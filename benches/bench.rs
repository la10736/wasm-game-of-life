#![feature(test)]
extern crate test;
extern crate wasm_game_of_life;

#[bench]
fn universe_tick(b: &mut test::Bencher) {
    let mut u = wasm_game_of_life::Universe::new_random(128, 128);

    b.iter(|| {
        u.tick();
    });
}
