type Board = string[][];
interface BoardDelta {
  row: number;
  col: number;
}

interface IState {
  board?: Board;
  isInitialState?: boolean;
  blackRemoved?: number;
  whiteRemoved?: number;
  action?: Action;
}

interface Action {
  isInline: boolean;
  direction: BoardDelta;
  selfMarbles: BoardDelta[];
  opponentMarbles: BoardDelta[];
}

module gameLogic {
  export const ROWS: number = 9;
  export const COLS: number = 17;
  export const DIREC: BoardDelta[] = [{row: 0, col: 2}, {row: 1, col: -1},
  {row: 1, col: 1}, {row: 0, col: -2}, {row: -1, col: 1}, {row: -1, col: -1}];
  export const PLACES: BoardDelta[] = [{row: 0, col: 4}, {row: 0, col: 6}, {row: 0, col: 8},
  {row: 0, col: 10}, {row: 0, col: 12}, {row: 1, col: 3}, {row: 1, col: 5}, {row: 1, col: 7},
  {row: 1, col: 9}, {row: 1, col: 11}, {row: 1, col: 13}, {row: 2, col: 2}, {row: 2, col: 4},
  {row: 2, col: 6}, {row: 2, col: 8}, {row: 2, col: 10}, {row: 2, col: 12}, {row: 2, col: 14},
  {row: 3, col: 1}, {row: 3, col: 3}, {row: 3, col: 5}, {row: 3, col: 7},
  {row: 3, col: 9}, {row: 3, col: 11}, {row: 3, col: 13}, {row: 3, col: 15},
  {row: 4, col: 0}, {row: 4, col: 2}, {row: 4, col: 4},{row: 4, col: 6}, {row: 4, col: 8},
  {row: 4, col: 10}, {row: 4, col: 12}, {row: 4, col: 14}, {row: 4, col: 16},
  {row: 5, col: 1}, {row: 5, col: 3}, {row: 5, col: 5}, {row: 5, col: 7},
  {row: 5, col: 9}, {row: 5, col: 11}, {row: 5, col: 13}, {row: 5, col: 15},
  {row: 6, col: 2}, {row: 6, col: 4}, {row: 6, col: 6}, {row: 6, col: 8}, {row: 6, col: 10},
  {row: 6, col: 12}, {row: 6, col: 14},
  {row: 7, col: 3}, {row: 7, col: 5}, {row: 7, col: 7},
  {row: 7, col: 9}, {row: 7, col: 11}, {row: 7, col: 13},
  {row: 8, col: 4}, {row: 8, col: 6}, {row: 8, col: 8},
  {row: 8, col: 10}, {row: 8, col: 12} ];

  function getEmptyBoard(): Board {
    let board: Board = [];
    for (let i = 0; i < ROWS; i++) {
        board[i] = [];
        for (let j = 0; j < COLS; j++) {
            board[i][j] = '';
        }
    }
    for (let place of PLACES) {
      let i = place.row;
      // let i = place['row'];
      let j = place.col;
      board[i][j] = 'O';
    }
    return board;
  }

  /** Returns the initial Abalone board called Belgian daisy, which is a 9x17 matrix
  containing 14 'B's(belonging to the black party), 14 'W's(belonging to the white party),
  'O' (open space that 'B' and 'W' can moved to), ''(space that does not exist in a physical board). */
  export function getInitialBoard(): Board {
    let board = getEmptyBoard();
    board[0][4] = 'W'; board[0][6] = 'W'; board[0][10] = 'B'; board[0][12] = 'B';
    board[1][3] = 'W'; board[1][5] = 'W'; board[1][7] = 'W'; board[1][9] = 'B'; board[1][11] = 'B'; board[1][13] = 'B';
    board[2][4] = 'W'; board[2][6] = 'W'; board[2][10] = 'B'; board[2][12] = 'B';
    board[6][4] = 'B'; board[6][6] = 'B'; board[6][10] = 'W'; board[6][12] = 'W';
    board[7][3] = 'B'; board[7][5] = 'B'; board[7][7] = 'B'; board[7][9] = 'W'; board[7][11] = 'W'; board[7][13] = 'W';
    board[8][4] = 'B'; board[8][6] = 'B'; board[8][10] = 'W'; board[8][12] = 'W';
    return board;
  }

  export function getInitialState(): IState {
    let initialBoard: Board = getInitialBoard();
    let initialState: IState = {board: initialBoard, isInitialState: true, blackRemoved : 0, whiteRemoved : 0};
    return initialState;
  }

