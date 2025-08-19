import { supabase } from './supabaseClient.js';

const userEmailDisplay = document.getElementById('user-email');
const mobileUserEmailDisplay = document.getElementById('mobile-user-email');
const logoutButton = document.getElementById('logout-button');
const mobileLogoutButton = document.getElementById('mobile-logout-button');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const progressLoadingSpinner = document.getElementById('progress-loading-spinner');
const progressChartCanvas = document.getElementById('progressChart');

let user = null;
let progressChart = null;

const initialize = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
        window.location.href = 'index.html';
        return;
    }
    user = session.user;
    userEmailDisplay.textContent = user.email;
    mobileUserEmailDisplay.textContent = user.email;
    setupEventListeners();
    await loadChartData();
};

const setupEventListeners = () => {
    logoutButton.addEventListener('click', handleLogout);
    mobileLogoutButton.addEventListener('click', handleLogout);
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
};

const loadChartData = async () => {
    progressLoadingSpinner.classList.remove('hidden');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('updated_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('updated_at', sevenDaysAgo.toISOString());

    if (error) {
        console.error('Error fetching progress data:', error);
        progressLoadingSpinner.classList.add('hidden');
        return;
    }
    const processedData = processDataForChart(tasks);
    renderChart(processedData);
    progressLoadingSpinner.classList.add('hidden');
};

const processDataForChart = (tasks) => {
    const dailyCounts = {};
    const labels = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayString = d.toISOString().split('T')[0];
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }));
        dailyCounts[dayString] = 0;
    }
    tasks.forEach(task => {
        const completedDate = new Date(task.updated_at);
        const dayString = completedDate.toISOString().split('T')[0];
        if (dailyCounts.hasOwnProperty(dayString)) {
            dailyCounts[dayString]++;
        }
    });
    return {
        labels: labels,
        data: Object.values(dailyCounts)
    };
};

const renderChart = (chartData) => {
    if (progressChart) {
        progressChart.destroy();
    }
    const ctx = progressChartCanvas.getContext('2d');
    progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Tasks Completed',
                data: chartData.data,
                backgroundColor: 'rgba(79, 70, 229, 0.8)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1,
                borderRadius: 5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1F2937',
                    titleFont: { size: 16 },
                    bodyFont: { size: 14 },
                    padding: 12,
                    cornerRadius: 6,
                }
            }
        }
    });
};

const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
};

initialize();