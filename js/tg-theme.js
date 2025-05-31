document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.expand();
    tg.enableClosingConfirmation();

    // Интеграция тем Telegram с Firebase
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            if (tg.colorScheme === 'dark') {
                document.documentElement.style.setProperty('--bg-primary', '#1a1a1a');
                document.documentElement.style.setProperty('--text-primary', '#f8f9fa');
            }
            tg.MainButton.setText("Сохранить в облако").show();
        }
    });

    tg.BackButton.onClick(() => {
        firebase.auth().signOut();
    });
});
