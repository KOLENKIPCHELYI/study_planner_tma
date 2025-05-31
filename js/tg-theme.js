// Конфигурация Firebase (ЗАМЕНИТЕ значения на свои!)
const firebaseConfig = {
  apiKey: "AIzaSyB6Oj0VgRn-UnSyBAbeB-rSO2L_vsGCFWk",
  authDomain: "study-planner-tma.firebaseapp.com",
  databaseURL: "https://study-planner-tma-default-rtdb.firebaseio.com",
  projectId: "study-planner-tma",
  storageBucket: "study-planner-tma.firebasestorage.app",
  messagingSenderId: "750316555731",
  appId: "1:750316555731:web:976f190e97b7bf26fb7326",
  measurementId: "G-QS0E6R6J08"
};

// Инициализация Firebase с проверкой
function initFirebase() {
  try {
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase SDK не загружен');
    }

    // Проверяем, не инициализирован ли уже Firebase
    if (!firebase.apps.length) {
      const app = firebase.initializeApp(firebaseConfig);
      console.log('Firebase инициализирован');
      return app;
    } else {
      return firebase.app();
    }
  } catch (error) {
    console.error('Ошибка инициализации Firebase:', error);
    return null;
  }
}

// Проверка авторизации Telegram
function checkTelegramAuth(tg) {
  if (!tg.initDataUnsafe?.user) {
    tg.showAlert('❌ Сначала авторизуйтесь в Telegram');
    tg.close();
    return false;
  }
  return true;
}

// Основная функция
document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  
  // Режим разработки (если запущено вне Telegram)
  if (!tg) {
    console.warn('Режим разработки: запуск вне Telegram');
    initDevMode();
    return;
  }

  // Инициализируем Firebase
  const firebaseApp = initFirebase();
  if (!firebaseApp) {
    tg.showAlert('🔥 Ошибка подключения к базе данных');
    return;
  }

  // Проверяем авторизацию
  if (!checkTelegramAuth(tg)) return;

  // Настраиваем приложение
  setupApp(tg, firebaseApp);
});

function setupApp(tg, firebase) {
  // 1. Растягиваем на весь экран
  tg.expand();
  tg.enableClosingConfirmation();

  // 2. Применяем тему Telegram
  applyTheme(tg);

  // 3. Настраиваем кнопки
  tg.BackButton.show();
  tg.BackButton.onClick(() => {
    tg.showConfirm('Закрыть приложение?', (confirmed) => {
      if (confirmed) tg.close();
    });
  });

  // 4. Главная кнопка "Сохранить"
  tg.MainButton
    .setText('💾 Сохранить')
    .setParams({ color: tg.themeParams.button_color })
    .show()
    .onClick(() => saveUserData(tg, firebase));

  // 5. Показываем интерфейс
  document.getElementById('app-container').style.display = 'block';
  console.log('Приложение инициализировано');
}

// Сохранение данных пользователя
async function saveUserData(tg, firebase) {
  try {
    const userId = tg.initDataUnsafe.user.id;
    const userData = {
      tasks: window.tasks || [],
      sessions: window.sessions || [],
      lastSave: new Date().toISOString()
    };

    // Сохраняем в Firebase
    await firebase.database().ref(`users/${userId}`).set(userData);
    
    // Дублируем в Telegram Cloud
    tg.sendData(JSON.stringify(userData));
    
    tg.showAlert('✅ Данные сохранены!');
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    tg.showAlert(`❌ Ошибка: ${error.message}`);
  }
}

// Применение темы Telegram
function applyTheme(tg) {
  const root = document.documentElement;
  const params = tg.themeParams;

  root.style.setProperty('--bg-primary', params.bg_color || '#ffffff');
  root.style.setProperty('--text-primary', params.text_color || '#222222');
  root.style.setProperty('--accent', params.button_color || '#2481cc');
  
  if (tg.colorScheme === 'dark') {
    root.classList.add('dark-theme');
  }
}

// Режим разработки (для тестов в браузере)
function initDevMode() {
  console.log('Активирован режим разработки');
  
  // Мок-объект Telegram WebApp
  window.Telegram = {
    WebApp: {
      initDataUnsafe: {
        user: {
          id: 1234567890,
          first_name: 'TestUser',
          username: 'test_dev'
        }
      },
      themeParams: {
        bg_color: '#f0f0f0',
        text_color: '#333333',
        button_color: '#4a80f0'
      },
      colorScheme: 'light',
      expand: () => console.log('[MOCK] App expanded'),
      showAlert: (msg) => alert(`[ALERT] ${msg}`),
      showConfirm: (msg, cb) => cb(confirm(msg)),
      sendData: (data) => console.log('[MOCK] Data sent:', data),
      close: () => console.log('[MOCK] App closed'),
      BackButton: {
        show: () => console.log('[MOCK] BackButton shown'),
        onClick: (cb) => { window.mockBackHandler = cb; }
      },
      MainButton: {
        setText: (t) => console.log(`[MOCK] MainButton text: ${t}`),
        show: () => console.log('[MOCK] MainButton shown'),
        onClick: (cb) => { window.mockMainHandler = cb; }
      }
    }
  };

  // Инициализируем Firebase для разработки
  initFirebase();
}
