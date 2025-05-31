document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, запущено ли приложение в Telegram
    const tg = window.Telegram?.WebApp;
    if (!tg) {
        console.error('Telegram WebApp не обнаружен!');
        showNonTelegramWarning();
        return;
    }

    // Инициализация
    tg.expand(); // Растягиваем на весь экран
    tg.enableClosingConfirmation(); // Подтверждение закрытия
    
    // Проверка авторизации
    if (!tg.initDataUnsafe.user) {
        tg.showAlert('Сначала авторизуйтесь в Telegram!');
        tg.close();
        return;
    }

    // Получаем данные пользователя
    const user = tg.initDataUnsafe.user;
    console.log('Авторизован пользователь:', user.username || user.first_name);

    // Настройка темы Telegram
    applyTelegramTheme(tg);

    // Кнопка "Назад"
    setupBackButton(tg);

    // Основная логика приложения
    initApp(tg);
});

/**
 * Применяет тему Telegram (светлая/тёмная)
 */
function applyTelegramTheme(tg) {
    const themeParams = tg.themeParams;
    
    // Устанавливаем CSS-переменные
    document.documentElement.style.setProperty('--bg-primary', themeParams.bg_color || '#ffffff');
    document.documentElement.style.setProperty('--text-primary', themeParams.text_color || '#222222');
    document.documentElement.style.setProperty('--accent', themeParams.button_color || '#2481cc');
    document.documentElement.style.setProperty('--bg-secondary', themeParams.secondary_bg_color || '#f4f4f5');

    // Для тёмной темы добавляем дополнительные стили
    if (tg.colorScheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
    }
}

/**
 * Настраивает кнопку "Назад"
 */
function setupBackButton(tg) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
        // Можно добавить подтверждение выхода
        tg.showConfirm('Закрыть приложение?', (confirmed) => {
            if (confirmed) tg.close();
        });
    });
}

/**
 * Инициализирует основное приложение
 */
function initApp(tg) {
    // Показываем интерфейс
    document.getElementById('app-container').style.display = 'block';
    
    // Настройка MainButton
    tg.MainButton.setText('Сохранить')
        .setParams({ color: tg.themeParams.button_color })
        .show()
        .onClick(() => {
            saveDataToTelegram(tg);
        });
}

/**
 * Сохраняет данные в Telegram Cloud
 */
function saveDataToTelegram(tg) {
    const data = {
        tasks: window.tasks,
        sessions: window.sessions,
        stats: window.stats
    };
    
    tg.sendData(JSON.stringify(data));
    tg.showAlert('Данные сохранены в облако Telegram!');
}

/**
 * Показывает предупреждение для не-Telegram окружения
 */
function showNonTelegramWarning() {
    const warning = document.createElement('div');
    warning.innerHTML = `
        <div class="non-telegram-warning">
            <h2>Это приложение работает только в Telegram!</h2>
            <p>Откройте его через Telegram-бота.</p>
        </div>
    `;
    document.body.appendChild(warning);
    
    // Добавляем стили
    const style = document.createElement('style');
    style.textContent = `
        .non-telegram-warning {
            padding: 20px;
            text-align: center;
            color: #ff0000;
            background: #fff3f3;
            border: 2px solid #ff0000;
            border-radius: 10px;
            margin: 20px;
        }
    `;
    document.head.appendChild(style);
}

// Экспорт для тестирования (если нужно)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        applyTelegramTheme,
        setupBackButton
    };
}
// Только для разработки!
if (!window.Telegram) {
    window.Telegram = {
        WebApp: {
            initDataUnsafe: { user: { id: 123, first_name: "Test" } },
            themeParams: {},
            expand: () => console.log("Expanded"),
            BackButton: { show: () => {}, onClick: () => {} },
            MainButton: { 
                setText: () => {}, 
                show: () => {}, 
                onClick: () => {} 
            }
        }
    };
}
