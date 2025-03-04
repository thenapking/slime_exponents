// Global Settings
let SLIME_THICKNESS = 1;
let SLIME_DECAY = 0.95;
let SLIME_DEPOSIT = 40

let msWorker = new Worker('worker.js'); 
let interactionWorker = new Worker('interactionWorker.js'); 

const interactionMatrix = [
  [ 0.07,  0.99,  0.99 ], 
  [ 0.27,  0.16, -0.99 ], 
  [ 0.2, -0.99,  0.02   ]  
];

let contourResults = {}; 

msWorker.onmessage = function(e) {
  const { segments, threshold, groupID } = e.data;
  if (!contourResults[groupID]) {
    contourResults[groupID] = {};
  }
  contourResults[groupID][threshold] = segments;
};

let groups = [];
let agents = [];
let numAgents = 500000; 

let gridRes = 4;     
let cols, rows;
let nextAgentID = 0;

let gui;


function setup() {
  createCanvas(800, 800);
  background(0);
  
  cols = floor(width / gridRes);
  rows = floor(height / gridRes);
  
  groups.push(new Group(0, '#FF0000', 1.5, 40, 0.07, 0.50, [6,12,24,48]));
  groups.push(new Group(1, '#00FF00', 0.35, 15, 0.35, 0.68, [60, 80]));
  groups.push(new Group(2, '#0000FF', 0.12, 28, 1.23, 0.25, [40,60]));
  
  create_agents();
  
  // --- dat.GUI Setup ---
  gui = new dat.GUI();
  
  // Group settings folder.
  let groupsFolder = gui.addFolder("Groups");
  groups.forEach((group, index) => {
    let folder = groupsFolder.addFolder(`Group ${index}`);
    folder.add(group, 'speed', 0.01, 5).name('Speed');
    folder.add(group, 'sensorDistance', 10, 50).name('Sensor Distance');
    folder.add(group, 'sensorAngle', 0, PI).name('Sensor Angle');
    folder.add(group, 'turnAngle', 0, 1).name('Turn Angle');
    folder.addColor(group, 'strokeColor').name('Stroke Color');
  });
  
  // Interaction matrix settings.
  // Create an object to mirror the matrix.
  let interactionSettings = {
    "0-0": interactionMatrix[0][0],
    "0-1": interactionMatrix[0][1],
    "0-2": interactionMatrix[0][2],
    "1-0": interactionMatrix[1][0],
    "1-1": interactionMatrix[1][1],
    "1-2": interactionMatrix[1][2],
    "2-0": interactionMatrix[2][0],
    "2-1": interactionMatrix[2][1],
    "2-2": interactionMatrix[2][2]
  };
  
  let interactionFolder = gui.addFolder("Interactions");
  Object.keys(interactionSettings).forEach(key => {
    interactionFolder.add(interactionSettings, key, -1, 1, 0.01)
      .onChange(function(value) {
        let indices = key.split("-");
        let i = parseInt(indices[0]);
        let j = parseInt(indices[1]);
        interactionMatrix[i][j] = value;
      });
  });

  // Simulation controls folder.
  let simControls = { reset: resetSimulation };
  let simFolder = gui.addFolder("Simulation");
  simFolder.add(simControls, "reset").name("Reset Simulation");
}

function draw() {
  background(0);
  
  update_agents();
  updateInteractions();
  update_thresholds();
  draw_thresholds();
}

class Group {
  constructor(id, strokeColor, speed, sensorDistance, sensorAngle, turnAngle, thresholds) {
    this.id = id;
    this.strokeColor = strokeColor;
    this.speed = speed;
    this.sensorDistance = sensorDistance;
    this.sensorAngle = sensorAngle;
    this.turnAngle = turnAngle;
    this.thresholds = thresholds;
    
    this.trailMap = new Array(cols)
      .fill()
      .map(() => new Array(rows).fill(0));
  }
}

class Agent {
  constructor(x, y, id, group) {
    this.id = id;
    this.pos = createVector(x, y);
    this.angle = random(TWO_PI);
    this.group = group;
  }
  
  update() {
    let left = this.sense(this.group.sensorAngle);
    let center = this.sense(0);
    let right = this.sense(-this.group.sensorAngle);
    
    if (center > left && center > right) {
    } else if (left > right) {
      this.angle += this.group.turnAngle;
    } else if (right > left) {
      this.angle -= this.group.turnAngle;
    } else {
      this.angle += random(-this.group.turnAngle, this.group.turnAngle);
    }
    
    this.pos.x += cos(this.angle) * this.group.speed;
    this.pos.y += sin(this.angle) * this.group.speed;
    
    // this.applyEdgeTurningForce();
    // this.checkEdges();
  }
  
  sense(offsetAngle) {
    let sensorDir = this.angle + offsetAngle;
    let sensorX = this.pos.x + cos(sensorDir) * this.group.sensorDistance;
    let sensorY = this.pos.y + sin(sensorDir) * this.group.sensorDistance;
    let i = floor(sensorX / gridRes);
    let j = floor(sensorY / gridRes);
    if (i >= 0 && i < cols && j >= 0 && j < rows) {
      return this.group.trailMap[i][j];
    }
    return 0;
  }
  
