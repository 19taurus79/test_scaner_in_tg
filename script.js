// Ждем, пока загрузится вся страница
document.addEventListener('DOMContentLoaded', () => {

    // Получаем объект Telegram Web App
    const tg = window.Telegram.WebApp;

    // Элементы на странице
    const scanButton = document.getElementById('scanButton');
    const resultElement = document.getElementById('result');

    // 1. Инициализируем приложение
    // Это говорит Telegram, что приложение готово
    tg.ready();

    // 2. Расширяем приложение на весь экран
    tg.expand();

    // 3. Проверяем, что версия Telegram поддерживает сканер (6.4+)
    if (!tg.isVersionAtLeast('6.4')) {
        // Блокируем кнопку и показываем ошибку
        scanButton.disabled = true;
        scanButton.innerText = 'Сканер не поддерживается';
        tg.showAlert('Ваша версия Telegram устарела. Обновитесь, чтобы использовать сканер.');
        return;
    }

    // 4. Вешаем обработчик на кнопку
    scanButton.addEventListener('click', () => {

        resultElement.textContent = 'Запуск сканера...';

        // 5. Вызываем сам сканер
        // Мы просим его распознать что угодно ('text')
        tg.showScanQrPopup({ text: 'Наведите на штрихкод' }, (scannedText) => {

            // 6. Этот код (callback) выполнится, когда что-то отсканируется
            if (scannedText) {
                resultElement.textContent = scannedText;

                // ВАЖНО: Возвращаем true, чтобы Telegram понял, что мы обработали
                // результат и можно закрыть окно сканера.
                return true;
            } else {
                resultElement.textContent = 'Сканер был закрыт без результата.';
            }
        });
    });
});