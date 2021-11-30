import assert from "assert";
import {Compass, Coord, Dir} from "./basicTypes";

import {
    ACTION,
    ConnectionList,
    cullUselessNeurons,
    Gene,
    Genome,
    initialNeuronOutput,
    makeNodeList,
    makeRenumberedConnectionList,
    NEURON,
    Node,
    NodeMap,
    SENSOR
} from "./Genome";
import {genomeSimilarity} from "./GenomeCompare";

import {visitNeighborhood} from "./Grid";
import {NeuralNet, Neuron} from "./NeuralNet";
import {params as p} from "./params";

import {
    getPopulationDensityAlongAxis,
    getShortProbeBarrierDistance,
    getSignalDensity,
    getSignalDensityAlongAxis,
    longProbeBarrierFwd,
    longProbePopulationFwd
} from "./Sensor";

import {Action, Sensor} from "./SensorActions";
import {grid, peeps} from "./simulator";
import {Clamp} from "./Utils";

export class Individual {

    public alive: boolean = true;
    public index: number;
    public loc: Coord;
    // public birthLoc: Coord;
    public age: number;
    public genome: Genome;
    public nnet: NeuralNet;
    public responsiveness: number;
    public oscPeriod: number;
    public longProbeDist: number;
    public lastMoveDir: Dir = new Dir(Compass.CENTER);
    public challengeBits: number;

    constructor(index: number, loc: Coord, genome: Genome) {

        this.index = index;
        this.loc = loc;
        this.age = 0;
        this.oscPeriod = 34;
        this.alive = true;
        this.lastMoveDir = Dir.random8();
        this.responsiveness = 0.5;
        this.longProbeDist = p.longProbeDistance;
        this.challengeBits = 0;

        this.genome = genome;
        this.nnet = new NeuralNet();

        this.createWiringFromGenome();
    }

    public createWiringFromGenome() {
        let nodeMap: NodeMap = new Map<number, Node>();
        let connectionList: ConnectionList = [];

        makeRenumberedConnectionList(connectionList, this.genome);

        makeNodeList(nodeMap, connectionList);

        cullUselessNeurons(connectionList, nodeMap);

        let newNumber = 0;
        for (const node of nodeMap.values()) {
            assert(node.numOutputs !== 0);
            node.remappedNumber = newNumber++;
        }
        this.nnet.connections.length = 0;

        for (const connection of connectionList) {
            if (connection.sinkType === NEURON) {
                const node = nodeMap.get(connection.sinkNum);
                if (!node) {continue;}

                connection.sinkNum = node.remappedNumber;

                if (connection.sourceType === NEURON) {
                    const node2 = nodeMap.get(connection.sourceNum);
                    if (!node2) {
                        continue;
                    }
                    connection.sourceNum = node2.remappedNumber;
                }

                this.nnet.connections.push(connection);
            }
        }

        for (const connection of connectionList) {
            if (connection.sinkType === ACTION) {
                if (connection.sourceType === NEURON) {
                    const node = nodeMap.get(connection.sourceNum);
                    if (!node) {continue;}
                    connection.sourceNum = node.remappedNumber;
                }
                this.nnet.connections.push(connection);
            }
        }

        this.nnet.neurons.length = 0;
        for (const node of nodeMap.values()) {
            const neuron = new Neuron();

            neuron.output = initialNeuronOutput();

            neuron.driven = node.numInputsFromSensorOrOtherNeurons !== 0;
            this.nnet.neurons.push(neuron);
        }

    }

    public feedForward(simStep: number): number[] {
        const actionLevels: number[] = Array.from({length: Action.NUM_ACTIONS}, () => 0.0);

        const neuronAccumulators: number[] = Array.from({length: this.nnet.neurons.length}, () => 0.0);

        let neuronOutputsComputed = false;

        for (const conn of this.nnet.connections) {
            if (conn.sinkType === ACTION && !neuronOutputsComputed) {
                for (let neuronIndex = 0; neuronIndex < this.nnet.neurons.length; neuronIndex++) {
                    if (this.nnet.neurons[neuronIndex].driven) {
                        neuronAccumulators[neuronIndex] = this.nnet.neurons[neuronIndex].output;
                    }
                }
                neuronOutputsComputed = true;
            }

            let inputVal;
            if (conn.sourceType === SENSOR) {
                inputVal = this.getSensor(conn.sourceNum, simStep);
            } else {
                inputVal = this.nnet.neurons[Clamp(conn.sourceNum, 0, this.nnet.neurons.length - 1)].output; // VERY UGLY FIX but sourceNum is sometimes out of range
            }

            if (conn.sinkType === ACTION) {
                actionLevels[conn.sinkNum] += inputVal * conn.weightAsFloat();
            } else {
                neuronAccumulators[conn.sinkNum] += inputVal * conn.weightAsFloat();
            }
        }

        return actionLevels;
    }

