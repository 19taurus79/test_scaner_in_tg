document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    const videoElement = document.getElementById('video');
    const resultTextElement = document.getElementById('result-text');
    const resultContainer = document.getElementById('result-box');

    const codeReader = new window.ZXing.BrowserMultiFormatReader();
    let videoStream = null;

    // --- Функция: САМ ПРОЦЕСС ПОИСКА ---
    function runScanLoop() {
        // Убедимся, что поток есть и видео играет
        if (videoStream && !videoElement.paused) {
            console.log('ZXing: Поиск кода...');
            resultTextElement.textContent = '...';

            codeReader.decodeFromStream(videoStream, videoElement, (result, err) => {

                // A. УСПЕХ!
                if (result) {
                    console.log('ZXing: УСПЕХ!', result.getText());
                    resultTextElement.textContent = result.getText();

                    if (navigator.vibrate) {
                        navigator.vibrate(100);
                    }

                    //
                    // --- НОВОЕ: СТАВИМ ВИДЕО НА ПАУЗУ ---
                    //
                    videoElement.pause(); // <-- Вот оно! Кадр "замерз"
                    codeReader.reset(); // Сбрасываем ридер
                }

                // B. Ошибка (просто игнорируем, если не найдено)
                if (err && !(err instanceof window.ZXing.NotFoundException)) {
                    console.error('ZXing: Ошибка сканирования:', err);
                }
            });
        }
    }

    // --- Обработчик для перезапуска ---
    resultContainer.addEventListener('click', () => {
        // Если видео на паузе (значит, мы что-то нашли)
        if (videoElement.paused) {
            console.log('Ручной перезапуск сканера...');

            // Снова включаем видео
            videoElement.play().catch(err => {
                console.error("Ошибка при возобновлении видео:", err);
            });

            // И снова запускаем цикл поиска
            runScanLoop();
        }
    });

    // --- Функция: Запуск сканирования (Один раз при старте) ---
    function startInitialScan() {
        console.log('ZXing: Запрос к камере...');
        resultTextElement.textContent = 'Запрос камеры...';

        navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        })
            .then((stream) => {
                videoStream = stream; // Сохраняем поток
                videoElement.srcObject = stream;

                // Важно: ждем, пока видео реально начнет проигрываться
                videoElement.addEventListener('canplay', () => {
                    videoElement.play();
                    runScanLoop(); // Запускаем "поиск"
                });
            })
            .catch((err) => {
                console.error('Критическая ошибка: не удалось получить доступ к камере.', err);
                resultTextElement.textContent = 'Ошибка: Нет доступа к камере.';
                tg.showAlert(`Не удалось получить доступ к камере: ${err.message}`);
            });
    }

    // --- Запускаем все в первый раз ---
    startInitialScan();
});