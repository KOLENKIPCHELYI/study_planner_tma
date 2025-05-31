// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Глобальные переменные
let tasks = [];
let sessions = [];
let stats = {
  totalStudyTime: 0, // в секундах
  tasksCompleted: 0,
  sessionsCompleted: 0,
  efficiency: "0%"
};
let timerInterval;
let timerSeconds = 0;

// DOM элементы
const taskInput = document.getElementById("task-input");
const subjectSelect = document.getElementById("subject-select");
const addTaskBtn = document.getElementById("add-task-btn");
const tasksContainer = document.getElementById("tasks-container");
const statsContainer = document.getElementById("stats-container");
const sessionsContainer = document.getElementById("sessions-container");
const timerDisplay = document.getElementById("timer");
const startTimerBtn = document.getElementById("start-timer-btn");
const stopTimerBtn = document.getElementById("stop-timer-btn");
const saveTimerBtn = document.getElementById("save-timer-btn");
const dailyQuote = document.getElementById("daily-quote");

// Инициализация приложения
async function init() {
  if (localStorage.getItem("authenticated")) {
    await loadDataFromFirebase();
    updateDate();
    renderStats();
    renderTasks();
    renderSessions();
    loadQuote();
    setupEventListeners();
    initTimer();
  }
}

// ======================
// ФУНКЦИИ ДЛЯ РАБОТЫ С FIREBASE
// ======================

/**
 * Загружает все данные из Firebase
 */
async function loadDataFromFirebase() {
  const userId = firebase.auth().currentUser?.uid;
  const currentGroup = localStorage.getItem("currentGroup");

  if (!userId || !currentGroup) return;

  try {
    // Загрузка задач
    const tasksSnapshot = await database
      .ref(`users/${userId}/groups/${currentGroup}/tasks`)
      .once("value");
    tasks = tasksSnapshot.val() || [];

    // Загрузка сессий
    const sessionsSnapshot = await database
      .ref(`users/${userId}/sessions`)
      .orderByChild("group")
      .equalTo(currentGroup)
      .once("value");
    sessions = Object.values(sessionsSnapshot.val() || {});

    // Загрузка статистики
    const statsSnapshot = await database
      .ref(`users/${userId}/stats/${currentGroup}`)
      .once("value");
    stats = statsSnapshot.val() || {
      totalStudyTime: 0,
      tasksCompleted: 0,
      sessionsCompleted: 0,
      efficiency: "0%"
    };
  } catch (error) {
    console.error("Ошибка загрузки из Firebase:", error);
    // Используем локальные данные как fallback
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    sessions = JSON.parse(localStorage.getItem("sessions")) || [];
  }
}

/**
 * Сохраняет задачи в Firebase и локально
 */
async function saveTasks() {
  const userId = firebase.auth().currentUser?.uid;
  const currentGroup = localStorage.getItem("currentGroup");

  if (!userId || !currentGroup) return;

  try {
    // Сохраняем в Firebase
    await database
      .ref(`users/${userId}/groups/${currentGroup}/tasks`)
      .set(tasks);
    
    // Дублируем в localStorage
    localStorage.setItem("tasks", JSON.stringify(tasks));
    console.log("Задачи сохранены");
  } catch (error) {
    console.error("Ошибка сохранения задач:", error);
  }
}

/**
 * Сохраняет сессии в Firebase
 */
async function saveSessions() {
  const userId = firebase.auth().currentUser?.uid;
  const currentGroup = localStorage.getItem("currentGroup");

  if (!userId || !currentGroup) return;

  try {
    await database.ref(`users/${userId}/sessions`).set(sessions);
    localStorage.setItem("sessions", JSON.stringify(sessions));
  } catch (error) {
    console.error("Ошибка сохранения сессий:", error);
  }
}

/**
 * Сохраняет статистику в Firebase
 */
async function saveStats() {
  const userId = firebase.auth().currentUser?.uid;
  const currentGroup = localStorage.getItem("currentGroup");

  if (!userId || !currentGroup) return;

  try {
    await database.ref(`users/${userId}/stats/${currentGroup}`).set(stats);
    localStorage.setItem("stats", JSON.stringify(stats));
  } catch (error) {
    console.error("Ошибка сохранения статистики:", error);
  }
}

// ======================
// ОСНОВНОЙ ФУНКЦИОНАЛ
// ======================

/**
 * Добавляет новую задачу
 */
async function addTask() {
  const text = taskInput.value.trim();
  const subject = subjectSelect.value;
  const group = localStorage.getItem("currentGroup");

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
    await saveTasks(); // Сохраняем в Firebase
    renderTasks();
    updateStats();
    taskInput.value = "";
  }
}

/**
 * Удаляет задачу
 */
async function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  await saveTasks(); // Сохраняем в Firebase
  renderTasks();
  updateStats();
}

/**
 * Отмечает задачу выполненной/невыполненной
 */
async function completeTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    await saveTasks(); // Сохраняем в Firebase
    updateStats();
  }
}

// ======================
// ТАЙМЕР И СЕССИИ
// ======================

