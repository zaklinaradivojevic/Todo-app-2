// --- APPLICATION STATE (Loads from Local Storage or defaults if empty) ---
let todos = JSON.parse(localStorage.getItem("todo-items")) || [
  { id: 1, text: "Complete online JavaScript course", completed: false },
  { id: 2, text: "Jog around the park x3", completed: false },
  { id: 3, text: "10 minutes meditation", completed: false },
  { id: 4, text: "Read for 1 hour", completed: false },
  { id: 5, text: "Pick up groceries", completed: false },
  { id: 6, text: "Completed Todo App on Frontend Mentor", completed: true }
];

let currentFilter = 'all'; 
let draggedItemId = null;

// --- DOM ELEMENTS ---
const tableBody = document.getElementById("table-body") || document.querySelector("#table");
const todoInput = document.getElementById("myInput");
const itemsLeftCount = document.getElementById("dinamicNum");
const themeToggleBtn = document.querySelector(".moon-icon");
const bgSource = document.getElementById("bg-source");
const bgImg = document.getElementById("bg-img");

// --- INITIALIZE APPLICATION ---
document.addEventListener("DOMContentLoaded", () => {
  // Provera sačuvane teme iz Local Storage-a pri učitavanju
  const savedTheme = localStorage.getItem("todo-theme");
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    
    // Čiste lokalne putanje za tamnu temu
    themeToggleBtn.src = "https://raw.githubusercontent.com/zaklinaradivojevic/Todo-app-2/main/todo-app-main/images/icon-sun.svg";
    if (bgSource) bgSource.srcset = "https://raw.githubusercontent.com/zaklinaradivojevic/Todo-app-2/main/todo-app-main/images/bg-mobile-dark.jpg";
    if (bgImg) bgImg.src = "https://raw.githubusercontent.com/zaklinaradivojevic/Todo-app-2/main/todo-app-main/images/bg-desktop-dark.jpg";
  } else {
    // Čiste lokalne putanje za svetlu temu
    themeToggleBtn.src = "https://raw.githubusercontent.com/zaklinaradivojevic/Todo-app-2/main/todo-app-main/images/icon-moon.svg";
    if (bgSource) bgSource.srcset = "https://raw.githubusercontent.com/zaklinaradivojevic/Todo-app-2/main/todo-app-main/images/bg-mobile-light.jpg";
    if (bgImg) bgImg.src = "https://raw.githubusercontent.com/zaklinaradivojevic/Todo-app-2/main/todo-app-main/images/bg-desktop-light.jpg";
  }

  renderTodos();
  setupEventListeners();
});

function setupEventListeners() {
  // Unos novog zadatka na taster Enter
  todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && todoInput.value.trim() !== "") {
      addTodo(todoInput.value.trim());
      todoInput.value = "";
    }
  });

  // Dugmad za filtriranje i čišćenje
  document.getElementById("all").addEventListener("click", () => setFilter('all'));
  document.getElementById("activep").addEventListener("click", () => setFilter('active'));
  document.getElementById("complited").addEventListener("click", () => setFilter('completed'));
  document.getElementById("clear").addEventListener("click", clearCompletedTodos);

  // Prekidač za svetlu i tamnu temu
  themeToggleBtn.addEventListener("click", toggleTheme);
}

// --- SAVE STATE TO STORAGE ---
function saveToLocalStorage() {
  localStorage.setItem("todo-items", JSON.stringify(todos));
}

// --- CORE UTILITIES ---
function renderTodos() {
  tableBody.innerHTML = "";

  let filteredTodos = todos;
  if (currentFilter === 'active') {
    filteredTodos = todos.filter(todo => !todo.completed);
  } else if (currentFilter === 'completed') {
    filteredTodos = todos.filter(todo => todo.completed);
  }

  filteredTodos.forEach((todo) => {
    const tr = document.createElement("tr");
    tr.className = "todo-row";
    tr.setAttribute("draggable", "true");
    tr.dataset.id = todo.id; 

    tr.innerHTML = `
      <td>
        <div class="table-field">
          <div class="table-checked-wrapper">
            <div class="table-checked ${todo.completed ? 'checked-active' : ''}">
              <img class="checked-img" src="https://raw.githubusercontent.com/zaklinaradivojevic/Todo-app-2/main/todo-app-main/images/icon-check.svg" alt="checked-icon" style="display: ${todo.completed ? 'block' : 'none'}">
            </div>
          </div>
          <p class="${todo.completed ? 'text-strike' : ''}">${todo.text}</p>
          <img class="delete-row" src="https://raw.githubusercontent.com/zaklinaradivojevic/Todo-app-2/main/todo-app-main/images/icon-cross.svg" alt="delete-icon">
        </div>
      </td>
    `;

    // Klik interakcije na elemente unutar reda
    const checkBtn = tr.querySelector(".table-checked");
    checkBtn.addEventListener("click", () => toggleTodoComplete(todo.id));

    const textPara = tr.querySelector(".table-field p");
    textPara.addEventListener("click", () => toggleTodoComplete(todo.id));

    const deleteBtn = tr.querySelector(".delete-row");
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    // Povezivanje Drag & Drop događaja
    setupDragAndDropEvents(tr);

    tableBody.appendChild(tr);
  });

  const activeCount = todos.filter(todo => !todo.completed).length;
  itemsLeftCount.textContent = activeCount;
}

