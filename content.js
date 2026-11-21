(function () {
  'use strict';

  /* ============================================
     ИКОНКИ (SVG)
     Используются в кнопках и контекстном меню
     ============================================ */
  const icons = {
    play: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
    pause: `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
    volumeHigh: `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
    volumeLow: `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`,
    mute: `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
    fullscreen: `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`,
    exitFullscreen: `<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`,
    pip: `<svg viewBox="0 0 24 24"><path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>`,
    loop: `<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>`,
    flip: `<svg viewBox="0 0 24 24"><path d="M15 21h2v-2h-2v2zm4-12h2V7h-2v2zM3 5v14c0 1.1.9 2 2 2h4v-2H5V5h4V3H5c-1.1 0-2 .9-2 2zm16-2v2h2c0-1.1-.9-2-2-2zm-8 20h2V1h-2v22zm8-6h2v-2h-2v2zM15 5h2V3h-2v2zm4 8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2z"/></svg>`,
    camera: `<svg viewBox="0 0 24 24"><path d="M12 12m-3.2 0a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0-6.4 0M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>`
  };

  /* Через сколько мс удержания (ЛКМ или Space) включается временный ×2 */
  const HOLD_DELAY = 450;

  /* Доступные скорости воспроизведения */
  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  /* Форматирование времени: 65 → "1:05", 3661 → "1:01:01" */
  function formatTime(sec) {
    if (!isFinite(sec) || isNaN(sec)) return '0:00';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  /* Ключ для сохранения позиции этого конкретного файла */
  function getStorageKey() {
    return 'blp_pos_' + location.href;
  }

  /* ============================================
     ГЛАВНАЯ ФУНКЦИЯ — создаёт кастомный плеер
     вокруг одного <video> или <audio>
     ============================================ */
  function createPlayer(media) {
    // Чтобы не инициализировать один и тот же элемент дважды
    if (media.dataset.blpInitialized) return;
    media.dataset.blpInitialized = 'true';

    const isAudio = media.tagName.toLowerCase() === 'audio';
    const isVideo = media.tagName.toLowerCase() === 'video';

    // Убираем стандартные контролы браузера
    media.controls = false;
    media.removeAttribute('controls');

    /* --- Обёртка --- */
    const wrapper = document.createElement('div');
    wrapper.className = 'blp-wrapper' + (isAudio ? ' blp-audio-wrapper' : ' blp-is-video');
    media.parentNode.insertBefore(wrapper, media);
    wrapper.appendChild(media);

    /* Название файла для аудио */
    if (isAudio) {
      const title = document.createElement('div');
      title.className = 'blp-audio-title';
      try {
        title.textContent = decodeURIComponent(location.pathname.split('/').pop() || 'Аудиофайл');
      } catch (e) {
        title.textContent = 'Аудиофайл';
      }
      wrapper.insertBefore(title, media);
    }

    /* Большая кнопка Play по центру (только для видео) */
    const bigPlay = document.createElement('div');
    bigPlay.className = 'blp-big-play';
    bigPlay.innerHTML = icons.play;
    if (isVideo) wrapper.appendChild(bigPlay);

    /* Индикатор ×2 (при удержании ЛКМ) */
    const speedIndicator = document.createElement('div');
    speedIndicator.className = 'blp-speed-indicator';
    speedIndicator.textContent = '2×';
    if (isVideo) wrapper.appendChild(speedIndicator);

    /* Индикатор громкости (при изменении звука) */
    const volumeIndicator = document.createElement('div');
    volumeIndicator.className = 'blp-volume-indicator';
    volumeIndicator.textContent = '100%';
    if (isVideo) wrapper.appendChild(volumeIndicator);

    /* Короткое уведомление ("Кадр скопирован" и т.п.) */
    const toast = document.createElement('div');
    toast.className = 'blp-toast';
    if (isVideo) wrapper.appendChild(toast);

    /* ============================================
       КОНТЕКСТНОЕ МЕНЮ (ПКМ)
       Важно: добавляем ВНУТРЬ wrapper,
       чтобы оно работало и в fullscreen
       ============================================ */
    const contextMenu = document.createElement('div');
    contextMenu.className = 'blp-context-menu';
    contextMenu.innerHTML = `
      <div class="blp-context-item" data-action="loop">
        ${icons.loop}
        <span>Зациклить</span>
      </div>
      <div class="blp-context-item" data-action="pip">
        ${icons.pip}
        <span>Мини-плеер</span>
      </div>
      <div class="blp-context-item" data-action="flip">
        ${icons.flip}
        <span>Отразить по горизонтали</span>
      </div>
      <div class="blp-context-separator"></div>
${isVideo ? `<div class="blp-context-item" data-action="copy-frame">
        ${icons.camera}
        <span>Копировать кадр</span>
      </div>` : ''}
      <div class="blp-context-item" data-action="copy-name">
        <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
        <span>Копировать имя файла</span>
      </div>
      <div class="blp-context-item" data-action="reset-pos">
        <svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
        <span>Сбросить сохранённую позицию</span>
      </div>
    `;
    wrapper.appendChild(contextMenu);   // ← внутри wrapper = работает в fullscreen

    /* ============================================
       ПАНЕЛЬ УПРАВЛЕНИЯ (прогресс-бар + кнопки)
       ============================================ */
    const controls = document.createElement('div');
    controls.className = 'blp-controls';
    controls.innerHTML = `
      <div class="blp-progress-container">
        <div class="blp-buffer"></div>
        <div class="blp-progress"></div>
        <div class="blp-progress-handle"></div>
        <div class="blp-tooltip">0:00</div>
      </div>
      <div class="blp-bottom">
        <div class="blp-left">
          <button class="blp-btn blp-play" title="Play / Pause (Space / K)">${icons.play}</button>
          <div class="blp-volume-container">
            <button class="blp-btn blp-mute" title="Mute (M)">${icons.volumeHigh}</button>
            <div class="blp-volume-slider">
              <input type="range" class="blp-volume-range" min="0" max="1" step="0.01" value="1">
            </div>
          </div>
          <div class="blp-time">0:00 / 0:00</div>
        </div>
        <div class="blp-right">
          <div class="blp-speed-wrapper">
            <div class="blp-speed" title="Скорость">1×</div>
            <div class="blp-speed-menu">
              ${speeds.map(s => `<div class="blp-speed-option" data-speed="${s}">${s}×</div>`).join('')}
            </div>
          </div>
          ${isVideo ? `<button class="blp-btn blp-pip" title="Картинка в картинке (P)">${icons.pip}</button>` : ''}
          ${isVideo ? `<button class="blp-btn blp-fullscreen" title="Полный экран (F)">${icons.fullscreen}</button>` : ''}
        </div>
      </div>
    `;
    wrapper.appendChild(controls);

    /* Ссылки на элементы управления */
    const playBtn = controls.querySelector('.blp-play');
    const muteBtn = controls.querySelector('.blp-mute');
    const volumeRange = controls.querySelector('.blp-volume-range');
    const timeEl = controls.querySelector('.blp-time');
    const progressBar = controls.querySelector('.blp-progress');
    const bufferBar = controls.querySelector('.blp-buffer');
    const handle = controls.querySelector('.blp-progress-handle');
    const progressContainer = controls.querySelector('.blp-progress-container');
    const tooltip = controls.querySelector('.blp-tooltip');
    const speedEl = controls.querySelector('.blp-speed');
    const speedMenu = controls.querySelector('.blp-speed-menu');
    const speedOptions = controls.querySelectorAll('.blp-speed-option');
    const pipBtn = controls.querySelector('.blp-pip');
    const fsBtn = controls.querySelector('.blp-fullscreen');

    /* Вспомогательные переменные */
    let hideTimeout = null;        // таймер автоскрытия панели
    let isDragging = false;        // тянем ли прогресс-бар
    let saveInterval = null;       // интервал сохранения позиции
    let volumeHideTimeout = null;  // таймер скрытия индикатора громкости

    // Для кликов и удержания ЛКМ
    let clickCount = 0;
    let clickTimer = null;
    let holdTimer = null;
    let isHoldingFor2x = false;
    let previousSpeed = 1;
    let wasHolding = false;

    // Режим ×2 может включить и мышь, и Space — запоминаем, кто именно держит
    const hold2xSources = new Set();

    // Для Space: короткое нажатие = play/pause, удержание = ×2
    let spaceDown = false;
    let spaceTimer = null;     // не null — ещё ждём: это тап или удержание

    // Время видео в момент открытия контекстного меню (для «Копировать кадр»)
    let frameTime = null;
    let toastTimeout = null;

    /* ============================================
       СОХРАНЕНИЕ / ВОССТАНОВЛЕНИЕ ПОЗИЦИИ
       ============================================ */
    function savePosition() {
      try {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
        if (!media.duration || media.currentTime < 5) return;

        // Если почти конец — удаляем сохранённую позицию
        if (media.currentTime > media.duration - 15) {
          chrome.storage.local.remove(getStorageKey()).catch(() => {});
          return;
        }

        chrome.storage.local.set({
          [getStorageKey()]: {
            time: media.currentTime,
            updated: Date.now()
          }
        }).catch(() => {});
      } catch (e) {}
    }

    function restorePosition() {
      try {
        if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;

        chrome.storage.local.get(getStorageKey(), (result) => {
          try {
            const data = result?.[getStorageKey()];
            if (data && data.time > 5 && media.duration && data.time < media.duration - 10) {
              media.currentTime = data.time;
            }
          } catch (e) {}
        });
      } catch (e) {}
    }

    /* ============================================
       ОСНОВНЫЕ ФУНКЦИИ УПРАВЛЕНИЯ
       ============================================ */
    function updatePlayButton() {
      playBtn.innerHTML = media.paused ? icons.play : icons.pause;
      if (bigPlay) bigPlay.innerHTML = icons.play;
      wrapper.classList.toggle('blp-paused', media.paused);
    }

    function updateTime() {
      timeEl.textContent = `${formatTime(media.currentTime)} / ${formatTime(media.duration)}`;
    }

    function updateProgress() {
      if (!media.duration || isNaN(media.duration)) return;
      const percent = (media.currentTime / media.duration) * 100;
      progressBar.style.width = percent + '%';
      handle.style.left = percent + '%';
    }

    function updateBuffer() {
      try {
        if (media.buffered.length > 0 && media.duration) {
          const end = media.buffered.end(media.buffered.length - 1);
          bufferBar.style.width = (end / media.duration * 100) + '%';
        }
      } catch (e) {}
    }

    function togglePlay() {
      if (media.paused) media.play().catch(() => {});
      else media.pause();
    }

    /* Показать плашку с уровнем громкости */
    function showVolumeIndicator(val) {
      const percent = Math.round(val * 100);
      volumeIndicator.textContent = percent + '%';
      volumeIndicator.classList.add('blp-visible');
      clearTimeout(volumeHideTimeout);
      volumeHideTimeout = setTimeout(() => {
        volumeIndicator.classList.remove('blp-visible');
      }, 1000);
    }

    function showToast(text, duration = 1500) {
      toast.textContent = text;
      toast.classList.add('blp-visible');
      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => toast.classList.remove('blp-visible'), duration);
    }

    /* Установка громкости
       showIndicator = false — не показывать плашку (нужно при старте) */
    function setVolume(val, showIndicator = true) {
      val = Math.max(0, Math.min(1, val));
      media.volume = val;
      media.muted = val === 0;
      volumeRange.value = val;

      if (media.muted || val === 0) {
        muteBtn.innerHTML = icons.mute;
      } else if (val <= 0.5) {
        muteBtn.innerHTML = icons.volumeLow;
      } else {
        muteBtn.innerHTML = icons.volumeHigh;
      }

      if (showIndicator) {
        showVolumeIndicator(val);
        showControls();
      }
    }

    /* Перемотка по клику/перетаскиванию на прогресс-баре */
    function seek(e) {
      const rect = progressContainer.getBoundingClientRect();
      let percent = (e.clientX - rect.left) / rect.width;
      percent = Math.max(0, Math.min(1, percent));
      if (media.duration) media.currentTime = percent * media.duration;
      showControls();
    }

    /* Тултип со временем при наведении на прогресс-бар */
    function showTooltip(e) {
      if (!media.duration) return;
      const rect = progressContainer.getBoundingClientRect();
      let percent = (e.clientX - rect.left) / rect.width;
      percent = Math.max(0, Math.min(1, percent));
      const time = percent * media.duration;
      tooltip.textContent = formatTime(time);
      tooltip.style.left = (e.clientX - rect.left) + 'px';
      tooltip.classList.add('blp-visible');
    }

    function hideTooltip() {
      tooltip.classList.remove('blp-visible');
    }

    /* Обновление UI скорости */
    function updateSpeedUI() {
      const current = media.playbackRate || 1;
      speedEl.textContent = current + '×';
      speedOptions.forEach(opt => {
        opt.classList.toggle('blp-active', parseFloat(opt.dataset.speed) === current);
      });
    }

    function toggleSpeedMenu(e) {
      e.stopPropagation();
      const isOpen = speedMenu.classList.contains('blp-open');
      document.querySelectorAll('.blp-speed-menu.blp-open').forEach(m => m.classList.remove('blp-open'));
      if (!isOpen) {
        speedMenu.classList.add('blp-open');
        updateSpeedUI();
      }
    }

    speedOptions.forEach(opt => {
      opt.addEventListener('click', e => {
        e.stopPropagation();
        media.playbackRate = parseFloat(opt.dataset.speed);
        updateSpeedUI();
        speedMenu.classList.remove('blp-open');
      });
    });

    speedEl.addEventListener('click', toggleSpeedMenu);
    document.addEventListener('click', () => speedMenu.classList.remove('blp-open'));
    speedMenu.addEventListener('click', e => e.stopPropagation());

    function toggleFullscreen() {
      if (!document.fullscreenElement) wrapper.requestFullscreen().catch(() => {});
      else document.exitFullscreen();
    }

    function togglePiP() {
      if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
      else if (document.pictureInPictureEnabled) media.requestPictureInPicture().catch(() => {});
    }

    /* ============================================
       СОБЫТИЯ МЕДИА-ЭЛЕМЕНТА
       ============================================ */
    media.addEventListener('play', updatePlayButton);
    media.addEventListener('pause', () => {
      updatePlayButton();
      savePosition();
    });
    media.addEventListener('timeupdate', () => {
      updateTime();
      updateProgress();
    });
    media.addEventListener('progress', updateBuffer);
    media.addEventListener('loadedmetadata', () => {
      updateTime();
      updateProgress();
      updateBuffer();
      restorePosition();
    });
    media.addEventListener('volumechange', () => {
      const val = media.muted ? 0 : media.volume;
      volumeRange.value = val;
      if (media.muted || val === 0) {
        muteBtn.innerHTML = icons.mute;
      } else if (val <= 0.5) {
        muteBtn.innerHTML = icons.volumeLow;
      } else {
        muteBtn.innerHTML = icons.volumeHigh;
      }
    });

    // Автосохранение позиции каждые 5 секунд + при закрытии вкладки
    saveInterval = setInterval(savePosition, 5000);
    window.addEventListener('beforeunload', savePosition);

    /* Кнопки Play */
    playBtn.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
    if (bigPlay) bigPlay.addEventListener('click', e => { e.stopPropagation(); togglePlay(); });

    /* ============================================
       КЛИКИ ПО ВИДЕО + УДЕРЖАНИЕ ЛКМ ДЛЯ ×2
       ============================================ */
    media.addEventListener('mousedown', e => {
      if (e.button !== 0 || e.target !== media) return;
      if (isDragging) return;

      wasHolding = false;   // сброс «залипшего» флага, если прошлый mouseup был вне видео
      clearTimeout(holdTimer);

      // Если держат дольше HOLD_DELAY — включаем временный ×2
      holdTimer = setTimeout(() => {
        wasHolding = true;
        start2x('mouse');
      }, HOLD_DELAY);
    });

    /* Включить / выключить временный ×2.
       source — кто держит ('mouse' или 'key'); скорость возвращается,
       только когда отпущены все источники */
    function start2x(source) {
      hold2xSources.add(source);
      if (isHoldingFor2x) return;
      isHoldingFor2x = true;
      previousSpeed = media.playbackRate || 1;
      media.playbackRate = 2;
      speedIndicator.classList.add('blp-visible');
    }

    function stop2x(source) {
      hold2xSources.delete(source);
      if (!isHoldingFor2x || hold2xSources.size > 0) return;
      isHoldingFor2x = false;
      media.playbackRate = previousSpeed;
      speedIndicator.classList.remove('blp-visible');
      updateSpeedUI();
    }

    const stopHolding2x = () => {
      clearTimeout(holdTimer);
      stop2x('mouse');
    };

    media.addEventListener('mouseup', stopHolding2x);
    media.addEventListener('mouseleave', stopHolding2x);
    document.addEventListener('mouseup', stopHolding2x);

    // Одинарный клик = play/pause, двойной = fullscreen
    media.addEventListener('click', e => {
      if (e.target !== media) return;

      // Если открыто контекстное меню — только закрываем, play/pause не трогаем
      if (contextMenu.classList.contains('blp-open')) {
        hideContextMenu();
        clickCount = 0;
        clearTimeout(clickTimer);
        return;
      }

      // После удержания для ×2 — игнорируем клик
      if (wasHolding) {
        wasHolding = false;
        clickCount = 0;
        clearTimeout(clickTimer);
        return;
      }

      clickCount++;

      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          togglePlay();
          clickCount = 0;
        }, 450);
      } else if (clickCount === 2) {
        clearTimeout(clickTimer);
        clickCount = 0;
        e.preventDefault();
        if (isVideo) toggleFullscreen();
      }
    });

    /* ============================================
       КОНТЕКСТНОЕ МЕНЮ (логика)
       ============================================ */
    function hideContextMenu() {
      contextMenu.classList.remove('blp-open');
    }

    /* Достаём кадр видео на заданной секунде как PNG-Blob.

       На file:// нельзя просто нарисовать <video> в canvas на самой странице —
       Chrome считает такой canvas «испорченным» и toBlob() падает с SecurityError.
       Поэтому кадр рисует страница расширения (frame.html) во вложенном скрытом
       iframe: у неё есть доступ к file://, и canvas остаётся чистым.
       Бонус — кадр получается в родном разрешении видео и без интерфейса плеера. */
    function getFrameBlob(time) {
      return new Promise((resolve, reject) => {
        const frameUrl = chrome.runtime.getURL('frame.html');
        const frameOrigin = new URL(frameUrl).origin;

        const iframe = document.createElement('iframe');
        iframe.src = frameUrl;
        iframe.style.cssText =
          'position:fixed;left:-10px;top:-10px;width:1px;height:1px;border:0;opacity:0;pointer-events:none;';

        // Личный канал связи с iframe — чтобы сама страница не видела наш Blob
        const channel = new MessageChannel();

        const cleanup = () => {
          clearTimeout(timer);
          channel.port1.close();
          iframe.remove();
        };
        const timer = setTimeout(() => {
          cleanup();
          reject(new Error('Время ожидания истекло'));
        }, 20000);

        channel.port1.onmessage = e => {
          cleanup();
          if (e.data && e.data.blob) resolve(e.data.blob);
          else reject(new Error((e.data && e.data.error) || 'Неизвестная ошибка'));
        };

        iframe.addEventListener('load', () => {
          iframe.contentWindow.postMessage(
            { src: media.currentSrc, time },
            frameOrigin,
            [channel.port2]
          );
        });

        document.documentElement.appendChild(iframe);
      });
    }

    /* Копирование кадра (на секунде time) в буфер обмена как PNG */
    async function copyFrame(time) {
      if (!isVideo || time === null || !media.videoWidth) {
        showToast('Не удалось получить кадр');
        return;
      }
      try {
        showToast('Копирую кадр…', 20000);
        // В буфер передаём Promise, а не готовый Blob: запись начинается сразу
        // внутри клика, поэтому жест пользователя не «протухает», пока кадр готовится
        const blobPromise = getFrameBlob(time);
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise })]);
        showToast('Кадр скопирован');
      } catch (err) {
        console.warn('[BLP] Не удалось скопировать кадр:', err);
        showToast('Не удалось скопировать кадр');
      }
    }

    // Слушаем весь плеер, а не только <video>: панель управления лежит поверх видео,
    // и без этого на ней вылезало бы системное меню Chrome
    wrapper.addEventListener('contextmenu', e => {
      e.preventDefault();

      // ПКМ по самому нашему меню — просто не даём открыться системному
      if (contextMenu.contains(e.target)) return;

      // Обновляем состояние пункта "Зациклить"
      const loopItem = contextMenu.querySelector('[data-action="loop"]');
      loopItem.classList.toggle('blp-active', media.loop);
      loopItem.querySelector('span').textContent = media.loop ? 'Зациклить (вкл)' : 'Зациклить';

      // Запоминаем время кадра именно в момент вызова меню (видео может продолжать играть)
      frameTime = media.currentTime;

      // «Копировать кадр» нужен только если есть видеодорожка
      // (Chrome открывает одиночный mp3 тоже в <video>, но без картинки)
      const frameItem = contextMenu.querySelector('[data-action="copy-frame"]');
      if (frameItem) {
        if (media.videoWidth > 0) frameItem.style.removeProperty('display');
        else frameItem.style.setProperty('display', 'none', 'important');
      }

      // Позиционируем меню рядом с курсором
      const x = Math.min(e.clientX, window.innerWidth - 230);
      const y = Math.min(e.clientY, window.innerHeight - 310);
      contextMenu.style.left = x + 'px';
      contextMenu.style.top = y + 'px';
      contextMenu.classList.add('blp-open');
    });

    document.addEventListener('click', hideContextMenu);
    document.addEventListener('contextmenu', e => {
      if (!wrapper.contains(e.target)) {
        hideContextMenu();
      }
    });

    contextMenu.addEventListener('click', e => {
      const item = e.target.closest('.blp-context-item');
      if (!item) return;

      const action = item.dataset.action;

      switch (action) {
        case 'loop':
          media.loop = !media.loop;
          break;
        case 'pip':
          togglePiP();
          break;
        case 'flip':
          wrapper.classList.toggle('blp-flipped');
          break;
case 'copy-frame':
          copyFrame(frameTime);
          break;
case 'copy-name':
          try {
            const name = decodeURIComponent(location.pathname.split('/').pop() || '');
            navigator.clipboard.writeText(name);
            showToast('Имя файла скопировано');
          } catch (err) {}
          break;
        case 'reset-pos':
          try {
            if (chrome?.storage?.local) {
              chrome.storage.local.remove(getStorageKey());
            }
            media.currentTime = 0;
          } catch (err) {}
          break;
      }

      hideContextMenu();
    });

    /* Громкость */
    muteBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (media.muted || media.volume === 0) setVolume(parseFloat(volumeRange.value) || 1);
      else setVolume(0);
    });
    volumeRange.addEventListener('input', e => setVolume(parseFloat(e.target.value)));

    /* Перемотка мышкой */
    progressContainer.addEventListener('mousedown', e => {
      isDragging = true;
      seek(e);
    });
    document.addEventListener('mousemove', e => { if (isDragging) seek(e); });
    document.addEventListener('mouseup', () => { isDragging = false; });

    progressContainer.addEventListener('mousemove', showTooltip);
    progressContainer.addEventListener('mouseleave', hideTooltip);

    if (pipBtn) pipBtn.addEventListener('click', e => { e.stopPropagation(); togglePiP(); });
    if (fsBtn) fsBtn.addEventListener('click', e => { e.stopPropagation(); toggleFullscreen(); });

    document.addEventListener('fullscreenchange', () => {
      if (fsBtn) fsBtn.innerHTML = document.fullscreenElement ? icons.exitFullscreen : icons.fullscreen;
    });

    /* ============================================
       АВТОСКРЫТИЕ ПАНЕЛИ УПРАВЛЕНИЯ
       ============================================ */
    function showControls() {
      wrapper.classList.add('blp-show-controls');
      clearTimeout(hideTimeout);
      if (!media.paused) {
        hideTimeout = setTimeout(() => {
          wrapper.classList.remove('blp-show-controls');
        }, 2500);
      }
    }

    function hideControls() {
      if (!media.paused) {
        wrapper.classList.remove('blp-show-controls');
      }
    }

    wrapper.addEventListener('mousemove', showControls);
    wrapper.addEventListener('mouseenter', showControls);
    wrapper.addEventListener('mouseleave', hideControls);

    media.addEventListener('pause', () => {
      clearTimeout(hideTimeout);
      wrapper.classList.add('blp-show-controls');
    });

    media.addEventListener('play', () => {
      showControls();
    });

    /* ============================================
       ГОРЯЧИЕ КЛАВИШИ
       ============================================ */
    document.addEventListener('keydown', e => {
      // Игнорируем, если фокус в поле ввода
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      // Space: короткое нажатие = play/pause (по отпусканию), удержание = ×2
      if (e.code === 'Space') {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        e.preventDefault();                    // не даём странице прокручиваться / «нажимать» кнопку
        if (e.repeat || spaceDown) return;     // автоповтор клавиши игнорируем
        spaceDown = true;
        spaceTimer = setTimeout(() => {
          spaceTimer = null;                   // дождались — это удержание
          start2x('key');
        }, HOLD_DELAY);
        return;
      }

      switch (e.code) {
        case 'KeyK':
          e.preventDefault();
          togglePlay();
          break;

        case 'KeyJ': { // замедлить
          e.preventDefault();
          const currentIndex = speeds.indexOf(media.playbackRate) !== -1
            ? speeds.indexOf(media.playbackRate)
            : speeds.findIndex(s => s >= media.playbackRate) - 1;
          const newIndex = Math.max(0, (currentIndex === -1 ? speeds.length - 1 : currentIndex) - 1);
          media.playbackRate = speeds[newIndex];
          updateSpeedUI();
          showControls();
          break;
        }

        case 'KeyL': { // ускорить
          e.preventDefault();
          const currentIndex = speeds.indexOf(media.playbackRate) !== -1
            ? speeds.indexOf(media.playbackRate)
            : speeds.findIndex(s => s > media.playbackRate);
          const newIndex = Math.min(speeds.length - 1, (currentIndex === -1 ? 0 : currentIndex) + 1);
          media.playbackRate = speeds[newIndex];
          updateSpeedUI();
          showControls();
          break;
        }

        case 'KeyH': // отразить по горизонтали
          e.preventDefault();
          wrapper.classList.toggle('blp-flipped');
          showControls();
          break;

        case 'Comma': // кадр назад
          e.preventDefault();
          if (!media.paused) media.pause();
          media.currentTime = Math.max(0, media.currentTime - (1 / 30));
          showControls();
          break;

        case 'Period': // кадр вперёд
          e.preventDefault();
          if (!media.paused) media.pause();
          media.currentTime = Math.min(media.duration || Infinity, media.currentTime + (1 / 30));
          showControls();
          break;

        case 'ArrowLeft':
          e.preventDefault();
          media.currentTime = Math.max(0, media.currentTime - (e.shiftKey ? 10 : 5));
          showControls();
          break;

        case 'ArrowRight':
          e.preventDefault();
          media.currentTime = Math.min(media.duration || Infinity, media.currentTime + (e.shiftKey ? 10 : 5));
          showControls();
          break;

        case 'ArrowUp':
          e.preventDefault();
          setVolume(media.volume + 0.05);
          break;

        case 'ArrowDown':
          e.preventDefault();
          setVolume(media.volume - 0.05);
          break;

        case 'KeyM':
          e.preventDefault();
          muteBtn.click();
          break;

        case 'KeyF':
          e.preventDefault();
          if (isVideo) toggleFullscreen();
          break;

        case 'KeyP':
          e.preventDefault();
          if (isVideo) togglePiP();
          break;

        // Переход по процентам (верхний ряд + нумпад)
        case 'Digit0': case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4':
        case 'Digit5': case 'Digit6': case 'Digit7': case 'Digit8': case 'Digit9':
        case 'Numpad0': case 'Numpad1': case 'Numpad2': case 'Numpad3': case 'Numpad4':
        case 'Numpad5': case 'Numpad6': case 'Numpad7': case 'Numpad8': case 'Numpad9':
          e.preventDefault();
          if (media.duration) {
            const num = parseInt(e.code.replace('Digit', '').replace('Numpad', ''));
            media.currentTime = (num / 10) * media.duration;
            showControls();
          }
          break;
      }
    });

    document.addEventListener('keyup', e => {
      if (e.code !== 'Space' || !spaceDown) return;
      e.preventDefault();
      spaceDown = false;

      if (spaceTimer !== null) {
        // Отпустили раньше HOLD_DELAY — обычный тап: play/pause
        clearTimeout(spaceTimer);
        spaceTimer = null;
        togglePlay();
        showControls();
      } else {
        // Было удержание — возвращаем обычную скорость
        stop2x('key');
      }
    });

    // Если окно потеряло фокус при зажатом Space, keyup не придёт — сбрасываем вручную
    window.addEventListener('blur', () => {
      if (!spaceDown) return;
      spaceDown = false;
      clearTimeout(spaceTimer);
      spaceTimer = null;
      stop2x('key');
    });

    /* ============================================
       СТАРТ
       ============================================ */
    updatePlayButton();
    setVolume(1, false);   // false = не показывать плашку громкости при загрузке
    updateSpeedUI();
    showControls();
    wrapper.classList.add('blp-show-controls');

    if (media.readyState >= 1) {
      updateTime();
      updateProgress();
      restorePosition();
    }
  }

  /* ============================================
     ИНИЦИАЛИЗАЦИЯ
     Ищем все video/audio на странице и
     следим за появлением новых
     ============================================ */
  function initAll() {
    document.querySelectorAll('video, audio').forEach(createPlayer);
  }

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches?.('video, audio')) createPlayer(node);
        node.querySelectorAll?.('video, audio').forEach(createPlayer);
      }
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // На всякий случай ещё раз через небольшие задержки
  setTimeout(initAll, 200);
  setTimeout(initAll, 1000);
})();