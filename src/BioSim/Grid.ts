import {Coord} from "./basicTypes";
import {params as p} from "./params";


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

export class Grid {
    private data: Column[] = [];

    private barrierLocations: Coord[] = [];
    private barrierCenters: Coord[] = [];

    constructor(sizeX: number, sizeY: number) {
        this.data = Array.from({length: sizeX}, () => new Column(sizeY));
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

    public get sizeX(): number {
        return this.data.length;
    }

    public get sizeY(): number {
        return this.data[0].length;
    }

    public at(x: number | Coord, y?: number): number {
        if (x instanceof Coord) {
            return this.data[x.x][x.y];
        } else if (y !== undefined) {
            return this.data[x][y];
        }
        throw new Error("Invalid arguments");
    }

    public isInBounds(loc: Coord): boolean {
        return loc.x >= 0 && loc.x < this.sizeX && loc.y >= 0 && loc.y < this.sizeY;
    }

    public isEmptyAt(loc: Coord): boolean {
        return this.at(loc) === 0;
    }

    public isBarrierAt(loc: Coord): boolean {
        return this.at(loc) === 0xffff;
    }

    public isOccupiedAt(loc: Coord): boolean {
        return !this.isEmptyAt(loc) && !this.isBarrierAt(loc);
    }

    public isBorder(loc: Coord): boolean {
        return loc.x === 0 || loc.x === this.sizeX - 1 || loc.y === 0 || loc.y === this.sizeY - 1;
    }

    public set(x: number | Coord, y: number, val?: number): void {
        if (x instanceof Coord) {
            this.data[x.x][x.y] = y;
            return;
        } else if (y !== undefined && val !== undefined) {
            this.data[x][y] = val;
            return;
        }
        throw new Error("Invalid arguments");
    }

    public findEmptyLocation(): Coord {
        let loc: Coord;
        do {
            loc = new Coord(Math.floor(Math.random() * this.sizeX), Math.floor(Math.random() * this.sizeY));
        } while (!this.isEmptyAt(loc));
        return loc;
    }

    // https://github.com/davidrmiller/biosim4/blob/9d9bb2706f0212946f8c654ddb1f65862a652fb7/src/createBarrier.cpp
    public createBarrier(barrierType: number): void {
        
        this.barrierCenters.length = 0;
        this.barrierLocations.length = 0;

        // const drawBox = (minX: number, minY: number, maxX: number, maxY: number) => {
        //     for (let x = minX; x <= maxX; x++) {
        //         for (let y = minY; y <= maxY; y++) {
        //             this.set(x, y, 0xffff);
        //             this.barrierLocations.push(new Coord(x, y));
        //         }
        //     }
        // }

        switch(barrierType) {
            case 0:
                return;
            case 1:
                const minX = p.sizeX / 2;
                const maxX = minX + 1;
                const minY = p.sizeY / 4;
                const maxY = minY + p.sizeY / 2;

                for(let x = minX; x <= maxX; x++) {
                    for(let y = minY; y <= maxY; y++) {
                        this.set(x, y, 0xffff);
                        this.barrierLocations.push(new Coord(x, y));
                    }
                }
                break;
        }
    }

    public getBarrierLocations(): Coord[] {
        return this.barrierLocations;
    }

    public getBarrierCenters(): Coord[] {
        return this.barrierCenters;
    }
}

export const visitNeighborhood = (loc: Coord, radius: number, callback: (loc: Coord) => void) => {
    for(let dx = -Math.min(radius, loc.x); dx <= Math.min(radius, p.sizeX - loc.x - 1); ++dx) {
        let x = Math.trunc(loc.x + dx);
        let extentY = Math.sqrt(radius * radius - dx * dx);
        for(let dy = -Math.min(extentY, loc.y); dy <= Math.min(extentY, p.sizeY - loc.y - 1); ++dy) {
            let y = Math.trunc(loc.y + dy);
            callback(new Coord(x, y));
        }
    }
};