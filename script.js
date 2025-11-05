document.addEventListener('DOMContentLoaded', () => {

    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();

    const scanButton = document.getElementById('scanButton');
    const fileInput = document.getElementById('fileInput');
    const resultElement = document.getElementById('result');

    // Это "мозг" из ZXing, но теперь он будет читать из картинок
    const codeReader = new window.ZXing.BrowserMultiFormatReader();

    // 1. Нажимаем на нашу красивую кнопку
    scanButton.addEventListener('click', () => {
        resultElement.textContent = 'Запуск камеры...';
        // 2. А программно "кликаем" по скрытому инпуту
        fileInput.click();
    });

    // 3. Когда пользователь сделал фото и нажал "ОК"
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            resultElement.textContent = 'Фото не выбрано.';
            return;
        }

        resultElement.textContent = 'Обработка фото...';

        // Создаем URL для этого фото, чтобы ZXing мог его "прочитать"
        const imageURL = URL.createObjectURL(file);

        // 4. Главная команда: распознать код из URL картинки
        codeReader.decodeFromImageUrl(imageURL)
            .then(result => {
                // 5. УСПЕХ!
                console.log('ZXing: УСПЕХ!', result);
                resultElement.textContent = result.getText();

                if (navigator.vibrate) {
                    navigator.vibrate(100);
                }
            })
            .catch(err => {
                // 6. ПРОВАЛ
                console.error('ZXing: Ошибка:', err);
                resultElement.textContent = 'Код не найден на фото. Попробуйте еще раз.';
            })
            .finally(() => {
                // Очищаем URL, чтобы не было утечек памяти
                URL.revokeObjectURL(imageURL);

                // Важно: сбрасываем инпут, чтобы можно было сфоткать то же самое
                fileInput.value = null;
            });
    });
});