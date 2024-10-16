class Task {
  constructor(id, name, estimatedTime, deadline) {
    this.id = id;
    this.name = name;
    this.estimatedTime = estimatedTime;
    this.deadline = new Date(deadline);
    this.startTime = null;
    this.completionTime = null;
  }
}

let tasks = [];
let currentTaskId = 1;

document.getElementById("taskForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("taskName").value;
  const estimatedTime = parseInt(
    document.getElementById("estimatedTime").value
  );
  const deadline = document.getElementById("deadline").value;

  const newTask = new Task(currentTaskId++, name, estimatedTime, deadline);
  tasks.push(newTask);
  updateTaskTable();
  document.getElementById("taskForm").reset();
});

function updateTaskTable() {
  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = "";

  tasks.forEach((task) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${task.id}</td>
      <td>${task.name}</td>
      <td>${task.estimatedTime}</td>
      <td>${task.deadline.toLocaleString()}</td>
      <td>${
        task.startTime ? new Date(task.startTime).toLocaleString() : ""
      }</td>
      <td>${
        task.completionTime
          ? new Date(task.completionTime).toLocaleString()
          : ""
      }</td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById(
    "totalTasks"
  ).textContent = `Total Tasks: ${tasks.length}`;
}

function runFCFS() {
  if (tasks.length === 0) return;
  tasks.sort((a, b) => a.deadline - b.deadline);
  scheduleTasks();
}

function runSJF() {
  if (tasks.length === 0) return;
  tasks.sort((a, b) => a.estimatedTime - b.estimatedTime);
  scheduleTasks();
}

function scheduleTasks() {
  let currentTime = Date.now();

  tasks.forEach((task) => {
    task.startTime = currentTime;
    currentTime += task.estimatedTime * 3600000;
    task.completionTime = currentTime;
  });

  updateTaskTable();
  renderGanttChart();
}

function renderGanttChart() {
  const ganttChart = document.getElementById("ganttChart");
  ganttChart.innerHTML = "";

  tasks.forEach((task) => {
    const taskBlock = document.createElement("div");
    taskBlock.classList.add("gantt-block", "gantt-fcfs");
    taskBlock.style.width = `${task.estimatedTime * 30}px`;
    taskBlock.textContent = task.name;
    ganttChart.appendChild(taskBlock);
  });
}

function resetTable() {
  tasks = [];
  currentTaskId = 1;
  updateTaskTable();
  document.getElementById("ganttChart").innerHTML = "";
}
