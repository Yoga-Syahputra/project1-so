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

// Reset the table and process list
function resetTable() {
  processes = [];
  processId = 1;
  contextSwitches = 0;
  displayProcesses(processes);
  document.getElementById("contextSwitches").innerText = "Context Switches: 0";
}

function runFCFS() {
  resetProcessTimes(); // Reset times before running FCFS
  contextSwitches = 0; // Reset context switches
  let currentTime = 0;

  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);

  processes.forEach((process, index) => {
    if (index > 0) {
      contextSwitches++; // Increment context switch when moving to the next process
    }

    process.waitingTime = Math.max(0, currentTime - process.arrivalTime);
    process.turnaroundTime = process.waitingTime + process.burstTime;
    currentTime += process.burstTime;
  });

  displayProcesses(processes);
  displayAverages(); // Menampilkan hasil analisis
}

function runSJF() {
  resetProcessTimes(); // Reset times before running SJF
  contextSwitches = 0; // Reset context switches
  let currentTime = 0;
  let remainingProcesses = [...processes]; // Copy processes array to keep track of remaining processes

  remainingProcesses.sort((a, b) => a.burstTime - b.burstTime);

  while (remainingProcesses.length > 0) {
    let process = remainingProcesses.shift();

    if (process.arrivalTime > currentTime) {
      currentTime = process.arrivalTime; // Adjust current time if process arrives later
    }

    contextSwitches++;
    process.waitingTime = currentTime - process.arrivalTime;
    process.turnaroundTime = process.waitingTime + process.burstTime;
    currentTime += process.burstTime;
  }

  displayProcesses(processes);
  displayAverages(); // Menampilkan hasil analisis
}

// Menghitung Average Waiting Time dan Turnaround Time
function calculateAverages() {
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;

  processes.forEach((process) => {
    totalWaitingTime += process.waitingTime;
    totalTurnaroundTime += process.turnaroundTime;
  });

  const averageWaitingTime = (totalWaitingTime / processes.length).toFixed(2);
  const averageTurnaroundTime = (totalTurnaroundTime / processes.length).toFixed(2);

  return { averageWaitingTime, averageTurnaroundTime };
}

// Menampilkan hasil Average Waiting Time dan Turnaround Time
function displayAverages() {
  const { averageWaitingTime, averageTurnaroundTime } = calculateAverages();
  
  document.getElementById('avgWaitingTime').innerText = `Average Waiting Time: ${averageWaitingTime}`;
  document.getElementById('avgTurnaroundTime').innerText = `Average Turnaround Time: ${averageTurnaroundTime}`;
}
