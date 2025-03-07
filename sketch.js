// Global Settings
const N = 3;
const A = 500000;

const SLIME_THICKNESS = 1;
const SLIME_DECAY = 0.95;
const SLIME_DEPOSIT = 40

const interactionMatrix = [
  [ 0.07,  0.99,  0.99 ], 
  [ 0.27,  0.16, -0.99 ], 
  [ 0.2, -0.99,  0.02   ]  
];

let contourResults = {}; 

let groups = [];
let agents = [];
let attractors = [];
let food_map = [];

let resolution = 4;
let cols, rows;
let gui;

function setup() {
  createCanvas(800,800);
  background(0);
  cols = floor(width / resolution);
  rows = floor(height / resolution);

  create_attractors();
  create_groups();
  create_gui();
  create_agents();
  
}

function draw() {
  background(0);
  update_attractors();
  update_agents();
  updateInteractions();
  update_thresholds();
  // draw_attractors();
  draw_thresholds();
}


