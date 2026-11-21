'use strict';

const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const warning = document.querySelector('#form-warning');
const list = document.querySelector('#todo-list');
const counter = document.querySelector('#counter');
const emptyState = document.querySelector('#empty-state');
const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));

const state = {
  tasks: [],
  filter: 'all',
  nextId: 1,
};

function showWarning(message) {
  warning.textContent = message;
  warning.hidden = false;
}

function hideWarning() {
  warning.textContent = '';
  warning.hidden = true;
}

function createTaskElement(task) {
  const item = document.createElement('li');
  item.className = 'todo-item';
  item.dataset.id = String(task.id);

  if (task.completed) {
    item.classList.add('completed');
  }

  const label = document.createElement('label');
  label.className = 'todo-item__check';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.setAttribute('aria-label', 'Отметить задачу выполненной');

  checkbox.addEventListener('change', () => {
    task.completed = checkbox.checked;
    render();
  });

  const text = document.createElement('span');
  text.className = 'todo-item__text';
  text.textContent = task.text;

  label.append(checkbox, text);

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'todo-item__delete';
  deleteButton.textContent = 'Удалить';

  deleteButton.addEventListener('click', () => {
    state.tasks = state.tasks.filter(item => item.id !== task.id);
    render();
  });

  item.append(label, deleteButton);

  return item;
}

function getVisibleTasks() {
  if (state.filter === 'active') {
    return state.tasks.filter(task => !task.completed);
  }

  if (state.filter === 'completed') {
    return state.tasks.filter(task => task.completed);
  }

  return state.tasks;
}

function render() {
  const visibleTasks = getVisibleTasks();

  list.replaceChildren(...visibleTasks.map(createTaskElement));

  const remaining = state.tasks.filter(task => !task.completed).length;
  const completed = state.tasks.filter(task => task.completed).length;

  counter.textContent = `Осталось: ${remaining}, Выполнено: ${completed}`;

  filterButtons.forEach(button => {
    const isActive = button.dataset.filter === state.filter;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  emptyState.hidden = visibleTasks.length > 0;

  if (visibleTasks.length === 0) {
    emptyState.textContent = state.tasks.length === 0
      ? 'Пока задач нет. Добавьте первую.'
      : 'Нет задач по выбранному фильтру.';
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const text = input.value.trim();

  if (!text) {
    showWarning('Введите текст задачи — пустую задачу добавить нельзя.');
    input.focus();
    return;
  }

  state.tasks.push({
    id: state.nextId,
    text,
    completed: false,
  });

  state.nextId += 1;

  input.value = '';
  hideWarning();
  render();
  input.focus();
});

input.addEventListener('input', () => {
  if (!warning.hidden) {
    hideWarning();
  }
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    state.filter = button.dataset.filter;
    render();
  });
});

render();