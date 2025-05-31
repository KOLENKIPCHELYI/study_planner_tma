const ADMIN_EMAIL = "eakimov195@gmail.com"; // Замените на ваш email
const ADMIN_PASSWORD = "123456"; // Замените на ваш пароль

// Элементы интерфейса
const authScreen = document.getElementById('auth-screen');
const appContainer = document.getElementById('app-container');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

// Инициализация Firebase Auth
function initAuth() {
// Временный код для регистрации (удалите после первого входа!)
firebase.auth().createUserWithEmailAndPassword(ADMIN_EMAIL, ADMIN_PASSWORD)
  .then(() => console.log("Admin registered"))
  .catch(error => console.error("Registration error:", error));
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Пользователь авторизован
            const currentGroup = localStorage.getItem('currentGroup');
            if (currentGroup) {
                authScreen.style.display = 'none';
                appContainer.style.display = 'block';
                document.getElementById('current-group').textContent = getGroupName(currentGroup);
            }
        } else {
            // Пользователь не авторизован
            authScreen.style.display = 'flex';
            appContainer.style.display = 'none';
        }
    });
}

// Вход для администратора
loginBtn.addEventListener('click', async () => {
    const password = document.getElementById('admin-password').value;
    const group = document.getElementById('group-select').value;

    if (password !== ADMIN_PASSWORD) {
        alert("Неверный пароль!");
        return;
    }

    try {
        // Аутентификация в Firebase
        await firebase.auth().signInWithEmailAndPassword(ADMIN_EMAIL, password);
        
        localStorage.setItem('authenticated', 'true');
        localStorage.setItem('currentGroup', group);
        location.reload(); // Перезагрузка для инициализации данных
    } catch (error) {
        alert("Ошибка входа: " + error.message);
    }
});

// Выход из системы
logoutBtn.addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        localStorage.clear();
        authScreen.style.display = 'flex';
        appContainer.style.display = 'none';
    });
});

// Вспомогательная функция
function getGroupName(key) {
    const groups = {
        group1: 'Группа 1',
        group2: 'Группа 2',
        group3: 'Группа 3'
    };
    return groups[key] || key;
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initAuth);