// --- STATE OPERATIONS ---
function addTodo(text) {
  const newTodo = {
    id: Date.now(), 
    text: text,
    completed: false
  };
  todos.push(newTodo);
  saveToLocalStorage();
  renderTodos();
}

function toggleTodoComplete(id) {
  todos = todos.map(todo => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });
  saveToLocalStorage();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  saveToLocalStorage();
  renderTodos();
}

function setFilter(filterType) {
  currentFilter = filterType;
  
  document.querySelectorAll(".todo-filters .paragraf").forEach(btn => btn.classList.remove("active"));
  
  if (filterType === 'all') document.getElementById("all").classList.add("active");
  if (filterType === 'active') document.getElementById("activep").classList.add("active");
  if (filterType === 'completed') document.getElementById("complited").classList.add("active");

  renderTodos();
}

function clearCompletedTodos() {
  todos = todos.filter(todo => !todo.completed);
  saveToLocalStorage();
  renderTodos();
}

// --- DRAG AND DROP HANDLING ---
function setupDragAndDropEvents(row) {
  row.addEventListener("dragstart", (e) => {
    draggedItemId = parseInt(row.dataset.id);
    row.classList.add("dragging");
  });

  row.addEventListener("dragend", () => {
    row.classList.remove("dragging");
    draggedItemId = null;
  });

  row.addEventListener("dragover", (e) => {
    e.preventDefault(); 
  });

  row.addEventListener("drop", (e) => {
    e.preventDefault();
    const targetItemId = parseInt(row.dataset.id);

    if (draggedItemId !== null && draggedItemId !== targetItemId) {
      const draggedIndex = todos.findIndex(t => t.id === draggedItemId);
      const targetIndex = todos.findIndex(t => t.id === targetItemId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const movedItem = todos.splice(draggedIndex, 1)[0];
        todos.splice(targetIndex, 0, movedItem);
        saveToLocalStorage();
        renderTodos();
      }
    }
  });
}

// --- LIGHT / DARK MODE TOGGLE ---
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  
  if (currentTheme === "dark") {
    document.documentElement.removeAttribute("data-theme");
    themeToggleBtn.src = "https://raw.githubusercontent.com/zaklinaradivojevic/Todo-app-2/main/todo-app-main/images/icon-moon.svg";
    
    // Menjanje na lokalne svetle pozadinske slike
    if (bgSource) bgSource.srcset = "https://raw.githubusercontent.com/zaklinaradivojevic/Todo-app-2/main/todo-app-main/images/bg-mobile-light.jpg";
    if (bgImg) bgImg.src = "https://raw.githubusercontent.com/zaklinaradivojevic/Todo-app-2/main/todo-app-main/images/bg-desktop-light.jpg";
    
    localStorage.setItem("todo-theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    themeToggleBtn.src = "https://raw.githubusercontent.com/zaklinaradivojevic/Todo-app-2/main/todo-app-main/images/icon-sun.svg";
    
    // Menjanje na lokalne tamne pozadinske slike
    if (bgSource) bgSource.srcset = "https://raw.githubusercontent.com/zaklinaradivojevic/Todo-app-2/main/todo-app-main/images/bg-mobile-dark.jpg";
    if (bgImg) bgImg.src = "https://raw.githubusercontent.com/zaklinaradivojevic/Todo-app-2/main/todo-app-main/images/bg-desktop-dark.jpg";
    
    localStorage.setItem("todo-theme", "dark");
  }
}
