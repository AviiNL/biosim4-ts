import {makeRandomGenome, Genome, generateChildGenome} from "./Genome";
import {Individual} from "./Individual";
import {grid, peeps, signals} from "./simulator";
import {CHALLENGE_ALTRUISM, passedSurvivalCriterion} from "./SurvivalCriteria";
import {params as p} from "./params";

export const initializeGeneration0 = (): void => {
    grid.zeroFill();

    grid.createBarrier(p.replaceBarrierTypeGenerationNumber === 0 ?
        p.replaceBarrierType : p.barrierType);

    signals.zeroFill();

    for (let i = 0; i < p.population; i++) {
        peeps.push(new Individual(i, grid.findEmptyLocation(), makeRandomGenome()));
    }
};

export const initializeNewGeneration = (parentsGenome: Genome[], generation: number): void => {

    grid.zeroFill();

    grid.createBarrier(generation >= p.replaceBarrierTypeGenerationNumber ?
        p.replaceBarrierType : p.barrierType);

    signals.zeroFill();

    peeps.clear();
    for (let i = 0; i < p.population; i++) {
        peeps.push(new Individual(i, grid.findEmptyLocation(), generateChildGenome(parentsGenome)));
    }
};

export const spawnNewGeneration = (generation: number, muderCount: number): number => {
    let secrificedCount = 0;

    let parents: Map<number, number> = new Map();

    const parentGenome: Genome[] = [];

    if (p.challenge !== CHALLENGE_ALTRUISM) {
        for (let index = 0; index <= p.population; ++index) {
            const passed = passedSurvivalCriterion(peeps[index], p.challenge);

            if (passed.passed && peeps[index].nnet.connections.length > 0) {
                parents.set(index, passed.score);
            }
        }
    } else {
        throw new Error("Altrusim not implemented");
    }

    parents = new Map([...parents.entries()].sort((a: [number, number], b: [number, number]) => {
        return a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0;
    }));

    for (const parent of parents.entries()) {
        parentGenome.push(peeps[parent[0]].genome);
    }

    console.log(`Gen ${generation}, ${parentGenome.length} survivors`);

    if (parentGenome.length > 0) {
        initializeNewGeneration(parentGenome, generation + 1);
    } else {
        initializeGeneration0();
    }

    return parentGenome.length;
};