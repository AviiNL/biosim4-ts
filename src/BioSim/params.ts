type ParamArgs = {
    population?: number; // >= 0
    stepsPerGeneration?: number; // > 0
    maxGenerations?: number; // >= 0
    numThreads?: number; // > 0
    signalLayers?: number; // >= 0
    genomeMaxLength?: number; // > 0
    maxNumberNeurons?: number; // > 0
    pointMutationRate?: number; // 0.0..1.0
    geneInsertionDeletionRate?: number; // 0.0..1.0
    deletionRatio?: number; // 0.0..1.0
    killEnable?: boolean;
    sexualReproduction?: boolean;
    chooseParentsByFitness?: boolean;
    populationSensorRadius?: number; // > 0.0
    signalSensorRadius?: number; // > 0
    responsiveness?: number; // >= 0.0
    responsivenessCurveKFactor?: number; // 1, 2, 3, or 4
    longProbeDistance?: number; // > 0
    shortProbeBarrierDistance?: number; // > 0
    valenceSaturationMag?: number;
    saveVideo?: boolean; // probably unused
    videoStride?: number; // > 0
    videoSaveFirstFrames?: number; // >= 0, overrides videoStride
    displayScale?: number;
    agentSize?: number;
    genomeAnalysisStride?: number; // > 0
    displaySampleGenomes?: number; // >= 0
    genomeComparisonMethod?: number;
    updateGraphLog?: boolean;
    updateGraphLogStride?: number; // > 0
    challenge?: number;
    barrierType?: number; // >= 0
    replaceBarrierType?: number; // >= 0
    replaceBarrierTypeGenerationNumber?: number; // >= 0

    // These must not change after initialization
    sizeX?: number; // 2..0x10000
    sizeY?: number; // 2..0x10000
    genomeInitialLengthMin?: number; // > 0 and < genomeInitialLengthMax
    genomeInitialLengthMax?: number; // > 0 and < genomeInitialLengthMin
    logDir?: string;
    imageDir?: string;
    graphLogUpdateCommand?: string;
};

class Params {
    public population: number = 100; // >= 0
    public stepsPerGeneration: number = 100; // > 0
    public maxGenerations: number = 100; // >= 0
    public numThreads: number = 1; // > 0
    public signalLayers: number = 1; // >= 0
    public genomeMaxLength: number = 20; // > 0
    public maxNumberNeurons: number = this.genomeMaxLength / 2; // > 0
    public pointMutationRate: number = 0.0001; // 0.0..1.0
    public geneInsertionDeletionRate: number = 0.0001; // 0.0..1.0
    public deletionRatio: number = 0.7; // 0.0..1.0
    public killEnable: boolean = false;
    public sexualReproduction: boolean = true;
    public chooseParentsByFitness: boolean = true;
    public populationSensorRadius: number = 2.0; // > 0.0
    public signalSensorRadius: number = 1; // > 0
    public responsiveness: number = 0.5; // >= 0.0
    public responsivenessCurveKFactor: number = 2; // 1, 2, 3, or 4
    public longProbeDistance: number = 16; // > 0
    public shortProbeBarrierDistance: number = 3; // > 0
    public valenceSaturationMag: number = 0.5;
    public saveVideo: boolean = true; // probably unused
    public videoStride: number = 1; // > 0
    public videoSaveFirstFrames: number = 0; // >= 0, overrides videoStride
    public displayScale: number = 1;
    public agentSize: number = 2;
    public genomeAnalysisStride: number = 1; // > 0
    public displaySampleGenomes: number = 0; // >= 0
    public genomeComparisonMethod: number = 0; // 0 = Jaro-Winkler; 1 = Hamming
    public updateGraphLog: boolean = false;
    public updateGraphLogStride: number = 16; // > 0
    public challenge: number = 0;
    public barrierType: number = 0; // >= 0
    public replaceBarrierType: number = 0; // >= 0
    public replaceBarrierTypeGenerationNumber: number = 0; // >= 0

    // These must not change after initialization
    public sizeX: number = 128; // 2..0x10000
    public sizeY: number = 128; // 2..0x10000
    public genomeInitialLengthMin: number = 16; // > 0 and < genomeInitialLengthMax
    public genomeInitialLengthMax: number = 16; // > 0 and < genomeInitialLengthMin
    public logDir: string = "./logs/";
    public imageDir: string = "./images/";
    public graphLogUpdateCommand: string = "";