  deposit() {
    let i = floor(this.pos.x / gridRes);
    let j = floor(this.pos.y / gridRes);
    if (i >= 0 && i < cols && j >= 0 && j < rows) {
      this.group.trailMap[i][j] = constrain(this.group.trailMap[i][j] + SLIME_DEPOSIT, 0, 255);
    }
  }
  
  checkEdges() {
    if (this.pos.x < 0) {
      this.pos.x = width;
    } else if (this.pos.x >= width) {
      this.pos.x = 0;
    }
    
    if (this.pos.y < 0) {
      this.pos.y = height;
    } else if (this.pos.y >= height) {
      this.pos.y = 0;
    }
  }
  
  applyEdgeTurningForce() {
    let edgeThreshold = 50; // pixels from an edge to start turning
    let turningForce = 0;
    let totalWeight = 0;
    
    if (this.pos.x < edgeThreshold) {
      let desired = 0;
      let weight = (edgeThreshold - this.pos.x) / edgeThreshold;
      turningForce += angleDifference(desired, this.angle) * weight;
      totalWeight += weight;
    }
    if (this.pos.x > width - edgeThreshold) {
      let desired = PI;
      let weight = (this.pos.x - (width - edgeThreshold)) / edgeThreshold;
      turningForce += angleDifference(desired, this.angle) * weight;
      totalWeight += weight;
    }
    if (this.pos.y < edgeThreshold) {
      let desired = HALF_PI;
      let weight = (edgeThreshold - this.pos.y) / edgeThreshold;
      turningForce += angleDifference(desired, this.angle) * weight;
      totalWeight += weight;
    }
    if (this.pos.y > height - edgeThreshold) {
      let desired = -HALF_PI;
      let weight = (this.pos.y - (height - edgeThreshold)) / edgeThreshold;
      turningForce += angleDifference(desired, this.angle) * weight;
      totalWeight += weight;
    }
    
    if (totalWeight > 0) {
      let averageForce = turningForce / totalWeight;
      this.angle += 0.1 * averageForce;
    }
  }
}

function angleDifference(target, current) {
  let diff = target - current;
  while (diff < -PI) diff += TWO_PI;
  while (diff > PI) diff -= TWO_PI;
  return diff;
}

// --- Agent and Group Updates ---
function create_agents(){
  for (let i = 0; i < numAgents; i++) {
    let group = random(groups);
    agents.push(new Agent(random(width), random(height), nextAgentID++, group));
  }
}

function update_agents(){
  for (let agent of agents) {
    agent.update();
    agent.deposit();
  }
  diffuseTrails();
}

function diffuseTrails() {
  groups.forEach(group => {
    let newMap = new Array(cols)
      .fill()
      .map(() => new Array(rows).fill(0));
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let sum = 0;
        let count = 0;
        for (let di = -SLIME_THICKNESS; di <= SLIME_THICKNESS; di++) {
          for (let dj = -SLIME_THICKNESS; dj <= SLIME_THICKNESS; dj++) {
            let ni = i + di;
            let nj = j + dj;
            if (ni >= 0 && ni < cols && nj >= 0 && nj < rows) {
              sum += group.trailMap[ni][nj];
              count++;
            }
          }
        }
        let avg = sum / count;
        newMap[i][j] = avg * SLIME_DECAY;
      }
    }
    group.trailMap = newMap;
  });
}

function update_thresholds(){
  for(let group of groups){
    for(let threshold of group.thresholds){
      requestContours(group, threshold);
    }
  }
}

function requestContours(group, threshold) {
  msWorker.postMessage({
    groupID: group.id,
    grid: group.trailMap,
    cols: cols,
    rows: rows,
    gridRes: gridRes,
    threshold: threshold
  });
}

function draw_thresholds(){
  groups.forEach(group => {
    if (contourResults[group.id]) {
      for (let threshold in contourResults[group.id]) {
        stroke(group.strokeColor);
        strokeWeight(2);
        for (let seg of contourResults[group.id][threshold]) {
          line(seg[0].x, seg[0].y, seg[1].x, seg[1].y);
        }
      }
    }
  });
}

// --- Interaction Worker ---
// Offload inter-group interactions to the worker.
function updateInteractions(){
  const agentData = agents.map(agent => ({
    id: agent.id,
    x: agent.pos.x,
    y: agent.pos.y,
    group: agent.group.id  // Use the group's id for interactions.
  }));
  
  interactionWorker.postMessage({
    agents: agentData,
    interactions: interactionMatrix
  });
}

interactionWorker.onmessage = function(e) {
  const { forces } = e.data;
  // Update agent positions based on the computed forces.
  agents.forEach(agent => {
    if (forces[agent.id]) {
      agent.pos.x += forces[agent.id].fx;
      agent.pos.y += forces[agent.id].fy;
      
      // Check edges after applying forces.
      agent.checkEdges();
    }
  });
};

function resetSimulation() {
  // Clear the agents array.
  agents = [];
  
  // Reset each group's trail map to zeros.
  groups.forEach(group => {
    group.trailMap = new Array(cols)
      .fill()
      .map(() => new Array(rows).fill(0));
  });
  
  // Recreate agents with the current group settings.
  create_agents();
}

