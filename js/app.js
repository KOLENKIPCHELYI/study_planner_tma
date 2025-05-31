// js/app.js
function updateDate() {
    const options = { weekday: 'short', day: 'numeric' };
    document.getElementById('current-date').textContent = 
        new Date().toLocaleDateString('en-US', options);
}

document.addEventListener('DOMContentLoaded', updateDate);