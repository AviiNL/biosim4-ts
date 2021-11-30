import assert from "assert";
import {Coord, Dir} from "./basicTypes";
import {Individual} from "./Individual";
import {params as p} from "./params";
import {Action} from "./SensorActions";
import {grid, peeps, signals} from "./simulator";
export const prob2bool = (factor: number): boolean => {
    return Math.random() < factor;
};

export const responseCurve = (r: number) => {
    const k = p.responsivenessCurveKFactor;
    return Math.pow((r - 2.0), -2.0 * k) - Math.pow(2.0, -2.0 * k) * (1.0 - r);
};

export const executeActions = (indiv: Individual, actionLevels: number[]) => {
    const isEnabled = (action: Action) => {
        return action < Action.NUM_ACTIONS;
    };

    if (isEnabled(Action.SET_RESPONSIVENESS)) {
        let level = actionLevels[Action.SET_RESPONSIVENESS];
        level = (Math.tanh(level) + 1) / 2.0;
        indiv.responsiveness = level;
    }

    const responsevenessAdjusted = responseCurve(indiv.responsiveness);

    if (isEnabled(Action.SET_OSCILLATOR_PERIOD)) {
        const periodf = actionLevels[Action.SET_OSCILLATOR_PERIOD];
        const newPeriodf01 = (Math.tanh(periodf) + 1) / 2.0;
        const newPeriod = Math.round(1 + (1.5 + Math.exp(7.0 * newPeriodf01)));
        assert(newPeriod >= 2 && newPeriod <= 2048);
        indiv.oscPeriod = newPeriod;
    }

    if (isEnabled(Action.SET_LONGPROBE_DIST)) {
        const maxLongProbeDistange = 32;
        let level = actionLevels[Action.SET_LONGPROBE_DIST];
        level = (Math.tanh(level) + 1) / 2.0;
        level = 1 + level * maxLongProbeDistange;
        indiv.longProbeDist = level >>> 0;
    }

    if (isEnabled(Action.EMIT_SIGNAL0)) {
        const emitThreashold = 0.5;
        let level = actionLevels[Action.EMIT_SIGNAL0];
        level = (Math.tanh(level) + 1) / 2.0;
        level *= responsevenessAdjusted;
        if (level > emitThreashold && prob2bool(level)) {
            signals.increment(0, indiv.loc);
        }
    }

    // https://github.com/davidrmiller/biosim4/blob/2f5e29e58d01cbf496f85bae89dcc84d3e3bccbb/src/executeActions.cpp#L128
    if (isEnabled(Action.KILL_FORWARD)) {
        // this is disabled by default, will implement later
    }

    let level: number;
    let offset: Coord;
    let lastMoveOffset = indiv.lastMoveDir.asNormalizedCoord();

    let moveX = isEnabled(Action.MOVE_X) ? actionLevels[Action.MOVE_X] : 0;
    let moveY = isEnabled(Action.MOVE_Y) ? actionLevels[Action.MOVE_Y] : 0;

    if (isEnabled(Action.MOVE_EAST)) {moveX += actionLevels[Action.MOVE_EAST];}
    if (isEnabled(Action.MOVE_WEST)) {moveX -= actionLevels[Action.MOVE_WEST];}
    if (isEnabled(Action.MOVE_NORTH)) {moveY += actionLevels[Action.MOVE_NORTH];}
    if (isEnabled(Action.MOVE_SOUTH)) {moveY -= actionLevels[Action.MOVE_SOUTH];}

    if (isEnabled(Action.MOVE_FORWARD)) {
        level = actionLevels[Action.MOVE_FORWARD];
        moveX += lastMoveOffset.x * level;
        moveY += lastMoveOffset.y * level;
    }

    if (isEnabled(Action.MOVE_REVERSE)) {
        level = actionLevels[Action.MOVE_REVERSE];
        moveX -= lastMoveOffset.x * level;
        moveY -= lastMoveOffset.y * level;
    }

    if (isEnabled(Action.MOVE_LEFT)) {
        level = actionLevels[Action.MOVE_LEFT];
        offset = indiv.lastMoveDir.rotate90DegCCW().asNormalizedCoord();
        moveX += offset.x * level;
        moveY += offset.y * level;
    }

    if (isEnabled(Action.MOVE_RIGHT)) {
        level = actionLevels[Action.MOVE_RIGHT];
        offset = indiv.lastMoveDir.rotate90DegCW().asNormalizedCoord();
        moveX += offset.x * level;
        moveY += offset.y * level;
    }

    if (isEnabled(Action.MOVE_RL)) {
        level = actionLevels[Action.MOVE_RL];
        offset = indiv.lastMoveDir.rotate90DegCW().asNormalizedCoord();
        moveX += offset.x * level;
        moveY += offset.y * level;
    }

    if (isEnabled(Action.MOVE_RANDOM)) {
        level = actionLevels[Action.MOVE_RANDOM];
        offset = Dir.random8().asNormalizedCoord();
        moveX += offset.x * level;
        moveY += offset.y * level;
    }

    moveX = Math.tanh(moveX);
    moveY = Math.tanh(moveY);

    moveX *= responsevenessAdjusted;
    moveY *= responsevenessAdjusted;

    let probX = +prob2bool(Math.abs(moveX));
    let probY = +prob2bool(Math.abs(moveY));

    let signumX = moveX < 0.0 ? -1 : 1;
    let signumY = moveY < 0.0 ? -1 : 1;

    let movementOffset:Coord = new Coord(probX * signumX, probY * signumY);

    let newLoc = indiv.loc.add(movementOffset);
    if(grid.isInBounds(newLoc) && grid.isEmptyAt(newLoc)) {
        peeps.queueForMove(indiv, newLoc);
    }
};