document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    const videoElement = document.getElementById('video');
    const resultTextElement = document.getElementById('result-text');
    const resultContainer = document.getElementById('result-box');

    const codeReader = new window.ZXing.BrowserMultiFormatReader();
    let videoStream = null;

    // --- Функция: Запускает цикл поиска ---
    function runScanLoop() {
        // Убедимся, что поток есть
        if (videoStream) {
            console.log('ZXing: Запуск цикла поиска...');
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
                    // --- ГЛАВНАЯ ИЗМЕНА ---
                    // Мы НЕ трогаем видео. Мы просто "глушим" сканер.
                    //
                    codeReader.reset(); // <-- Останавливаем цикл сканирования
                    console.log('ZXing: Сканер остановлен. Видео работает.');
                }

                // B. Ошибка
                if (err && !(err instanceof window.ZXing.NotFoundException)) {
                    // Игнорируем "NotFound", но выводим другие ошибки
                    console.error('ZXing: Ошибка сканирования:', err);
                }
            });
        }
    }

    // --- Обработчик для перезапуска ---
    resultContainer.addEventListener('click', () => {
        // Мы не можем проверить, работает ли сканер,
        // поэтому мы просто очищаем текст и запускаем цикл заново.
        // Если он уже был запущен, reset() его остановит,
        // а эта функция запустит новый.

        console.log('Ручной перезапуск сканера...');

        // Сначала останавливаем любой текущий цикл, на всякий случай
        codeReader.reset();

        // И запускаем новый
        runScanLoop();
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

                // Ждем, пока видео начнет проигрываться
                // 'canplay' недостаточно, 'playing' — надежнее
                videoElement.addEventListener('playing', () => {
                    console.log('ZXing: Видеопоток активен.');
                    runScanLoop(); // Запускаем "поиск"
                });

                // Запускаем воспроизведение
                videoElement.play().catch(e => console.error("Ошибка play:", e));

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