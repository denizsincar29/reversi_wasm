use std::ops::Index;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Player {
    Black,
    White,
}

impl Player {
    pub fn opponent(self) -> Self {
        match self {
            Player::Black => Player::White,
            Player::White => Player::Black,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Square(pub u8); // 0-63

impl Square {
    pub fn from_coords(x: i32, y: i32) -> Option<Self> {
        if (0..8).contains(&x) && (0..8).contains(&y) {
            Some(Square((y * 8 + x) as u8))
        } else {
            None
        }
    }

    pub fn from_notation(s: &str) -> Option<Self> {
        if s.len() != 2 {
            return None;
        }
        let s = s.to_uppercase();
        let col = s.chars().nth(0)? as i32 - 'A' as i32;
        let row = s.chars().nth(1)? as i32 - '1' as i32;
        Self::from_coords(col, row)
    }

    pub fn to_notation(self) -> String {
        let col = (self.0 % 8) as u8 + b'A';
        let row = (self.0 / 8) as u8 + b'1';
        format!("{}{}", col as char, row as char)
    }

    pub fn x(self) -> i32 {
        (self.0 % 8) as i32
    }

    pub fn y(self) -> i32 {
        (self.0 / 8) as i32
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Move {
    pub square: Option<Square>, // None for Pass
    pub player: Player,
}

impl Move {
    pub fn to_notation(self) -> String {
        match self.square {
            Some(s) => s.to_notation(),
            None => "pass".to_string(),
        }
    }
}

#[derive(Clone, Debug)]
pub struct Game {
    pub black_mask: u64,
    pub white_mask: u64,
    pub turn: Player,
    pub history: Vec<(u64, u64, Player, Option<i32>, Option<Square>)>,
    pub last_eval: Option<i32>,
    // To support Index trait returning &u8
    grid_cache: [u8; 64],
}

impl Game {
    pub fn new() -> Self {
        let mut g = Game {
            black_mask: 0,
            white_mask: 0,
            turn: Player::Black,
            history: Vec::new(),
            last_eval: None,
            grid_cache: [0; 64],
        };
        g.white_mask = (1 << 27) | (1 << 36);
        g.black_mask = (1 << 28) | (1 << 35);
        g.update_cache();
        g
    }

    fn update_cache(&mut self) {
        for i in 0..64 {
            let bit = 1 << i;
            if (self.black_mask & bit) != 0 {
                self.grid_cache[i] = 1;
            } else if (self.white_mask & bit) != 0 {
                self.grid_cache[i] = 2;
            } else {
                self.grid_cache[i] = 0;
            }
        }
    }

    pub fn get_mask(&self, player: Player) -> u64 {
        match player {
            Player::Black => self.black_mask,
            Player::White => self.white_mask,
        }
    }

    pub fn set_mask(&mut self, player: Player, mask: u64) {
        match player {
            Player::Black => self.black_mask = mask,
            Player::White => self.white_mask = mask,
        }
        self.update_cache();
    }

    pub fn get_occupied(&self) -> u64 {
        self.black_mask | self.white_mask
    }

    pub fn get_legal_moves(&self) -> u64 {
        get_legal_moves(self.get_mask(self.turn), self.get_mask(self.turn.opponent()))
    }

    pub fn apply_move(&mut self, sq: Square) -> Result<u64, String> {
        let player_mask = self.get_mask(self.turn);
        let opponent_mask = self.get_mask(self.turn.opponent());
        let move_bit = 1 << sq.0;

        if (self.get_occupied() & move_bit) != 0 {
            return Err("Square already occupied".to_string());
        }

        let flips = get_flips(move_bit, player_mask, opponent_mask);
        if flips == 0 {
            return Err("Invalid move: no flips".to_string());
        }

        self.history.push((self.black_mask, self.white_mask, self.turn, self.last_eval, Some(sq)));

        let new_player_mask = player_mask | move_bit | flips;
        let new_opponent_mask = opponent_mask & !flips;

        self.set_mask(self.turn, new_player_mask);
        self.set_mask(self.turn.opponent(), new_opponent_mask);

        self.last_eval = Some(evaluate(new_player_mask, new_opponent_mask));

        self.turn = self.turn.opponent();
        self.update_cache();
        Ok(flips)
    }

    pub fn pass(&mut self) -> Result<(), String> {
        if self.get_legal_moves() != 0 {
            return Err("Cannot pass when legal moves exist".to_string());
        }

        self.history.push((self.black_mask, self.white_mask, self.turn, self.last_eval, None));
        self.turn = self.turn.opponent();
        self.last_eval = None;
        Ok(())
    }

    pub fn undo(&mut self) -> bool {
        if let Some((b, w, t, e, _)) = self.history.pop() {
            self.black_mask = b;
            self.white_mask = w;
            self.turn = t;
            self.last_eval = e;
            self.update_cache();
            true
        } else {
            false
        }
    }

    pub fn to_fen(&self) -> String {
        let mut fen = String::new();
        for y in 0..8 {
            let mut empty_count = 0;
            for x in 0..8 {
                let bit = 1 << (y * 8 + x);
                if (self.black_mask & bit) != 0 {
                    if empty_count > 0 {
                        fen.push_str(&empty_count.to_string());
                        empty_count = 0;
                    }
                    fen.push('d');
                } else if (self.white_mask & bit) != 0 {
                    if empty_count > 0 {
                        fen.push_str(&empty_count.to_string());
                        empty_count = 0;
                    }
                    fen.push('D');
                } else {
                    empty_count += 1;
                }
            }
            if empty_count > 0 {
                fen.push_str(&empty_count.to_string());
            }
            if y < 7 {
                fen.push('/');
            }
        }
        fen.push(' ');
        fen.push(match self.turn {
            Player::Black => 'd',
            Player::White => 'D',
        });
        fen
    }

    pub fn from_fen(fen: &str) -> Result<Self, String> {
        let parts: Vec<&str> = fen.split_whitespace().collect();
        if parts.is_empty() {
            return Err("Invalid FEN".to_string());
        }

        let mut black_mask = 0;
        let mut white_mask = 0;
        let mut y = 0;
        let mut x = 0;

        for c in parts[0].chars() {
            match c {
                'd' => {
                    if x >= 8 || y >= 8 { return Err("Invalid FEN: too many cells".to_string()); }
                    black_mask |= 1 << (y * 8 + x);
                    x += 1;
                }
                'D' => {
                    if x >= 8 || y >= 8 { return Err("Invalid FEN: too many cells".to_string()); }
                    white_mask |= 1 << (y * 8 + x);
                    x += 1;
                }
                '1'..='8' => {
                    let n = c.to_digit(10).unwrap() as i32;
                    x += n;
                }
                '/' => {
                    y += 1;
                    x = 0;
                }
                _ => {}
            }
        }

        let turn = if parts.len() > 1 {
            match parts[1] {
                "d" => Player::Black,
                "D" => Player::White,
                _ => Player::Black,
            }
        } else {
            Player::Black
        };

        let mut game = Game {
            black_mask,
            white_mask,
            turn,
            history: Vec::new(),
            last_eval: None,
            grid_cache: [0; 64],
        };
        game.update_cache();
        Ok(game)
    }

    pub fn to_pgn(&self) -> String {
        let mut pgn = String::new();
        let mut move_num = 1;
        for h in self.history.iter() {
            let turn = h.2;
            let sq = h.4;
            let notation = match sq {
                Some(s) => s.to_notation(),
                None => "pass".to_string(),
            };

            if turn == Player::Black {
                pgn.push_str(&format!("{}. {} ", move_num, notation));
            } else {
                pgn.push_str(&format!("{} ", notation));
                move_num += 1;
            }
        }
        pgn.trim().to_string()
    }

    pub fn get_by_notation(&self, notation: &str) -> Option<u8> {
        let sq = Square::from_notation(notation)?;
        Some(self.grid_cache[sq.0 as usize])
    }
}

impl Index<(i32, i32)> for Game {
    type Output = u8;
    fn index(&self, index: (i32, i32)) -> &Self::Output {
        let (x, y) = index;
        let idx = (y * 8 + x) as usize;
        &self.grid_cache[idx]
    }
}

fn get_flips(move_bit: u64, player: u64, opponent: u64) -> u64 {
    let mut flips = 0;
    flips |= check_dir(move_bit, player, opponent, |b| (b << 1) & 0xFEFEFEFEFEFEFEFE);
    flips |= check_dir(move_bit, player, opponent, |b| (b >> 1) & 0x7F7F7F7F7F7F7F7F);
    flips |= check_dir(move_bit, player, opponent, |b| b << 8);
    flips |= check_dir(move_bit, player, opponent, |b| b >> 8);
    flips |= check_dir(move_bit, player, opponent, |b| (b << 9) & 0xFEFEFEFEFEFEFEFE);
    flips |= check_dir(move_bit, player, opponent, |b| (b >> 9) & 0x7F7F7F7F7F7F7F7F);
    flips |= check_dir(move_bit, player, opponent, |b| (b << 7) & 0x7F7F7F7F7F7F7F7F);
    flips |= check_dir(move_bit, player, opponent, |b| (b >> 7) & 0xFEFEFEFEFEFEFEFE);
    flips
}

fn check_dir<F>(move_bit: u64, player: u64, opponent: u64, shift: F) -> u64 where F: Fn(u64) -> u64 {
    let mut potential_flips = 0;
    let mut mask = shift(move_bit);
    while mask != 0 && (mask & opponent) != 0 {
        potential_flips |= mask;
        mask = shift(mask);
    }
    if mask != 0 && (mask & player) != 0 {
        potential_flips
    } else {
        0
    }
}

pub fn get_legal_moves(player: u64, opponent: u64) -> u64 {
    let mut legal = 0;
    let empty = !(player | opponent);
    for i in 0..64 {
        let bit = 1 << i;
        if (bit & empty) != 0 {
            if get_flips(bit, player, opponent) != 0 {
                legal |= bit;
            }
        }
    }
    legal
}

pub fn evaluate(player: u64, opponent: u64) -> i32 {
    let p_count = player.count_ones() as i32;
    let o_count = opponent.count_ones() as i32;

    let p_legal = get_legal_moves(player, opponent).count_ones() as i32;
    let o_legal = get_legal_moves(opponent, player).count_ones() as i32;
    let mobility = p_legal - o_legal;

    let corners = 0x8100000000000081u64;
    let p_corners = (player & corners).count_ones() as i32;
    let o_corners = (opponent & corners).count_ones() as i32;

    (p_count - o_count) + 10 * mobility + 50 * (p_corners - o_corners)
}

pub fn alpha_beta(game: &Game, depth: usize, alpha: i32, beta: i32) -> (i32, Option<Square>) {
    alpha_beta_recursive(game.black_mask, game.white_mask, game.turn, depth, alpha, beta)
}

fn alpha_beta_recursive(black: u64, white: u64, turn: Player, depth: usize, mut alpha: i32, beta: i32) -> (i32, Option<Square>) {
    let (player_mask, opponent_mask) = if turn == Player::Black { (black, white) } else { (white, black) };
    let legal = get_legal_moves(player_mask, opponent_mask);

    if depth == 0 {
        return (evaluate(player_mask, opponent_mask), None);
    }

    if legal == 0 {
        let opponent_legal = get_legal_moves(opponent_mask, player_mask);
        if opponent_legal == 0 {
            return (evaluate(player_mask, opponent_mask), None);
        }
        let (val, _) = alpha_beta_recursive(black, white, turn.opponent(), depth - 1, -beta, -alpha);
        return (-val, None);
    }

    let mut best_val = i32::MIN;
    let mut best_move = None;

    let mut move_indices: Vec<u8> = (0..64).filter(|&i| (legal & (1 << i)) != 0).collect();
    move_indices.sort_by_key(|&i| {
        let bit = 1 << i;
        if (bit & 0x8100000000000081u64) != 0 { 0 } else { 1 }
    });

    for i in move_indices {
        let move_bit = 1 << i;
        let flips = get_flips(move_bit, player_mask, opponent_mask);
        let (new_black, new_white) = if turn == Player::Black {
            (black | move_bit | flips, white & !flips)
        } else {
            (black & !flips, white | move_bit | flips)
        };

        let (val, _) = alpha_beta_recursive(new_black, new_white, turn.opponent(), depth - 1, -beta, -alpha);
        let score = -val;
        if score > best_val {
            best_val = score;
            best_move = Some(Square(i));
        }
        alpha = alpha.max(best_val);
        if alpha >= beta {
            break;
        }
    }
    (best_val, best_move)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_d3_flips_d4() {
        let mut game = Game::new();
        let d3 = Square::from_notation("D3").unwrap();
        game.apply_move(d3).expect("D3 should be legal");

        let d4 = Square::from_notation("D4").unwrap();
        assert_eq!(game.grid_cache[d4.0 as usize], 1, "D4 should be black after D3 move");
    }

    #[test]
    fn test_d3_bit_index() {
        let d3 = Square::from_notation("D3").unwrap();
        assert_eq!(d3.0, 19);
        let d4 = Square::from_notation("D4").unwrap();
        assert_eq!(d4.0, 27);
    }
}
