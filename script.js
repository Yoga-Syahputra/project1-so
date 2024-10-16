class Task {
  constructor(id, name, estimatedTime, deadline) {
    this.id = id;
    this.name = name;
    this.estimatedTime = estimatedTime;
    this.deadline = new Date(deadline);
    this.startTime = null;
    this.completionTime = null;
    this.waitingTime = 0;
    this.turnaroundTime = 0;
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
                    <td>${task.waitingTime.toFixed(2)}</td>
                    <td>${task.turnaroundTime.toFixed(2)}</td>
                   </tr>`;
    tableBody.innerHTML += row;
  });

  document.getElementById(
    "totalTasks"
  ).innerText = `Total Tasks: ${tasks.length}`;
}

/**
 * Calculates scheduling metrics for each task
 * Waiting Time = Start Time - Deadline
 * Turnaround Time = Completion Time - Deadline
 */

function runFCFS() {
  resetTaskTimes();
  let currentDate = new Date();

  tasks.sort((a, b) => a.deadline - b.deadline);

  let schedule = [];
  tasks.forEach((task) => {

    currentDate = new Date(
      Math.max(currentDate.getTime(), task.deadline.getTime())
    );

    task.startTime = new Date(currentDate);
    task.waitingTime = Math.max(0, (task.startTime - task.deadline) / 3600000);
    task.completionTime = new Date(
      currentDate.getTime() + task.estimatedTime * 3600000
    );
    task.turnaroundTime = (task.completionTime - task.deadline) / 3600000;

    schedule.push({
      task: task,
      duration: task.estimatedTime,
    });
    currentDate = task.completionTime;
  });

  calculateAndDisplayAverages("FCFS");
  displayTasks(tasks);
  drawScheduleTimeline(schedule, "FCFS");
}

function runSJF() {
  resetTaskTimes();
  let currentDate = new Date();

  tasks.sort((a, b) => a.estimatedTime - b.estimatedTime);

  let schedule = [];

  tasks.forEach((task) => {
    task.startTime = new Date(currentDate);
    task.waitingTime = Math.max(0, (task.startTime - task.deadline) / 3600000);
    task.completionTime = new Date(
      currentDate.getTime() + task.estimatedTime * 3600000
    );
    task.turnaroundTime = (task.completionTime - task.deadline) / 3600000;
    schedule.push({
      task: task,
      duration: task.estimatedTime,
    });
    currentDate = task.completionTime;
  });

  calculateAndDisplayAverages("SJF");
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
    )}\nEnd: ${formatDate(
      block.task.completionTime
    )}\nWaiting Time: ${block.task.waitingTime.toFixed(
      2
    )}h\nTurnaround Time: ${block.task.turnaroundTime.toFixed(2)}h`;

    ganttChart.appendChild(div);
  });
}

function calculateAndDisplayAverages(type) {
  let totalCompletionTime = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;

  tasks.forEach((task) => {
    totalCompletionTime += task.estimatedTime;
    totalWaitingTime += task.waitingTime;
    totalTurnaroundTime += task.turnaroundTime;
  });

  let avgCompletionTime = (totalCompletionTime / tasks.length).toFixed(2);
  let avgWaitingTime = (totalWaitingTime / tasks.length).toFixed(2);
  let avgTurnaroundTime = (totalTurnaroundTime / tasks.length).toFixed(2);

  document.getElementById(
    "avgCompletionTime"
  ).innerText = `Average Completion Time (${type}): ${avgCompletionTime} hours`;
  document.getElementById(
    "avgWaitingTime"
  ).innerText = `Average Waiting Time (${type}): ${avgWaitingTime} hours`;
  document.getElementById(
    "avgTurnaroundTime"
  ).innerText = `Average Turnaround Time (${type}): ${avgTurnaroundTime} hours`;
}

function resetTaskTimes() {
  tasks.forEach((task) => {
    task.startTime = null;
    task.completionTime = null;
    task.waitingTime = 0;
    task.turnaroundTime = 0;
  });
}

function resetTable() {
  tasks = [];
  taskId = 1;
  document.querySelector("#resultsTable tbody").innerHTML = "";
  document.getElementById("totalTasks").innerText = "Total Tasks: 0";
  document.getElementById("avgCompletionTime").innerText =
    "Average Completion Time: 0 hours";
  document.getElementById("avgWaitingTime").innerText =
    "Average Waiting Time: 0 hours";
  document.getElementById("avgTurnaroundTime").innerText =
    "Average Turnaround Time: 0 hours";
  document.getElementById("ganttChart").innerHTML = "";
  const comparisonDiv = document.getElementById("comparisonDiv");
  if (comparisonDiv) {
    comparisonDiv.style.display = "none";
  }
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

function compareAlgorithms() {
  const originalTasks = [...tasks];

  runFCFS();
  const fcfsResults = {
    avgCompletionTime: parseFloat(
      document.getElementById("avgCompletionTime").innerText.split(": ")[1]
    ),
    avgWaitingTime: parseFloat(
      document.getElementById("avgWaitingTime").innerText.split(": ")[1]
    ),
    avgTurnaroundTime: parseFloat(
      document.getElementById("avgTurnaroundTime").innerText.split(": ")[1]
    ),
  };

  tasks = [...originalTasks];
  runSJF();
  const sjfResults = {
    avgCompletionTime: parseFloat(
      document.getElementById("avgCompletionTime").innerText.split(": ")[1]
    ),
    avgWaitingTime: parseFloat(
      document.getElementById("avgWaitingTime").innerText.split(": ")[1]
    ),
    avgTurnaroundTime: parseFloat(
      document.getElementById("avgTurnaroundTime").innerText.split(": ")[1]
    ),
  };

  document.getElementById(
    "fcfsAvgCompletionTime"
  ).innerText = `${fcfsResults.avgCompletionTime.toFixed(2)} hours`;
  document.getElementById(
    "sjfAvgCompletionTime"
  ).innerText = `${sjfResults.avgCompletionTime.toFixed(2)} hours`;

  document.getElementById(
    "fcfsAvgWaitingTime"
  ).innerText = `${fcfsResults.avgWaitingTime.toFixed(2)} hours`;
  document.getElementById(
    "sjfAvgWaitingTime"
  ).innerText = `${sjfResults.avgWaitingTime.toFixed(2)} hours`;

  document.getElementById(
    "fcfsAvgTurnaroundTime"
  ).innerText = `${fcfsResults.avgTurnaroundTime.toFixed(2)} hours`;
  document.getElementById(
    "sjfAvgTurnaroundTime"
  ).innerText = `${sjfResults.avgTurnaroundTime.toFixed(2)} hours`;

  document.getElementById("comparisonDiv").style.display = "block";
}


document
  .getElementById("compareButton")
  .addEventListener("click", compareAlgorithms);
