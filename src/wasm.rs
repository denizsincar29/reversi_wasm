use wasm_bindgen::prelude::*;
use crate::reversi::{Game, Player, Square, alpha_beta, evaluate};

#[wasm_bindgen]
#[derive(Clone)]
pub struct Board {
    game: Game,
}

#[wasm_bindgen]
pub struct AIMove {
    pub cell_index: i32,
    pub score: i32,
}

#[wasm_bindgen]
impl Board {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Board { game: Game::new() }
    }

    pub fn clone_js(&self) -> Board {
        self.clone()
    }

    pub fn get_turn(&self) -> u8 {
        match self.game.turn {
            Player::Black => 1,
            Player::White => 2,
        }
    }

    pub fn apply_move_js(&mut self, r: u32, c: u32) -> Result<Vec<u32>, String> {
        let sq = Square::from_coords(c as i32, r as i32).ok_or("Invalid coordinates")?;
        let flips_mask = self.game.apply_move(sq).map_err(|e| e.to_string())?;
        let mut flipped_indices = Vec::new();
        for i in 0..64 {
            if (flips_mask & (1 << i)) != 0 {
                flipped_indices.push(i as u32);
            }
        }
        Ok(flipped_indices)
    }

    pub fn pass(&mut self) -> Result<(), String> {
        self.game.pass()
    }

    pub fn undo(&mut self) -> bool {
        self.game.undo()
    }

    pub fn get_grid(&self) -> Vec<u8> {
        let mut grid = vec![0; 64];
        for i in 0..64 {
            let bit = 1 << i;
            if (self.game.black_mask & bit) != 0 {
                grid[i] = 1;
            } else if (self.game.white_mask & bit) != 0 {
                grid[i] = 2;
            }
        }
        grid
    }

    pub fn get_legal_moves_js(&self) -> Vec<u32> {
        let legal = self.game.get_legal_moves();
        (0..64).filter(|i| (legal & (1 << i)) != 0).map(|i| i as u32).collect()
    }

    pub fn check_is_terminal(&self) -> bool {
        let legal_p1 = self.game.get_legal_moves();
        let mut next = self.game.clone();
        next.turn = next.turn.opponent();
        let legal_p2 = next.get_legal_moves();
        legal_p1 == 0 && legal_p2 == 0
    }

    pub fn get_count(&self, player: u8) -> usize {
        let mask = if player == 1 { self.game.black_mask } else { self.game.white_mask };
        mask.count_ones() as usize
    }

    pub fn get_game_winner(&self) -> u8 {
        if !self.check_is_terminal() { return 3; }
        let b = self.get_count(1);
        let w = self.get_count(2);
        if b > w { 1 } else if w > b { 2 } else { 0 }
    }

    pub fn other_js(&self, player: u8) -> u8 {
        if player == 1 { 2 } else { 1 }
    }

    pub fn get_score_js(&self, player: u8) -> i32 {
        let p = if player == 1 { Player::Black } else { Player::White };
        let (p_mask, o_mask) = (self.game.get_mask(p), self.game.get_mask(p.opponent()));
        evaluate(p_mask, o_mask)
    }

    pub fn to_fen(&self) -> String {
        self.game.to_fen()
    }

    pub fn from_fen(&mut self, fen: &str) -> Result<(), String> {
        self.game = Game::from_fen(fen)?;
        Ok(())
    }

    pub fn to_pgn(&self) -> String {
        self.game.to_pgn()
    }

    pub fn get_last_eval(&self) -> i32 {
        self.game.last_eval.unwrap_or(0)
    }

    pub fn get_history_len(&self) -> usize {
        self.game.history.len()
    }

    pub fn choose_ai_move(&self, depth: usize) -> AIMove {
        let (score, best_move) = alpha_beta(&self.game, depth, i32::MIN, i32::MAX);
        AIMove {
            cell_index: best_move.map(|s| s.0 as i32).unwrap_or(-1),
            score,
        }
    }
}

// Keep these for backward compatibility with existing JS calls if needed,
// but recommended to use Board::choose_ai_move
#[wasm_bindgen]
pub struct AlphaBetaPlayer {
    pub depth: usize,
}

#[wasm_bindgen]
impl AlphaBetaPlayer {
    #[wasm_bindgen(constructor)]
    pub fn new(depth: usize) -> AlphaBetaPlayer {
        AlphaBetaPlayer { depth }
    }

    pub fn choose_move(&self, board: &Board) -> AIMove {
        board.choose_ai_move(self.depth)
    }
}

#[wasm_bindgen]
pub struct MinimaxPlayer {
    pub depth: usize,
}

#[wasm_bindgen]
impl MinimaxPlayer {
    #[wasm_bindgen(constructor)]
    pub fn new(depth: usize) -> MinimaxPlayer {
        MinimaxPlayer { depth }
    }

    pub fn choose_move(&self, board: &Board) -> AIMove {
        board.choose_ai_move(self.depth)
    }
}
