document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.expand();
    tg.enableClosingConfirmation();

    // Применение темы Telegram
    if (tg.colorScheme === 'dark') {
        document.documentElement.style.setProperty('--bg-primary', '#1a1a1a');
        document.documentElement.style.setProperty('--bg-secondary', '#2d2d2d');
        document.documentElement.style.setProperty('--text-primary', '#f8f9fa');
    }

    // Кнопка "Назад" в Telegram
    tg.BackButton.onClick(() => {
        if (appContainer.style.display === 'block') {
            logoutBtn.click();
        }
    });
});
