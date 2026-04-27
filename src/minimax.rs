use wasm_bindgen::prelude::*;
use crate::ai_utils::AIUtils;

#[wasm_bindgen]
pub struct MinimaxPlayer {
    pub depth: usize,
}

#[wasm_bindgen]
impl MinimaxPlayer {
    #[wasm_bindgen(constructor)]
    pub fn new(depth: usize) -> MinimaxPlayer {
        MinimaxPlayer {
            depth: std::cmp::min(depth, 10),
        }
    }

    #[wasm_bindgen]
    pub fn choose_move(&self, board: &[u8], player: u8) -> i32 {
        let (_, best_move) = self.maxv(board, player, self.depth);

        if let Some(m) = best_move {
            m as i32
        } else {
            -1
        }
    }

    fn maxv(&self, state: &[u8], player: u8, depth: usize) -> (i32, Option<usize>) {
        if depth == 0 {
            return (AIUtils::heuristic(state, player), None);
        }

        let moves = AIUtils::actions(state, player);
        if moves.is_empty() {
            if AIUtils::actions(state, AIUtils::other(player)).is_empty() {
                return (AIUtils::heuristic(state, player), None);
            }
            let (val, _) = self.minv(state, player, depth - 1);
            return (val, None);
        }

        let mut best_val = i32::MIN;
        let mut best_move = None;

        for m in moves {
            let result = AIUtils::result(state, player, m);
            let (val, _) = self.minv(&result, player, depth - 1);
            if val > best_val {
                best_val = val;
                best_move = Some(m);
            }
        }

        (best_val, best_move)
    }

    fn minv(&self, state: &[u8], player: u8, depth: usize) -> (i32, Option<usize>) {
        let opponent = AIUtils::other(player);

        if depth == 0 {
            return (AIUtils::heuristic(state, player), None);
        }

        let moves = AIUtils::actions(state, opponent);
        if moves.is_empty() {
            if AIUtils::actions(state, player).is_empty() {
                return (AIUtils::heuristic(state, player), None);
            }
            let (val, _) = self.maxv(state, player, depth - 1);
            return (val, None);
        }

        let mut best_val = i32::MAX;
        let mut best_move = None;

        for m in moves {
            let result = AIUtils::result(state, opponent, m);
            let (val, _) = self.maxv(&result, player, depth - 1);
            if val < best_val {
                best_val = val;
                best_move = Some(m);
            }
        }

        (best_val, best_move)
    }
}
