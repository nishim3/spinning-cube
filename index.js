/**
 * Spinning ASCII Cubes
 * A 3D ASCII art animation of rotating cubes in the terminal
 */

// Rotation angles
let A = 0;
let B = 0;
let C = 0;

// Display configuration
const width = 160;
const height = 44;
const backgroundASCIICode = '.';
const distanceFromCam = 100;
const K1 = 40;
const incrementSpeed = 0.6;

// Buffers
let zBuffer = new Float32Array(width * height);
let buffer = new Array(width * height);

// Horizontal offset for positioning cubes
let horizontalOffset = 0;

/**
 * Calculate X coordinate after 3D rotation
 */
function calculateX(i, j, k) {
  return (
    j * Math.sin(A) * Math.sin(B) * Math.cos(C) -
    k * Math.cos(A) * Math.sin(B) * Math.cos(C) +
    j * Math.cos(A) * Math.sin(C) +
    k * Math.sin(A) * Math.sin(C) +
    i * Math.cos(B) * Math.cos(C)
  );
}

/**
 * Calculate Y coordinate after 3D rotation
 */
function calculateY(i, j, k) {
  return (
    j * Math.cos(A) * Math.cos(C) +
    k * Math.sin(A) * Math.cos(C) -
    j * Math.sin(A) * Math.sin(B) * Math.sin(C) +
    k * Math.cos(A) * Math.sin(B) * Math.sin(C) -
    i * Math.cos(B) * Math.sin(C)
  );
}

/**
 * Calculate Z coordinate after 3D rotation
 */
function calculateZ(i, j, k) {
  return k * Math.cos(A) * Math.cos(B) - j * Math.sin(A) * Math.cos(B) + i * Math.sin(B);
}

/**
 * Calculate and render a point on a cube surface
 */
function calculateForSurface(cubeX, cubeY, cubeZ, cubeWidth, ch) {
  const x = calculateX(cubeX, cubeY, cubeZ);
  const y = calculateY(cubeX, cubeY, cubeZ);
  const z = calculateZ(cubeX, cubeY, cubeZ) + distanceFromCam;

  const ooz = 1 / z;

  const xp = Math.floor(width / 2 + horizontalOffset + K1 * ooz * x * 2);
  const yp = Math.floor(height / 2 + K1 * ooz * y);

  const idx = xp + yp * width;

  if (idx >= 0 && idx < width * height) {
    if (ooz > zBuffer[idx]) {
      zBuffer[idx] = ooz;
      buffer[idx] = ch;
    }
  }
}

/**
 * Render a single cube at the current horizontal offset
 */
function renderCube(cubeWidth) {
  for (let cubeX = -cubeWidth; cubeX < cubeWidth; cubeX += incrementSpeed) {
    for (let cubeY = -cubeWidth; cubeY < cubeWidth; cubeY += incrementSpeed) {
      calculateForSurface(cubeX, cubeY, -cubeWidth, cubeWidth, '@');
      calculateForSurface(cubeWidth, cubeY, cubeX, cubeWidth, '$');
      calculateForSurface(-cubeWidth, cubeY, -cubeX, cubeWidth, '~');
      calculateForSurface(-cubeX, cubeY, cubeWidth, cubeWidth, '#');
      calculateForSurface(cubeX, -cubeWidth, -cubeY, cubeWidth, ';');
      calculateForSurface(cubeX, cubeWidth, cubeY, cubeWidth, '+');
    }
  }
}

/**
 * Main render loop
 */
function render() {
  // Clear buffers
  buffer.fill(backgroundASCIICode);
  zBuffer.fill(0);

  // First cube (largest, left)
  let cubeWidth = 20;
  horizontalOffset = -2 * cubeWidth;
  renderCube(cubeWidth);

  // Second cube (medium, center)
  cubeWidth = 10;
  horizontalOffset = 1 * cubeWidth;
  renderCube(cubeWidth);

  // Third cube (smallest, right)
  cubeWidth = 5;
  horizontalOffset = 8 * cubeWidth;
  renderCube(cubeWidth);

  // Build output string
  let output = '\x1b[H'; // Move cursor to home position
  for (let k = 0; k < width * height; k++) {
    output += k % width ? buffer[k] : '\n';
  }

  process.stdout.write(output);

  // Update rotation angles
  A += 0.05;
  B += 0.05;
  C += 0.01;
}

/**
 * Initialize and start the animation
 */
function main() {
  // Clear screen
  process.stdout.write('\x1b[2J');

  // Hide cursor for cleaner animation
  process.stdout.write('\x1b[?25l');

  // Handle graceful exit
  process.on('SIGINT', () => {
    // Show cursor again
    process.stdout.write('\x1b[?25h');
    // Clear screen
    process.stdout.write('\x1b[2J');
    process.stdout.write('\x1b[H');
    console.log('Goodbye!');
    process.exit(0);
  });

  // Run animation at ~60fps (16ms interval)
  setInterval(render, 16);
}

// Start the animation
main();