/**
 * Инициализация таймера
 */
function initTimer() {
  startTimerBtn.addEventListener("click", startTimer);
  stopTimerBtn.addEventListener("click", stopTimer);
  saveTimerBtn.addEventListener("click", saveSession);
}

function startTimer() {
  if (!timerInterval) {
    timerInterval = setInterval(() => {
      timerSeconds++;
      updateTimerDisplay();
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

async function saveSession() {
  const subject = subjectSelect.value;
  const group = localStorage.getItem("currentGroup");

  if (timerSeconds > 0 && group) {
    const newSession = {
      date: new Date().toISOString(),
      duration: timerSeconds,
      subject,
      group
    };

    sessions.push(newSession);
    stats.totalStudyTime += timerSeconds;
    stats.sessionsCompleted++;
    
    await saveSessions(); // Сохраняем в Firebase
    await saveStats();    // Сохраняем статистику
    
    renderSessions();
    updateStats();
    
    timerSeconds = 0;
    updateTimerDisplay();
    stopTimer();
  }
}

function updateTimerDisplay() {
  const hours = Math.floor(timerSeconds / 3600);
  const minutes = Math.floor((timerSeconds % 3600) / 60);
  const seconds = timerSeconds % 60;
  
  timerDisplay.textContent = 
    `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// ======================
// ОТОБРАЖЕНИЕ ДАННЫХ
// ======================

function renderTasks() {
  const currentGroup = localStorage.getItem("currentGroup");
  const groupTasks = tasks.filter(task => task.group === currentGroup);
  
  tasksContainer.innerHTML = groupTasks.map(task => `
    <div class="task-item" data-id="${task.id}">
      <div>
        <div class="task-title ${task.completed ? "completed" : ""}">${task.text}</div>
        <div class="task-subject">${getSubjectName(task.subject)}</div>
      </div>
      <div class="task-actions">
        <button class="complete-btn">✓</button>
        <button class="delete-btn">✕</button>
      </div>
    </div>
  `).join("");
}

function renderSessions() {
  const currentGroup = localStorage.getItem("currentGroup");
  const groupSessions = sessions
    .filter(session => session.group === currentGroup)
    .slice(0, 10); // Показываем последние 10 сессий
  
  sessionsContainer.innerHTML = groupSessions.map(session => `
    <div class="session-item">
      <div>
        <div>${new Date(session.date).toLocaleString()}</div>
        <div class="session-subject">${getSubjectName(session.subject)}</div>
      </div>
      <div class="session-duration">
        ${formatTime(session.duration)}
      </div>
    </div>
  `).join("");
}

function renderStats() {
  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Время учебы</div>
      <div class="stat-value">${formatTime(stats.totalStudyTime)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Выполнено</div>
      <div class="stat-value">${stats.tasksCompleted}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Сессии</div>
      <div class="stat-value">${stats.sessionsCompleted}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Эффективность</div>
      <div class="stat-value">${stats.efficiency}</div>
    </div>
  `;
}

// ======================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ======================

function updateDate() {
  const options = { weekday: "short", day: "numeric" };
  document.getElementById("current-date").textContent = 
    new Date().toLocaleDateString("ru-RU", options);
}

function updateStats() {
  const currentGroup = localStorage.getItem("currentGroup");
  const groupTasks = tasks.filter(task => task.group === currentGroup);
  
  stats.tasksCompleted = groupTasks.filter(t => t.completed).length;
  stats.efficiency = groupTasks.length > 0 
    ? `${Math.round((stats.tasksCompleted / groupTasks.length) * 100)}%` 
    : "0%";
  
  saveStats(); // Сохраняем статистику
  renderStats();
}

function loadQuote() {
  const quotes = [
    "Учитесь так, словно вы постоянно ощущаете нехватку своих знаний.",
    "Образование — это то, что остается после того, как забывается все выученное в школе.",
    "Наука — это организованные знания, мудрость — это организованная жизнь."
  ];
  dailyQuote.textContent = quotes[Math.floor(Math.random() * quotes.length)];
}

function setupEventListeners() {
  addTaskBtn.addEventListener("click", addTask);
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
  });
  
  tasksContainer.addEventListener("click", (e) => {
    const taskItem = e.target.closest(".task-item");
    if (!taskItem) return;
    
    const id = parseInt(taskItem.dataset.id);
    
    if (e.target.closest(".delete-btn")) {
      deleteTask(id);
    } else if (e.target.closest(".complete-btn")) {
      completeTask(id);
    }
  });
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours > 0 ? hours + "ч " : ""}${minutes}м`;
}

function getSubjectName(key) {
  const subjects = {
    math: "Математика",
    physics: "Физика",
    literature: "Литература",
    language: "Языки",
    other: "Другое"
  };
  return subjects[key] || key;
}

// Автосохранение при закрытии
window.addEventListener("beforeunload", () => {
  saveTasks();
  saveSessions();
  saveStats();
});

// Запуск приложения
document.addEventListener("DOMContentLoaded", init);
