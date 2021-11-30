import {createReadStream, createWriteStream, mkdirSync} from "fs";
import {resolve} from "path";
import * as PImage from "pureimage";
import {Genome} from "./Genome";
import {Individual} from "./Individual";
import {params as p} from "./params";
import {grid, peeps} from "./simulator";
import {Converter} from "ffmpeg-stream";
import internal from "stream";

const time = new Date();

const makeGeneticColor = (genome: Genome) => {
    const c = ((genome.length & 1)
        | ((genome[0].sourceType) << 1)
        | ((genome[genome.length - 1].sourceType) << 2)
        | ((genome[0].sinkType) << 3)
        | ((genome[genome.length - 1].sinkType) << 4)
        | ((genome[0].sourceNum & 1) << 5)
        | ((genome[0].sinkNum & 1) << 6)
        | ((genome[genome.length - 1].sourceNum & 1) << 7));

    let r = (c);
    let g = ((c & 0x1f) << 3);
    let b = ((c & 7) << 5);

    return [r, g, b];
};

export const saveVideoFrame = async (simStep: number, generation: number) => {
    const indivSize = 4;
    const canvas = PImage.make(p.sizeX * indivSize, p.sizeY * indivSize, undefined);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = 'rgb(75,166,253)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 1; i < p.population; i++) {
        const indiv: Individual = peeps[i];
        if (indiv.alive) {
            const color = makeGeneticColor(indiv.genome);
            ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            ctx.fillRect(indiv.loc.x * indivSize, indiv.loc.y * indivSize, indivSize, indivSize);
        }
    }

    const pa = resolve(p.imageDir, time.getTime().toString(), generation.toString());
    //console.log(`${pa}/${simStep}.jpg`);
    mkdirSync(pa, {recursive: true});
    await PImage.encodeJPEGToStream(canvas, createWriteStream(`${pa}/${simStep}.jpg`));
};

export const saveVideo = async (generation: number) => {
    const pa = resolve(p.imageDir, time.getTime().toString(), generation.toString());

    const conv = new Converter(); // create converter
    const input = conv.createInputStream({f: 'image2pipe', r: 30}); // create input writable stream
    
    conv.output(`${pa}.mp4`); // output to file

    await processFrame(pa, input, 0, p.stepsPerGeneration - 1);

    input.end();
    conv.run();
};

const processFrame = (pa: string, input: internal.Writable, currentFrame: number, lastFrame: number) => {
    return new Promise<void>((resolve, reject) => {
        createReadStream(`${pa}/${currentFrame}.jpg`)
            .on("error", (err) => {
                console.log("Error", err);
            })
            .on("data", (chunk: any) => {
                input.write(chunk);
            })
            .on("end", async () => {
                if (currentFrame < lastFrame) {
                    await processFrame(pa, input, currentFrame + 1, lastFrame);
                }
                resolve();
            });
    });
}