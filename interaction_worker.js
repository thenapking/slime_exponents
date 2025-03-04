// interactionWorker.js

// Example helper for computing force between two agents.
function computeForce(ax, ay, bx, by, coeff) {
    const dx = bx - ax;
    const dy = by - ay;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return { fx: 0, fy: 0 };
    // Basic force calculation; adjust as needed.
    const forceMagnitude = coeff / distance; 
    return { fx: (dx / distance) * forceMagnitude, fy: (dy / distance) * forceMagnitude };
  }
  
  onmessage = function(e) {
    // Data sent: agents: [{ id, x, y, group }...], interactions: 2D array of coefficients.
    const { agents, interactions } = e.data;
    // Prepare an array to store force vectors, keyed by agent id.
    const forces = {};
    for (const agent of agents) {
      forces[agent.id] = { fx: 0, fy: 0 };
    }
    
    // Loop through pairs (naively, you might optimize with spatial partitioning if needed).
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const a = agents[i];
        const b = agents[j];
        // Get the interaction coefficient between these two groups.
        const coeff = interactions[a.group][b.group];
        // Compute the force vector from a to b.
        const { fx, fy } = computeForce(a.x, a.y, b.x, b.y, coeff);
        
        // Apply force: note that force on a is positive, and force on b is negative.
        forces[a.id].fx += fx;
        forces[a.id].fy += fy;
        forces[b.id].fx -= fx;
        forces[b.id].fy -= fy;
      }
    }
    
    // Return the computed forces
    postMessage({ forces });
  };
  