import { supabase } from './supabaseClient.js';

const userEmailDisplay = document.getElementById('user-email');
const mobileUserEmailDisplay = document.getElementById('mobile-user-email');
const logoutButton = document.getElementById('logout-button');
const mobileLogoutButton = document.getElementById('mobile-logout-button');
const addTaskForm = document.getElementById('add-task-form');
const taskInput = document.getElementById('task-input');
const deadlineInput = document.getElementById('deadline-input');
const taskList = document.getElementById('task-list');
const noTasksMessage = document.getElementById('no-tasks-message');
const loadingSpinner = document.getElementById('loading-spinner');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

let user = null;

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
    await fetchAndRenderTasks();
};

const setupEventListeners = () => {
    logoutButton.addEventListener('click', handleLogout);
    mobileLogoutButton.addEventListener('click', handleLogout);
    addTaskForm.addEventListener('submit', handleAddTask);
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
};

const fetchAndRenderTasks = async () => {
    showLoading();

    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

    hideLoading();

    if (error) {
        console.error('Error fetching tasks:', error);
        return;
    }

    taskList.innerHTML = '';
    if (tasks.length === 0) {
        noTasksMessage.classList.remove('hidden');
    } else {
        noTasksMessage.classList.add('hidden');
        tasks.forEach(task => renderTask(task));
    }
};

const renderTask = (task, prepend = false) => {
    const isComplete = task.status === 'completed';
    const taskElement = document.createElement('li');
    taskElement.id = `task-${task.id}`;
    taskElement.dataset.deadline = task.deadline;
    updateTaskAppearance(taskElement, isComplete);

    taskElement.innerHTML = `
        <div class="flex items-center">
            <input
                type="checkbox"
                class="task-checkbox h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                ${isComplete ? 'checked' : ''}
            />
            <div class="ml-4">
                <span class="task-text text-lg ${isComplete ? 'line-through text-gray-400' : ''}">
                    ${task.title}
                </span>
                ${task.deadline ? `
                    <p class="text-xs text-gray-500">
                        Deadline: ${new Date(task.deadline).toLocaleString()}
                    </p>
                ` : ''}
            </div>
        </div>
        <button class="delete-button text-red-500 hover:text-red-700 font-semibold">
            Delete
        </button>
    `;

    const checkbox = taskElement.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => handleToggleTask(task.id, checkbox.checked ? 'completed' : 'incomplete'));
    const deleteButton = taskElement.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => handleDeleteTask(task.id));

    if (prepend) {
        taskList.prepend(taskElement);
    } else {
        taskList.appendChild(taskElement);
    }
};

const updateTaskAppearance = (taskElement, isComplete) => {
    const deadline = taskElement.dataset.deadline;
    const taskText = taskElement.querySelector('.task-text');
    if (taskText) {
        taskText.classList.toggle('line-through', isComplete);
        taskText.classList.toggle('text-gray-400', isComplete);
    }
    const colorClasses = ['bg-red-100', 'border-red-300', 'bg-yellow-100', 'border-yellow-300', 'bg-green-50', 'border-green-200', 'bg-white', 'border-gray-200'];
    taskElement.classList.remove(...colorClasses);
    taskElement.classList.add('p-4', 'rounded-lg', 'border', 'flex', 'items-center', 'justify-between', 'transition');
    const deadlineColorClass = getDeadlineColorClass(deadline, isComplete);
    taskElement.classList.add(...deadlineColorClass.split(' '));
}

const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
};

const handleAddTask = async (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    const deadline = deadlineInput.value || null;
    if (!taskText) return;
    const { data, error } = await supabase
        .from('tasks')
        .insert({ title: taskText, deadline: deadline, user_id: user.id, status: 'incomplete' })
        .select()
        .single();

    if (error) {
        console.error('Error adding task:', error);
    } else {
        renderTask(data, true);
        noTasksMessage.classList.add('hidden');
    }
    addTaskForm.reset();
};

const handleToggleTask = async (taskId, newStatus) => {
    const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .match({ id: taskId });

    if (error) {
        console.error('Error updating task:', error);
    } else {
        const taskElement = document.getElementById(`task-${taskId}`);
        if(taskElement) {
            updateTaskAppearance(taskElement, newStatus === 'completed');
        }
    }
};

const handleDeleteTask = async (taskId) => {
    const { error } = await supabase.from('tasks').delete().match({ id: taskId });
    if (error) {
        console.error('Error deleting task:', error);
    } else {
        document.getElementById(`task-${taskId}`).remove();
        if (taskList.children.length === 0) {
            noTasksMessage.classList.remove('hidden');
        }
    }
};

const showLoading = () => loadingSpinner.classList.remove('hidden');
const hideLoading = () => loadingSpinner.classList.add('hidden');

const getDeadlineColorClass = (deadline, isComplete) => {
    if (isComplete || !deadline || deadline === 'null') return 'bg-white border-gray-200';
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursUntilDeadline = (deadlineDate - now) / (1000 * 60 * 60);

    if (hoursUntilDeadline < 0) return 'bg-red-100 border-red-300';
    if (hoursUntilDeadline <= 24) return 'bg-yellow-100 border-yellow-300';
    return 'bg-green-50 border-green-200';
};

initialize();