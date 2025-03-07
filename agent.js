let nextAgentID = 0;

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
  }

  sense(offsetAngle) {
    let sensorDir = this.angle + offsetAngle;
    let sensorX = this.pos.x + cos(sensorDir) * this.group.sensorDistance;
    let sensorY = this.pos.y + sin(sensorDir) * this.group.sensorDistance;
    let i = floor(sensorX / resolution);
    let j = floor(sensorY / resolution);
    if (i >= 0 && i < cols && j >= 0 && j < rows) {
      return this.group.trailMap[i][j] + this.group.food_map[i][j];
    }
    return 0;
  }
  deposit() {
    let i = floor(this.pos.x / resolution);
    let j = floor(this.pos.y / resolution);
    if (i >= 0 && i < cols && j >= 0 && j < rows) {
      this.group.trailMap[i][j] = constrain(this.group.trailMap[i][j] + 10, 0, 255);
    }
  }
  
}

function create_agents() {
  for (let i = 0; i < A; i++) {
    let group = random(groups);
    agents.push(new Agent(random(width), random(height), nextAgentID++, group));
  }
}

function update_agents() {
  for (let agent of agents) {
    agent.update();
    agent.deposit();
  }
  diffuseTrails();
}

function diffuseTrails() {
  groups.forEach(group => {
    let newMap = new Array(cols).fill().map(() => new Array(rows).fill(0));
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