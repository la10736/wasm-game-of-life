#![feature(test)]
extern crate test;
extern crate wasm_game_of_life;

#[bench]
fn universe_tick(b: &mut test::Bencher) {
    let mut u = wasm_game_of_life::Universe::example();

    b.iter(|| {
        for _ in 0..9 {u.tick()};
    });
}