  export function getWinner(state: IState): string {
    if (state.blackRemoved === 6)
      return 'W';
    if (state.whiteRemoved === 6)
      return 'B';
    return '';
  }


//Check if a given state is valid
  function isStateValid (state: IState): boolean {
    let board = angular.copy(state.board);
    let numOfBs: number = 0, numOfWs: number = 0;
    if (board.length !== ROWS) {
      return false;
    }
    for (let i = 0; i < ROWS; i++) {
      if (board[i].length !== COLS) return false;
    }
    for (let place of PLACES) {
      let i = place.row;
      let j = place.col;
      let cell = board[i][j];
      if (cell !== 'O' && cell !== 'B' && cell !== 'W') {
          return false;
      }
      if (cell === 'B') numOfBs ++;
      if (cell === 'W') numOfWs ++;
      board[i][j] = 'O';
    }

    if (numOfBs + state.blackRemoved !== 14
      || numOfWs + state.whiteRemoved !== 14) return false;
    let emptyboard = getEmptyBoard();
    if (!angular.equals(board, emptyboard)) return false;
    return true;
  }

  function isDirectionValid (direction: BoardDelta) : boolean {
    for (let direction_pattern of DIREC) {
      if (angular.equals(direction,direction_pattern))
          return true;
    }
    return false;
  }

  export function isStepValid (stateBeforeMove: IState, action: Action, turnIndexBeforeMove: number): boolean {
    let board = stateBeforeMove.board;
    if (action.selfMarbles.length > 3 || action.selfMarbles.length === 0)
      return false;
    if (action.selfMarbles.length <= action.opponentMarbles.length)
      return false;
    if (!isDirectionValid(action.direction))
      return false;

// check the color of the marbles to be moved
    for (let i = 0; i < action.selfMarbles.length; i++) {
        let row = action.selfMarbles[i].row;
        let col = action.selfMarbles[i].col;
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS
          || board[row][col] !== (turnIndexBeforeMove === 0? 'B' : 'W'))
          return false;
    }
    for (let i = 0; i < action.opponentMarbles.length; i++) {
        let row = action.opponentMarbles[i].row;
        let col = action.opponentMarbles[i].col;
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS
          || board[row][col] !== (turnIndexBeforeMove === 0? 'W' : 'B'))
          return false;
    }

/* Check if the marbles to be moved are aligned in the same line and next to each other.
    Moreover, if it is an in-line move, we require that selfMarbles[0],selfMarbles[1],
    selfMarbles[2], opponentMarbles[0],opponentMarbles[1] are aligned along
    the moving direction.
*/
    if (!action.isInline) {
      if (action.opponentMarbles.length !== 0)
        return false;
      for (let i = 0; i < action.selfMarbles.length; i++) {
          let row = action.selfMarbles[i].row + action.direction.row;
          let col = action.selfMarbles[i].col + action.direction.col;
          if (row < 0 || row >= ROWS || col < 0 || col >= COLS || board[row][col] !== 'O')
            return false;
      }
      let temp_direc1: BoardDelta;
      if (action.selfMarbles.length > 1) {
        let row_delta1 = action.selfMarbles[1].row - action.selfMarbles[0].row;
        let col_delta1 = action.selfMarbles[1].col - action.selfMarbles[0].col;
        temp_direc1 = {row: row_delta1, col: col_delta1};
        if (!isDirectionValid(temp_direc1))
          return false;
        }
        if (action.selfMarbles.length === 3) {
          let row_delta2 = action.selfMarbles[2].row - action.selfMarbles[1].row;
          let col_delta2 = action.selfMarbles[2].col - action.selfMarbles[1].col;
          let temp_direc2: BoardDelta = {row: row_delta2, col: col_delta2};
          if (temp_direc1 !== temp_direc2)
            return false;
        }
    }

    if (action.isInline) {
      for (let i = 1; i < action.selfMarbles.length; i++) {
          let row = action.selfMarbles[i-1].row + action.direction.row;
          let col = action.selfMarbles[i-1].col + action.direction.col;
          if (row !== action.selfMarbles[i].row
            || col !== action.selfMarbles[i].col)
            return false;
      }
      let len = action.selfMarbles.length;
      let row = action.selfMarbles[len-1].row + action.direction.row;
      let col = action.selfMarbles[len-1].col + action.direction.col;
      len = action.opponentMarbles.length;
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS ||
        (len === 0 && board[row][col] !== 'O'))
        return false;
      if (len > 0 &&
        (action.opponentMarbles[0].row !== row || action.opponentMarbles[0].col !== col)) {
          return false;
      }
      if (len === 2) {
            let row_delta = action.opponentMarbles[1].row - action.opponentMarbles[0].row;
            let col_delta = action.opponentMarbles[1].col - action.opponentMarbles[0].col;
            if (row_delta !== action.direction.row || col_delta !== action.direction.col)
              return false;
      }
      if (len > 0) {
           let row = action.opponentMarbles[len-1].row + action.direction.row;
           let col = action.opponentMarbles[len-1].col + action.direction.col;
           if (row >= 0 && row < ROWS && col >= 0 && col < COLS
             && board[row][col] !== 'O')
               return false;
      }
    }
    return true;
  }

