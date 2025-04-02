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
  for(let agent of agents){
    if (forces[agent.id]) {
      agent.pos.x += forces[agent.id].fx;
      agent.pos.y += forces[agent.id].fy;
      agent.checkEdges();
    }
  }
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
  for(let group of groups){
    group.trailMap = new Array(cols).fill().map(() => new Array(rows).fill(0));
  };
  create_agents();
}

let simControls = { 
  reset: resetSimulation, 
  show_agents: false
};

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
    folder.add(group, 'show').name('Show Agents');
    folder.add(group, 'show_thresholds').name('Show Thresholds');
    folder.add(group, 'depth', 0, 10, 1).name('Depth');
    let interactionsFolder = folder.addFolder("Interactions");
    for (let j = 0; j < N; j++) {
      interactionsFolder.add(group.interactions, j.toString(), -1, 1, 0.01).name(`With Group ${j}`);
    }
  });
  
  gui.add(simControls, "reset").name("Reset Simulation");
  gui.add(simControls, "show_agents").name("Show Agents");
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
  for(let group of groups){
    if(!group.show_thresholds) { continue }
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
  }
}

function hatchThresholdBand(group, lower, upper, spacing) {
  stroke(group.fillColor);
  strokeWeight(1);
  for (let j = 0; j < rows; j++) {
    let drawing = false;
    let segStart = 0;
    for (let i = 0; i < cols; i++) {
      let val = group.trailMap[i][j];
      if (val >= lower && val < upper) {
        if (!drawing) {
          segStart = i;
          drawing = true;
        }
      } else {
        if (drawing) {
          let x1 = segStart * resolution;
          let x2 = i * resolution;
          let y = j * resolution;
          for (let sy = y; sy < y + resolution; sy += spacing) {
            line(x1, sy, x2, sy);
          }
          drawing = false;
        }
      }
    }
    if (drawing) {
      let x1 = segStart * resolution;
      let x2 = cols * resolution;
      let y = j * resolution;
      for (let sy = y; sy < y + resolution; sy += spacing) {
        line(x1, sy, x2, sy);
      }
    }
  }
}

function draw_hatched_thresholds() {
  for(let group of groups){
    if(!group.show_thresholds) { continue }
    let thresholds = [];
    for (let i = 0; i < group.levels; i++) {
      thresholds.push(group.minThreshold + i * (group.maxThreshold - group.minThreshold) / (group.levels - 1));
    }
    for (let i = 0; i < thresholds.length - 1; i++) {
      hatchThresholdBand(group, thresholds[i], thresholds[i+1], 2);
    }
  };
}

function draw_depth_pixels() {
  loadPixels();
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let cellColor = null;
      for (let group of groups) {
        if(!group.show_thresholds) { continue }
        let val = group.trailMap[i][j];
        if (val >= group.minThreshold && val <= group.maxThreshold) {
          cellColor = color(group.strokeColor);
          break;
        }
      }
      if (cellColor !== null) {
        for (let y = j * resolution; y < (j + 1) * resolution; y++) {
          for (let x = i * resolution; x < (i + 1) * resolution; x++) {
            let index = (y * width + x) * 4;
            pixels[index] = red(cellColor);
            pixels[index + 1] = green(cellColor);
            pixels[index + 2] = blue(cellColor);
            pixels[index + 3] = 255;
          }
        }
      }
    }
  }
  updatePixels();
}




