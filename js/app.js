// Расширенные данные приложения
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let sessions = JSON.parse(localStorage.getItem('sessions')) || [];
let stats = JSON.parse(localStorage.getItem('stats')) || {
    totalStudyTime: 0, // в секундах
    tasksCompleted: 0,
    sessionsCompleted: 0,
    efficiency: 0
};

// Элементы таймера
let timerInterval;
let timerSeconds = 0;
const timerDisplay = document.getElementById('timer');
const startTimerBtn = document.getElementById('start-timer-btn');
const stopTimerBtn = document.getElementById('stop-timer-btn');
const saveTimerBtn = document.getElementById('save-timer-btn');

// Инициализация таймера
function initTimer() {
    startTimerBtn.addEventListener('click', startTimer);
    stopTimerBtn.addEventListener('click', stopTimer);
    saveTimerBtn.addEventListener('click', saveSession);
}

// Запуск таймера
function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            timerSeconds++;
            updateTimerDisplay();
        }, 1000);
    }
}

// Остановка таймера
function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

// Сохранение сессии
function saveSession() {
    const subject = document.getElementById('subject-select').value;
    if (timerSeconds > 0) {
        sessions.push({
            date: new Date().toISOString(),
            duration: timerSeconds,
            subject
        });
        
        stats.totalStudyTime += timerSeconds;
        stats.sessionsCompleted++;
        updateStats();
        saveData();
        renderSessions();
        
        timerSeconds = 0;
        updateTimerDisplay();
    }
}

// Обновление отображения таймера
function updateTimerDisplay() {
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const seconds = timerSeconds % 60;
    
    timerDisplay.textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Рендер истории сессий
function renderSessions() {
    const container = document.getElementById('sessions-container');
    const currentGroup = localStorage.getItem('currentGroup');
    const groupSessions = sessions.filter(s => s.group === currentGroup);
    
    container.innerHTML = groupSessions.slice(0, 10).map(session => `
        <div class="session-item">
            <div>
                <div>${new Date(session.date).toLocaleString()}</div>
                <div class="session-subject">${getSubjectName(session.subject)}</div>
            </div>
            <div class="session-duration">${formatTime(session.duration)}</div>
        </div>
    `).join('');
}

// Форматирование времени
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? hours + 'ч ' : ''}${minutes}м`;
}

// Инициализация графика
function initChart() {
    const ctx = document.getElementById('progress-chart').getContext('2d');
    const currentGroup = localStorage.getItem('currentGroup');
    const groupSessions = sessions.filter(s => s.group === currentGroup);
    
    // Группировка по дням
    const dailyData = groupSessions.reduce((acc, session) => {
        const date = new Date(session.date).toLocaleDateString();
        acc[date] = (acc[date] || 0) + session.duration;
        return acc;
    }, {});
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(dailyData),
            datasets: [{
                label: 'Время изучения (мин)',
                data: Object.values(dailyData).map(sec => Math.round(sec / 60)),
                backgroundColor: '#4361ee',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Обновляем инициализацию
function init() {
    if (localStorage.getItem('authenticated')) {
        updateDate();
        renderStats();
        renderTasks();
        renderSessions();
        initTimer();
        initChart();
        setupEventListeners();
    }
}
