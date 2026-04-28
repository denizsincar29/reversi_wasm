# Task
## bit boards and reversi library
Make this reversi wasm code as a library that can be used not only in wasm, and wasm port / wasm bindgened structs, IDK can we merge e.g. the struct board into something that can be used in both wasm and non-wasm code? Or do we need to have separate structs for wasm and non-wasm code?
Use bitboards for alpha beta pruning and move generation.
make a very easy to use struct for the game and board, and full game state must be stored in the struct, and applying a move must mutate the game struct, undo moves, pass validation, and AI hint without applying the move. The game must also be able to write evaluation for the human move the human did, to than speak the phrase in js how good the move was.
Make the rust board struct indexable by x/y coordinates, and a method to get by "A1" or "b3" notation case insencetive.
Actually, Move can also be a struct, and square can be a struct, and they will have methods for getting coordinates or letter+digit notation. Board is not a struct but 2 u64 bitboards in Game struct.
Make set_fen and fen methods for the game struct, that returns a special fen like string that contains the full game state.
The fen looks like this:
```
8/8/8/3Dd3/3dD3/8/8/8 d
```
Capital D is white, lowercase d is black, and the last character is the player to move, same case.
Make PGN like language for move history, and a method to get the move history in that format. The move history should be stored in the game struct as well, and it should be possible to undo moves and get the move history up to the current position.
After doing the rust library that's crosplatform, make a wasm wrapper for it.
The goal of all this is to minimize the js code that works with reversi logic and focus on the ui, sounds, announcements and other interactions, and have the rust code handle all the game logic, move generation, AI, and so on. The wasm wrapper should be as thin as possible, just exposing the necessary functions and structs to the js code.
Make tests for the rust library that validate the moves, AI evaluation, move generation, and so on. The tests should be comprehensive and cover all the edge cases, like passing, undoing moves, and so on. It must check the game legality, and that the game state is correctly updated after each move, and that the AI evaluation is correct for a given position.

## Move evaluation announcements
For now, for some reason, I guess both AI move's quality and human moves quality is announced by the screenreader, but since AI's move is always awesome, it's nonsence to announce "Excellent!" or "wow good move!" for AI's move.

## Pass logic
For now, I've done that if a player has no legal moves, any cell click will pass the turn. Test if it works correctly.
