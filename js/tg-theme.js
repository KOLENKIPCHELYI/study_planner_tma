// Инициализация Firebase (добавьте этот блок в начало файла)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Проверяем, инициализировано ли Firebase
function initializeFirebase() {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log("Firebase инициализирован");
    }
    return firebase;
  } catch (error) {
    console.error("Ошибка инициализации Firebase:", error);
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  
  // Режим разработки (если не в Telegram)
  if (!tg) {
    console.warn("Запуск вне Telegram. Активирован режим разработки");
    mockTelegramEnvironment();
    return;
  }

  // Инициализация Firebase
  const firebaseApp = initializeFirebase();
  if (!firebaseApp) {
    tg.showAlert("Ошибка инициализации базы данных");
    return;
  }

  // Основная логика
  tg.expand();
  setupTelegramFeatures(tg, firebaseApp);
});

function setupTelegramFeatures(tg, firebaseApp) {
  // 1. Проверка авторизации
  if (!tg.initDataUnsafe?.user) {
    tg.showAlert("Требуется авторизация в Telegram");
    tg.close();
    return;
  }

  // 2. Применение темы
  applyTheme(tg);

  // 3. Настройка кнопок
  tg.BackButton.show();
  tg.BackButton.onClick(() => handleBackButton(tg));

  // 4. Главная кнопка
  tg.MainButton
    .setText("Сохранить прогресс")
    .show()
    .onClick(() => saveData(tg, firebaseApp));

  // 5. Показываем интерфейс
  document.getElementById("app-container").style.display = "block";
}

function applyTheme(tg) {
  const root = document.documentElement;
  const params = tg.themeParams;

  root.style.setProperty("--bg-primary", params.bg_color || "#ffffff");
  root.style.setProperty("--text-primary", params.text_color || "#222222");
  root.style.setProperty("--accent", params.button_color || "#2481cc");
  
  if (tg.colorScheme === "dark") {
    root.classList.add("dark-mode");
  }
}

async function saveData(tg, firebase) {
  try {
    const userId = tg.initDataUnsafe.user.id;
    const userData = {
      tasks: window.tasks,
      sessions: window.sessions,
      lastUpdated: new Date().toISOString()
    };

    // Сохраняем в Firebase
    await firebase.database().ref(`telegramUsers/${userId}`).set(userData);
    
    // Дублируем в Telegram Cloud
    tg.sendData(JSON.stringify(userData));
    
    tg.showAlert("Данные сохранены!");
  } catch (error) {
    console.error("Ошибка сохранения:", error);
    tg.showAlert("Ошибка: " + error.message);
  }
}

function handleBackButton(tg) {
  tg.showConfirm("Закрыть приложение?", (confirmed) => {
    if (confirmed) tg.close();
  });
}

// Мок-окружение для разработки
function mockTelegramEnvironment() {
  console.warn("Используется мок-окружение Telegram");
  
  window.Telegram = {
    WebApp: {
      initDataUnsafe: {
        user: {
          id: 123456789,
          first_name: "Developer",
          username: "dev_test"
        }
      },
      themeParams: {
        bg_color: "#ffffff",
        text_color: "#222222",
        button_color: "#2481cc"
      },
      colorScheme: "light",
      expand: () => console.log("App expanded"),
      showAlert: (msg) => alert("ALERT: " + msg),
      showConfirm: (msg, callback) => callback(confirm(msg)),
      sendData: (data) => console.log("Data sent:", data),
      close: () => console.log("App closed"),
      BackButton: {
        show: () => console.log("BackButton shown"),
        onClick: (cb) => window.mockBackButton = cb
      },
      MainButton: {
        setText: (t) => console.log("MainButton text:", t),
        show: () => console.log("MainButton shown"),
        onClick: (cb) => window.mockMainButton = cb
      }
    }
  };

  // Имитируем клики для тестов
  setTimeout(() => {
    window.mockBackButton?.();
    window.mockMainButton?.();
  }, 3000);
}

// Для модульных тестов
if (typeof module !== 'undefined') {
  module.exports = {
    initializeFirebase,
    setupTelegramFeatures,
    applyTheme
  };
}
