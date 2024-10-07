class Process {
  constructor(id, burstTime, arrivalTime) {
    this.id = id;
    this.burstTime = burstTime;
    this.arrivalTime = arrivalTime;
    this.waitingTime = 0;
    this.turnaroundTime = 0;
  }
}

let processes = [];
let processId = 1;
let contextSwitches = 0;

document.getElementById("processForm").addEventListener("submit", (e) => {
  e.preventDefault();

  let burstTime = parseInt(document.getElementById("burstTime").value);
  let arrivalTime = parseInt(document.getElementById("arrivalTime").value);

  processes.push(new Process(processId++, burstTime, arrivalTime));
  displayProcesses(processes);

  // Reset the form
  document.getElementById("processForm").reset();
});

// Display the list of processes
function displayProcesses(processes) {
  let tableBody = document.querySelector("#resultsTable tbody");
  tableBody.innerHTML = "";

  processes.forEach((process) => {
    let row = `<tr>
                    <td>${process.id}</td>
                    <td>${process.burstTime}</td>
                    <td>${process.arrivalTime}</td>
                    <td>${process.waitingTime}</td>
                    <td>${process.turnaroundTime}</td>
                   </tr>`;
    tableBody.innerHTML += row;
  });

  // Display context switches
  document.getElementById(
    "contextSwitches"
  ).innerText = `Context Switches: ${contextSwitches}`;
}

// Reset all processes' waiting and turnaround times
function resetProcessTimes() {
  processes.forEach((process) => {
    process.waitingTime = 0;
    process.turnaroundTime = 0;
  });
}

// Add the Gantt chart drawing function
function drawGanttChart(schedule, type) {
  const ganttChart = document.getElementById("ganttChart");
  ganttChart.innerHTML = ""; // Clear previous chart

  schedule.forEach((block) => {
    const div = document.createElement("div");
    div.classList.add("gantt-block");

    if (block.process) {
      div.innerText = `P${block.process.id}`;
      div.style.width = `${block.duration * 30}px`; // Scale width to represent time
      div.classList.add(type === "FCFS" ? "gantt-fcfs" : "gantt-sjf");
    } else {
      div.innerText = `Idle`;
      div.style.width = `${block.duration * 30}px`;
      div.classList.add("gantt-idle");
    }

    ganttChart.appendChild(div);
  });
}

// Modify FCFS to generate Gantt chart data
function runFCFS() {
  resetProcessTimes();
  contextSwitches = 0;
  let ganttSchedule = [];

  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
  let currentTime = 0;

  processes.forEach((process, index) => {
    if (currentTime < process.arrivalTime) {
      ganttSchedule.push({
        process: null,
        duration: process.arrivalTime - currentTime,
      });
      currentTime = process.arrivalTime;
    }
    process.waitingTime = currentTime - process.arrivalTime;
    process.turnaroundTime = process.waitingTime + process.burstTime;
    ganttSchedule.push({ process, duration: process.burstTime });
    currentTime += process.burstTime;

    if (index > 0) contextSwitches++;
  });

  calculateAndDisplayAverages();
  displayProcesses(processes);
  drawGanttChart(ganttSchedule, "FCFS");
}

// Modify SJF to generate Gantt chart data
function runSJF() {
  resetProcessTimes();
  contextSwitches = 0;
  let ganttSchedule = [];

  let remainingProcesses = [...processes];
  let currentTime = 0;

  while (remainingProcesses.length > 0) {
    remainingProcesses = remainingProcesses
      .filter((p) => p.arrivalTime <= currentTime)
      .sort((a, b) => a.burstTime - b.burstTime);

    if (remainingProcesses.length > 0) {
      let process = remainingProcesses.shift();
      process.waitingTime = currentTime - process.arrivalTime;
      process.turnaroundTime = process.waitingTime + process.burstTime;
      ganttSchedule.push({ process, duration: process.burstTime });
      currentTime += process.burstTime;

      if (remainingProcesses.length > 0) {
        contextSwitches++;
      }
    } else {
      ganttSchedule.push({ process: null, duration: 1 }); // Idle time
      currentTime++;
    }
  }

  calculateAndDisplayAverages();
  displayProcesses(processes);
  drawGanttChart(ganttSchedule, "SJF");
}

// Calculate and display average waiting and turnaround times
function calculateAndDisplayAverages() {
  let totalWaitingTime = processes.reduce((sum, p) => sum + p.waitingTime, 0);
  let totalTurnaroundTime = processes.reduce(
    (sum, p) => sum + p.turnaroundTime,
    0
  );
  let processCount = processes.length;

  let avgWaitingTime = (totalWaitingTime / processCount).toFixed(2);
  let avgTurnaroundTime = (totalTurnaroundTime / processCount).toFixed(2);

  document.getElementById(
    "avgWaitingTime"
  ).innerText = `Average Waiting Time: ${avgWaitingTime}`;
  document.getElementById(
    "avgTurnaroundTime"
  ).innerText = `Average Turnaround Time: ${avgTurnaroundTime}`;
}

// Reset the table and data
function resetTable() {
  processes = [];
  processId = 1;
  contextSwitches = 0;
  document.querySelector("#resultsTable tbody").innerHTML = "";
  document.getElementById("avgWaitingTime").innerText =
    "Average Waiting Time: 0";
  document.getElementById("avgTurnaroundTime").innerText =
    "Average Turnaround Time: 0";
  document.getElementById("contextSwitches").innerText = "Context Switches: 0";
}
