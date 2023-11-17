document.addEventListener('DOMContentLoaded', function () {
  const toggleDarkModeButton = document.getElementById('toggle-dark-mode');
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const deleteAllButton = document.getElementById('delete-all');
  const sortSelect = document.getElementById('sort-tasks');
  const taskStatsElement = document.getElementById('task-stats');

  // Event listener for dark mode toggle
  toggleDarkModeButton.addEventListener('click', function () {
    document.body.classList.toggle('dark-mode');
    document.querySelector('h1').classList.toggle('dark-mode');
    document.querySelector('.container').classList.toggle('dark-mode');
    document.querySelector('label').classList.toggle('dark-mode');
    document.querySelector('button').classList.toggle('dark-mode');
    
  });

  // Event listener for form submission
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const task = input.value.trim();
    const prioritySelect = document.getElementById('priority-select');
    const priority = prioritySelect.value;
    if (task !== '') {
      const listItem = createTaskElement(task, priority);
      list.appendChild(listItem);
      saveTaskToLocalStorage(task, priority);
      input.value = '';
      updateTaskStats();
    }
  });

  // Event listener for task list
  list.addEventListener('click', function (event) {
    const target = event.target;

    if (target.tagName === 'BUTTON' && target.classList.contains('edit')) {
      enterEditMode(target.parentNode);
    } else if (target.tagName === 'BUTTON' && !target.classList.contains('edit')) {
      removeTask(target.parentNode);
      updateTaskStats();
    } else if (target.tagName === 'INPUT' && target.type === 'checkbox') {
      const textToStrike = target.nextElementSibling;
      textToStrike.classList.toggle('strikethrough', target.checked);
      updateTaskStatus(target.parentNode);
      updateTaskStats();
    }
  });

  // Event listener for delete all button
  deleteAllButton.addEventListener('click', function () {
    removeAllTasks();
    
    updateTaskStats();
  });

  // Event listener for task sorting
  sortSelect.addEventListener('change', function () {
    sortTasks(this.value);
  });

// Function to create a task element
function createTaskElement(task, priority, completed) {
const listItem = document.createElement('li');
const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.checked = completed || false; // Set the checkbox state
const span = document.createElement('span');
span.textContent = task;
if (completed) {
  span.classList.add('strikethrough'); // Add strikethrough class if completed
}

// Add a priority dropdown
const prioritySelect = document.createElement('select');
prioritySelect.innerHTML = `
  <option value="low" ${priority === 'low' ? 'selected' : ''}>Low</option>
  <option value="medium" ${priority === 'medium' ? 'selected' : ''}>Medium</option>
  <option value="high" ${priority === 'high' ? 'selected' : ''}>High</option>
`;

const editButton = document.createElement('button');
editButton.textContent = 'Edit';
editButton.classList.add('edit');
const deleteButton = document.createElement('button');
deleteButton.textContent = 'Delete';

listItem.appendChild(checkbox);
listItem.appendChild(span);
listItem.appendChild(prioritySelect);
listItem.appendChild(editButton);
listItem.appendChild(deleteButton);

return listItem;
}



  // Function to save a task to local storage
  function saveTaskToLocalStorage(task, priority) {
    let tasks = getTasksFromLocalStorage();
    tasks.push({ task, priority });
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }


// Function to load tasks from local storage
function loadTasks() {
let tasks = getTasksFromLocalStorage().filter(task=> !task.deleted);
tasks.forEach(({ task, priority, completed }) => {
  const listItem = createTaskElement(task, priority, completed);
  list.appendChild(listItem);
});
}



  // Function to update task status in local storage
  function updateTaskStatus(listItem) {
    const tasks = getTasksFromLocalStorage();
    const taskIndex = Array.from(list.children).indexOf(listItem);
    tasks[taskIndex] = {
      task: listItem.querySelector('span').textContent,
      priority: listItem.querySelector('select').value,
      completed: listItem.querySelector('input[type="checkbox"]').checked
    };
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // Function to remove a task
  function removeTask(listItem) {
    listItem.remove();
    updateLocalStorage();
  }

// Function to remove all completed tasks
function removeCompletedTasks() {
const completedTasks = Array.from(list.children).filter(task => {
  return task.querySelector('input[type="checkbox"]').checked;
});

completedTasks.forEach(task => {
  task.remove();
});

updateTaskStats();
updateLocalStorage();
}

// Function to update local storage after a task is removed
function updateLocalStorage() {
  const tasks = Array.from(list.children).map(taskElement => {
    return {
      task: taskElement.querySelector('span').textContent,
      priority: taskElement.querySelector('select').value,
      completed: taskElement.querySelector('input[type="checkbox"]').checked
    };
  });

  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Event listener for delete all completed tasks button
deleteAllButton.addEventListener('click', function () {
removeCompletedTasks();
});

  // Function to get tasks from local storage
  function getTasksFromLocalStorage() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
  }

  // Function to enter edit mode for a task
  function enterEditMode(listItem) {
    const span = listItem.querySelector('span');
    const editText = prompt('Edit task:', span.textContent);

    if (editText !== null) {
      span.textContent = editText;
      exitEditMode(listItem);
      updateTaskStatus(listItem);
      updateTaskStats();
    }
  }

  // Function to exit edit mode for a task
  function exitEditMode(listItem) {
    listItem.classList.remove('edit-mode');
  }

  // Function to update task completion statistics
  function updateTaskStats() {
    const totalTasks = list.children.length;
    const completedTasks = Array.from(list.children).filter(task => {
      return task.querySelector('input[type="checkbox"]').checked;
    }).length;

    const completionPercentage = totalTasks > 0 ?
      Math.round((completedTasks / totalTasks) * 100) : 0;

    taskStatsElement.textContent = `Task completion: ${completionPercentage}%`;
  }

  // Function to handle task completion change
  function onTaskCompletionChange() {
    updateTaskStats();
    updateTaskStatus(this.parentNode);
  }

  // Event listener for checkbox change
  list.addEventListener('change', function (event) {
    const target = event.target;
    if (target.tagName === 'INPUT' && target.type === 'checkbox') {
      const textToStrike = target.nextElementSibling;
      textToStrike.classList.toggle('strikethrough', target.checked);
      onTaskCompletionChange.call(target.parentNode);
      updateTaskStats();
    }
  });

  // Function to sort tasks based on the selected option
  function sortTasks(sortBy) {
    const tasks = Array.from(list.children);

    switch (sortBy) {
      case 'priority':
        tasks.sort(comparePriority);
        break;
      // Add more cases for additional sorting options
      default:
        // Default sorting (by task order)
        break;
    }

    list.innerHTML = '';
    tasks.forEach(task => list.appendChild(task));
  }

  // Function to compare task priorities for sorting
  function comparePriority(taskA, taskB) {
    const priorityOrder = {
      low: 2,
      medium: 1,
      high: 0
    };

    const priorityA = priorityOrder[getPriorityValue(taskA)];
    const priorityB = priorityOrder[getPriorityValue(taskB)];

    if (priorityA < priorityB) return -1;
    if (priorityA > priorityB) return 1;
    return 0;
  }

  // Function to get priority value for a task
  function getPriorityValue(taskElement) {
    const prioritySelect = taskElement.querySelector('select');
    return prioritySelect ? prioritySelect.value : 'low';
  }

  // Initial loading of tasks
  loadTasks();
  // Initialize task completion stats and default sorting
  updateTaskStats();
  sortTasks('default');
});
