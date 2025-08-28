document.addEventListener("dragover", e => e.preventDefault());
const modal = document.querySelector(".confirm-modal");
const columnsContainer = document.querySelector('.columns');
const columns = columnsContainer.querySelectorAll(".column");
let currentTask = null;

/* =================== FUNCTION ======================== */

const handleDragover = (event) => {
     event.preventDefault();   /*allow drop*/

    const draggedTask = document.querySelector(".dragging");
    const path = event.composedPath();
    const target = path.find(el => el.classList && (el.classList.contains("task") || el.classList.contains("tasks")));


    if(!target || target === draggedTask) return;

    if(target.classList.contains("tasks")) {
        const lastTask = target.lastElementChild;
        if (!lastTask) {
            // task is empty
            target.appendChild(draggedTask);
        } else {
             const { bottom } = target.getBoundingClientRect();
            event.clientY > bottom && target.appendChild(draggedTask)
        }
        
    } else {
        // target is another
        const { top, height } = target.getBoundingClientRect();
        const distance = top + height / 2;

        if (event.clientY < distance) {
            target.before(draggedTask);
        } else {
            target.after(draggedTask);
        }
    }
};
const handleDrop = (event) => {
    event.preventDefault();
};


const handleDragend = (event) => {
    event.target.classList.remove("dragging");
};
const handleDragstart = (event) => {
    event.dataTransfer.dropEffect = 'move';
    event.dataTransfer.setData('text/plain' , '');
    setTimeout(() => event.target.classList.add("dragging"), 0);
};


const handleDelete = (event) => {
    currentTask = event.target.closest(".task");

    // --------------- SHOW PREVIEW -----------------------
    modal.querySelector(".preview").innerText = currentTask.innerText.substring(0,100);
    modal.showModal();
};


const handleEdit = (event) => {
    const task = event.target.closest(".task");
    const input = createTaskInput(task.innerText);
    task.replaceWith(input);
    input.focus();

    // ------------ MOVE CURSOR TO THE END ---------------
    const selection = window.getSelection();
    selection.selectAllChildren(input);
    selection.collapseToEnd();

};

const handleBlur = (event) => {
    const input = event.target;
    const content = input.innerText.trim() || "Untitled";
    const task = createTask(content.replace(/\n/g, "<br>"));
    input.replaceWith(task);
};

const handleAdd = (event) => {
    const tasksEl = event.target.closest(".column").lastElementChild;
    const input = createTaskInput();
    tasksEl.appendChild(input);
    input.focus();
};

const updateTaskCount = (column) => {
    const tasks = column.querySelector(".tasks").children;
    const taskCount = tasks.length;
    column.querySelector(".column-title h3").dataset.tasks = taskCount;
};

const observeTaskChanges = () => {
    for (const column of columns) {
        const observer = new MutationObserver(() => updateTaskCount(column));
        observer.observe(column.querySelector(".tasks"), {childList: true});
    }
};
observeTaskChanges();

const createTask = (content) => {
    const task = document.createElement('div');
    task.className = 'task';
    task.draggable = true;
    task.innerHTML = `
    <div>${content}</div>
    <menu>
        <button data-edit><i class="bi bi-pencil-square"></i></button>
        <button data-delete><i class="bi bi-trash"></i></button>
    </menu>`;
    task.addEventListener('dragstart', handleDragstart);
    task.addEventListener('dragend', handleDragend);
    return task;
};

const createTaskInput = (text = "") => {
    const input = document.createElement("div");
    input.className = "task-input";
    input.dataset.placeholder = "Task name";
    input.contentEditable = true;
    input.innerText = text;
    input.addEventListener('blur', handleBlur);
    return input;
};

/* =============== EVENT LISTENERS ===================== */

// ----------------- DRAG AND DROP ---------------------------
const tasksElements = columnsContainer.querySelectorAll(".tasks");
for(const tasksEl of tasksElements) {
    tasksEl.addEventListener("dragover", handleDragover);
    tasksEl.addEventListener("drop", handleDrop);
}

// ------------ ADD, EDIT & DELETE TASK ---------------
columnsContainer.addEventListener("click", (event) => {
    if (event.target.closest("button[data-add]")) {
        handleAdd(event);
    } else if (event.target.closest("button[data-edit]")) {
        handleEdit(event);
    } else if (event.target.closest("button[data-delete]")) {
        handleDelete(event);
    }
});

// -------------------- CONFIRM DELETION ---------------------------
modal.addEventListener("submit", () => currentTask && currentTask.remove());

// -------------------- CANCEL DELETION ---------------------------
modal.querySelector("#cancel").addEventListener("click", () => modal.close());

// -------------------- CLEAR CURRENT TASK-------------------------
modal.addEventListener("close", () => (currentTask = null));

/* ==================== PLACEHOLDER TASKS ========================= */

let tasks = [
    ["Write Report", "Code Review", "Team Meeting"],
    ["Exercise", "Me Time"],
    [ "Party Time", "Submit Project"],
    [ "Party Time"]
];
tasks.forEach((col,idx) => {
    for (const item of col) {
        columns[idx].querySelector('.tasks').appendChild(createTask(item));
    }
});
