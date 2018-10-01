extern crate cfg_if;
extern crate wasm_bindgen;
extern crate js_sys;
#[macro_use]
extern crate itertools;

mod utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[repr(u8)]
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<Cell>,
}

impl Universe {
    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        iproduct!(-1..2, -1..2)
            .filter(|&pair| pair != (0, 0))
            .map(|(r, c)| (self.wrap_row((row as i32) + r), self.wrap_col((column as i32) + c)))
            .filter(|&(r, c)| self.cells[self.get_index(r, c)] == Cell::Alive)
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
        Self { width, height, cells: vec![Cell::Dead; (width * height) as usize] }
    }

    pub fn example() -> Universe {
        let mut result = Self::new(64, 64);

        result.cells = (0..result.width * result.height)
            .map(|i| {
                if i % 2 == 0 || i % 7 == 0 {
                    Cell::Alive
                } else {
                    Cell::Dead
                }
            })
            .collect();

        result
    }

    pub fn random(width: u32, height: u32) -> Self {
        let mut result = Self::new(width, height);

        result.cells = (0..result.width * result.height)
            .map(|_| {
                if js_sys::Math::random() < 0.5 {
                    Cell::Alive
                } else {
                    Cell::Dead
                }
            })
            .collect();

        result
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }

    pub fn render(&self) -> String {
        self.to_string()
    }

    pub fn tick(&mut self) {
        self.cells = iproduct!(0..self.height, 0..self.width)
            .map(|(r, c)|
                (self.get_index(r, c), self.live_neighbor_count(r, c))
            )
            .map(|(idx, count)|
                match (self.cells[idx], count) {
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
                }
            )
            .collect();
    }
}

use std::fmt;

impl fmt::Display for Universe {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        for line in self.cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                let symbol = if cell == Cell::Dead { '◻' } else { '◼' };
                write!(f, "{}", symbol)?;
            }
            write!(f, "\n")?;
        }

        Ok(())
    }
}

fn wrap(mut v: i32, size: u32) -> u32 {
    let size = size as i32;
    while v < 0 {
        v += size;
    }
    (v % size) as u32
}

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
        u.cells = vec![Cell::Alive; u.cells.len()];
        assert_eq!(8, u.live_neighbor_count(0, 0));
    }
}


