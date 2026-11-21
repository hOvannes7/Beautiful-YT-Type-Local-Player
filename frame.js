/* ============================================
   FRAME.JS
   Работает на странице расширения (chrome-extension://),
   которую content.js встраивает скрытым iframe.

   Зачем это нужно: на file:// Chrome считает canvas «испорченным»
   (tainted), если рисовать в него видео прямо на странице — toBlob()
   кидает SecurityError. У страницы расширения есть host-разрешение
   на file://, поэтому здесь canvas остаётся чистым.

   Протокол: родитель шлёт { src, time } и MessagePort,
   в ответ получает { blob } или { error }.
   ============================================ */

function renderFrame(src, time) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'auto';

    let seeking = false;
    let finished = false;

    const fail = (msg) => {
      if (finished) return;
      finished = true;
      reject(new Error(msg));
    };

    function draw() {
      if (finished) return;
      finished = true;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          blob => (blob ? resolve(blob) : reject(new Error('toBlob вернул null'))),
          'image/png'
        );
      } catch (err) {
        reject(err);
      }
    }

    video.addEventListener('error', () => fail('Не удалось открыть видео'));

    video.addEventListener('loadeddata', () => {
      if (time <= 0.001) {
        draw();                       // первый кадр — перематывать не нужно
      } else {
        seeking = true;
        video.currentTime = Math.min(time, video.duration || time);
      }
    });

    video.addEventListener('seeked', () => {
      if (seeking) draw();
    });

    video.src = src;
  });
}

window.addEventListener('message', async (e) => {
  // Принимаем запрос только от родительской страницы и только с портом для ответа
  if (e.source !== window.parent || !e.ports[0]) return;

  const port = e.ports[0];
  const { src, time } = e.data || {};

  try {
    // Страница расширения не должна открывать ничего, кроме локальных файлов
    if (typeof src !== 'string' || !src.startsWith('file:')) {
      throw new Error('Поддерживаются только file:// источники');
    }
    const blob = await renderFrame(src, Number(time) || 0);
    port.postMessage({ blob });
  } catch (err) {
    port.postMessage({ error: String((err && err.message) || err) });
  }
}, { once: true });
