#!/usr/bin/env bash


npm install --cwd www --prefix www
npm link --cwd pkg
npm link wasm-game-of-life --cwd www
