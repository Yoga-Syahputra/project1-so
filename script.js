// Kelas Task untuk merepresentasikan sebuah tugas
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
    this.state = "ready";
    this.contextSwitches = 0;
  }
}

// Variabel untuk menyimpan daftar tugas dan ID tugas berikutnya
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

// Fungsi untuk menampilkan tugas
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
 * Deadline = Arrival Time
 * Estimated Time = Burst Time
 * Waiting Time = Start Time - Deadline
 * Turnaround Time = Completion Time - Deadline
 */

// Konstanta untuk context switch atau pergantian konteks pada setiap tugas (dalam ms)
const CONTEXT_SWITCH_TIME = 100;

// Fungsi untuk menjalankan algoritma FCFS
function runFCFS() {
  resetTaskTimes(); // Mengatur ulang waktu tugas
  let currentDate = new Date();

  // Mengurutkan tugas berdasarkan deadline
  tasks.sort((a, b) => a.deadline - b.deadline);

  let schedule = [];
  let totalContextSwitchTime = 0;

  tasks.forEach((task, index) => {
    // Tambahkan waktu pergantian konteks jika bukan tugas pertama
    if (index > 0) {
      currentDate = new Date(currentDate.getTime() + CONTEXT_SWITCH_TIME);
      totalContextSwitchTime += CONTEXT_SWITCH_TIME;
      task.contextSwitches++;
    }

    // Menyimpan status tugas
    task.state = "running";

    // Tentukan start time tugas (waktu saat ini atau setelah deadline)
    task.startTime = new Date(
      Math.max(currentDate.getTime(), task.deadline.getTime())
    );

    // Hitung waiting time, termasuk waktu context switch
    task.waitingTime = Math.max(
      0,
      (task.startTime - task.deadline) / 3600000 +
        (task.contextSwitches * CONTEXT_SWITCH_TIME) / 3600000
    );

    // Tentukan completion time
    task.completionTime = new Date(
      task.startTime.getTime() + task.estimatedTime * 3600000
    );

    // Hitung turnaround time
    task.turnaroundTime = (task.completionTime - task.deadline) / 3600000;

    // Perbarui status tugas menjadi "completed"
    task.state = "completed";

    // Simpan informasi tugas ke dalam jadwal
    schedule.push({
      task: task,
      duration: task.estimatedTime,
      contextSwitches: task.contextSwitches,
    });

    // Waktu saat ini diperbarui ke completion time
    currentDate = task.completionTime;
  });

  // Menghitung dan menampilkan rata-rata metrik
  calculateAndDisplayAverages("FCFS", totalContextSwitchTime);
  displayTasks(tasks);
  drawScheduleTimeline(schedule, "FCFS");
}

// Fungsi untuk menjalankan algoritma SJF (Non-Preemptive)
function runSJF() {
  resetTaskTimes(); // Mengatur ulang waktu tugas
  let currentDate = new Date();
  let totalContextSwitchTime = 0;

  // Menyaring tugas yang sudah tersedia berdasarkan deadline
  let availableTasks = tasks.filter((task) => task.deadline <= currentDate);
  let remainingTasks = tasks.filter((task) => task.deadline > currentDate);

  let schedule = [];

  while (availableTasks.length > 0 || remainingTasks.length > 0) {
    // Jika tidak ada tugas yang tersedia, tunggu hingga ada yang tiba
    if (availableTasks.length === 0) {
      currentDate = new Date(
        Math.min(...remainingTasks.map((task) => task.deadline.getTime()))
      );
      availableTasks = remainingTasks.filter(
        (task) => task.deadline <= currentDate
      );
      remainingTasks = remainingTasks.filter(
        (task) => task.deadline > currentDate
      );
    }

    // Urutkan tugas yang tersedia berdasarkan estimated time terpendek
    availableTasks.sort((a, b) => a.estimatedTime - b.estimatedTime);

    let task = availableTasks.shift(); // Ambil tugas dengan estimasi waktu terpendek

    // Tambahkan context switch jika bukan tugas pertama
    if (schedule.length > 0) {
      currentDate = new Date(currentDate.getTime() + CONTEXT_SWITCH_TIME);
      totalContextSwitchTime += CONTEXT_SWITCH_TIME;
      task.contextSwitches++;
    }

    // Menyimpan status tugas
    task.state = "running";

    // Tentukan start time tugas
    task.startTime = new Date(currentDate);
    task.waitingTime = Math.max(
      0,
      (task.startTime - task.deadline) / 3600000 +
        (task.contextSwitches * CONTEXT_SWITCH_TIME) / 3600000
    );

    // Tentukan completion time
    task.completionTime = new Date(
      task.startTime.getTime() + task.estimatedTime * 3600000
    );

    // Hitung turnaround time
    task.turnaroundTime = (task.completionTime - task.deadline) / 3600000;

    // Perbarui status tugas menjadi "completed"
    task.state = "completed";

    // Simpan informasi tugas ke dalam jadwal
    schedule.push({
      task: task,
      duration: task.estimatedTime,
      contextSwitches: task.contextSwitches,
    });

    // Waktu saat ini diperbarui ke waktu selesai tugas
    currentDate = task.completionTime;

    // Tambah tugas yang baru tersedia berdasarkan waktu saat ini
    let newAvailableTasks = remainingTasks.filter(
      (task) => task.deadline <= currentDate
    );
    availableTasks = availableTasks.concat(newAvailableTasks);
    remainingTasks = remainingTasks.filter(
      (task) => task.deadline > currentDate
    );
  }

  // Menghitung dan menampilkan rata-rata metrik
  calculateAndDisplayAverages("SJF", totalContextSwitchTime);
  displayTasks(tasks);
  drawScheduleTimeline(schedule, "SJF");
}

