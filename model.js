import { infectionMean, infectionStd, infectionRadius, GammaParams, deathTimeRate, deathChance } from "./model_config.js";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const State = {
    SUSCEPTIBLE: 'susceptible',
    INFECTED: 'infected',
    RECOVERED: 'recovered',
    DEAD: 'dead'
};

// Samplers
function sampleNormal(mean, stdDev) {
    let u1 = Math.random();
    let u2 = Math.random();
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
}

function sampleLogNormal(mean, stdDev) {
    let normalSample = sampleNormal(mean, stdDev);
    
    return Math.exp(normalSample);
}

function sampleExponential(rate) {
    return -Math.log(1.0 - Math.random()) / rate;
}

function sampleBernoulli(p) {
    return Math.random() < p;
}

function sampleGamma(alpha, beta) {
    if (alpha < 1) {
        // Use the method for alpha < 1 by transforming the gamma distribution
        let u = Math.random();
        return sampleGamma(1 + alpha, beta) * Math.pow(u, 1 / alpha);
    }

    // Marsaglia and Tsang's method for alpha >= 1
    let d = alpha - 1 / 3;
    let c = 1 / Math.sqrt(9 * d);

    while (true) {
        let x = sampleNormal(0, 1); // Standard normal sample
        let v = Math.pow(1 + c * x, 3);
        if (v > 0) {
            let u = Math.random();
            let xSquared = x * x;

            if (u < 1 - 0.0331 * xSquared * xSquared || Math.log(u) < 0.5 * xSquared + d * (1 - v + Math.log(v))) {
                return d * v / beta;
            }
        }
    }
}

// Dot class representing each individual
class Dot {
    constructor(x, y, radius, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.state = State.SUSCEPTIBLE;
        this.direction = this.getRandomDirection();
        this.infectedTime = 0;
        this.recoveryTime = 0;
        this.deathTime = 0;
    }

    getRandomDirection() {
        const angle = Math.random() * 2 * Math.PI;
        return { dx: Math.cos(angle), dy: Math.sin(angle) };
    }

    move() {
        if (this.state !== State.DEAD) {
            this.x += this.direction.dx * this.speed;
            this.y += this.direction.dy * this.speed;

            if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
                this.direction.dx *= -1;
            }
            if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
                this.direction.dy *= -1;
            }
        }
    }

    getColor() {
        if (this.state === State.SUSCEPTIBLE) {
            return 'blue';
        } else if (this.state === State.INFECTED) {
            return 'red';
        } else if (this.state === State.RECOVERED) {
            return 'green';
        } else if (this.state === State.DEAD) {
            return 'white';
        }
    }

    // Infect other dots within the infection radius
    tryToInfect(others) {
        if (this.state === State.INFECTED) {
            others.forEach(other => {
                if (other.state === State.SUSCEPTIBLE && this.distanceTo(other) < infectionRadius) {
                    let infectionChance = sampleNormal(infectionMean, infectionStd); //<------------------------- INFECTION
                    infectionChance = Math.max(0, Math.min(1, infectionChance)); // To [0, 1]

                    if (sampleBernoulli(infectionChance)) { //<-------------------------------- INFECTION
                        other.state = State.INFECTED;
                        other.recoveryTime = sampleGamma(GammaParams.ALFA, GammaParams.BETA); //<--------------- RECOVERY
                        other.deathTime = sampleExponential(deathTimeRate); //<--------------------------------- DEATH
                    }
                }
            });
        }
    }

    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Handle infection recovery or death
    updateInfection() {
        if (this.state === State.INFECTED) {
            this.infectedTime++;
            // Check if death occurs first
            if (this.infectedTime >= this.deathTime) {
                if (sampleBernoulli(deathChance)) { //<-------------------------------- DEATH
                    this.state = State.DEAD;
                    return;
                }
            }
            // If the dot survives, it recovers
            if (this.infectedTime >= this.recoveryTime) {
                this.state = State.RECOVERED;
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.getColor();
        ctx.fill();
        ctx.closePath();
    }
}

export { Dot, State, sampleNormal, sampleExponential, sampleBernoulli };
