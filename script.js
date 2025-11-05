document.addEventListener('DOMContentLoaded', () => {

    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    const videoElement = document.getElementById('video');
    const resultTextElement = document.getElementById('result-text');
    const resultContainer = document.getElementById('result-box');

    const codeReader = new window.ZXing.BrowserMultiFormatReader();

    // Переменная для хранения потока камеры
    let videoStream = null;

    // --- Функция: Начать сканирование ---
    function startScanning() {
        console.log('v2.0: Запрос к камере...');
        resultTextElement.textContent = '...';

        navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        })
            .then((stream) => {
                videoStream = stream; // Сохраняем поток
                videoElement.srcObject = stream;
                videoElement.play();

                console.log('v2.0: Камера запущена, начинаю декодирование...');

                // Запускаем непрерывное сканирование
                codeReader.decodeFromStream(stream, videoElement, (result, err) => {

                    // A. УСПЕХ!
                    if (result) {
                        console.log('v2.0: УСПЕХ!', result);
                        resultTextElement.textContent = result.getText();

                        if (navigator.vibrate) {
                            navigator.vigate(100);
                        }

                        //
                        // --- ВОТ ПРИЧИНА "ЧЕРНОГО ЭКРАНА" ---
                        //
                        stopScanning();
                    }

                    // B. Ошибка
                    if (err && !(err instanceof window.ZXing.NotFoundException)) {
                        console.error('v2.0: Ошибка сканирования:', err);
                    }
                });
            })
            .catch((err) => {
                console.error('v2.0: Критическая ошибка:', err);
                resultTextElement.textContent = 'Ошибка: Нет доступа к камере.';
                tg.showAlert(`Не удалось получить доступ к камере: ${err.message}`);
            });
    }

    // --- Функция: Остановить сканирование ---
    function stopScanning() {
        console.log('v2.0: Сканер остановлен.');

        // Эта команда ПОЛНОСТЬЮ ВЫКЛЮЧАЕТ камеру
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }

        // Сбрасываем "читателя"
        codeReader.reset();
    }

    // --- Обработчик для перезапуска ---
    resultContainer.addEventListener('click', () => {
        // Если потока нет (т.е. мы его "убили" после сканирования)
        if (!videoStream) {
            console.log('v2.0: Ручной перезапуск сканера...');
            startScanning(); // Запускаем все заново
        }
    });


    // --- Запускаем все в первый раз ---
    startScanning();

});