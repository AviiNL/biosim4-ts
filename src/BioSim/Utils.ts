export const randomUint = (min?: number, max?: number) => {
    if (min === undefined) min  = 0;
    if (max === undefined) max = Math.pow(2, 32) - 1;
    
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const Clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
}