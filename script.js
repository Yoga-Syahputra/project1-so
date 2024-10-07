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
let taskId = 1;

document.getElementById("taskForm").addEventListener("submit", (e) => {
  e.preventDefault();

  let taskName = document.getElementById("taskName").value;
  let estimatedTime = parseInt(document.getElementById("estimatedTime").value);
  let deadline = document.getElementById("deadline").value;

  tasks.push(new Task(taskId++, taskName, estimatedTime, deadline));
  displayTasks(tasks);

  document.getElementById("taskForm").reset();
});

function displayTasks(tasks) {
  let tableBody = document.querySelector("#resultsTable tbody");
  tableBody.innerHTML = "";

  tasks.forEach((task) => {
    let row = `<tr>
                    <td>${task.id}</td>
                    <td class="task-name">${task.name}</td>
                    <td>${task.estimatedTime}</td>
                    <td class="${isDeadlineApproaching(
                      task.deadline
                    )}">${formatDate(task.deadline)}</td>
                    <td>${
                      task.startTime
                        ? formatDate(task.startTime)
                        : "Not started"
                    }</td>
                    <td>${
                      task.completionTime
                        ? formatDate(task.completionTime)
                        : "Not completed"
                    }</td>
                   </tr>`;
    tableBody.innerHTML += row;
  });

  document.getElementById(
    "totalTasks"
  ).innerText = `Total Tasks: ${tasks.length}`;
}

function runFCFS() {
  resetTaskTimes();
  let currentDate = new Date();

  // Sort tasks by deadline
  tasks.sort((a, b) => a.deadline - b.deadline);

  let schedule = [];
  tasks.forEach((task) => {
    task.startTime = new Date(currentDate);
    task.completionTime = new Date(
      currentDate.getTime() + task.estimatedTime * 3600000
    );
    schedule.push({
      task: task,
      duration: task.estimatedTime,
    });
    currentDate = task.completionTime;
  });

  calculateAndDisplayAverages();
  displayTasks(tasks);
  drawScheduleTimeline(schedule, "FCFS");
}

function runSJF() {
  resetTaskTimes();
  let currentDate = new Date();

  // Sort tasks by estimated time (shortest first)
  tasks.sort((a, b) => a.estimatedTime - b.estimatedTime);

  let schedule = [];
  tasks.forEach((task) => {
    task.startTime = new Date(currentDate);
    task.completionTime = new Date(
      currentDate.getTime() + task.estimatedTime * 3600000
    );
    schedule.push({
      task: task,
      duration: task.estimatedTime,
    });
    currentDate = task.completionTime;
  });

  calculateAndDisplayAverages();
  displayTasks(tasks);
  drawScheduleTimeline(schedule, "SJF");
}

function drawScheduleTimeline(schedule, type) {
  const ganttChart = document.getElementById("ganttChart");
  ganttChart.innerHTML = "";

  schedule.forEach((block) => {
    const div = document.createElement("div");
    div.classList.add("gantt-block");
    div.classList.add(type === "FCFS" ? "gantt-fcfs" : "gantt-sjf");

    div.innerText = `${block.task.name} (${block.duration}h)`;
    div.style.width = `${block.duration * 20}px`;

    div.title = `Task: ${block.task.name}\nStart: ${formatDate(
      block.task.startTime
    )}\nEnd: ${formatDate(block.task.completionTime)}`;

    ganttChart.appendChild(div);
  });
}

function calculateAndDisplayAverages() {
  let totalCompletionTime = tasks.reduce((sum, task) => {
    return sum + task.estimatedTime;
  }, 0);

  let avgCompletionTime = (totalCompletionTime / tasks.length).toFixed(2);
  document.getElementById(
    "avgCompletionTime"
  ).innerText = `Average Completion Time: ${avgCompletionTime} hours`;
}

function resetTaskTimes() {
  tasks.forEach((task) => {
    task.startTime = null;
    task.completionTime = null;
  });
}

function resetTable() {
  tasks = [];
  taskId = 1;
  document.querySelector("#resultsTable tbody").innerHTML = "";
  document.getElementById("totalTasks").innerText = "Total Tasks: 0";
  document.getElementById("avgCompletionTime").innerText =
    "Average Completion Time: 0 hours";
  document.getElementById("ganttChart").innerHTML = "";
}

function formatDate(date) {
  return date.toLocaleString();
}

function isDeadlineApproaching(deadline) {
  const now = new Date();
  const timeUntilDeadline = deadline - now;
  const daysUntilDeadline = timeUntilDeadline / (1000 * 60 * 60 * 24);

  return daysUntilDeadline <= 2 ? "deadline-approaching" : "deadline-safe";
}
