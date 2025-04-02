// Global Settings
const N = 1;
const A = 25000;

const SLIME_THICKNESS = 1;
const SLIME_DECAY = 0.95;
const SLIME_DEPOSIT = 40

const NUM_ATTRACTORS = 450;
let palettes = {
  "mindful143": {
    colours: [
      "#4497A1",
      "#FFE314",
      "#216B88",
      "#3D703E",
      "#F6F1E5",
      "#00253F",
    ],
    strokes: [0, 1, 2, 3, 4, 5],
    fills: [4, 3, 1, 1, 2, 1],
    background: "#F6F1E5",
    white: "#F6F1E5",
    black: "#00253F",
  },
  "mindful97": {
    colours: [
      "#F3DACE",
      "#FFC347",
      "#A23F5D",
      "#135952",
      "#F1F3F3",
      "#102329",
    ],
    strokes: [0, 1, 2, 3, 4, 5],
    fills: [4, 3, 1, 1, 2, 1],
    background: "#F1F3F3",
    white: "#F1F3F3",
    black: "#102329",
  }
};

let palette_name = "mindful97";
let palette = palettes[palette_name];


let contourResults = {}; 
let show_agents = false;
let groups = [];
let agents = [];
let attractors = [];
let food_map = [];

let resolution = 8;
let cols, rows;
let gui;

function setup() {
  createCanvas(800, 800);
  background(0);
  cols = floor(width*2 / resolution);
  rows = floor(height*2 / resolution);

  create_attractors();
  create_groups();
  create_gui();
  create_agents();
  
}

function draw() {
  background(palette.background);
  // translate(width/2, height/2);
  // rotate(PI/4);
  // translate(-width/2, -height/2);
  update_attractors();
  update_agents();
  updateInteractions();
  update_thresholds();
  // draw_attractors();
  draw_thresholds();
  // draw_hatched_thresholds()
  // draw_depth_pixels()
  draw_agents();
}

function draw_agents() {
  if(!simControls.show_agents) { return }

  for(let agent of agents){
    if(agent.group.show){
      agent.draw();
    }
  }
}

