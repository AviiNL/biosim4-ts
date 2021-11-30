
export enum Compass {
    SW = 0, S, SE, W, CENTER, E, NW, N, NE
}

export class Dir {


    private dir9: Compass;

    constructor(dir: Compass = Compass.CENTER) {
        this.dir9 = dir;
    }

    public static random8() {
        return new Dir(Compass.N).rotate(Math.floor(Math.random() * 8));
    }


    public asInt() {
        return this.dir9;
    }

    public asNormalizedCoord(): Coord {
        const d = this.asInt();
        return new Coord(Math.floor((d % 3) - 1), Math.floor((d / 3) - 1));
    }

    public asNormalizedPolar(): Polar {
        const d = this.asInt();
        return new Polar(1, new Dir(this.dir9));
    }

    public rotate(n: number): Dir {
        const rotateRight: number[] = [3, 0, 1, 6, 4, 2, 7, 8, 5];
        const rotateLeft: number[] = [1, 2, 5, 0, 4, 8, 3, 6, 7];

        let n9: number = this.asInt();
        if (n < 0) {
            while (n++ < 0) {
                n9 = rotateLeft[n9];
            }
        } else if (n > 0) {
            while (n-- > 0) {
                n9 = rotateRight[n9];
            }
        }

        return new Dir(n9);
    }

    public rotate90DegCW(): Dir {
        return this.rotate(2);
    }

    public rotate90DegCCW(): Dir {
        return this.rotate(-2);
    }

    public rotate180Deg(): Dir {
        return this.rotate(4);
    }

    public equals(dir: Dir | Compass): boolean {
        if (dir instanceof Dir) {
            return dir.asInt() === this.asInt();
        } else {
            return dir === this.asInt();
        }
    }

    public notEquals(dir: Dir | Compass): boolean {
        return !this.equals(dir);
    }
}

export class Coord {

    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public isNormalized() {
        return this.x >= -1 && this.x <= 1 && this.y >= -1 && this.y <= 1;
    }

    public normalize() {
        return this.asDir().asNormalizedCoord();
    }

    public length() {
        return Math.floor(Math.sqrt(this.x * this.x + this.y * this.y));
    }

    public asDir() {
        if (this.x === 0 && this.y === 0) {
            return new Dir(Compass.CENTER);
        }

        const TWO_PI: number = Math.PI * 2.0;
        let angle: number = Math.atan2(this.y, this.x);

        if (angle < 0) {
            angle = Math.PI + (Math.PI + angle);
        }

        angle += Math.PI / 16.0;
        if (angle > TWO_PI) {
            angle -= TWO_PI;
        }

        const slice = (angle / (TWO_PI / 8)) >>> 0;

        const dirconversion = [
            Compass.E, Compass.NE, Compass.N, Compass.NW,
            Compass.W, Compass.SW, Compass.S, Compass.SE
        ];

        return new Dir(dirconversion[slice]);
    }

    public asPolar(): Polar {
        return new Polar(this.length(), this.asDir());
    }

    public equals(other: Coord) {
        return this.x == other.x && this.y == other.y;
    }

    public notEquals(other: Coord) {
        return this.x != other.x || this.y != other.y;
    }

    public add(other: Coord | Dir) {
        if (other instanceof Coord) {
            return new Coord(this.x + other.x, this.y + other.y);
        } else {
            return this.add(other.asNormalizedCoord());
        }
    }

    public sub(other: Coord | Dir) {
        if (other instanceof Coord) {
            return new Coord(this.x - other.x, this.y - other.y);
        } else {
            return this.add(other.asNormalizedCoord());
        }
    }

    public multiply(other: number) {
        return new Coord(this.x * other, this.y * other);
    }

    public raySameness(other: Coord | Dir): number {
        if (other instanceof Coord) {
            const mag1 = Math.sqrt(this.x * this.x + this.y * this.y);
            const mag2 = Math.sqrt(other.x * other.x + other.y * other.y);

            if (mag1 === 0 && mag2 === 0) {
                return 1;
            }

            const dot = this.x * other.x + this.y * other.y;
            let cos = dot / (mag1 * mag2);

            cos = Math.min(Math.max(cos, -1), 1);

            return cos;
        } else {
            return this.raySameness(other.asNormalizedCoord());
        }
    }

}

export class Polar {
    public mag: number;
    public dir: Dir;

    constructor(mag: number, dir: Dir) {
        this.mag = mag;
        this.dir = dir;
    }

    /**
     * TODO: Check if the math checks out, looks like it doesn't for weird angles
     * @deprecated
     */
    public asCoord(): Coord {
        if (this.dir.equals(Compass.CENTER)) {
            return new Coord(0, 0);
        }

        const S: number = (Math.PI * 2) / 8;
        const compassToRadians = [5 * S, 6 * S, 7 * S, 4 * S, 0, 0 * S, 3 * S, 2 * S, 1 * S];

        const x = Math.round(this.mag * Math.cos(compassToRadians[this.dir.asInt()]));
        const y = Math.round(this.mag * Math.sin(compassToRadians[this.dir.asInt()]));

        return new Coord(x, y);
    }
}