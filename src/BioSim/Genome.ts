import assert from "assert";
import {params as p} from "./params";
import {Action, Sensor} from "./SensorActions";
import {Clamp, randomUint} from "./Utils";

export const SENSOR = 1;
export const ACTION = 1;
export const NEURON = 0;

export const RANDOM_UINT_MAX = 0xffffffff;

export class Node {
    public remappedNumber;
    public numOutputs;
    public numSelfInputs;
    public numInputsFromSensorOrOtherNeurons;
};

export type NodeMap = Map<number, Node>;
export type ConnectionList = Array<Gene>;
export type Genome = Array<Gene>;

export const initialNeuronOutput = () => {return 0.5;};

export class Gene {
    public sourceType: number = 1;
    public sourceNum: number = 7;
    public sinkType: number = 1;
    public sinkNum: number = 7;
    public weight: number = 0;

    static f1 = 8.0;
    static f2 = 64.0;

    public weightAsFloat() {
        return this.weight / 8192.0;
    }

    public makeRandomWeight() {
        this.weight = Math.floor((Math.random() * 0xefff) - 0x8000);
        return this.weight;
    }

    public print() {
        const array = new Uint16Array([this.sourceType, this.sourceNum, this.sinkType, this.sinkNum, this.weight]);

        return Array.from(array, function (byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
    }
};

export const makeRandomGene = () => {
    const gene = new Gene();
    gene.sourceType = Math.floor(Math.random() * 2);
    gene.sourceNum = Math.floor(Math.random() * 0x7fff);
    gene.sinkType = Math.floor(Math.random() * 2);
    gene.sinkNum = Math.floor(Math.random() * 0x7fff);
    gene.makeRandomWeight();

    return gene;
};

export const makeRandomGenome = () => {
    const numGenes = randomUint(p.genomeInitialLengthMin, p.genomeInitialLengthMax);
    const genome = new Array<Gene>();
    for (let i = 0; i < numGenes; i++) {
        genome.push(makeRandomGene());
    }
    return genome;
};

export const makeRenumberedConnectionList = (connectionList: ConnectionList, genome: Genome) => {
    connectionList.length = 0;

    for (const gene of genome) {
        if (gene.sourceType === NEURON) {
            gene.sourceNum %= p.maxNumberNeurons;
        } else {
            gene.sourceNum %= Sensor.NUM_SENSES;
        }

        if (gene.sinkType === NEURON) {
            gene.sinkNum %= p.maxNumberNeurons;
        } else {
            gene.sinkNum %= Action.NUM_ACTIONS;
        }

        connectionList.push(gene);
    }
};

export const makeNodeList = (nodeMap: NodeMap, connectionList: ConnectionList) => {
    nodeMap.clear();

    for (const gene of connectionList) {
        if (gene.sinkType === NEURON) {
            if (!(gene.sinkNum in nodeMap)) {
                assert(gene.sinkNum < p.maxNumberNeurons);
                nodeMap.set(gene.sinkNum, new Node());
                const node = nodeMap.get(gene.sinkNum);
                if (!node) {continue;}
                node.numOutputs = 0;
                node.numSelfInputs = 0;
                node.numInputsFromSensorOrOtherNeurons = 0;
            }

            const node = nodeMap.get(gene.sinkNum);
            if (!node) {continue;}

            if (gene.sourceType === NEURON && (gene.sourceNum === gene.sinkNum)) {
                node.numSelfInputs++;
            } else {
                node.numInputsFromSensorOrOtherNeurons++;
            }
        }

        if (gene.sourceType === NEURON) {
            if (!(gene.sourceNum in nodeMap)) {
                assert(gene.sourceNum < p.maxNumberNeurons); // i really dont understand why this is here
                nodeMap.set(gene.sourceNum, new Node());
                const node = nodeMap.get(gene.sourceNum);
                if (!node) {continue;}
                node.numOutputs = 0;
                node.numSelfInputs = 0;
                node.numInputsFromSensorOrOtherNeurons = 0;
            }

            const node = nodeMap.get(gene.sourceNum);
            if (!node) {continue;}
            node.numOutputs++;
        }
    }

};

export const removeConnectionsToNeuron = (connection: ConnectionList, nodeMap: NodeMap, neuronNumber: number) => {
    for (let i = connection.length - 1; i >= 0; i--) {
        if (connection[i].sinkType === NEURON && connection[i].sinkNum === neuronNumber) {
            if (connection[i].sourceType === NEURON) {
                const node = nodeMap.get(connection[i].sourceNum);
                if (!node) {continue;}
                node.numOutputs--;
            }
            connection.splice(i, 1);
        }
    }
};

export const cullUselessNeurons = (connectionList: ConnectionList, nodeMap: NodeMap) => {
    let allDone = false;
    while (!allDone) {
        allDone = true;

        for (let nodeNumber of nodeMap.keys()) {
            assert(nodeNumber < p.maxNumberNeurons);

            const node = nodeMap.get(nodeNumber);
            if (!node) {continue;}

            if (node.numOutputs === node.numSelfInputs) {
                removeConnectionsToNeuron(connectionList, nodeMap, nodeNumber);
                nodeMap.delete(nodeNumber);
                allDone = false;
            }
        }
    }
};

export const randomBitFlip = (genome: Genome) => {
    let elementIndex = Math.floor(Math.random() * genome.length - 1) + 1;
    const chance = Math.random();

    if (chance < 0.2) {
        genome[elementIndex].sourceType ^= 1;
    } else if (chance < 0.4) {
        genome[elementIndex].sinkType ^= 1;
    } else if (chance < 0.6) {
        genome[elementIndex].sourceNum ^= 1;
    } else if (chance < 0.8) {
        genome[elementIndex].sinkNum ^= 1;
    } else {
        genome[elementIndex].weight ^= 1;
    }
};

export const cropLength = (genome: Genome, length: number) => {
    if (genome.length > length && length > 0) {
        if (Math.random() < 0.5) {
            const elementsToTrip = genome.length - length;
            genome.splice(0, elementsToTrip);
        } else {
            genome.splice(genome.length - length, genome.length);
        }
    }
};

export const randomInsertDeletion = (genome: Genome) => {
    const probability = p.geneInsertionDeletionRate;
    if (Math.random() < probability) {
        if (Math.random() < p.deletionRatio) {
            if (genome.length > 1) {
                genome.splice(Math.floor(Math.random() * genome.length) + 1, 1);
            }
        } else {
            genome.push(makeRandomGene());
        }
    }
};

export const applyPointMutations = (genome: Genome) => {
    let numberOfGenes = genome.length;
    while (numberOfGenes-- > 0) {
        if (Math.random() < p.pointMutationRate) {
            randomBitFlip(genome);
        }
    }
};

export const generateChildGenome = (parentGenomes: Genome[]): Genome => {
    let genome: Genome = [];

    let parent1Idx;
    let parent2Idx;

    if (p.chooseParentsByFitness && parentGenomes.length > 1) {
        parent1Idx = randomUint(0, parentGenomes.length - 1);
        parent2Idx = randomUint(0, parent1Idx - 1);
    } else {
        parent1Idx = randomUint(0, parentGenomes.length - 1);
        parent2Idx = randomUint(0, parentGenomes.length - 1);
    }

    const g1: Genome = parentGenomes[parent1Idx];
    const g2: Genome = parentGenomes[parent2Idx];

    if (g1.length === 0 || g2.length === 0) {
        console.log('Invalid genome');
        assert(false);
    }

    const overlayWithSliceOf = (gShorter: Genome) => {
        let index0 = randomUint(0, gShorter.length - 1);
        let index1 = randomUint(0, gShorter.length);

        if (index0 > index1) {
            const temp = index0;
            index0 = index1;
            index1 = temp;
        }

        for (let i = index0; i < index1; i++) {
            if (i in genome) { // only replace
                //console.log("Replacing:", genome[i], "With:", gShorter[i]);
                genome[i] = gShorter[i];
            }
        }
    };

    if (p.sexualReproduction) { // this is broken
        if (g1.length > g2.length) {
            genome = g1;
            overlayWithSliceOf(g2);
            assert(genome.length > 0);
        } else {
            genome = g2;
            overlayWithSliceOf(g1);
            assert(genome.length > 0);
        }

        let sum = g1.length + g2.length;

        if ((sum & 1) && (randomUint() & 1)) {
            sum++;
        }

        cropLength(genome, sum / 2);
        assert(genome.length > 0);
    } else {
        genome = g2;
        assert(genome.length > 0);
    }

    randomInsertDeletion(genome);
    assert(genome.length > 0);
    applyPointMutations(genome);
    assert(genome.length > 0);
    assert(genome.length <= p.genomeMaxLength);

    return genome;
};
