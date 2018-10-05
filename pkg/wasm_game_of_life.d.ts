/* tslint:disable */
export enum Cell {Dead,Alive,}
export class Universe {
free(): void;
static  new(arg0: number, arg1: number): Universe;

static  example(): Universe;

 random(): void;

 clear(): void;

static  new_random(arg0: number, arg1: number): Universe;

 width(): number;

 height(): number;

 cells(): number;

 toggle_cell(arg0: number, arg1: number): void;

 set_cell(arg0: number, arg1: number): void;

 clear_cell(arg0: number, arg1: number): void;

 tick(): void;

}
