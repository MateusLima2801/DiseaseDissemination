const infectionRadius = 20;
const infectionMean = 0.1;
const infectionStd = 0.02;
const recoveryMean = 500;
const recoveryStd = 100;
const deathChance = 0.05;
const deathTimeRate = 1 / 400;

const GammaParams = {
    ALFA: 800,
    BETA: 2.2,
}

export {infectionRadius, infectionMean, infectionStd, recoveryMean, recoveryStd, deathChance, deathTimeRate, GammaParams}