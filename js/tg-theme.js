// js/tg-theme.js
document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.expand(); // Растянуть на весь экран
    
    // Применение темы Telegram
    document.documentElement.style.setProperty('--bg-primary', tg.themeParams.bg_color || '#ffffff');
    document.documentElement.style.setProperty('--text-primary', tg.themeParams.text_color || '#212121');
    // ... остальные цвета
});