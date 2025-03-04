// worker.js
function getIntersection(x1, y1, v1, x2, y2, v2, threshold) {
    let t = (threshold - v1) / (v2 - v1);
    return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t };
  }
  
  function marchingSquares(grid, cols, rows, gridRes, threshold) {
    let segments = [];
    for (let i = 0; i < cols - 1; i++) {
      for (let j = 0; j < rows - 1; j++) {
        let vTL = grid[i][j];
        let vTR = grid[i + 1][j];
        let vBR = grid[i + 1][j + 1];
        let vBL = grid[i][j + 1];
  
        let tl = vTL > threshold ? 1 : 0;
        let tr = vTR > threshold ? 1 : 0;
        let br = vBR > threshold ? 1 : 0;
        let bl = vBL > threshold ? 1 : 0;
        let state = tl * 8 + tr * 4 + br * 2 + bl;
  
        let x = i * gridRes;
        let y = j * gridRes;
        
        let top = null, right = null, bottom = null, left = null;
        if ((vTL - threshold) * (vTR - threshold) < 0) {
          top = getIntersection(x, y, vTL, x + gridRes, y, vTR, threshold);
        }
        if ((vTR - threshold) * (vBR - threshold) < 0) {
          right = getIntersection(x + gridRes, y, vTR, x + gridRes, y + gridRes, vBR, threshold);
        }
        if ((vBL - threshold) * (vBR - threshold) < 0) {
          bottom = getIntersection(x, y + gridRes, vBL, x + gridRes, y + gridRes, vBR, threshold);
        }
        if ((vTL - threshold) * (vBL - threshold) < 0) {
          left = getIntersection(x, y, vTL, x, y + gridRes, vBL, threshold);
        }
  
        switch (state) {
          case 0:
          case 15:
            break;
          case 1:
          case 14:
            segments.push([left, bottom]);
            break;
          case 2:
          case 13:
            segments.push([bottom, right]);
            break;
          case 3:
          case 12:
            segments.push([left, right]);
            break;
          case 4:
          case 11:
            segments.push([top, right]);
            break;
          case 5:
            segments.push([top, left]);
            segments.push([bottom, right]);
            break;
          case 6:
          case 9:
            segments.push([top, bottom]);
            break;
          case 7:
          case 8:
            segments.push([top, left]);
            break;
          case 10:
            segments.push([top, right]);
            segments.push([bottom, left]);
            break;
        }
      }
    }
    return segments;
  }
  
  onmessage = function(e) {
    // Destructure the incoming data including groupID!
    const { grid, cols, rows, gridRes, threshold, groupID } = e.data;
    const segments = marchingSquares(grid, cols, rows, gridRes, threshold);
    // Include groupID in the outgoing message
    postMessage({ segments, threshold, groupID });
  };
  