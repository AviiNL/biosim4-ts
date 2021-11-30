import {Coord} from "./basicTypes";
import {visitNeighborhood} from "./Grid";
import {params as p} from "./params";

export const SIGNAL_MIN = 0;
export const SIGNAL_MAX = 255;

export class Column {
    private readonly data: Uint8Array;

    constructor(numRows: number) {
        this.data = new Uint8Array(numRows);

        return new Proxy(this, {
            get: (target, prop) => {
                if (prop in target) {
                    return target[prop];
                } else {
                    return target.data[prop];
                }
            },
            set: (target, prop, value) => {
                if (prop in target) {
                    return false;
                } else {
                    target.data[prop] = value;
                }
                return true;
            }
        });
    }

    public get length() {
        return this.data.length;
    }

    public zeroFill(): void {
        this.data.fill(0);
    }
}

export class Layer {
    private readonly data: Column[];

    constructor(numColumns: number, numRows: number) {
        this.data = Array.from({length: numColumns}, () => new Column(numRows));

        return new Proxy(this, {
            get: (target, prop) => {
                if (prop in target) {
                    return target[prop];
                } else {
                    return target.data[prop];
                }
            },
            set: (target, prop, value) => {
                if (prop in target) {
                    return false;
                } else {
                    target.data[prop] = value;
                }
                return true;
            }
        });
    }

    public zeroFill(): void {
        this.data.forEach(column => column.zeroFill());
    }
}

export class Signals {
    private data: Layer[] = [];

    constructor(numLayers: number, sizeX: number, sizeY: number) {
        this.data = Array.from({length: numLayers}, () => new Layer(sizeX, sizeY));
        return new Proxy(this, {
            get: (target, prop) => {
                if (prop in target) {
                    return target[prop];
                } else {
                    return target.data[prop];
                }
            },
            set: (target, prop, value) => {
                if (prop in target) {
                    return false;
                } else {
                    target.data[prop] = value;
                }
                return true;
            }
        });
    }

    public zeroFill(): void {
        this.data.forEach(layer => layer.zeroFill());
    }

    public getMagnitude(layerNum: number, loc: Coord): number {
        return this[layerNum][loc.x][loc.y];
    }

    public increment(layerNum: number, loc: Coord): void {
        const radius = 1.5;
        const centerIncreaseAmount = 2;
        const neighborIncreaseAmount = 1;

        visitNeighborhood(loc, radius, (loc: Coord) => {
            if (this[layerNum][loc.x][loc.y] < 255) {
                this[layerNum][loc.x][loc.y] = Math.min(255, this[layerNum][loc.x][loc.y] + neighborIncreaseAmount);
            }
        });

        if (this[layerNum][loc.x][loc.y] < 255) {
            this[layerNum][loc.x][loc.y] = Math.min(255, this[layerNum][loc.x][loc.y] + centerIncreaseAmount);
        }
    }

    public fade(layerNum: number): void {
        const fadeAmount = 1;

        for (let x = 0; x < p.sizeX; ++x) {
            for (let y = 0; y < p.sizeY; ++y) {
                if (this[layerNum][x][y] >= fadeAmount) {
                    this[layerNum][x][y] -= fadeAmount;
                } else {
                    this[layerNum][x][y] = 0;
                }
            }
        }
    }
}
