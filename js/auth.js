const ADMIN_PASSWORD = "study2024"; // Замените на ваш пароль
const authScreen = document.getElementById('auth-screen');
const appContainer = document.getElementById('app-container');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const groupSelect = document.getElementById('group-select');
const currentGroup = document.getElementById('current-group');

// Проверка авторизации при загрузке
document.addEventListener('DOMContentLoaded', () => {
    const savedGroup = localStorage.getItem('currentGroup');
    const isAuthenticated = localStorage.getItem('authenticated') === 'true';

    if (isAuthenticated && savedGroup) {
        authScreen.style.display = 'none';
        appContainer.style.display = 'block';
        currentGroup.textContent = getGroupName(savedGroup);
    }
});

// Вход
loginBtn.addEventListener('click', () => {
    const password = document.getElementById('admin-password').value;
    const group = groupSelect.value;

    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('authenticated', 'true');
        localStorage.setItem('currentGroup', group);
        authScreen.style.display = 'none';
        appContainer.style.display = 'block';
        currentGroup.textContent = getGroupName(group);
    } else {
        alert('Неверный пароль!');
    }
});

// Выход
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('authenticated');
    localStorage.removeItem('currentGroup');
    authScreen.style.display = 'flex';
    appContainer.style.display = 'none';
    document.getElementById('admin-password').value = '';
});

// Получение названия группы
function getGroupName(key) {
    const groups = {
        group1: 'Группа 1',
        group2: 'Группа 2'
    };
    return groups[key] || key;
}
