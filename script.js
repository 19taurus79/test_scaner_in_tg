document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    const videoElement = document.getElementById('video');
    const resultTextElement = document.getElementById('result-text');

    // Наш читатель кодов
    const codeReader = new window.ZXing.BrowserMultiFormatReader();

    //
    // --- НОВОЕ: Переменная для управления потоком ---
    //
    let videoStream = null; // Будем хранить здесь поток с камеры

    // Функция: Начать сканирование
    function startScanning() {
        console.log('ZXing: Запрос к камере...');
        resultTextElement.textContent = '...'; // Очищаем старый результат

        navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        })
            .then((stream) => {
                videoStream = stream; // Сохраняем поток
                videoElement.srcObject = stream;
                videoElement.play();

                console.log('ZXing: Камера запущена, начинаю декодирование...');

                // Запускаем непрерывное сканирование
                codeReader.decodeFromStream(stream, videoElement, (result, err) => {

                    // A. УСПЕХ!
                    if (result) {
                        console.log('ZXing: УСПЕХ!', result);
                        resultTextElement.textContent = result.getText();

                        if (navigator.vibrate) {
                            navigator.vibrate(100);
                        }

                        //
                        // --- ГЛАВНОЕ ИЗМЕНЕНИЕ ---
                        // Мы нашли код, останавливаем сканер!
                        //
                        stopScanning();
                    }

                    // B. Ошибка (просто игнорируем, если не найдено)
                    if (err && !(err instanceof window.ZXing.NotFoundException)) {
                        console.error('ZXing: Ошибка сканирования:', err);
                    }
                });
            })
            .catch((err) => {
                console.error('Критическая ошибка: не удалось получить доступ к камере.', err);
                resultTextElement.textContent = 'Ошибка: Нет доступа к камере.';
                tg.showAlert(`Не удалось получить доступ к камере: ${err.message}`);
            });
    }

    //
    // --- НОВАЯ ФУНКЦИЯ: Остановить сканирование ---
    //
    function stopScanning() {
        console.log('ZXing: Сканер остановлен.');

        // Выключаем камеру (поток)
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }

        // Сбрасываем "читателя", чтобы он был готов к следующему разу
        codeReader.reset();

        // Можно выключить видео, но это не обязательно
        // videoElement.srcObject = null;
    }

    //
    // --- НОВОЕ: Добавляем интерактив ---
    //
    // Вешаем на весь блок с результатом обработчик клика,
    // чтобы "перезапустить" сканер
    //
    document.getElementById('result-box').addEventListener('click', () => {
        // Если сканер уже выключен (т.е. мы что-то нашли),
        // запускаем его снова
        if (!videoStream) {
            console.log('Ручной перезапуск сканера...');
            startScanning();
        }
    });


    // --- Запускаем все в первый раз ---
    startScanning();

});