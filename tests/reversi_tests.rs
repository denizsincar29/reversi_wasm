use reversi_wasm::reversi::{Game, Player, Square};

#[test]
fn test_initial_board() {
    let game = Game::new();
    assert_eq!(game.black_mask.count_ones(), 2);
    assert_eq!(game.white_mask.count_ones(), 2);
    assert_eq!(game.turn, Player::Black);
}

#[test]
fn test_legal_moves() {
    let game = Game::new();
    let legal = game.get_legal_moves();
    // In starting position, black has 4 moves: D3, C4, F5, E6
    // D3 = 19, C4 = 26, F5 = 37, E6 = 44
    assert_eq!(legal.count_ones(), 4);
    assert!((legal & (1 << 19)) != 0);
    assert!((legal & (1 << 26)) != 0);
    assert!((legal & (1 << 37)) != 0);
    assert!((legal & (1 << 44)) != 0);
}

#[test]
fn test_apply_move() {
    let mut game = Game::new();
    // D3 = index 19. Initial D4 = White (27). E4 = Black (28). D5 = Black (35). E5 = White (36).
    // Playing D3 (Black) should flip D4 (White) to Black.
    game.apply_move(Square(19)).unwrap(); // D3
    assert_eq!(game.turn, Player::White);
    assert_eq!(game.black_mask.count_ones(), 4);
    assert_eq!(game.white_mask.count_ones(), 1);

    // Check if D4 (index 27) is now Black
    assert!((game.black_mask & (1 << 27)) != 0, "D4 should be black after playing D3");
    assert!((game.white_mask & (1 << 27)) == 0, "D4 should NOT be white after playing D3");
}

#[test]
fn test_fen() {
    let game = Game::new();
    let fen = game.to_fen();
    assert_eq!(fen, "8/8/8/3Dd3/3dD3/8/8/8 d");

    let game2 = Game::from_fen(&fen).unwrap();
    assert_eq!(game2.black_mask, game.black_mask);
    assert_eq!(game2.white_mask, game.white_mask);
    assert_eq!(game2.turn, game.turn);
}

#[test]
fn test_undo() {
    let mut game = Game::new();
    let initial_black = game.black_mask;
    game.apply_move(Square(19)).unwrap();
    game.undo();
    assert_eq!(game.black_mask, initial_black);
    assert_eq!(game.turn, Player::Black);
}

#[test]
fn test_notation() {
    let sq = Square::from_notation("D3").unwrap();
    assert_eq!(sq.0, 19);
    assert_eq!(sq.to_notation(), "D3");

    let sq2 = Square::from_notation("a1").unwrap();
    assert_eq!(sq2.0, 0);
}

#[test]
fn test_get_by_notation() {
    let game = Game::new();
    // D4 = 27 = white (2)
    assert_eq!(game.get_by_notation("D4"), Some(2));
    // E4 = 28 = black (1)
    assert_eq!(game.get_by_notation("E4"), Some(1));
    // A1 = 0 = empty (0)
    assert_eq!(game.get_by_notation("A1"), Some(0));
}

#[test]
fn test_index_xy() {
    let game = Game::new();
    assert_eq!(game[(3, 3)], 2); // D4
    assert_eq!(game[(4, 3)], 1); // E4
}

#[test]
fn test_pgn() {
    let mut game = Game::new();
    game.apply_move(Square(19)).unwrap(); // 1. D3
    let pgn = game.to_pgn();
    assert_eq!(pgn, "1. D3");
}

#[test]
fn test_complex_pgn() {
    let mut game = Game::new();
    game.apply_move(Square::from_notation("D3").unwrap()).unwrap();
    game.apply_move(Square::from_notation("C3").unwrap()).unwrap();
    let pgn = game.to_pgn();
    assert_eq!(pgn, "1. D3 C3");
}

#[test]
fn test_pass_scenario() {
    // Construct a FEN where one player must pass
    // This is hard to do manually, but we can test the pass() method itself
    let mut game = Game::from_fen("dddddddd/dddddddd/dddddddd/dddddddd/dddddddd/dddddddd/dddddddd/ddddddd1 d").unwrap();
    assert_eq!(game.get_legal_moves(), 0);
    assert!(game.pass().is_ok());
    assert_eq!(game.turn, Player::White);
}