// Convert what is clicked on to an Action
export function clickToAction(isInline: boolean, marbles: BoardDelta[],
  direction: BoardDelta, stateBeforeMove: IState, turnIndexBeforeMove: number) : Action {
    if (!stateBeforeMove || Object.keys(stateBeforeMove).length === 0) {
      stateBeforeMove = getInitialState();
    }
   let selfMarbles: BoardDelta[] = [];
   let opponentMarbles: BoardDelta[] = [];
   let currentPlayer: string = (turnIndexBeforeMove === 0)? 'B' : 'W';
   for (let i = 0; i < marbles.length; i++) {
     if (stateBeforeMove.board[marbles[i].row][marbles[i].col] === currentPlayer)
      selfMarbles.push(marbles[i]);
    else opponentMarbles.push(marbles[i]);
   }
   let action : Action = {isInline: isInline, direction: direction, selfMarbles: selfMarbles, opponentMarbles: opponentMarbles};
   return action;
}


  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
  export function createMove(
    stateBeforeMove: IState, action: Action, turnIndexBeforeMove: number): IMove {
    if (!stateBeforeMove || Object.keys(stateBeforeMove).length === 0) {
      stateBeforeMove = getInitialState();
    }
    if (!isStateValid(stateBeforeMove))
      throw new Error("The given state is invalid");
    if (getWinner(stateBeforeMove) === 'B'
      || getWinner(stateBeforeMove) === 'W')
      throw new Error("Can only make a move if the game is not over!");

    if(!isStepValid(stateBeforeMove, action, turnIndexBeforeMove))
      throw new Error("Action is invalid and game is halted!");

    let stateAfterMove = angular.copy(stateBeforeMove);
    if (stateAfterMove.isInitialState === true) {
      stateAfterMove.isInitialState = false;
    }
    if (!action.isInline) {
      for (let i = 0; i < action.selfMarbles.length; i++) {
          let row = action.selfMarbles[i].row;
          let col = action.selfMarbles[i].col;
          stateAfterMove.board[row][col] = 'O';
          row += action.direction.row;
          col += action.direction.col;
          stateAfterMove.board[row][col] = (turnIndexBeforeMove === 0? 'B' : 'W');
      }
    }
    if (action.isInline) {
      let row = action.selfMarbles[0].row;
      let col = action.selfMarbles[0].col;
      stateAfterMove.board[row][col] = 'O';

      let len = action.selfMarbles.length;
      row = action.selfMarbles[len-1].row + action.direction.row;
      col = action.selfMarbles[len-1].col + action.direction.col;
      stateAfterMove.board[row][col] = (turnIndexBeforeMove === 0? 'B' : 'W');

      len = action.opponentMarbles.length;
      if (len > 0) {
           let row = action.opponentMarbles[len-1].row + action.direction.row;
           let col = action.opponentMarbles[len-1].col + action.direction.col;
           if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
             if (turnIndexBeforeMove === 0)
                 stateAfterMove.whiteRemoved ++;
             else stateAfterMove.blackRemoved++;
           } else {
             stateAfterMove.board[row][col] = (turnIndexBeforeMove === 0? 'W' : 'B');
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
    let move: IMove = [firstOperation,
            {set: {key: 'action', value: action}},
            {set: {key: 'state', value: stateAfterMove}}];
    return move;
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
      let action: Action = move[1].set.value;
      let expectedMove = createMove(stateBeforeMove, action, turnIndexBeforeMove);
      if (angular.equals(move, expectedMove)) {
        return true;
      }
    } catch (e) {
      // if there are any exceptions then the move is illegal
      return false;
    }
    return false;
  }
}
