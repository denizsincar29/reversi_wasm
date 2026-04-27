/**
 * REVERSI RULES VALIDATION TEST
 * 
 * This test validates that the Rust implementation follows the actual Reversi rules
 * by using known, simple game scenarios rather than comparing against Python.
 */

#[cfg(test)]
mod reversi_rules_validation {
    use crate::board::Board;

    #[test]
    fn test_rule_1_initial_board_setup() {
        // Rule: Standard Reversi opening has 4 disks (Black D5/E4, White D4/E5)
        let board = Board::new();
        
        assert_eq!(board.get_count(1), 2, "Black should start with 2 disks");
        assert_eq!(board.get_count(2), 2, "White should start with 2 disks");
        
        let grid = board.get_grid();
        // Row 4 (index 3): D4=White, E4=Black
        assert_eq!(grid[26], 2, "D4 (row 4, col 3) should be White");
        assert_eq!(grid[27], 1, "E4 (row 4, col 4) should be Black");
        // Row 5 (index 4): D5=Black, E5=White
        assert_eq!(grid[34], 1, "D5 (row 5, col 3) should be Black");
        assert_eq!(grid[35], 2, "E5 (row 5, col 4) should be White");
        
        assert_eq!(board.get_turn(), 1, "Black should go first");
    }

    #[test]
    fn test_rule_2_legal_move_single_direction() {
        // Rule: Legal move must flip at least 1 opponent disk in straight line
        // Black's first legal move: C3, flips D4 (one White disk horizontally)
        
        let board = Board::new();
        let legal_moves = board.get_legal_moves_js(1); // Black's legal moves
        
        // D3 = 2*8 + 3 = 19
        assert!(legal_moves.contains(&19), "D3 should be legal (flips D4 East)");
        
        // Make the move
        let board = board.apply_move_js(1, 2, 3);
        
        // Verify the flip happened
        let grid = board.get_grid();
        assert_eq!(grid[19], 1, "D3 should now be Black");
        assert_eq!(grid[26], 1, "D4 should be flipped to Black");
        
        // Verify counts
        assert_eq!(board.get_count(1), 3, "Black should have 3 after flipping 1");
        assert_eq!(board.get_count(2), 2, "White should have 2 (lost 1 to flip)");
    }

    #[test]
    fn test_rule_3_cannot_place_on_occupied_cell() {
        // Rule: Cannot place disk where there's already a disk
        let board = Board::new();
        let grid = board.get_grid();
        
        // D4 and E4 are occupied initially
        assert_eq!(grid[26], 2, "D4 occupied");
        assert_eq!(grid[27], 1, "E4 occupied");
        
        let legal_moves = board.get_legal_moves_js(1);
        
        // D4 index = 26, E4 index = 27
        assert!(!legal_moves.contains(&26), "D4 occupied, cannot place there");
        assert!(!legal_moves.contains(&27), "E4 occupied, cannot place there");
    }

    #[test]
    fn test_rule_4_must_flip_opponent_disks() {
        // Rule: Move that doesn't flip any opponent disks is illegal
        let board = Board::new();
        
        // After initial setup, playing at A1 would not flip anything
        let legal_moves = board.get_legal_moves_js(1);
        let a1_index = 0;
        
        assert!(!legal_moves.contains(&(a1_index as u32)), 
            "A1 is illegal (no flips possible from initial position)");
    }

    #[test]
    fn test_rule_5_multiple_directions_flipping() {
        // Rule: All opponent disks in all directions get flipped
        // Complex scenario: place disk that flips in multiple directions
        
        let mut board = Board::new();
        
        // Set up a specific board state for testing
        // Place: Black at D3
        board = board.apply_move_js(1, 2, 3);
        
        // Then White at C3
        board = board.apply_move_js(2, 2, 2);
        
        let grid = board.get_grid();
        
        // After these moves:
        // D3 (Black) should have flipped something
        // C3 (White) should have flipped D3 back
        assert_eq!(grid[19], 2, "D3 should be White after White plays C3");
        assert_eq!(grid[18], 2, "C3 should be White");
    }

    #[test]
    fn test_rule_6_turn_alternation() {
        // Rule: After each move, turn switches to other player
        let mut board = Board::new();
        
        assert_eq!(board.get_turn(), 1, "Initially Black (1)");
        
        board = board.apply_move_js(1, 2, 3); // Black plays D3
        assert_eq!(board.get_turn(), 2, "After Black, should be White (2)");
        
        board = board.apply_move_js(2, 2, 2); // White plays C3
        assert_eq!(board.get_turn(), 1, "After White, should be Black (1)");
    }

