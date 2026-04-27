use crate::board::{SIZE, DIRECTIONS, CORNERS};

pub struct AIUtils;

impl AIUtils {
    pub fn other(player: u8) -> u8 {
        if player == 1 { 2 } else { 1 }
    }

    pub fn get_flips(board: &[u8], player: u8, x: i32, y: i32) -> Vec<usize> {
        let mut flips = Vec::new();
        let opponent = AIUtils::other(player);

        for &(dx, dy) in DIRECTIONS {
            let mut nx = x + dx;
            let mut ny = y + dy;
            let mut temp = Vec::new();

            while nx >= 0 && nx < SIZE as i32 && ny >= 0 && ny < SIZE as i32 {
                let idx = ny as usize * SIZE + nx as usize;
                let piece = board[idx];

                if piece == opponent {
                    temp.push(idx);
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

    pub fn actions(board: &[u8], player: u8) -> Vec<usize> {
        let mut moves = Vec::new();
        for i in 0..64 {
            if board[i] == 0 {
                let r = i / SIZE;
                let c = i % SIZE;
                if !AIUtils::get_flips(board, player, c as i32, r as i32).is_empty() {
                    moves.push(i);
                }
            }
        }
        moves
    }

    pub fn result(board: &[u8], player: u8, action: usize) -> Vec<u8> {
        let mut new = board.to_vec();
        new[action] = player;

        let r = action / SIZE;
        let c = action % SIZE;
        for idx in AIUtils::get_flips(board, player, c as i32, r as i32) {
            new[idx] = player;
        }

        new
    }

    pub fn heuristic(board: &[u8], player: u8) -> i32 {
        let opponent = AIUtils::other(player);

        let disc = board.iter().filter(|&&x| x == player).count() as i32
            - board.iter().filter(|&&x| x == opponent).count() as i32;

        let mobility = AIUtils::actions(board, player).len() as i32
            - AIUtils::actions(board, opponent).len() as i32;

        let mut corner_score = 0;
        for &i in CORNERS {
            if board[i] == player {
                corner_score += 25;
            } else if board[i] == opponent {
                corner_score -= 25;
            }
        }

        disc + 2 * mobility + corner_score
    }
}