    public getSensor(sensorNum: number, simStep: number): number {
        let sensorVal = 0;

        switch (sensorNum) {
            case Sensor.AGE: {
                sensorVal = this.age / p.stepsPerGeneration;
                break;
            }

            case Sensor.BOUNDARY_DIST: {
                const distX = Math.min(this.loc.x, (p.sizeX - this.loc.x) - 1);
                const distY = Math.min(this.loc.y, (p.sizeY - this.loc.y) - 1);
                const closest = Math.min(distX, distY);
                const maxPossible = Math.max(p.sizeX / 2 - 1, p.sizeY / 2 - 1);
                sensorVal = closest / maxPossible;
                break;
            }

            case Sensor.BOUNDARY_DIST_X: {
                sensorVal = Math.min(this.loc.x, (p.sizeX - this.loc.x) - 1) / (p.sizeX / 2);
                break;
            }

            case Sensor.BOUNDARY_DIST_Y: {
                sensorVal = Math.min(this.loc.y, (p.sizeY - this.loc.y) - 1) / (p.sizeY / 2);
                break;
            }

            case Sensor.LAST_MOVE_DIR_X: {
                const lastX = this.lastMoveDir.asNormalizedCoord().x;
                sensorVal = lastX === 0 ? 0.5 :
                    lastX === -1 ? 0.0 : 1.0;
                break;
            }

            case Sensor.LAST_MOVE_DIR_Y: {
                const lastY = this.lastMoveDir.asNormalizedCoord().y;
                sensorVal = lastY === 0 ? 0.5 :
                    lastY === -1 ? 0.0 : 1.0;
                break;
            }

            case Sensor.LOC_X: {
                sensorVal = this.loc.x / (p.sizeX - 1);
                break;
            }

            case Sensor.LOC_Y: {
                sensorVal = this.loc.y / (p.sizeY - 1);
                break;
            }

            case Sensor.OSC1: {
                const phase = (simStep % this.oscPeriod) / this.oscPeriod;
                let factor = -Math.cos(phase * 2 * Math.PI);
                assert(factor >= -1.0 && factor <= 1.0);
                factor += 1.0;
                factor /= 2.0;
                sensorVal = factor;
                sensorVal = Clamp(sensorVal, 0.0, 1.0);
                break;
            }

            case Sensor.LONGPROBE_POP_FWD: {
                sensorVal = longProbePopulationFwd(this.loc, this.lastMoveDir, this.longProbeDist) / this.longProbeDist;
                break;
            }

            case Sensor.LONGPROBE_BAR_FWD: {
                sensorVal = longProbeBarrierFwd(this.loc, this.lastMoveDir, this.longProbeDist) / this.longProbeDist;
                break;
            }

            case Sensor.POPULATION: {
                let countLocs = 0;
                let countOccupied = 0;
                const center = this.loc;

                const f = (loc: Coord) => {
                    countLocs++;
                    if (grid.isOccupiedAt(loc)) {
                        countOccupied++;
                    }
                };

                visitNeighborhood(center, p.populationSensorRadius, f);
                sensorVal = countOccupied / countLocs;
                break;
            }

            case Sensor.POPULATION_FWD: {
                sensorVal = getPopulationDensityAlongAxis(this.loc, this.lastMoveDir);
                break;
            }

            case Sensor.POPULATION_LR: {
                sensorVal = getPopulationDensityAlongAxis(this.loc, this.lastMoveDir.rotate90DegCW());
                break;
            }

            case Sensor.BARRIER_FWD: {
                sensorVal = getShortProbeBarrierDistance(this.loc, this.lastMoveDir, p.shortProbeBarrierDistance);
                break;
            }

            case Sensor.BARRIER_LR: {
                sensorVal = getShortProbeBarrierDistance(this.loc, this.lastMoveDir.rotate90DegCW(), p.shortProbeBarrierDistance);
                break;
            }

            case Sensor.RANDOM: {
                sensorVal = Math.random();
                break;
            }

            case Sensor.SIGNAL0: {
                sensorVal = getSignalDensity(0, this.loc);
                break;
            }

            case Sensor.SIGNAL0_FWD: {
                sensorVal = getSignalDensityAlongAxis(0, this.loc, this.lastMoveDir);
                break;
            }

            case Sensor.SIGNAL0_LR: {
                sensorVal = getSignalDensityAlongAxis(0, this.loc, this.lastMoveDir.rotate90DegCW());
                break;
            }

            case Sensor.GENETIC_SIM_FWD: {
                const loc2 = this.loc.add(this.lastMoveDir);

                if (grid.isInBounds(loc2)) {
                    const other = peeps.getIndividual(loc2);
                    if (other?.alive) {
                        sensorVal = genomeSimilarity(this.genome, other.genome);
                    }
                }
                break;
            }

            default: {
                console.log(`Unknown sensor: ${sensorNum}`);
                assert(false);
                break;
            }
        }

        if (isNaN(sensorVal) || sensorVal < -0.01 || sensorVal > 1.01) {
            sensorVal = Clamp(sensorVal, 0.0, 1.0);
        }

        assert(!isNaN(sensorVal) && sensorVal >= -0.01 && sensorVal <= 1.01);

        return sensorVal;
    }

    public printGenome() {
        const genesPerLine = 8;
        let count = 0;
        for (const gene of this.genome) {
            if (count === genesPerLine) {
                process.stdout.write("\n");
                count = 0;
            } else if (count > 0) {
                process.stdout.write(" ");
            }

            process.stdout.write(gene.print());
            count++;
        }
    }
}
