// Данные
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || {
    studyTime: '0h 0m',
    tasksCompleted: 0,
    sessions: 0,
    efficiency: '0%'
};

// Таймер Pomodoro
let timerInterval;
let timerTime = 25 * 60; // 25 минут
let isTimerRunning = false;

// DOM-элементы
const taskInput = document.getElementById('task-input');
const subjectSelect = document.getElementById('subject-select');
const addTaskBtn = document.getElementById('add-task-btn');
const tasksContainer = document.getElementById('tasks-container');
const statsContainer = document.getElementById('stats-container');
const dailyQuote = document.getElementById('daily-quote');
const timerDisplay = document.getElementById('timer');
const startTimerBtn = document.getElementById('start-timer-btn');
const resetTimerBtn = document.getElementById('reset-timer-btn');

// Инициализация
function init() {
    updateDate();
    renderStats();
    renderTasks();
    loadQuote();
    setupEventListeners();
    updateTimerDisplay();
}

// Обновление даты
function updateDate() {
    const options = { weekday: 'short', day: 'numeric' };
    document.getElementById('current-date').textContent = 
        new Date().toLocaleDateString('en-US', options);
}

// Рендер статистики
function renderStats() {
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Study Time</div>
            <div class="stat-value">${stats.studyTime}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Tasks Done</div>
            <div class="stat-value">${stats.tasksCompleted}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Sessions</div>
            <div class="stat-value">${stats.sessions}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Efficiency</div>
            <div class="stat-value">${stats.efficiency}</div>
        </div>
    `;
}

// Рендер задач
function renderTasks() {
    tasksContainer.innerHTML = tasks.map(task => `
        <div class="task-item" data-id="${task.id}">
            <div>
                <div class="task-title">${task.text}</div>
                <div class="task-subject">${getSubjectName(task.subject)}</div>
            </div>
            <div class="task-actions">
                <button class="complete-btn">✓</button>
                <button class="delete-btn">✕</button>
            </div>
        </div>
    `).join('');
}

// Управление задачами
function addTask() {
    const text = taskInput.value.trim();
    const subject = subjectSelect.value;
    
    if (text) {
        tasks.push({
            id: Date.now(),
            text,
            subject,
            completed: false
        });
        saveData();
        taskInput.value = '';
        renderTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveData();
    renderTasks();
}

function completeTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveData();
        renderTasks();
        updateStats();
    }
}

// Таймер Pomodoro
function startTimer() {
    if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        startTimerBtn.textContent = 'Старт';
    } else {
        timerInterval = setInterval(() => {
            timerTime--;
            updateTimerDisplay();
            if (timerTime <= 0) {
                clearInterval(timerInterval);
                alert('Таймер завершён!');
                updateStudyTime();
                resetTimer();
            }
        }, 1000);
        isTimerRunning = true;
        startTimerBtn.textContent = 'Пауза';
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timerTime = 25 * 60;
    isTimerRunning = false;
    startTimerBtn.textContent = 'Старт';
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerTime / 60);
    const seconds = timerTime % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updateStudyTime() {
    const [hours, minutes] = stats.studyTime.split('h ');
    const newMinutes = parseInt(minutes) + 25;
    stats.studyTime = `${hours}h ${newMinutes}m`;
    saveData();
    renderStats();
}

// Вспомогательные функции
function saveData() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('stats', JSON.stringify(stats));
}

function updateStats() {
    stats.tasksCompleted = tasks.filter(t => t.completed).length;
    stats.sessions = tasks.length;
    stats.efficiency = `${Math.floor((stats.tasksCompleted / stats.sessions) * 100) || 0}%`;
    saveData();
    renderStats();
}

function loadQuote() {
    const quotes = [
        "The only limit to our realization of tomorrow is our doubts of today.",
        "My attention is lowered into what Theo knows is not a projector of the paper or present, but that which moves on at night.",
        "Education is the most powerful weapon which you can use to change the world."
    ];
    dailyQuote.textContent = quotes[Math.floor(Math.random() * quotes.length)];
}

function getSubjectName(key) {
    const subjects = {
        math: 'Математика',
        physics: 'Физика',
        literature: 'Литература'
    };
    return subjects[key];
}

// Обработчики событий
function setupEventListeners() {
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTask());
    
    tasksContainer.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const id = parseInt(taskItem.dataset.id);
        if (e.target.classList.contains('delete-btn')) deleteTask(id);
        if (e.target.classList.contains('complete-btn')) completeTask(id);
    });

    startTimerBtn.addEventListener('click', startTimer);
    resetTimerBtn.addEventListener('click', resetTimer);
}

// Запуск
init();
