// Обработка тем Telegram
document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.expand(); // Растянуть на весь экран
    
    // Применяем тему Telegram
    document.documentElement.style.setProperty('--bg-primary', tg.themeParams.bg_color || '#ffffff');
    document.documentElement.style.setProperty('--text-primary', tg.themeParams.text_color || '#212121');
    document.documentElement.style.setProperty('--bg-secondary', tg.themeParams.secondary_bg_color || '#f5f5f5');
    document.documentElement.style.setProperty('--accent', tg.themeParams.button_color || '#34a4ff');
});
