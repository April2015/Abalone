 type Board = string[][];
interface BoardDelta {
  row: number;
  col: number;
}

interface RemovedMarbles {
  black: number;
  white: number;
}

interface IState {
  board?: Board;
  removedMarbles?: RemovedMarbles;
}

interface Action {
  isInline: boolean;
  direction: BoardDelta;
  selfMarbles: BoardDelta[];
  opponentMarbles: BoardDelta[];
}

module gameLogic {
  export const ROWS = 9;
  export const COLS = 17;

  /** Returns the initial Abalone board called Belgian daisy, which is a 9x17 matrix
  containing 14 'B's(belonging to the black party), 14 'W's(belonging to the white party),
  'O' (open space that 'B' and 'W' can moved to), ''(space that does not exist in a physical board). */
  export function getInitialBoard(): Board {
    return [['', '', '', '', 'W', '', 'W', '', 'O', '', 'B', '', 'B', '', '', '', '' ],
            ['', '', '', 'W', '', 'W', '', 'W', '', 'B', '', 'B', '', 'B', '', '', '' ],
            ['', '', 'O', '', 'W', '', 'W', '', 'O', '', 'B', '', 'B', '', 'O', '', '' ],
            ['', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '' ],
            ['O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O' ],
            ['', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '' ],
            ['', '', 'O', '', 'B', '', 'B', '', 'O', '', 'W', '', 'W', '', 'O', '', '' ],
            ['', '', '', 'B', '', 'B', '', 'B', '', 'W', '', 'W', '', 'W', '', '', '' ],
            ['', '', '', '', 'B', '', 'B', '', 'O', '', 'W', '', 'W', '', '', '', '' ]];
  }

  function getWinner(state: IState): string {
    if (state.removedMarbles.black === 6)
      return 'W';
    if (state.removedMarbles.white === 6)
      return 'B';
    return '';
  }

