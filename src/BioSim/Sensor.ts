import assert from "assert";
import {Compass, Coord, Dir} from "./basicTypes";
import {visitNeighborhood} from "./Grid";
import {grid, signals} from "./simulator";
import {params as p} from "./params";
import {SIGNAL_MAX} from "./Signals";

export const getPopulationDensityAlongAxis = (loc: Coord, dir: Dir): number => {

    if (dir.equals(Compass.CENTER)) {
        return 0.0;
    }

    assert(dir.notEquals(Compass.CENTER));

    let sum = 0;
    const dirVec = dir.asNormalizedCoord();

    const len = Math.sqrt(dirVec.x * dirVec.x + dirVec.y * dirVec.y);
    const dirVecX = dirVec.x / len;
    const dirVecY = dirVec.y / len;

    const f = (tloc: Coord) => {
        if (tloc.notEquals(loc) && grid.isOccupiedAt(tloc)) {
            const offset = tloc.sub(loc);
            const proj = dirVecX * offset.x + dirVecY * offset.y;
            const contrib = proj / (offset.x * offset.x + offset.y * offset.y);
            sum += contrib;
        }
    };
    
    visitNeighborhood(loc, p.populationSensorRadius, f);
    
    const maxSumMag = 6.0 * p.populationSensorRadius;
    assert(sum >= -maxSumMag && sum <= maxSumMag);

    return ((sum / maxSumMag) + 1.0) / 2.0;
};

export const getShortProbeBarrierDistance = (loc0: Coord, dir: Dir, probeDistance: number): number => {
    let countFwd = 0;
    let countRev = 0;

    let loc = loc0.add(dir);
    let numLocsToTest = probeDistance;

    while(numLocsToTest > 0 && grid.isInBounds(loc) && !grid.isBarrierAt(loc)) {
        countFwd++;
        loc = loc.add(dir);
        numLocsToTest--;
    }

    if(numLocsToTest > 0 && !grid.isInBounds(loc)) {
        countFwd = probeDistance;
    }

    numLocsToTest = probeDistance;
    loc = loc0.sub(dir);
    while(numLocsToTest > 0 && grid.isInBounds(loc) && !grid.isBarrierAt(loc)) {
        countRev++;
        loc = loc.sub(dir);
        numLocsToTest--;
    }

    if(numLocsToTest > 0 && !grid.isInBounds(loc)) {
        countRev = probeDistance;
    }

    let sensorVal = (countFwd - countRev) + probeDistance;
    sensorVal = (sensorVal / 2) / probeDistance;

    return sensorVal;
};

export const getSignalDensity = (layerNum: number, loc: Coord) => {
    let countLocs = 0;
    let sum = 0;

    const center = loc;

    const f = (tloc: Coord) => {
        countLocs++;
        sum += signals.getMagnitude(layerNum, tloc);
    };

    visitNeighborhood(center, p.signalSensorRadius, f);
    let maxSum = countLocs * SIGNAL_MAX;
    let sensorVal = sum / maxSum;

    return sensorVal;
};

export const getSignalDensityAlongAxis = (layerNum: number, loc: Coord, dir: Dir): number => {
    if (dir.equals(Compass.CENTER)) {
        return 0.0;
    }

    assert(dir.notEquals(Compass.CENTER));

    let sum = 0;
    const dirVec = dir.asNormalizedCoord();
    const len = Math.sqrt(dirVec.x * dirVec.x + dirVec.y * dirVec.y);
    const dirVecX = dirVec.x / len;
    const dirVecY = dirVec.y / len;

    const f = (tloc: Coord) => {
        if (tloc.notEquals(loc)) {
            const offset = tloc.sub(loc);
            const proj = dirVecX * offset.x + dirVecY * offset.y;
            const contrib = (proj * signals.getMagnitude(layerNum, tloc)) /
                (offset.x * offset.x + offset.y * offset.y);
            sum += contrib;
        }
    };

    visitNeighborhood(loc, p.signalSensorRadius, f);

    const maxSumMag = 6.0 * p.signalSensorRadius * SIGNAL_MAX;
    assert(sum >= -maxSumMag && sum <= maxSumMag);
    let sensorVal = ((sum / maxSumMag) + 1.0) / 2.0;

    return sensorVal;
};

export const longProbePopulationFwd = (loc: Coord, dir: Dir, longProbeDist: number): number => {
    assert(longProbeDist > 0);
    let count = 0;
    loc = loc.add(dir);
    let numLocsToTest = longProbeDist;
    while(numLocsToTest > 0 && grid.isInBounds(loc) && grid.isEmptyAt(loc)) {
        count++;
        loc = loc.add(dir);
        numLocsToTest--;
    }

    if (numLocsToTest > 0 && (!grid.isInBounds(loc) || grid.isBarrierAt(loc))) {
        count = longProbeDist;
    }

    return count;
};

export const longProbeBarrierFwd = (loc: Coord, dir: Dir, longProbeDist: number): number => {

    assert(longProbeDist > 0);
    let count = 0;
    loc = loc.add(dir);
    let numLocsToTest = longProbeDist;
    while(numLocsToTest > 0 && grid.isInBounds(loc) && !grid.isBarrierAt(loc)) {
        count++;
        loc = loc.add(dir);
        numLocsToTest--;
    }
    if (numLocsToTest > 0 && !grid.isInBounds(loc)) {
        count = longProbeDist;
    }

    return count;
};
