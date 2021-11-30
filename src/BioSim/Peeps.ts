import {Coord} from "./basicTypes";
import {makeRandomGenome} from "./Genome";
import {Grid} from "./Grid";
import {Individual} from "./Individual";

export class Peeps {
    private individuals: Individual[] = [];
    private deathQueue: number[] = [];
    private moveQueue: Record<number, Coord>[] = [];

    private grid: Grid;

    constructor(grid: Grid) {
        this.grid = grid;

        return new Proxy(this, {
            get: (target, prop) => {
                if (prop in target) {
                    return target[prop];
                } else {
                    return target.individuals[prop];
                }
            },
            set: (target, prop, value) => {
                if (prop in target) {
                    return false;
                } else {
                    target.individuals[prop] = value;
                }
                return true;
            }
        });
    }

    public push(indiv: Individual) {
        this.individuals[indiv.index] = indiv;
    }

    public clear() {
        this.individuals.length = 0;
    }

    public queueForDeath(indiv: Individual) {
        this.deathQueue.push(indiv.index);
    }

    public drainDeathQueue() {
        for (const index in this.deathQueue) {
            const indiv = this.individuals[index];
            this.grid.set(indiv.loc, 0);
            indiv.alive = false;
        }

        this.deathQueue.length = 0;
    }

    public queueForMove(indiv: Individual, newLoc: Coord) {
        this.moveQueue.push({[indiv.index]: newLoc});
    }

    public drainMoveQueue() {
        for (const moveRecord of this.moveQueue) {
            const indiv = this.individuals[Object.keys(moveRecord)[0]] as Individual;

            const newLoc = moveRecord[Object.keys(moveRecord)[0]] as Coord;
            const moveDir = (newLoc.sub(indiv.loc)).asDir();
            if (this.grid.isEmptyAt(newLoc)) {
                this.grid.set(indiv.loc, 0);
                this.grid.set(newLoc, indiv.index);
                indiv.loc = newLoc;
                indiv.lastMoveDir = moveDir;
            }
        }
        this.moveQueue.length = 0;
    }

    public deathQueueSize(): number {
        return this.deathQueue.length;
    }

    public getIndividual(loc: Coord): Individual|null {
        if (this.grid.at(loc) in this.individuals) {
            return this.individuals[this.grid.at(loc)];
        }
        return null;
    }
}