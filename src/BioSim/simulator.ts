import {Compass, Coord, Dir} from "./basicTypes";
import {executeActions} from "./ExecuteActions";
import {generateChildGenome, Genome, makeRandomGenome} from "./Genome";
import {Grid} from "./Grid";
import {saveVideo, saveVideoFrame} from "./ImageProcessor";
import {Individual} from "./Individual";
import {params as p, RunMode} from "./params";
import {Peeps} from "./Peeps";
import {Signals} from "./Signals";
import {initializeGeneration0, spawnNewGeneration} from "./SpawnNewGeneration";

import {
    CHALLENGE_CENTER_WEIGHTED,
    CHALLENGE_LOCATION_SEQUENCE,
    CHALLENGE_RADIOACTIVE_WALLS,
    CHALLENGE_RIGHT_HALF,
    CHALLENGE_TOUCH_ANY_WALL,
} from "./SurvivalCriteria";

p.set({
    challenge: CHALLENGE_CENTER_WEIGHTED,
    sizeX: 320,
    sizeY: 180,
    population: 1000,
    sexualReproduction: false,
    stepsPerGeneration: 300 * 6, // 60 seconds per generation at 30fps,
    saveVideo: true,
    displaySampleGenomes: 10,
    maxGenerations: 500,
    maxNumberNeurons: 250,
});

export const grid = new Grid(p.sizeX, p.sizeY);
export const signals = new Signals(p.signalLayers, p.sizeX, p.sizeY);
export const peeps = new Peeps(grid);

let runMode: RunMode = RunMode.STOP;

const simStepOneIndiv = (individual: Individual, simStep: number): void => {
    individual.age++;
    const actionLevels = individual.feedForward(simStep);
    executeActions(individual, actionLevels);
};

const endOfSimStep = async (simStep: number, generation: number): Promise<void> => {
    if (p.challenge === CHALLENGE_RADIOACTIVE_WALLS) {
        throw new Error("Not implemented");
    }

    if (p.challenge == CHALLENGE_TOUCH_ANY_WALL) {
        throw new Error("Not implemented");
    }

    if (p.challenge == CHALLENGE_LOCATION_SEQUENCE) {
        throw new Error("Not implemented");
    }

    peeps.drainDeathQueue();
    peeps.drainMoveQueue();
    signals.fade(0);

    if (p.saveVideo &&
        ((generation % p.videoStride) == 0
            || generation <= p.videoSaveFirstFrames
            || (generation >= p.replaceBarrierTypeGenerationNumber
                && generation <= p.replaceBarrierTypeGenerationNumber + p.videoSaveFirstFrames))) {
        await saveVideoFrame(simStep, generation);
    }
};

const endOfGeneration = async (generation: number) => {
    if (p.saveVideo) {
        await saveVideo(generation);
    }
    // update graph log
};

const displaySensorActionReferenceCounts = () => {

};

const displaySampleGenomes = (count: number) => {
    let index = 1;
    for (index = 1; count > 0 && index <= p.population; ++index) {
        if (peeps[index].alive) {
            console.log(`---------------------------`);
            console.log(`Individual ID: ${index}`);

            peeps[index].printGenome();

            console.log(`\n---------------------------`);
            --count;
        }
    }

    displaySensorActionReferenceCounts();
};

export const simulator = async () => {

    let generation = 0;
    initializeGeneration0();

    runMode = RunMode.RUN;
    while (runMode === RunMode.RUN && generation < p.maxGenerations) {
        let murderCount = 0;
        for (let simStep = 0; simStep < p.stepsPerGeneration; ++simStep) {

            // should be a multithreaded loop, but you know, javascript ¯\_(ツ)_/¯
            for (let indivIndex = 1; indivIndex <= p.population; ++indivIndex) {
                if (peeps[indivIndex] && peeps[indivIndex].alive) {
                    simStepOneIndiv(peeps[indivIndex], simStep);
                }
            }

            murderCount += peeps.deathQueueSize();
            await endOfSimStep(simStep, generation);
        }

        endOfGeneration(generation);
        // param.updateFromConfigFile();?

        let numberSurvivors = spawnNewGeneration(generation, murderCount);
        if (numberSurvivors > 0 && (generation % p.genomeAnalysisStride == 0)) {
            displaySampleGenomes(p.displaySampleGenomes);
        }

        if (numberSurvivors === 0) {
            break;
        }

        generation++;

    }

    console.log("Simulation finished");

};
