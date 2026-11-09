/* ============================================
   POPUP.JS
   Логика кнопки "Очистить все сохранённые позиции"
   ============================================ */

document.getElementById('clear').addEventListener('click', () => {

  // Получаем всё, что лежит в chrome.storage.local
  chrome.storage.local.get(null, (items) => {

    // Оставляем только ключи, которые начинаются с "blp_pos_"
    // (это наши сохранённые позиции видео)
    const keysToRemove = Object.keys(items).filter(key => key.startsWith('blp_pos_'));

    if (keysToRemove.length > 0) {
      // Есть что удалять — удаляем
      chrome.storage.local.remove(keysToRemove, () => {
        const status = document.getElementById('status');
        status.textContent = 'Все позиции удалены';
        status.style.display = 'block';

        // Через 2 секунды прячем сообщение
        setTimeout(() => status.style.display = 'none', 2000);
      });
    } else {
      // Нечего удалять
      const status = document.getElementById('status');
      status.textContent = 'Нет сохранённых позиций';
      status.style.display = 'block';

      setTimeout(() => status.style.display = 'none', 2000);
    }
  });
});