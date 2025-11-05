// Ждем, пока загрузится вся страница
document.addEventListener('DOMContentLoaded', () => {

    // Инициализируем Telegram
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    // Получаем элементы
    const videoElement = document.getElementById('video');
    const resultTextElement = document.getElementById('result-text');

    // Это "мозг" из библиотеки ZXing
    // Он умеет читать много форматов из видеопотока
    const codeReader = new window.ZXing.BrowserMultiFormatReader();

    console.log('ZXing: Инициализация сканера...');

    // 1. Запрашиваем доступ к камере
    // Мы просим 'environment' - это задняя камера
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: 'environment'
        }
    })
        .then((stream) => {
            // 2. Если пользователь разрешил, показываем видео
            videoElement.srcObject = stream;
            videoElement.play(); // Запускаем видео

            console.log('ZXing: Камера запущена, начинаю декодирование...');

            // 3. Главная команда: непрерывно сканировать видеопоток
            codeReader.decodeFromStream(stream, videoElement, (result, err) => {

                // A. Если результат ЕСТЬ
                if (result) {
                    console.log('ZXing: УСПЕХ!', result);

                    // Показываем результат
                    resultTextElement.textContent = result.getText();

                    // Издаем вибро-сигнал (очень полезно на складе)
                    if (navigator.vibrate) {
                        navigator.vibrate(100); // Вибрация 100 мс
                    }
                }

                // B. Если ОШИБКА
                if (err) {
                    // NotFoundException - это не "ошибка",
                    // а просто "в этом кадре штрихкода не найдено".
                    // Мы ее игнорируем, чтобы не спамить в консоль.
                    if (!(err instanceof window.ZXing.NotFoundException)) {
                        console.error('ZXing: Ошибка сканирования:', err);
                        // resultTextElement.textContent = `Ошибка: ${err.message}`;
                    }
                }
            });
        })
        .catch((err) => {
            // Если пользователь не дал доступ к камере
            console.error('Критическая ошибка: не удалось получить доступ к камере.', err);
            resultTextElement.textContent = 'Ошибка: Не удалось получить доступ к камере.';
            tg.showAlert(`Не удалось получить доступ к камере: ${err.message}`);
        });
});