    set(args: ParamArgs) {
        this.population = args.population === undefined ? this.population : args.population;
        this.stepsPerGeneration = args.stepsPerGeneration === undefined ? this.stepsPerGeneration: args.stepsPerGeneration;
        this.maxGenerations = args.maxGenerations === undefined ? this.maxGenerations: args.maxGenerations;
        this.numThreads = args.numThreads === undefined ? this.numThreads : args.numThreads;
        this.signalLayers = args.signalLayers === undefined ? this.signalLayers : args.signalLayers;
        this.genomeMaxLength = args.genomeMaxLength === undefined ? this.genomeMaxLength: args.genomeMaxLength;
        this.maxNumberNeurons = args.maxNumberNeurons === undefined ? this.maxNumberNeurons: args.maxNumberNeurons;
        this.pointMutationRate = args.pointMutationRate === undefined ? this.pointMutationRate: args.pointMutationRate;
        this.geneInsertionDeletionRate = args.geneInsertionDeletionRate === undefined ? this.geneInsertionDeletionRate: args.geneInsertionDeletionRate;
        this.deletionRatio = args.deletionRatio === undefined ? this.deletionRatio: args.deletionRatio;
        this.killEnable = args.killEnable === undefined ? this.killEnable: args.killEnable;
        this.sexualReproduction = args.sexualReproduction === undefined ? this.sexualReproduction: args.sexualReproduction;
        this.chooseParentsByFitness = args.chooseParentsByFitness === undefined ? this.chooseParentsByFitness: args.chooseParentsByFitness;
        this.populationSensorRadius = args.populationSensorRadius === undefined ? this.populationSensorRadius: args.populationSensorRadius;
        this.signalSensorRadius = args.signalSensorRadius === undefined ? this.signalSensorRadius: args.signalSensorRadius;
        this.responsiveness = args.responsiveness === undefined ? this.responsiveness: args.responsiveness;
        this.responsivenessCurveKFactor = args.responsivenessCurveKFactor === undefined ? this.responsivenessCurveKFactor: args.responsivenessCurveKFactor;
        this.longProbeDistance = args.longProbeDistance === undefined ? this.longProbeDistance: args.longProbeDistance;
        this.shortProbeBarrierDistance = args.shortProbeBarrierDistance === undefined ? this.shortProbeBarrierDistance: args.shortProbeBarrierDistance;
        this.valenceSaturationMag = args.valenceSaturationMag === undefined ? this.valenceSaturationMag: args.valenceSaturationMag;
        this.saveVideo = args.saveVideo === undefined ? this.saveVideo: args.saveVideo;
        this.videoStride = args.videoStride === undefined ? this.videoStride: args.videoStride;
        this.videoSaveFirstFrames = args.videoSaveFirstFrames === undefined ? this.videoSaveFirstFrames: args.videoSaveFirstFrames;
        this.displayScale = args.displayScale === undefined ? this.displayScale: args.displayScale;
        this.agentSize = args.agentSize === undefined ? this.agentSize: args.agentSize;
        this.genomeAnalysisStride = args.genomeAnalysisStride === undefined ? this.genomeAnalysisStride: args.genomeAnalysisStride;
        this.displaySampleGenomes = args.displaySampleGenomes === undefined ? this.displaySampleGenomes: args.displaySampleGenomes;
        this.genomeComparisonMethod = args.genomeComparisonMethod === undefined ? this.genomeComparisonMethod: args.genomeComparisonMethod;
        this.updateGraphLog = args.updateGraphLog === undefined ? this.updateGraphLog: args.updateGraphLog;
        this.updateGraphLogStride = args.updateGraphLogStride === undefined ? this.updateGraphLogStride: args.updateGraphLogStride;
        this.challenge = args.challenge === undefined ? this.challenge: args.challenge;
        this.barrierType = args.barrierType === undefined ? this.barrierType: args.barrierType;
        this.replaceBarrierType = args.replaceBarrierType === undefined ? this.replaceBarrierType: args.replaceBarrierType;
        this.replaceBarrierTypeGenerationNumber = args.replaceBarrierTypeGenerationNumber === undefined ? this.replaceBarrierTypeGenerationNumber: args.replaceBarrierTypeGenerationNumber;
        this.sizeX = args.sizeX === undefined ? this.sizeX: args.sizeX;
        this.sizeY = args.sizeY === undefined ? this.sizeY: args.sizeY;
        this.genomeInitialLengthMin = args.genomeInitialLengthMin === undefined ? this.genomeInitialLengthMin: args.genomeInitialLengthMin;
        this.genomeInitialLengthMax = args.genomeInitialLengthMax === undefined ? this.genomeInitialLengthMax: args.genomeInitialLengthMax;
        this.logDir = args.logDir === undefined ? this.logDir: args.logDir;
        this.imageDir = args.imageDir === undefined ? this.imageDir: args.imageDir;
        this.graphLogUpdateCommand = args.graphLogUpdateCommand === undefined ? this.graphLogUpdateCommand: args.graphLogUpdateCommand;
    }
}

export enum RunMode { STOP, RUN, PAUSE, ABORT };
export const params = new Params();