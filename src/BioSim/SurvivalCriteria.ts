import {Coord} from "./basicTypes";
import {visitNeighborhood} from "./Grid";
import {Individual} from "./Individual";
import {params as p} from "./params";

import {grid} from './simulator';

// Some of the survival challenges to try. Some are interesting, some
// not so much. Fine-tune the challenges by tweaking the corresponding code
// in survival-criteria.cpp.
export const CHALLENGE_CIRCLE = 0;
export const CHALLENGE_RIGHT_HALF = 1;
export const CHALLENGE_RIGHT_QUARTER = 2;
export const CHALLENGE_STRING = 3;
export const CHALLENGE_CENTER_WEIGHTED = 4;
export const CHALLENGE_CENTER_UNWEIGHTED = 40;
export const CHALLENGE_CORNER = 5;
export const CHALLENGE_CORNER_WEIGHTED = 6;
export const CHALLENGE_MIGRATE_DISTANCE = 7;
export const CHALLENGE_CENTER_SPARSE = 8;
export const CHALLENGE_LEFT_EIGHTH = 9;
export const CHALLENGE_RADIOACTIVE_WALLS = 10;
export const CHALLENGE_AGAINST_ANY_WALL = 11;
export const CHALLENGE_TOUCH_ANY_WALL = 12;
export const CHALLENGE_EAST_WEST_EIGHTHS = 13;
export const CHALLENGE_NEAR_BARRIER = 14;
export const CHALLENGE_PAIRS = 15;
export const CHALLENGE_LOCATION_SEQUENCE = 16;
export const CHALLENGE_ALTRUISM = 17;
export const CHALLENGE_ALTRUISM_SACRIFICE = 18;

export const passedSurvivalCriterion = (individual: Individual, challenge: number) => {

    let passed = false;
    let score = 0.0;

    if (!individual || !individual.alive) {
        return {passed, score};
    }

    switch (challenge) {
        case CHALLENGE_CIRCLE: {
            const safeCenter: Coord = new Coord(p.sizeX / 4, p.sizeY / 4);
            const radius = p.sizeX / 4;

            const offset: Coord = safeCenter.sub(individual.loc);
            const distance = offset.length();

            return distance <= radius ?
                {passed: true, score: (radius - distance) / radius} :
                {passed: false, score: 0.0};
        }

        case CHALLENGE_RIGHT_HALF: {
            return individual.loc.x > p.sizeX / 2 ?
                {passed: true, score: 1.0} :
                {passed: false, score: 0.0};
        }

        case CHALLENGE_RIGHT_QUARTER: {
            return individual.loc.x > p.sizeX / 2 + p.sizeX / 4 ?
                {passed: true, score: 1.0} :
                {passed: false, score: 0.0};
        }

        case CHALLENGE_LEFT_EIGHTH: {
            return individual.loc.x < p.sizeX / 8 ?
                {passed: true, score: 1.0} :
                {passed: false, score: 0.0};
        }
        
        case CHALLENGE_STRING: {
            const minNeighbors = 22;
            const maxNeighbors = 2;

            const radius = 1.5;

            if (grid.isBorder(individual.loc)) {
                return {passed: false, score: 0.0};
            }

            let count = 0;
            const f = (loc: Coord) => {
                if (grid.isOccupiedAt(loc)) {
                    count++;
                }
            };

            visitNeighborhood(individual.loc, radius, f);

            if (count >= minNeighbors && count <= maxNeighbors) {
                return {passed: true, score: 1.0};
            } else {
                return {passed: false, score: 0.0};
            }
        }

        case CHALLENGE_CENTER_WEIGHTED: {
            const safeCenter: Coord = new Coord(p.sizeX / 2, p.sizeY / 2);
            const radius = p.sizeX / 3;

            const offset: Coord = safeCenter.sub(individual.loc);
            const distance = offset.length();
            return distance <= radius ?
                {passed: true, score: (radius - distance) / radius} :
                {passed: false, score: 0.0};
        }

        case CHALLENGE_CENTER_UNWEIGHTED: {
            const safeCenter: Coord = new Coord(p.sizeX / 2, p.sizeY / 2);
            const radius = p.sizeX / 3;

            const offset: Coord = safeCenter.sub(individual.loc);
            const distance = offset.length();
            return distance <= radius ?
                {passed: true, score: 1.0} :
                {passed: false, score: 0.0};
        }

        case CHALLENGE_CENTER_SPARSE: {
            const safeCenter: Coord = new Coord(p.sizeX / 2, p.sizeY / 2);
            const outerRadius = p.sizeX / 4;
            const innerRadius = 1.5;

            const minNeighbors = 5;
            const maxNeighbors = 8;

            const offset: Coord = safeCenter.sub(individual.loc);
            const distance = offset.length();
            if (distance <= outerRadius) {
                let count = 0;
                const f = (loc: Coord) => {
                    if (grid.isOccupiedAt(loc)) {
                        count++;
                    }
                };

                visitNeighborhood(individual.loc, innerRadius, f);

                if (count >= minNeighbors && count <= maxNeighbors) {
                    return {passed: true, score: 1.0};
                }
            }
            return {passed: false, score: 0.0};
        }

        default: {
            throw new Error(`Unknown survival challenge ${challenge}`);
        }
    }
};