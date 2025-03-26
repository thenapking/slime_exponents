class Group {
  constructor(id, strokeColor, fillColor, speed, sensorDistance, sensorAngle, turnAngle, minThreshold, maxThreshold, levels, depth) {
    this.id = id;
    this.strokeColor = strokeColor;
    this.fillColor = fillColor;
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
    this.depth = depth || 0
    this.show = false
    this.show_thresholds = true;
    this.type = "slime"
  }
}

const interactionMatrix = [
  [  0.16, -0.99,   0.27,  0.20 ], 
  [ -0.99,  0.02,   0.20,  0.20 ],  
  [ -0.89,  -0.89,  0.05, -0.99 ], 
  [ -0.99,  0.05,  -0.99,  0.05 ]
];

let separation_group;
function create_groups(){
  // groups.push(new Group(0, palette.colours[palette.strokes[5]], palette.colours[palette.strokes[5]], 0.12, 28, 1.23, 0.25, 30, 90, 6, 0));
  // groups.push(new Group(1, palette.colours[palette.strokes[1]], palette.colours[palette.strokes[1]], 0.25, 15, 0.35, 0.68, 60, 160, 6, 1));
  // groups.push(new Group(2, palette.colours[palette.strokes[3]], palette.colours[palette.strokes[3]], 3.50, 50, 0.07, 0.14, 30, 150, 12, 2));
  groups.push(new Group(0, palette.colours[palette.strokes[3]], palette.colours[palette.strokes[3]], 3.50, 50, 0.07, 0.14, 100, 200, 2, 2));

  for(let group of groups){
    for(let other of groups){
      group.interactions[other.id] = interactionMatrix[group.id][other.id];
    }
  }

  // separation_group = new SeparationGroup(0, 0.01, 4, 30, groups[2], "less than");

}
