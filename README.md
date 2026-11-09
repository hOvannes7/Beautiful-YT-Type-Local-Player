<h1 align="center">🎬 Beautiful YT Type Local Player</h1>

<p align="center">
  <strong>Кастомный YouTube-подобный плеер для локальных видео и аудио в Chrome</strong>
</p>

<p align="center">
  <a href="https://www.google.com/chrome/"><img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome"></a>
  <a href="manifest.json"><img src="https://img.shields.io/badge/Manifest-V3-34A853?style=for-the-badge&logo=json&logoColor=white" alt="Manifest"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License"></a>
  <a href="https://github.com/hOvannes7/Beautiful-YT-Type-Local-Player"><img src="https://img.shields.io/badge/GitHub-hOvannes7-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"></a>
</p>

<p align="center">
  <em>Современный интерфейс вместо стандартного плеера Chrome для файлов <code>file://</code></em>
</p>

---

## 📖 О проекте

**Beautiful YT Type Local Player** — это расширение для Chrome, которое заменяет унылый стандартный плеер на стильный тёмный интерфейс в духе YouTube. Работает с **локальными** видео и аудио файлами (file://), открытыми прямо в браузере.

Забудь про стандартный video элемент Chrome — теперь у тебя красивый плеер с горячими клавишами, запоминанием позиции и кучей фишек.

---

## ✨ Возможности

- 🌙 Современный дизайн в духе YouTube
- 💾 Запоминание позиции просмотра
- ⌨️ Горячие клавиши (J/K/L, стрелки, F, P, H, кадры , / . и др.)
- 🖱️ Удержание ЛКМ — временный ×2
- 👆 Двойной клик — полноэкранный режим
- 🔁 Контекстное меню (ПКМ): зацикливание, мини-плеер, отражение, сброс позиции
- 📺 Картинка в картинке (PiP), скорость 0.25×–2×
- 🧹 Попап: очистка сохранённых позиций + справка по клавишам

---

## 🚀 Установка (режим разработчика)

1. **Скачай или клонируй** репозиторий
2. Открой chrome://extensions
3. Включи **Режим разработчика**
4. **Загрузить распакованное расширение** → выбери папку с файлами
5. Открой любой локальный .mp4 / .webm / .mp3 в Chrome

> 💡 Для работы с локальными файлами Chrome может попросить доступ к файлам — разреши его в карточке расширения.

---

## 📁 Структура

```
BeautifulYTTypeLocalPlayer/
├── manifest.json
├── README.md
├── content.js           # Плеер (file://)
├── styles.css
├── popup.html
├── popup.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## ⌨️ Горячие клавиши

| Клавиши | Действие |
|:--------|:---------|
| Space / K | ▶️ Play / Pause |
| J / L | ⏪ Замедлить / ⏩ Ускорить |
| ← / → | ⏱️ ±5 сек (Shift — ±10 сек) |
| ↑ / ↓ | 🔊 Громкость |
| M | 🔇 Mute |
| F | 🖥️ Полный экран |
| P | 📺 Картинка в картинке |
| H | 🪞 Отразить по горизонтали |
| , / . | 🎞️ Кадр назад / вперёд |
| 0–9 | 📊 Переход на 0%–90% |
| Двойной клик | 🖥️ Полный экран |
| Удержание ЛКМ | ⚡ Временно ×2 |

---

## 🔐 Разрешения

| Разрешение | Зачем нужно |
|:-----------|:------------|
| storage | 💾 Сохранение позиций просмотра |
| file://*/* | 📂 Работа с локальными файлами |

---

## 📄 Лицензия

**MIT** — делай что хочешь. ❤️
