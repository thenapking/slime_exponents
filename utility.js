let msWorker = new Worker('worker.js'); 
let interactionWorker = new Worker('interactionWorker.js'); 

msWorker.onmessage = function(e) {
  const { segments, threshold, groupID } = e.data;
  if (!contourResults[groupID]) {
    contourResults[groupID] = {};
  }
  contourResults[groupID][threshold] = segments;
};

interactionWorker.onmessage = function(e) {
  const { forces } = e.data;
  agents.forEach(agent => {
    if (forces[agent.id]) {
      agent.pos.x += forces[agent.id].fx;
      agent.pos.y += forces[agent.id].fy;
      agent.checkEdges();
    }
  });
}

function updateInteractions() {
  let groupInteractions = [];
  for (let i = 0; i < groups.length; i++) {
    groupInteractions[i] = [];
    for (let j = 0; j < groups.length; j++) {
      groupInteractions[i][j] = groups[i].interactions[j];
    }
  }
  const agentData = agents.map(agent => ({
    id: agent.id,
    x: agent.pos.x,
    y: agent.pos.y,
    group: agent.group.id
  }));
  interactionWorker.postMessage({
    agents: agentData,
    interactions: groupInteractions
  });
}

function resetSimulation() {
  agents = [];
  groups.forEach(group => {
    group.trailMap = new Array(cols).fill().map(() => new Array(rows).fill(0));
  });
  create_agents();
}

function create_gui(){
  gui = new dat.GUI();
  let groupsFolder = gui.addFolder("Groups");
  groups.forEach((group, index) => {
    let folder = groupsFolder.addFolder(`Group ${index}`);
    folder.add(group, 'speed', 0.1, 5).name('Speed');
    folder.add(group, 'sensorDistance', 10, 100).name('Sensor Distance');
    folder.add(group, 'sensorAngle', 0, PI).name('Sensor Angle');
    folder.add(group, 'turnAngle', 0, 1).name('Turn Angle');
    folder.addColor(group, 'strokeColor').name('Stroke Color');
    folder.add(group, 'minThreshold', 0, 255).name('Min Threshold');
    folder.add(group, 'maxThreshold', 0, 255).name('Max Threshold');
    folder.add(group, 'levels', 2, 10, 1).name('Levels');
    let interactionsFolder = folder.addFolder("Interactions");
    for (let j = 0; j < N; j++) {
      interactionsFolder.add(group.interactions, j.toString(), -1, 1, 0.01).name(`With Group ${j}`);
    }
  });
  let simControls = { reset: resetSimulation };
  gui.add(simControls, "reset").name("Reset Simulation");
}


function update_thresholds() {
  for(let group of groups){
    let thresholds = [];
    for (let i = 0; i < group.levels; i++) {
      thresholds.push(group.minThreshold + i * (group.maxThreshold - group.minThreshold) / (group.levels - 1));
    }
    for (let threshold of thresholds) {
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
    resolution: resolution,
    threshold: threshold
  });
}

function draw_thresholds() {
  groups.forEach(group => {
    if (contourResults[group.id]) {
      for (let threshold in contourResults[group.id]) {
        if (Array.isArray(group.strokeColor)) {
          stroke(group.strokeColor[0], group.strokeColor[1], group.strokeColor[2]);
        } else {
          stroke(group.strokeColor);
        }
        strokeWeight(2);
        for (let seg of contourResults[group.id][threshold]) {
          line(seg[0].x, seg[0].y, seg[1].x, seg[1].y);
        }
      }
    }
  });
}