// Fungsi untuk menggambar schedule timeline menggunakan gantt chart
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

// Fungsi untuk menghitung dan menampilkan rata-rata metrik
function calculateAndDisplayAverages(type, totalContextSwitchTime) {
  let totalCompletionTime = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;
  let totalContextSwitches = 0;

  tasks.forEach((task) => {
    totalCompletionTime += task.estimatedTime;
    totalWaitingTime += task.waitingTime;
    totalTurnaroundTime += task.turnaroundTime;
    totalContextSwitches += task.contextSwitches;
  });

  let avgCompletionTime = (totalCompletionTime / tasks.length).toFixed(2);
  let avgWaitingTime = (totalWaitingTime / tasks.length).toFixed(2);
  let avgTurnaroundTime = (totalTurnaroundTime / tasks.length).toFixed(2);
  let contextSwitchOverhead = (totalContextSwitchTime / 3600000).toFixed(4);

  document.getElementById(
    "avgCompletionTime"
  ).innerText = `Average Completion Time (${type}): ${avgCompletionTime} hours`;
  document.getElementById(
    "avgWaitingTime"
  ).innerText = `Average Waiting Time (${type}): ${avgWaitingTime} hours`;
  document.getElementById(
    "avgTurnaroundTime"
  ).innerText = `Average Turnaround Time (${type}): ${avgTurnaroundTime} hours`;
  document.getElementById(
    "contextSwitchOverhead"
  ).innerText = `Context Switch Overhead: ${contextSwitchOverhead} hours (${totalContextSwitches} switches)`;
}

// Fungsi untuk mengatur ulang status tugas
function resetTaskTimes() {
  tasks.forEach((task) => {
    task.startTime = null;
    task.completionTime = null;
    task.waitingTime = 0;
    task.turnaroundTime = 0;
    task.state = "ready";
    task.contextSwitches = 0;
  });
}

// Fungsi untuk mengatur ulang tabel
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

// Fungsi untuk melakukan format tanggal
function formatDate(date) {
  return date.toLocaleString();
}

// Fungsi untuk menentukan apakah deadline sudah dekat
function isDeadlineApproaching(deadline) {
  const now = new Date();
  const timeUntilDeadline = deadline - now;
  const daysUntilDeadline = timeUntilDeadline / (1000 * 60 * 60 * 24);

  return daysUntilDeadline <= 2 ? "deadline-approaching" : "deadline-safe";
}

// Fungsi untuk membandingkan algoritma
function compareAlgorithms() {
  const originalTasks = [...tasks];

  resetTaskTimes();
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
    contextSwitchOverhead: document
      .getElementById("contextSwitchOverhead")
      .innerText.split(": ")[1],
  };

  tasks = [...originalTasks];
  resetTaskTimes();
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
    contextSwitchOverhead: document
      .getElementById("contextSwitchOverhead")
      .innerText.split(": ")[1],
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

  document.getElementById("fcfsContextSwitchOverhead").innerText =
    fcfsResults.contextSwitchOverhead;
  document.getElementById("sjfContextSwitchOverhead").innerText =
    sjfResults.contextSwitchOverhead;

  document.getElementById("comparisonDiv").style.display = "block";
}
