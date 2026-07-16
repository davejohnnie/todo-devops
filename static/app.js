const form = document.getElementById("task-form");
const input = document.getElementById("task-title");
const list = document.getElementById("task-list");

async function loadTasks() {
  const res = await fetch("/api/tasks");
  const tasks = await res.json();
  list.innerHTML = "";
  tasks.forEach(renderTask);
}

function renderTask(task) {
  const li = document.createElement("li");
  li.className = "list-group-item d-flex justify-content-between align-items-center";

  const label = document.createElement("span");
  label.textContent = task.title;
  if (task.done) label.classList.add("text-decoration-line-through", "text-muted");

  const btnGroup = document.createElement("div");

  const doneBtn = document.createElement("button");
  doneBtn.className = "btn btn-sm btn-outline-success me-2";
  doneBtn.textContent = task.done ? "Undo" : "Done";
  doneBtn.onclick = () => toggleDone(task.id, !task.done);

  const delBtn = document.createElement("button");
  delBtn.className = "btn btn-sm btn-outline-danger";
  delBtn.textContent = "Delete";
  delBtn.onclick = () => deleteTask(task.id);

  btnGroup.appendChild(doneBtn);
  btnGroup.appendChild(delBtn);
  li.appendChild(label);
  li.appendChild(btnGroup);
  list.appendChild(li);
}

async function toggleDone(id, done) {
  await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done })
  });
  loadTasks();
}

async function deleteTask(id) {
  await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  loadTasks();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title })
  });
  input.value = "";
  loadTasks();
});

loadTasks();