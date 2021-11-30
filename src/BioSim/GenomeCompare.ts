import assert from "assert";
import {Gene, Genome} from "./Genome";
import {params as p} from "./params";

export const genesMatch = (gene1: Gene, gene2: Gene): boolean => {
    return gene1 !== undefined && gene2 !== undefined &&
        gene1.sinkNum === gene2.sinkNum &&
        gene1.sourceNum === gene2.sourceNum &&
        gene1.sinkType === gene2.sinkType &&
        gene1.sourceType === gene2.sourceType &&
        gene1.weight === gene2.weight;
}

export const jaro_winkler_distance = (genome1: Genome, genome2: Genome): number => {
    let dw: number;
    const max = (a: number, b: number): number => { return a > b ? a : b; }
    const min = (a: number, b: number): number => { return a < b ? a : b; }

    let s = genome1;
    let a = genome2;

    let i,j,l;
    let m = 0, t = 0;
    let s1 = s.length;
    let a1 = a.length;

    const maxNumGenesToCompare = 20;
    s1 = min(maxNumGenesToCompare, s1);
    a1 = min(maxNumGenesToCompare, a1);

    let sflags: number[] = Array.from({length: s1}, () => 0);
    let aflags: number[] = Array.from({length: a1}, () => 0);

    let range = max(0, max(s1, a1) / 2 - 1);

    if (!s1 || !a1) {
        return 0;
    }

    for (i = 0; i < a1; i++) {
        for (j = max(i - range, 0), l = min(i + range + 1, s1); j < l; j++) {
            if (genesMatch(a[i], s[j])) {
                sflags[j] = aflags[i] = 1;
                m++;
                break;
            }
        }
    }

    if (!m) {
        return 0;
    }

    l = 0;
    for (i = 0; i < a1; i++) {
        if (aflags[i]) {
            for (j = 0; j < s1; j++) {
                if (sflags[j] === 1) {
                    l = j + 1;
                    break;
                }
            }
            if(!genesMatch(a[i], s[j])) {
                t++;
            }
        }
    }

    t /= 2;

    dw = ((m / s1) + (m / a1) + (m - t) / m) / 3;
    return dw;
};

export const hammingDistanceBits = (genome1: Genome, genome2: Genome): number => {
    assert(genome1.length === genome2.length);

    throw new Error("Not implemented");
};

export const hammingDistanceBytes = (genome1: Genome, genome2: Genome): number => {
    assert(genome1.length === genome2.length);

    throw new Error("Not implemented");
}

export const genomeSimilarity = (genome1: Genome, genome2: Genome): number => {
    switch(p.genomeComparisonMethod) {
        case 0:
            return jaro_winkler_distance(genome1, genome2);
        case 1:
            return hammingDistanceBits(genome1, genome2);
        case 2:
            return hammingDistanceBytes(genome1, genome2);
        default:
            assert(false);
    }

    return 0;
};