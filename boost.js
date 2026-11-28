/* ============================================
   BOOST.JS
   Работает на странице расширения (chrome-extension://),
   которую content.js встраивает скрытым iframe.

   Зачем: на file:// Chrome обнуляет звук, если пропускать <video> страницы
   через Web Audio («outputs zeroes due to CORS»). У страницы расширения
   есть host-разрешение на file://, поэтому здесь Web Audio работает.
   Видео на странице при усилении заглушается, а этот iframe играет
   звуковую дорожку того же файла с усилением и подстраивается под видео.

   Протокол: родитель шлёт { src } и MessagePort. Дальше по порту:
   родитель → { time, paused, rate, gain }, iframe → { ready } или { error }.
   ============================================ */

let audio = null;
let ctx = null;
let gainNode = null;
let port = null;

function apply(s) {
  if (!audio || !s) return;

  gainNode.gain.setTargetAtTime(Number(s.gain) || 0, ctx.currentTime, 0.01);
  audio.playbackRate = Number(s.rate) || 1;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const drift = audio.currentTime - s.time;

  if (s.paused) {
    if (!audio.paused) audio.pause();
    if (Math.abs(drift) > 0.05) audio.currentTime = s.time;
  } else {
    // Подтягиваем звук к видео, если разошлись больше чем на 150 мс
    if (audio.paused || Math.abs(drift) > 0.15) audio.currentTime = s.time;
    if (audio.paused) audio.play().catch(() => {});
  }
}

window.addEventListener('message', (e) => {
  // Принимаем запрос только от родительской страницы и только с портом для ответа
  if (e.source !== window.parent || !e.ports[0] || port) return;

  const src = e.data && e.data.src;
  // Страница расширения не должна открывать ничего, кроме локальных файлов
  if (typeof src !== 'string' || !src.startsWith('file:')) return;

  port = e.ports[0];

  try {
    audio = new Audio();
    audio.preload = 'auto';
    audio.addEventListener('error', () => port.postMessage({ error: 'Не удалось открыть звук' }));
    audio.src = src;

    ctx = new AudioContext();
    const source = ctx.createMediaElementSource(audio);
    gainNode = ctx.createGain();
    gainNode.gain.value = 1;

    // Лимитер, чтобы пики при усилении не превращались в жёсткий клиппинг
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -3;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.1;

    source.connect(gainNode);
    gainNode.connect(limiter);
    limiter.connect(ctx.destination);

    port.onmessage = (ev) => apply(ev.data);
    port.postMessage({ ready: true });
  } catch (err) {
    port.postMessage({ error: String((err && err.message) || err) });
  }
});
