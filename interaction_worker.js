function computeForce(ax, ay, bx, by, coeff) {
  const dx = bx - ax;
  const dy = by - ay;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance === 0) return { fx: 0, fy: 0 };
  const forceMagnitude = coeff / distance; 
  return { fx: (dx / distance) * forceMagnitude, fy: (dy / distance) * forceMagnitude };
}

onmessage = function(e) {
  const { agents, interactions } = e.data;
  const forces = {};
  for (const agent of agents) {
    forces[agent.id] = { fx: 0, fy: 0 };
  }
  
  for (let i = 0; i < agents.length; i++) {
    for (let j = i + 1; j < agents.length; j++) {
      const a = agents[i];
      const b = agents[j];
      const coeff = interactions[a.group][b.group];
      const { fx, fy } = computeForce(a.x, a.y, b.x, b.y, coeff);
      
      forces[a.id].fx += fx;
      forces[a.id].fy += fy;
      forces[b.id].fx -= fx;
      forces[b.id].fy -= fy;
    }
  }
  
  postMessage({ forces });
};
