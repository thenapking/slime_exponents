class Group {
  constructor(id, strokeColor, speed, sensorDistance, sensorAngle, turnAngle, minThreshold, maxThreshold, levels) {
    this.id = id;
    this.strokeColor = strokeColor;
    this.speed = speed;
    this.sensorDistance = sensorDistance;
    this.sensorAngle = sensorAngle;
    this.turnAngle = turnAngle;
    this.minThreshold = minThreshold;
    this.maxThreshold = maxThreshold;
    this.levels = levels || 2; 
    this.trailMap = new Array(cols).fill().map(() => new Array(rows).fill(0));
    this.food_map = new Array(cols).fill().map(() => new Array(rows).fill(0));
    this.interactions = {};
  }
}

function create_groups(){
  groups.push(new Group(0, '#FF0000', 1.5, 40, 0.07, 0.50, 6, 12, 2));
  groups.push(new Group(1, '#00FF00', 0.35, 15, 0.35, 0.68, 60, 80, 2));
  groups.push(new Group(2, '#0000FF', 0.12, 28, 1.23, 0.25, 40,60, 2));
  

  for(let group of groups){
    for(let other of groups){
      group.interactions[other.id] = interactionMatrix[group.id][other.id];
    }
  }
}