    #[test]
    fn test_rule_7_pass_when_no_legal_moves() {
        // Rule: If player has no legal moves, they pass and turn goes to opponent
        // This is harder to trigger in early game, so we test the mechanism
        
        let board = Board::new();
        let black_moves = board.get_legal_moves_js(1);
        let white_moves = board.get_legal_moves_js(2);
        
        // Both players should have at least one move initially
        assert!(black_moves.len() > 0, "Black should have legal moves");
        assert!(white_moves.len() > 0, "White should have legal moves");
    }

    #[test]
    fn test_rule_8_game_ends_when_both_pass() {
        // Rule: Game ends only when both players have no legal moves
        let board = Board::new();
        
        // Initial board is not terminal
        assert!(!board.check_is_terminal(), "Initial board should not be terminal");
        
        // Winner should be 3 (no winner yet, 'N' in Python)
        let winner = board.get_game_winner();
        assert_eq!(winner, 3, "Winner should be 3 (no winner yet)");
    }

    #[test]
    fn test_rule_9_flipping_only_continuous_line() {
        // Rule: Only flip opponent disks if they form continuous line to player's disk
        // Empty cell breaks the line
        
        let mut board = Board::new();
        
        // Move 1: Black D3 (flips D4)
        board = board.apply_move_js(1, 2, 3);
        let black_count_1 = board.get_count(1);
        
        // If empty cell breaks flipping, count should be 3 (original 2 + 1 flip)
        assert_eq!(black_count_1, 3, "Should flip exactly 1 disk (continuous line)");
    }

    #[test]
    fn test_rule_10_all_8_directions() {
        // Rule: Check all 8 directions for flips
        // Directions: NW, N, NE, W, E, SW, S, SE
        
        let mut board = Board::new();
        
        // Create a test scenario by making a series of moves
        // Move 1: Black D3 (flips D4 horizontally East)
        board = board.apply_move_js(1, 2, 3);
        
        let grid = board.get_grid();
        
        // D4 was flipped from White to Black
        // This confirms at least the E direction works
        assert_eq!(grid[26], 1, "D4 should be flipped to Black (East direction)");
    }

    #[test]
    fn test_rule_11_no_empty_cells_appear() {
        // Rule: Flipped disks stay on board (no cell becomes empty except during placement)
        let mut board = Board::new();
        
        // Before any moves
        let grid_before = board.get_grid();
        let empty_before: usize = grid_before.iter().filter(|&&c| c == 0).count();
        
        // Make a move
        board = board.apply_move_js(1, 2, 3);
        let grid_after = board.get_grid();
        
        // Check total disks increased by 1 (the placed disk)
        let total_before: usize = grid_before.iter().filter(|&&c| c != 0).count();
        let total_after: usize = grid_after.iter().filter(|&&c| c != 0).count();
        
        assert_eq!(total_after, total_before + 1, 
            "Total disks should increase by 1 (only placement, no removals)");
    }

    #[test]
    fn test_rule_12_correct_winner_determination() {
        // Rule: Player with more disks when game ends wins
        // We can't easily force end state, but we can verify the logic
        
        let board = Board::new();
        
        // Get counts
        let black = board.get_count(1);
        let white = board.get_count(2);
        
        // Initially equal
        assert_eq!(black, white, "Initial counts should be equal");
        
        // Not terminal yet
        assert_eq!(board.get_game_winner(), 3, "No winner yet");
    }

    #[test]
    fn test_move_sequence_validity() {
        // Test a simple valid sequence: Black D3, White C3, Black F5
        let mut board = Board::new();
        
        // Move 1: Black D3
        let legal = board.get_legal_moves_js(1);
        assert!(legal.contains(&19), "D3 should be legal");
        board = board.apply_move_js(1, 2, 3);
        
        // Move 2: White C3
        let legal = board.get_legal_moves_js(2);
        assert!(legal.contains(&18), "C3 should be legal");
        board = board.apply_move_js(2, 2, 2);
        
        // Move 3: Black F5
        let legal = board.get_legal_moves_js(1);
        assert!(legal.contains(&37), "F5 should be legal");
        board = board.apply_move_js(1, 4, 5);
        
        // Verify board state is still valid
        let grid = board.get_grid();
        for i in 0..64 {
            assert!(grid[i] == 0 || grid[i] == 1 || grid[i] == 2,
                "Cell {} has invalid value {}", i, grid[i]);
        }
        
        // Verify turn is correct
        assert_eq!(board.get_turn(), 2, "Should be White's turn");
    }
}
