![Rust](https://img.shields.io/badge/Rust-WASM-orange)
![License](https://img.shields.io/github/license/denizsincar29/reversi_wasm)
# Reversi (Rust + WebAssembly)
A web-based implementation of the classic board game Reversi (often known as Othello) with AI, built using Rust and WebAssembly.
Try it out [here!](https://denizsincar.ru/reversi/)
This project demonstrates how to create an interactive game that runs efficiently in the browser, leveraging Rust's performance and WebAssembly's compatibility.

## Features
- **Classic Gameplay**: Play against an AI opponent;
- **AI opponent**: Supports minimax with optional alpha-beta pruning;
- **Responsive Design**: Enjoy a seamless gaming experience on both desktop and mobile devices;
- **Accessibility first**: The game is created by a blind developer, and is designed to be fully usable with screen readers.

## Technologies Used
- **Rust**: The core game logic and AI algorithms are implemented in Rust for performance and safety;
- **WebAssembly**: The Rust code is compiled to WebAssembly, allowing it to run efficiently in the browser;
- **JavaScript**: Used for handling user interactions, sounds and integrating the WebAssembly module with the web interface;
- **HTML/CSS**: For structuring and styling the game interface.

## Getting Started
If you wanna play the game directly, [here ya go!](https://denizsincar.ru/reversi/)
To run the game locally, clone the repository and run the build script. Make sure you have Rust and wasm-pack installed.
```bash
git clone git@github.com:denizsincar29/reversi_wasm.git
cd reversi_wasm
./build.sh
```
It will build the rust code and ask you if you want to serve the game locally. If you choose to serve, it will start a local server and open the game in your default web browser.

## Contributing
Contributions are welcome! If you have any ideas for improvements or want to report a bug, please open an issue or submit a pull request.