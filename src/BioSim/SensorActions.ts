// Neuron Sources (Sensors) and Sinks (Actions)

// These sensor, neuron, and action value ranges are here for documentation
// purposes. Most functions now assume these ranges. We no longer support changes
// to these ranges.
export const SENSOR_MIN = 0.0;
export const SENSOR_MAX = 1.0;
export const SENSOR_RANGE = SENSOR_MAX - SENSOR_MIN;

export const NEURON_MIN = -1.0;
export const NEURON_MAX = 1.0;
export const NEURON_RANGE = NEURON_MAX - NEURON_MIN;

export const ACTION_MIN = 0.0;
export const ACTION_MAX = 1.0;
export const ACTION_RANGE = ACTION_MAX - ACTION_MIN;

// Place the sensor neuron you want enabled prior to NUM_SENSES. Any
// that are after NUM_SENSES will be disabled in the simulator.
// If new items are added to this enum, also update the name functions
// in analysis.cpp.
// I means data about the individual, mainly stored in Indiv
// W means data about the environment, mainly stored in Peeps or Grid
export enum Sensor {
    LOC_X = 0,             // I distance from left edge
    LOC_Y,             // I distance from bottom
    BOUNDARY_DIST_X,   // I X distance to nearest edge of world
    BOUNDARY_DIST,     // I distance to nearest edge of world
    BOUNDARY_DIST_Y,   // I Y distance to nearest edge of world
    GENETIC_SIM_FWD,   // I genetic similarity forward
    LAST_MOVE_DIR_X,   // I +- amount of X movement in last movement
    LAST_MOVE_DIR_Y,   // I +- amount of Y movement in last movement
    LONGPROBE_POP_FWD, // W long look for population forward
    LONGPROBE_BAR_FWD, // W long look for barriers forward
    POPULATION,        // W population density in neighborhood
    POPULATION_FWD,    // W population density in the forward-reverse axis
    POPULATION_LR,     // W population density in the left-right axis
    OSC1,              // I oscillator +-value
    AGE,               // I
    BARRIER_FWD,       // W neighborhood barrier distance forward-reverse axis
    BARRIER_LR,        // W neighborhood barrier distance left-right axis
    RANDOM,            //   random sensor value, uniform distribution
    SIGNAL0,           // W strength of signal0 in neighborhood
    SIGNAL0_FWD,       // W strength of signal0 in the forward-reverse axis
    SIGNAL0_LR,        // W strength of signal0 in the left-right axis
    NUM_SENSES,        // <<------------------ END OF ACTIVE SENSES MARKER
};


// Place the action neuron you want enabled prior to NUM_ACTIONS. Any
// that are after NUM_ACTIONS will be disabled in the simulator.
// If new items are added to this enum, also update the name functions
// in analysis.cpp.
// I means the action affects the individual internally (Indiv)
// W means the action also affects the environment (Peeps or Grid)
export enum Action {
    MOVE_X,                   // W +- X component of movement
    MOVE_Y,                   // W +- Y component of movement
    MOVE_FORWARD,             // W continue last direction
    MOVE_RL,                  // W +- component of movement
    MOVE_RANDOM,              // W
    SET_OSCILLATOR_PERIOD,    // I
    SET_LONGPROBE_DIST,       // I
    SET_RESPONSIVENESS,       // I
    EMIT_SIGNAL0,             // W
    MOVE_EAST,                // W
    MOVE_WEST,                // W
    MOVE_NORTH,               // W
    MOVE_SOUTH,               // W
    MOVE_LEFT,                // W
    MOVE_RIGHT,               // W
    MOVE_REVERSE,             // W
    KILL_FORWARD,             // W
    NUM_ACTIONS,              // <<----------------- END OF ACTIVE ACTIONS MARKER
};


export const sensorName = (sensor: Sensor): string => {
    return "Not yet implemented";
}

export const actionName = (action: Action): string => {
    return "Not yet implemented";
}