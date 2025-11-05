document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    const videoElement = document.getElementById('video');
    const resultTextElement = document.getElementById('result-text');
    const resultContainer = document.getElementById('result-box');

    const codeReader = new window.ZXing.BrowserMultiFormatReader();
    let videoStream = null; // Будем хранить поток

    // --- Функция: Запускает цикл поиска ---
    function runScanLoop() {
        if (!videoStream) {
            console.log('Нет видеопотока, сканирование отменено.');
            return;
        }

        console.log('ZXing: Запуск цикла поиска...');
        resultTextElement.textContent = '...';

        // Мы используем decodeFromStream, как в самой первой удачной версии (v2.0)
        codeReader.decodeFromStream(videoStream, videoElement, (result, err) => {

            // A. УСПЕХ!
            if (result) {
                console.log('ZXing: УСПЕХ!', result.getText());
                resultTextElement.textContent = result.getText();

                if (navigator.vibrate) {
                    navigator.vibrate(100);
                }

                //
                // --- ЛОГИКА ОСТАНОВКИ из v2.2 ---
                //
                // Останавливаем *только* сканер. Видео НЕ трогаем.
                codeReader.reset();
                console.log('ZXing: Сканер остановлен. Видео продолжает работать.');
            }

            // B. Ошибка
            if (err && !(err instanceof window.ZXing.NotFoundException)) {
                // Игнорируем "NotFound", но выводим другие ошибки
                console.error('ZXing: Ошибка сканирования:', err);
            }
        });
    }

    // --- Обработчик для перезапуска ---
    resultContainer.addEventListener('click', () => {
        console.log('Ручной перезапуск сканера...');
        // Останавливаем старый цикл (на всякий случай)
        codeReader.reset();
        // Запускаем новый
        runScanLoop();
    });

    // --- Функция: Запуск сканирования (Один раз при старте) ---
    //
    // --- ЛОГИКА ЗАПУСКА из v2.0 (которая не "мигала") ---
    //
    function startInitialScan() {
        console.log('ZXing: Запрос к камере...');
        resultTextElement.textContent = 'Запрос камеры...';

        navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        })
            .then((stream) => {
                videoStream = stream; // Сохраняем поток
                videoElement.srcObject = stream;

                // Мы НЕ ждем 'playing' или 'canplay', чтобы не создавать "мигание".
                // Мы просто говорим .play() и полагаемся на 'autoplay' в HTML.
                videoElement.play().catch(e => {
                    console.error("Ошибка при вызове .play():", e);
                    resultTextElement.textContent = 'Не удалось запустить видео.';
                });

                // Сразу запускаем цикл сканирования
                runScanLoop();
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