use wasm_bindgen::prelude::*;

pub const SIZE: usize = 8;
pub const CORNERS: &[usize] = &[0, 7, 56, 63];

pub const DIRECTIONS: &[(i32, i32)] = &[
    (-1, -1), (-1, 0), (-1, 1),
    (0, -1),           (0, 1),
    (1, -1),  (1, 0),  (1, 1)
];

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Board {
    grid: Vec<u8>,  // 64 cells: 0=empty, 1=black, 2=white
    turn: u8,       // 1=black or 2=white
}

#[wasm_bindgen]
pub struct MoveResult {
    board: Board,
    flipped_indices: Vec<u32>,
}

#[wasm_bindgen]
impl MoveResult {
    #[wasm_bindgen(getter)]
    pub fn board(&self) -> Board {
        self.board.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn flipped_indices(&self) -> Vec<u32> {
        self.flipped_indices.clone()
    }
}

impl Board {
    pub fn new() -> Board {
        let mut grid = vec![0; 64];
        // Initial setup: Black and White pieces
        grid[3 * 8 + 3] = 2;  // D4 (white)
        grid[4 * 8 + 4] = 2;  // E5 (white)
        grid[3 * 8 + 4] = 1;  // E4 (black)
        grid[4 * 8 + 3] = 1;  // D5 (black)
        
        Board {
            grid,
            turn: 1, // black
        }
    }

    pub fn from_grid(grid: Vec<u8>, turn: u8) -> Board {
        Board { grid, turn }
    }

    pub fn clone(&self) -> Board {
        Board {
            grid: self.grid.clone(),
            turn: self.turn,
        }
    }

    pub fn to_1d(&self) -> Vec<u8> {
        self.grid.clone()
    }

    pub fn other(&self, player: u8) -> u8 {
        if player == 1 { 2 } else { 1 }
    }

    pub fn is_on_board(&self, x: i32, y: i32) -> bool {
        x >= 0 && x < SIZE as i32 && y >= 0 && y < SIZE as i32
    }

    pub fn get_flips(&self, player: u8, x: i32, y: i32) -> Vec<(i32, i32)> {
        let mut flips = Vec::new();
        let opponent = self.other(player);

        for &(dx, dy) in DIRECTIONS {
            let mut nx = x + dx;
            let mut ny = y + dy;
            let mut temp = Vec::new();

            while self.is_on_board(nx, ny) {
                let piece = self.grid[ny as usize * SIZE + nx as usize];

                if piece == opponent {
                    temp.push((nx, ny));
                } else if piece == player {
                    flips.extend(temp);
                    break;
                } else {
                    break;
                }

                nx += dx;
                ny += dy;
            }
        }

        flips
    }

    pub fn legal_moves(&self, player: u8) -> Vec<(usize, usize)> {
        let mut moves = Vec::new();
        for idx in 0..64 {
            if self.grid[idx] == 0 {
                let r = idx / SIZE;
                let c = idx % SIZE;
                if !self.get_flips(player, c as i32, r as i32).is_empty() {
                    moves.push((r, c));
                }
            }
        }
        moves
    }

    pub fn apply_move(&self, player: u8, r: usize, c: usize) -> (Board, Vec<usize>) {
        let moves = self.legal_moves(player);
        if !moves.contains(&(r, c)) {
            panic!("Invalid move: ({}, {})", r, c);
        }

        let mut new_grid = self.grid.clone();
        new_grid[r * SIZE + c] = player;

        let flips = self.get_flips(player, c as i32, r as i32);
        let mut flipped_indices = Vec::new();
        for (fx, fy) in flips {
            let idx = fy as usize * SIZE + fx as usize;
            new_grid[idx] = player;
            flipped_indices.push(idx);
        }

        (
            Board {
                grid: new_grid,
                turn: self.other(player),
            },
            flipped_indices
        )
    }

    pub fn count(&self, player: u8) -> usize {
        self.grid.iter().filter(|&&p| p == player).count()
    }

    pub fn is_terminal(&self) -> bool {
        self.legal_moves(1).is_empty() && self.legal_moves(2).is_empty()
    }

    pub fn get_winner(&self) -> u8 {
        let b = self.count(1);
        let w = self.count(2);

        if self.legal_moves(1).is_empty() && self.legal_moves(2).is_empty() {
            if b > w { 1 } else if w > b { 2 } else { 0 } // 0 = 'D' (Draw)
        } else if b == 0 {
            2
        } else if w == 0 {
            1
        } else {
            3 // 'N' (No winner yet)
        }
    }

