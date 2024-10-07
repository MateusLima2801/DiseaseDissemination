import { Dot, State, sampleNormal, sampleExponential } from './model.js';
import { recoveryMean, recoveryStd, deathTimeRate } from './model_config.js';
import { captureDotStates, countStates, downloadDotInfo } from './report.js';

// Set up canvas
const canvas = document.getElementById('canvas');
const showInfoButton = document.getElementById('showInfoButton');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

////////////////////////////////////////////////////////

const numDots = 300;
const radius = 7.5;
const speed = 4;
const dots = [];

let additionalTicks = 0;
let stopSimulation = false;
let stateCounts = [];
let dotHistory = [];

showInfoButton.addEventListener('click', () => downloadDotInfo(dotHistory));

// Initialize dots with random positions
function initializeDots() {
    for (let i = 0; i < numDots; i++) {
        const x = Math.random() * (canvas.width - 2 * radius) + radius;
        const y = Math.random() * (canvas.height - 2 * radius) + radius;
        const dot = new Dot(x, y, radius, speed);

        // Patient ZERO
        if (i === 0) {
            dot.state = State.INFECTED;
            dot.recoveryTime = sampleNormal(recoveryMean, recoveryStd);
            dot.deathTime = sampleExponential(deathTimeRate);
        }

        dots.push(dot);
    }
}

// Animation function
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dots.forEach(dot => {
        dot.move();
        dot.draw();
        dot.updateInfection();
    });

    dots.forEach(dot => {
        dot.tryToInfect(dots);
    });

    const currentStateCount = countStates(dots);
    stateCounts.push(currentStateCount);

    const currentDotStates = captureDotStates(dots);
    dotHistory.push(currentDotStates);

    if (currentStateCount.infected === 0) {
        additionalTicks++;

        // Stop the simulation after 30 additional ticks
        if (additionalTicks >= 30) {
            stopSimulation = true; // Stop the simulation
        }
    } else {
        additionalTicks = 0;
    }
    
    if (!stopSimulation) {
        requestAnimationFrame(animate);
    } else {
        console.log("Simulation stopped after 30 ticks without infected dots.");
        showInfoButton.classList.remove('hidden');
    }
}

initializeDots();
animate();
