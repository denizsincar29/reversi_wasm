mod utils;
pub mod board;
pub mod ai_utils;
pub mod alpha_beta;
pub mod minimax;
pub mod rules_validation;

use wasm_bindgen::prelude::*;

// Set up panic hook for better error messages
pub fn set_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

#[wasm_bindgen(start)]
pub fn init() {
    set_panic_hook();
}

#[cfg(test)]
mod tests {
    use crate::board::Board;

    // === REVERSI RULES VALIDATION TESTS ===
    // These tests validate that the Rust implementation correctly follows
    // the rules of Reversi/Othello, independent of any other implementation.

    #[test]
    fn test_rules_initial_board_setup() {
        // Rule: Standard Reversi opening has 4 disks in center
        let board = Board::new();
        
        assert_eq!(board.get_count(1), 2, "Black should start with 2 disks");
        assert_eq!(board.get_count(2), 2, "White should start with 2 disks");
        assert_eq!(board.get_turn(), 1, "Black should go first");
        

    }

    #[test]
    fn test_rules_legal_move_flipping() {
        // Rule: Legal move must flip at least 1 opponent disk
        let board = Board::new();
        let legal_moves = board.get_legal_moves_js(1);
        
        // D3 = index 19 should be legal
        assert!(legal_moves.contains(&19), "D3 should be legal (flips D4)");
        
        // Make the move and verify flip
        let res = board.apply_move_js(1, 2, 3);
        let board = res.board();
        let grid = board.get_grid();
        
        assert_eq!(grid[19], 1, "D3 should be Black");
        assert_eq!(grid[27], 1, "D4 should be flipped to Black");
        assert_eq!(board.get_count(1), 4, "Black should have 4 disks (2 initial + 1 placed D3 + 1 flipped D4)");
    }

    #[test]
    fn test_rules_cannot_place_on_occupied() {
        // Rule: Cannot place where there's already a disk
        let board = Board::new();
        let legal_moves = board.get_legal_moves_js(1);
        
        // D4 and E4 are occupied
        assert!(!legal_moves.contains(&27), "D4 occupied, cannot place");
        assert!(!legal_moves.contains(&28), "E4 occupied, cannot place");
    }

    #[test]
    fn test_rules_turn_alternation() {
        // Rule: Turn switches after each move
        let board = Board::new();
        
        assert_eq!(board.get_turn(), 1);
        let res = board.apply_move_js(1, 2, 3);
        let board = res.board();
        assert_eq!(board.get_turn(), 2);
        let res = board.apply_move_js(2, 2, 2);
        let board = res.board();
        assert_eq!(board.get_turn(), 1);
    }

    #[test]
    fn test_rules_disk_count_increases() {
        // Rule: Total disks increase by 1 per move (placement + flips)
        let board = Board::new();
        let total_before = board.get_count(1) + board.get_count(2);
        
        let res = board.apply_move_js(1, 2, 3);
        let board = res.board();
        let total_after = board.get_count(1) + board.get_count(2);
        
        assert_eq!(total_after, total_before + 1, "Should have exactly 1 more disk");
    }

    #[test]
    fn test_rules_no_invalid_cells() {
        // Rule: All cells must be 0, 1, or 2
        let board = Board::new();
        let grid = board.get_grid();
        
        for (i, &cell) in grid.iter().enumerate() {
            assert!(cell == 0 || cell == 1 || cell == 2,
                "Cell {} has invalid value {}", i, cell);
        }
    }
}