    pub fn coord_label(row: usize, col: usize) -> String {
        format!("{}{}", (('A' as u8 + col as u8) as char), row + 1)
    }

    pub fn piece_name(piece: u8) -> &'static str {
        match piece {
            1 => "black",
            2 => "white",
            _ => "empty",
        }
    }

    pub fn get_button_labels(&self) -> Vec<String> {
        let mut labels = Vec::new();
        for r in 0..SIZE {
            for c in 0..SIZE {
                let coord = Board::coord_label(r, c);
                let piece = Board::piece_name(self.grid[r * SIZE + c]);
                labels.push(format!("{} {}", coord, piece));
            }
        }
        labels
    }

    pub fn get_advantage_info(&self) -> (String, String) {
        let b_count = self.count(1);
        let w_count = self.count(2);
        let diff = (b_count as i32 - w_count as i32).abs() as usize;

        let (summary, css_class) = if b_count > w_count {
            (
                format!("Black advantage: +{} ({} to {})", diff, b_count, w_count),
                "leader-black"
            )
        } else if w_count > b_count {
            (
                format!("White advantage: +{} ({} to {})", diff, w_count, b_count),
                "leader-white"
            )
        } else {
            (
                format!("No advantage: tied at {} each", b_count),
                "leader-tie"
            )
        };

        let html = format!(
            "<div id='advantage-panel' class='info-card {}' data-announce='{}'><strong>Advantage</strong><br>{}</div>",
            css_class, summary, summary
        );
        (html, summary)
    }

    pub fn get_legal_moves_info(&self, player: u8) -> (String, String) {
        let moves = self.legal_moves(player);
        let moves_text = if moves.is_empty() {
            "none".to_string()
        } else {
            moves.iter()
                .map(|(r, c)| Board::coord_label(*r, *c))
                .collect::<Vec<_>>()
                .join(", ")
        };

        let p_name = if player == 1 { "Black" } else { "White" };
        let summary = format!("{} legal moves: {}", p_name, moves_text);

        let html = format!(
            "<div id='legal-panel' class='info-card legal-card' data-announce='{}'><strong>Legal Moves ({})</strong><br>{}</div>",
            summary, p_name, moves_text
        );
        (html, summary)
    }

    pub fn get_screenreader_text(&self, status_text: &str) -> String {
        let mut lines = vec![format!("Announcement: {}", status_text), "Board state:".to_string()];
        for r in 0..SIZE {
            let row_cells: Vec<String> = (0..SIZE)
                .map(|c| {
                    let coord = Board::coord_label(r, c);
                    let piece = Board::piece_name(self.grid[r * SIZE + c]);
                    format!("{} {}", coord, piece)
                })
                .collect();
            lines.push(row_cells.join(", "));
        }
        lines.join("\n")
    }
}

#[wasm_bindgen]
impl Board {
    #[wasm_bindgen(constructor)]
    pub fn wasm_new() -> Board {
        Board::new()
    }

    #[wasm_bindgen]
    pub fn clone_js(&self) -> Board {
        self.clone()
    }

    #[wasm_bindgen]
    pub fn get_grid(&self) -> Vec<u8> {
        self.grid.clone()
    }

    #[wasm_bindgen]
    pub fn set_grid(&mut self, grid: Vec<u8>) {
        if grid.len() == 64 {
            self.grid = grid;
        }
    }

    #[wasm_bindgen]
    pub fn set_turn(&mut self, turn: u8) {
        self.turn = turn;
    }

    #[wasm_bindgen]
    pub fn get_turn(&self) -> u8 {
        self.turn
    }

    #[wasm_bindgen]
    pub fn get_legal_moves_js(&self, player: u8) -> Vec<u32> {
        self.legal_moves(player)
            .iter()
            .map(|(r, c)| (r * SIZE + c) as u32)
            .collect()
    }

    #[wasm_bindgen]
    pub fn apply_move_js(&self, player: u8, r: u32, c: u32) -> MoveResult {
        let (new_board, flips) = self.apply_move(player, r as usize, c as usize);
        MoveResult {
            board: new_board,
            flipped_indices: flips.iter().map(|&i| i as u32).collect(),
        }
    }

    #[wasm_bindgen]
    pub fn get_count(&self, player: u8) -> usize {
        self.count(player)
    }

    #[wasm_bindgen]
    pub fn check_is_terminal(&self) -> bool {
        self.is_terminal()
    }

    #[wasm_bindgen]
    pub fn get_game_winner(&self) -> u8 {
        self.get_winner()
    }

    #[wasm_bindgen]
    pub fn other_js(&self, player: u8) -> u8 {
        self.other(player)
    }
}
