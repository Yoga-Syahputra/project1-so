class Process {
  constructor(id, burstTime, arrivalTime, priority) {
    this.id = id;
    this.burstTime = burstTime;
    this.arrivalTime = arrivalTime;
    this.priority = priority;
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
  let priority = parseInt(document.getElementById("priority").value);

  processes.push(new Process(processId++, burstTime, arrivalTime, priority));
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
                    <td>${process.priority}</td>
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

// FCFS Scheduling Algorithm
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
}

// SJF Scheduling Algorithm
function runSJF() {
  resetProcessTimes(); // Reset times before running SJF
  contextSwitches = 0; // Reset context switches
  let currentTime = 0;
  let completed = 0;

  while (completed < processes.length) {
    let sjfQueue = processes.filter(
      (p) => p.arrivalTime <= currentTime && p.turnaroundTime === 0
    );
    if (sjfQueue.length > 0) {
      sjfQueue.sort((a, b) => a.burstTime - b.burstTime);
      let shortestJob = sjfQueue[0];

      if (completed > 0) {
        contextSwitches++; // Increment context switch
      }

      shortestJob.waitingTime = currentTime - shortestJob.arrivalTime;
      shortestJob.turnaroundTime =
        shortestJob.waitingTime + shortestJob.burstTime;
      currentTime += shortestJob.burstTime;
      completed++;
    } else {
      currentTime++;
    }
  }

  displayProcesses(processes);
}