  function abs(a:number): number {
      if (a >= 0) return a;
      return  -a;
  }
// Check if a given state is valid
  function isStateValid (state: IState): boolean {
    let board = state.board;
    let numOfBs = 0, numOfWs = 0;
    if (board.length !== ROWS) return false;
    for (let i = 0; i < ROWS; i++) {
        if (board[i].length !== COLS) return false;
        for (let j = abs(i-4); j < COLS-abs(i-4); ) {
            let c = board[i][j];
            if (c !== 'O' || c !== 'B' || c !== 'W')
              return false;
            if (c === 'B') numOfBs ++;
            if (c === 'W') numOfWs ++;
            board[i][j] = 'O';
            j += 2;
        }
    }
    if (numOfBs + state.removedMarbles.black !== 14
      || numOfWs + state.removedMarbles.white !== 14) return false;
    let board_const: Board = [
            ['', '', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', '', '', '' ],
            ['', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', '', '' ],
            ['', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', '' ],
            ['', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '' ],
            ['O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O' ],
            ['', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '' ],
            ['', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', '' ],
            ['', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', '', '' ],
            ['', '', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', '', '', '' ]];
    if (board !== board_const) return false;
    return true;
  }

  function isDirectionValid (direction: BoardDelta) : boolean {
    let directionSet: BoardDelta[] = [{row: 0, col: 2}, {row: 0, col: -2},
    {row: 1, col: 1}, {row: -1, col: -1}, {row: 1, col: -1}, {row: -1, col: 1}];
    for (let direction_patter of directionSet) {
      if (direction === direction_patter) {
          return true;
      }
    }
    return false;
  }

  function isStepValid (board: Board, action: Action, turnIndexBeforeMove: number): boolean {
    if (action.selfMarbles.length > 3 || action.selfMarbles.length === 0) {
      throw new Error("You should move 1, 2, 3 marbles!");
    }
    if (action.selfMarbles.length <= action.opponentMarbles.length) {
      throw new Error("You can only push away less of your opponent's marbles than yours!");
    }
    if(!isDirectionValid(action.direction))
      throw new Error("The direction is wrong!");

// check the color of the marbles to be moved
    for (let i = 0; i < action.selfMarbles.length; i++) {
        let row = action.selfMarbles[i].row;
        let col = action.selfMarbles[i].col;
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS ||
          board[row][col] !== (turnIndexBeforeMove === 0? 'B' : 'W'))
          throw new Error("You should move your own marbles!");
    }
    for (let i = 0; i < action.opponentMarbles.length; i++) {
        let row = action.opponentMarbles[i].row;
        let col = action.opponentMarbles[i].col;
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS ||
          board[row][col] !== (turnIndexBeforeMove === 0? 'W' : 'B'))
          throw new Error("You should push away your opponent's marbles!");
    }

/* Check if the marbles to be moved are aligned in the same line and next to each other.
    Moreover, if it is an in-line move, we require that selfMarbles[0],selfMarbles[1],
    selfMarbles[2], opponentMarbles[0],opponentMarbles[1] are aligned along
    the moving direction.
*/
    if (!action.isInline) {
      if (action.opponentMarbles.length !== 0)
        throw new Error("Your cannot push away your opponent's marbles in a broadside move!");

      for (let i = 0; i < action.selfMarbles.length; i++) {
          let row = action.selfMarbles[i].row + action.direction.row;
          let col = action.selfMarbles[i].col + action.direction.col;
          if (row < 0 || row >= ROWS || col < 0 || col >= COLS || board[row][col] !== 'O')
            throw new Error("You should move your marbles to open space!");
      }

      if (action.selfMarbles.length > 1) {
        let row_delta1 = action.selfMarbles[1].row - action.selfMarbles[0].row;
        let col_delta1 = action.selfMarbles[1].col - action.selfMarbles[0].col;
        let temp_direc1: BoardDelta = {row: row_delta1, col: col_delta1};
        if (!isDirectionValid(temp_direc1))
          throw new Error("Marbles should be neighbors to each other!");
        if (action.selfMarbles.length === 3) {
          let row_delta2 = action.selfMarbles[2].row - action.selfMarbles[1].row;
          let col_delta2 = action.selfMarbles[2].col - action.selfMarbles[1].col;
          let temp_direc2: BoardDelta = {row: row_delta2, col: col_delta2};
          if (!isDirectionValid(temp_direc2))
            throw new Error("Marbles should be neighbors to each other!");
          if (temp_direc1 !== temp_direc2) {
            throw new Error("Marbles should be in the same line!");
          }
        }
      }
    }

    if (action.isInline) {
      for (let i = 1; i < action.selfMarbles.length; i++) {
          let row = action.selfMarbles[i-1].row + action.direction.row;
          let col = action.selfMarbles[i-1].col + action.direction.col;
          if (row !== action.selfMarbles[i].row
            || col !== action.selfMarbles[i].col)
            throw new Error("Marbles should be placed along the moving direction!");
      }
      let len = action.selfMarbles.length;
      let row = action.selfMarbles[len-1].row + action.direction.row;
      let col = action.selfMarbles[len-1].col + action.direction.col;
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS)
          throw new Error("You cannot eject your own marbles!");

      len = action.opponentMarbles.length;
      if (len === 0 && board[row][col] !== 'O')
         throw new Error("You should move your marbles to open space!");
      if (len > 0 &&
        (action.opponentMarbles[0].row !== row || action.opponentMarbles[0].col !== col)) {
          throw new Error("You can only push your opponent's marbles in the nbhd!");
      }
      if (len === 2) {
            let row_delta = action.opponentMarbles[1].row - action.opponentMarbles[0].row;
            let col_delta = action.opponentMarbles[1].col - action.opponentMarbles[0].col;
            if (row_delta !== action.direction.row
              || col_delta !== action.direction.col)
              throw new Error("Marbles should be neighbors to each other!");
      }
      if (len > 0) {
           let row = action.opponentMarbles[len-1].row + action.direction.row;
           let col = action.opponentMarbles[len-1].col + action.direction.col;
           if (row >= 0 && row < ROWS && col >= 0 && col < COLS
             && board[row][col] !== 'O') {
             throw new Error("You should push marbles to open space or off edge!");
           }
      }
    }
    return true;
  }

  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
  export function createMove(
    stateBeforeMove: IState, action: Action, turnIndexBeforeMove: number): IMove {
    if (!stateBeforeMove) {
      // Initially (at the beginning of the match), the board in state is undefined.
      stateBeforeMove = {board: getInitialBoard(), removedMarbles: {black : 0, white : 0}};
    //  stateBeforeMove.board = getInitialBoard();
    //  stateBeforeMove.removedMarbles = {black : 0, white : 0};
    }
    if (!isStateValid(stateBeforeMove))
      throw new Error("The given state is invalid");
    if (getWinner(stateBeforeMove) === 'B'
      || getWinner(stateBeforeMove) === 'W')
      throw new Error("Can only make a move if the game is not over!");

    if(!isStepValid(stateBeforeMove.board, action, turnIndexBeforeMove))
      throw new Error("Action is invalid and game is halted!");

    let stateAfterMove = angular.copy(stateBeforeMove);
    if (!action.isInline) {
      for (let i = 0; i < action.selfMarbles.length; i++) {
          let row = action.selfMarbles[i].row;
          let col = action.selfMarbles[i].col;
          stateAfterMove.board[row][col] = 'O';
          row += action.direction.row;
          col += action.direction.col;
          stateAfterMove.board[row][col] = turnIndexBeforeMove === 0? 'B' : 'W';
      }
    }
    if (action.isInline) {
      let row = action.selfMarbles[0].row;
      let col = action.selfMarbles[0].col;
      stateAfterMove.board[row][col] = 'O';

      let len = action.selfMarbles.length;
      row = action.selfMarbles[len-1].row + action.direction.row;
      col = action.selfMarbles[len-1].col + action.direction.col;
      stateAfterMove.board[row][col] = turnIndexBeforeMove === 0? 'B' : 'W';

      len = action.opponentMarbles.length;
      if (len > 0) {
           let row = action.opponentMarbles[len-1].row + action.direction.row;
           let col = action.opponentMarbles[len-1].col + action.direction.col;
           if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
             if (turnIndexBeforeMove === 0) {
                 stateAfterMove.removedMarbles.white++;
             } else stateAfterMove.removedMarbles.black++;
           } else {
             stateAfterMove.board[row][col] = turnIndexBeforeMove === 0? 'W' : 'B';
           }
      }
    }

    let winner = getWinner(stateAfterMove);
    let firstOperation: IOperation;
    if (winner === 'B' || winner === 'W') {
      // Game over.
      firstOperation = {endMatch: {endMatchScores:
        winner === 'B' ? [1, 0] :[0, 1]}};
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
    }
    return [firstOperation,
            {set: {key: 'action', value: action}},
            {set: {key: 'state', value: stateAfterMove}}];
  }

  export function isMoveOk(params: IIsMoveOk): boolean {
    let move = params.move;
    let turnIndexBeforeMove = params.turnIndexBeforeMove;
    let stateBeforeMove: IState = params.stateBeforeMove;
    // The state and turn after move are not needed in Abalone (or in any game where all state is public).
    //let turnIndexAfterMove = params.turnIndexAfterMove;
    //let stateAfterMove = params.stateAfterMove;

    // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
    // to verify that move is legal.
    try {
      // Example move:
      // [{setTurn: {turnIndex : 1},
      //  {set: {key: 'board', value: [['X', '', ''], ['', '', ''], ['', '', '']]}},
      //  {set: {key: 'delta', value: {row: 0, col: 0}}}]
      let action: Action = move[1].set.value;
      let expectedMove = createMove(stateBeforeMove, action, turnIndexBeforeMove);
      if (!angular.equals(move, expectedMove)) {
        return false;
      }
    } catch (e) {
      // if there are any exceptions then the move is illegal
      return false;
    }
    return true;
  }
}
