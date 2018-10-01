/* tslint:disable */
export enum Cell {Dead,Alive,}
export class Universe {
free(): void;
static  new(arg0: number, arg1: number): Universe;

static  example(): Universe;

static  random(arg0: number, arg1: number): Universe;

 width(): number;

 height(): number;

 cells(): number;

 render(): string;

 tick(): void;

}
