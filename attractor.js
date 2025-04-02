function create_attractors() {
  for (let i = 0; i < NUM_ATTRACTORS; i++) {
    let x = random(width);
    let y = random(height);
    let radius = random(20, 50);
    let interval = floor(random(60, 180));
    let strength = random(10, 30);
    attractors.push(new Attractor(i, x, y, radius, interval, strength));
  }
}

class Attractor {
  constructor(id, x, y, radius, interval, strength) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.interval = interval;
    this.strength = strength;
  }

  update() {
    let i0 = floor(this.x / resolution);
    let j0 = floor(this.y / resolution);
    let rCells = floor(this.radius / resolution);
    for (let i = max(0, i0 - rCells); i <= min(cols - 1, i0 + rCells); i++) {
      for (let j = max(0, j0 - rCells); j <= min(rows - 1, j0 + rCells); j++) {
        let dx = (i * resolution + resolution/2) - this.x;
        let dy = (j * resolution + resolution/2) - this.y;
        if(dx * dx + dy * dy <= this.radius * this.radius) {
          for(let group of groups){
            group.food_map[i][j] += this.strength
          }
        }
      }
    }
  }

  draw() {
    push();
    noStroke();
    fill(255)
    circle(this.x, this.y, this.radius * 2);
    pop();
  }
}

function update_attractors() {
  for(let attractor of attractors) {
    attractor.update();
  }
}

function draw_attractors() {
  for(let attractor of attractors) {
    attractor.draw();
  }
}
