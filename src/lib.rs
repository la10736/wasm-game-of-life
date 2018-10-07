extern crate cfg_if;
extern crate wasm_bindgen;
#[cfg(target_arch = "wasm32")]
extern crate js_sys;
#[cfg(not(target_arch = "wasm32"))]
extern crate rand;
#[macro_use]
extern crate itertools;

mod utils;

use wasm_bindgen::prelude::*;
use cfg_if::cfg_if;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

impl Cell {
    fn toggle(self) -> Self {
        match self {
            Cell::Dead => Cell::Alive,
            Cell::Alive => Cell::Dead
        }
    }
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<u8>,
}

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
#[allow(unused_macros)] macro_rules! log {
    ($($t:tt)*) => (log(&format!($($t)*)))
}

impl Universe {
    fn get(&self, row: u32, column: u32) -> Cell {
        let (pos, bit) = self.position(row, column);
        match self.cells[pos] & 0x1 << bit {
            0 => Cell::Dead,
            _ => Cell::Alive
        }
    }

    fn position(&self, row: u32, column: u32) -> (usize, usize) {
        let index = (row * self.width + column) as usize;
        ((index / 8), index % 8)
    }

    fn set(&mut self, row: u32, column: u32, cell: Cell) {
        let (pos, bit) = self.position(row, column);
        match cell {
            Cell::Alive => { self.cells[pos] |= 0x1 << bit }
            Cell::Dead => { self.cells[pos] &= !(0x1 << bit) }
        }
    }

    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        iproduct!(-1..2, -1..2)
            .filter(|&pair| pair != (0, 0))
            .map(|(r, c)| (self.wrap_row((row as i32) + r), self.wrap_col((column as i32) + c)))
            .filter(|&(r, c)| self.get(r, c) == Cell::Alive)
            .count() as u8
    }

    fn wrap_row(&self, r: i32) -> u32 {
        wrap(r, self.height)
    }

    fn wrap_col(&self, c: i32) -> u32 {
        wrap(c, self.width)
    }
}

#[wasm_bindgen]
impl Universe {
    pub fn new(width: u32, height: u32) -> Self {
        utils::set_panic_hook();
        Self { width, height, cells: vec![0; ((width * height) / 8 + 1) as usize] }
    }

    pub fn example() -> Universe {
        let mut result = Self::new(64, 64);

        iproduct!(0..result.width, 0..result.height).for_each(
            |(r, c)| {
                let i = r * result.width + c;
                result.set(r, c,
                           if i % 2 == 0 || i % 7 == 0 { Cell::Alive } else { Cell::Dead },
                );
            }
        );
        result
    }

    pub fn random(&mut self) {
        iproduct!(0..self.width, 0..self.height).for_each(
            |(r, c)| {
                self.set(r, c,
                           if random(0.5) { Cell::Alive } else { Cell::Dead },
                );
            }
        );
    }

    pub fn clear(&mut self) {
        self.cells = vec![0; self.cells.len()];
    }

    pub fn new_random(width: u32, height: u32) -> Self {
        let mut result = Self::new(width, height);
        result.random();

        result
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const u8 {
        self.cells.as_ptr()
    }

    pub fn toggle_cell(&mut self, row: u32, col: u32) {
        let new = self.get(row, col).toggle();
        self.set(row, col, new)
    }

    pub fn set_cell(&mut self, row: u32, col: u32) {
        self.set(row, col, Cell::Alive)
    }

    pub fn clear_cell(&mut self, row: u32, col: u32) {
        self.set(row, col, Cell::Dead)
    }

    pub fn tick(&mut self) {
        let _timer = Timer::new("Universe::tick");
        let prev_state = {
            let _timer = Timer::new("Universe::tick::allocate");
            self.clone()
        };
        {
            let _timer = Timer::new("Universe::tick::next_generation");
            iproduct!(0..self.height, 0..self.width)
                .map(|(r, c)|
                    (r, c, prev_state.get(r, c), prev_state.live_neighbor_count(r, c))
                )
                .for_each(|(r, c, cell, count)|
                    {
                        let next_cell = match (cell, count) {
                            // Rule 1: Any live cell with fewer than two live neighbours
                            // dies, as if caused by underpopulation.
                            (Cell::Alive, x) if x < 2 => Cell::Dead,
                            // Rule 2: Any live cell with two or three live neighbours
                            // lives on to the next generation.
                            (Cell::Alive, 2) | (Cell::Alive, 3) => Cell::Alive,
                            // Rule 3: Any live cell with more than three live
                            // neighbours dies, as if by overpopulation.
                            (Cell::Alive, x) if x > 3 => Cell::Dead,
                            // Rule 4: Any dead cell with exactly three live neighbours
                            // becomes a live cell, as if by reproduction.
                            (Cell::Dead, 3) => Cell::Alive,
                            // All other cells remain in the same state.
                            (otherwise, _) => otherwise,
                        };
                        self.set(r, c, next_cell)
                    });

        }
        let _timer = Timer::new("Universe::tick::free_memory");
    }
}

fn random(level: f64) -> bool {
    #[cfg(target_arch = "wasm32")] {
        js_sys::Math::random() < level
    }
    #[cfg(not(target_arch = "wasm32"))] {
        rand::random::<f64>() < level
    }
}

fn wrap(mut v: i32, size: u32) -> u32 {
    let size = size as i32;
    while v < 0 {
        v += size;
    }
    (v % size) as u32
}

pub struct Timer<'a> {
    #[allow(dead_code)]
    name: &'a str
}

impl<'a> Timer<'a> {
    pub fn new(name: &'a str) -> Self {
        time(name);
        Self {name}
    }
}

impl<'a> Drop for Timer<'a> {
    fn drop(&mut self) {
        timeEnd(self.name);
    }
}

//Js interface
#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
extern {
    #[wasm_bindgen(js_namespace = console)]
    fn log(msg: &str);

    #[wasm_bindgen(js_namespace = performance)]
    fn now() -> f64;

    #[wasm_bindgen(js_namespace = console)]
    fn time(name: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn timeEnd(name: &str);
}

#[cfg(not(target_arch = "wasm32"))]
mod mock {
    pub fn log(msg: &str) {
        println!("{}", msg)
    }

    pub fn now() -> f64 {
        0.0
    }

    pub fn time(name: &str) {}

    pub fn timeEnd(name: &str) {}
}

#[cfg(not(target_arch = "wasm32"))]
use mock::*;


#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn count_0_nighbor() {
        let u = Universe::new(3, 3);
        assert_eq!(0, u.live_neighbor_count(1, 1));
    }

    #[test]
    fn count_0_nighbor_should_wrap() {
        let u = Universe::new(3, 3);
        assert_eq!(0, u.live_neighbor_count(0, 0));
        assert_eq!(0, u.live_neighbor_count(2, 1));
        assert_eq!(0, u.live_neighbor_count(1, 2));
    }

    #[test]
    fn count_nighbor_should_ignore_self() {
        let mut u = Universe::new(3, 3);
        iproduct!(0..3, 0..3).for_each(|(r, c)| u.set(r, c, Cell::Alive));
        assert_eq!(8, u.live_neighbor_count(0, 0));
    }
}
