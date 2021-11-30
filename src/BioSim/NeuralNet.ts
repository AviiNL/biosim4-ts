import {Gene} from "./Genome";

export class Neuron {
    public output: number = 0;
    public driven: boolean = false;
}

export class NeuralNet {
    public neurons: Neuron[] = [];
    public connections: Gene[] = [];
}
