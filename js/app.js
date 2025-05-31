// Данные приложения
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let stats = {
    studyTime: '0h 0m',
    tasksCompleted: 0,
    sessions: 0,
    efficiency: '0%'
};

// DOM-элементы
const taskInput = document.getElementById('task-input');
const subjectSelect = document.getElementById('subject-select');
const addTaskBtn = document.getElementById('add-task-btn');
const tasksContainer = document.getElementById('tasks-container');
const statsContainer = document.getElementById('stats-container');
const dailyQuote = document.getElementById('daily-quote');

// Инициализация
function init() {
    updateDate();
    renderStats();
    renderTasks();
    loadQuote();
    setupEventListeners();
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

// Добавление задачи
function addTask() {
    const text = taskInput.value.trim();
    const subject = subjectSelect.value;
    
    if (text) {
        const newTask = {
            id: Date.now(),
            text,
            subject,
            completed: false
        };
        
        tasks.push(newTask);
        saveTasks();
        taskInput.value = '';
        renderTasks();
        updateStats();
    }
}

// Удаление задачи
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
}

// Обновление статистики
function updateStats() {
    stats.tasksCompleted = tasks.filter(t => t.completed).length;
    stats.sessions = tasks.length;
    localStorage.setItem('stats', JSON.stringify(stats));
    renderStats();
}

// Сохранение задач в LocalStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Загрузка цитаты дня
function loadQuote() {
    const quotes = [
        "The only limit to our realization of tomorrow is our doubts of today.",
        "My attention is lowered into what Theo knows is not a projector of the paper or present, but that which moves on at night.",
        "Education is the most powerful weapon which you can use to change the world."
    ];
    dailyQuote.textContent = quotes[Math.floor(Math.random() * quotes.length)];
}

// Вспомогательные функции
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
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    tasksContainer.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const id = parseInt(taskItem.dataset.id);
        
        if (e.target.classList.contains('delete-btn')) {
            deleteTask(id);
        } else if (e.target.classList.contains('complete-btn')) {
            completeTask(id);
        }
    });
}

// Запуск приложения
init();
