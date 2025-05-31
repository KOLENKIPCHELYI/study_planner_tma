// Данные приложения
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || {
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
    if (localStorage.getItem('authenticated') {
        updateDate();
        renderStats();
        renderTasks();
        loadQuote();
        setupEventListeners();
    }
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
    const currentGroup = localStorage.getItem('currentGroup');
    const groupTasks = tasks.filter(task => task.group === currentGroup);
    
    tasksContainer.innerHTML = groupTasks.map(task => `
        <div class="task-item" data-id="${task.id}">
            <div>
                <div class="task-title">${task.text}</div>
                <div class="task-subject">${getSubjectName(task.subject)}</div>
            </div>
            <div class="task-actions">
                <button class="complete-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <button class="delete-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Добавление задачи
function addTask() {
    const text = taskInput.value.trim();
    const subject = subjectSelect.value;
    const group = localStorage.getItem('currentGroup');
    
    if (text && group) {
        const newTask = {
            id: Date.now(),
            text,
            subject,
            group,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        saveTasks();
        taskInput.value = '';
        renderTasks();
        updateStats();
    }
}

// Обновление статистики
function updateStats() {
    const currentGroup = localStorage.getItem('currentGroup');
    const groupTasks = tasks.filter(task => task.group === currentGroup);
    
    stats.tasksCompleted = groupTasks.filter(t => t.completed).length;
    stats.sessions = groupTasks.length;
    stats.efficiency = groupTasks.length > 0 
        ? `${Math.round((stats.tasksCompleted / groupTasks.length) * 100)}%` 
        : '0%';
    
    localStorage.setItem('stats', JSON.stringify(stats));
    renderStats();
}

// Сохранение задач
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Загрузка цитаты
function loadQuote() {
    const quotes = [
        "Образование — самое мощное оружие, которое можно использовать, чтобы изменить мир. — Нельсон Мандела",
        "Учитесь так, словно вы постоянно ощущаете нехватку своих знаний. — Конфуций",
        "Наука — это организованные знания, мудрость — это организованная жизнь. — Иммануил Кант"
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
    taskInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTask());
    
    tasksContainer.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const id = parseInt(taskItem.dataset.id);
        
        if (e.target.closest('.delete-btn')) {
            deleteTask(id);
        } else if (e.target.closest('.complete-btn')) {
            completeTask(id);
        }
    });
}

// Запуск приложения
init();
