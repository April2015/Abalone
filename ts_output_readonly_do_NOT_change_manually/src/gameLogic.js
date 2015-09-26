var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 9;
    gameLogic.COLS = 17;
    gameLogic.PLACES = [{ row: 0, col: 4 }, { row: 0, col: 6 }, { row: 0, col: 8 },
        { row: 0, col: 10 }, { row: 0, col: 12 }, { row: 1, col: 3 }, { row: 1, col: 5 }, { row: 1, col: 7 },
        { row: 1, col: 9 }, { row: 1, col: 11 }, { row: 1, col: 13 }, { row: 2, col: 2 }, { row: 2, col: 4 },
        { row: 2, col: 6 }, { row: 2, col: 8 }, { row: 2, col: 10 }, { row: 2, col: 12 }, { row: 2, col: 14 },
        { row: 3, col: 1 }, { row: 3, col: 3 }, { row: 3, col: 5 }, { row: 3, col: 7 },
        { row: 3, col: 9 }, { row: 3, col: 11 }, { row: 3, col: 13 }, { row: 3, col: 15 },
        { row: 4, col: 2 }, { row: 4, col: 2 }, { row: 4, col: 4 }, { row: 4, col: 6 }, { row: 4, col: 8 },
        { row: 4, col: 10 }, { row: 4, col: 12 }, { row: 4, col: 14 }, { row: 4, col: 16 },
        { row: 5, col: 1 }, { row: 5, col: 3 }, { row: 5, col: 5 }, { row: 5, col: 7 },
        { row: 5, col: 9 }, { row: 5, col: 11 }, { row: 5, col: 13 }, { row: 5, col: 15 },
        { row: 6, col: 2 }, { row: 6, col: 4 }, { row: 6, col: 6 }, { row: 6, col: 8 }, { row: 6, col: 10 },
        { row: 6, col: 12 }, { row: 6, col: 14 },
        { row: 7, col: 3 }, { row: 7, col: 5 }, { row: 7, col: 7 },
        { row: 7, col: 9 }, { row: 7, col: 11 }, { row: 7, col: 13 },
        { row: 8, col: 4 }, { row: 8, col: 6 }, { row: 8, col: 8 },
        { row: 8, col: 10 }, { row: 8, col: 12 }];
    // function abs(a:number): number {
    //     if (a >= 0) return a;
    //     return  -a;
    // }
    function getEmptyBoard() {
        var board = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            board[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                board[i][j] = '';
            }
        }
        for (var _i = 0; _i < gameLogic.PLACES.length; _i++) {
            var place = gameLogic.PLACES[_i];
            var i = place.row;
            var j = place.col;
            board[i][j] = 'O';
        }
        return board;
    }
    /** Returns the initial Abalone board called Belgian daisy, which is a 9x17 matrix
    containing 14 'B's(belonging to the black party), 14 'W's(belonging to the white party),
    'O' (open space that 'B' and 'W' can moved to), ''(space that does not exist in a physical board). */
    function getInitialBoard() {
        var board = getEmptyBoard();
        board[0][4] = 'W';
        board[0][6] = 'W';
        board[0][10] = 'B';
        board[0][12] = 'B';
        board[1][3] = 'W';
        board[1][5] = 'W';
        board[1][7] = 'W';
        board[1][9] = 'B';
        board[1][11] = 'B';
        board[1][13] = 'B';
        board[2][4] = 'W';
        board[2][6] = 'W';
        board[2][10] = 'B';
        board[2][12] = 'B';
        board[6][4] = 'B';
        board[6][6] = 'B';
        board[6][10] = 'W';
        board[6][12] = 'W';
        board[7][3] = 'B';
        board[7][5] = 'B';
        board[7][7] = 'B';
        board[7][9] = 'W';
        board[1][11] = 'W';
        board[7][13] = 'W';
        board[8][4] = 'B';
        board[8][6] = 'B';
        board[8][10] = 'W';
        board[8][12] = 'W';
        return board;
    }
    gameLogic.getInitialBoard = getInitialBoard;
    //  [['', '', '', '', 'W', '', 'W', '', 'O', '', 'B', '', 'B', '', '', '', '' ],
    //   ['', '', '', 'W', '', 'W', '', 'W', '', 'B', '', 'B', '', 'B', '', '', '' ],
    //   ['', '', 'O', '', 'W', '', 'W', '', 'O', '', 'B', '', 'B', '', 'O', '', '' ],
    //   ['', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '' ],
    //   ['O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O' ],
    //   ['', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '' ],
    //   ['', '', 'O', '', 'B', '', 'B', '', 'O', '', 'W', '', 'W', '', 'O', '', '' ],
    //   ['', '', '', 'B', '', 'B', '', 'B', '', 'W', '', 'W', '', 'W', '', '', '' ],
    //   ['', '', '', '', 'B', '', 'B', '', 'O', '', 'W', '', 'W', '', '', '', '' ]]
    function getWinner(state) {
        if (state.blackRemoved === 6)
            return 'W';
        if (state.whiteRemoved === 6)
            return 'B';
        return '';
    }
    // Check if a given state is valid
    function isStateValid(state) {
        var board = angular.copy(state.board);
        var numOfBs = 0, numOfWs = 0;
        if (board.length !== gameLogic.ROWS) {
            return false;
        }
        for (var i = 0; i < gameLogic.ROWS; i++) {
            if (board[i].length !== gameLogic.COLS)
                return false;
        }
        for (var _i = 0; _i < gameLogic.PLACES.length; _i++) {
            var place = gameLogic.PLACES[_i];
            var i = place.row;
            var j = place.col;
            var cell = board[i][j];
            if (cell !== 'O' && cell !== 'B' && cell !== 'W') {
                return false;
            }
            if (cell === 'B')
                numOfBs++;
            if (cell === 'W')
                numOfWs++;
            board[i][j] = 'O';
        }
        // if (board.length !== ROWS) return false;
        // for (let i = 0; i < ROWS; i++) {
        //     // if (board[i].length !== COLS) return false;
        //     let l = abs(i-4);
        //     let r = COLS-abs(i-4);
        //     for (let j = l; j < r; j += 2) {
        //         if (board[i][j] !== 'O' && board[i][j] !== 'B' && board[i][j] !== 'W') {
        //           return false;
        //         }
        //         if (board[i][j] === 'B') numOfBs ++;
        //         if (board[i][j] === 'W') numOfWs ++;
        //         board[i][j] = 'O';
        //     }
        // }
        if (numOfBs + state.blackRemoved !== 14
            || numOfWs + state.whiteRemoved !== 14)
            return false;
        var emptyboard = getEmptyBoard();
        // if (board !== emptyboard) {
        //   throw new Error("is equal!");
        //   return false
        // }
        if (!angular.equals(board, emptyboard))
            return false;
        return true;
    }
    // [['', '', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', '', '', '' ],
    //   ['', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', '', '' ],
    //   ['', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', '' ],
    //   ['', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '' ],
    //   ['O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O' ],
    //   ['', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '' ],
    //   ['', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', '' ],
    //   ['', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', '', '' ],
    //   ['', '', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', '', '', '' ]]
    function isDirectionValid(direction) {
        var directionSet = [{ row: 0, col: 2 }, { row: 0, col: -2 },
            { row: 1, col: 1 }, { row: -1, col: -1 }, { row: 1, col: -1 }, { row: -1, col: 1 }];
        for (var _i = 0; _i < directionSet.length; _i++) {
            var direction_pattern = directionSet[_i];
            if (angular.equals(direction, direction_pattern)) {
                return true;
            }
        }
        return false;
    }
    function isStepValid(stateBeforeMove, action, turnIndexBeforeMove) {
        var board = stateBeforeMove.board;
        if (action.selfMarbles.length > 3 || action.selfMarbles.length === 0) {
            throw new Error("You should move 1, 2, 3 marbles!");
        }
        if (action.selfMarbles.length <= action.opponentMarbles.length) {
            throw new Error("You can only push away less of your opponent's marbles than yours!");
        }
        if (!isDirectionValid(action.direction))
            throw new Error("The direction is wrong!");
        // check the color of the marbles to be moved
        for (var i = 0; i < action.selfMarbles.length; i++) {
            var row = action.selfMarbles[i].row;
            var col = action.selfMarbles[i].col;
            if (row < 0 || row >= gameLogic.ROWS || col < 0 || col >= gameLogic.COLS)
                throw new Error("You are reaching a nonexisting position in the board!");
            if (board[row][col] !== (turnIndexBeforeMove === 0 ? 'B' : 'W'))
                throw new Error("You should move your own marbles!");
        }
        for (var i = 0; i < action.opponentMarbles.length; i++) {
            var row = action.opponentMarbles[i].row;
            var col = action.opponentMarbles[i].col;
            if (row < 0 || row >= gameLogic.ROWS || col < 0 || col >= gameLogic.COLS)
                throw new Error("You are reaching a nonexisting position in the board!");
            if (board[row][col] !== (turnIndexBeforeMove === 0 ? 'W' : 'B'))
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
            for (var i = 0; i < action.selfMarbles.length; i++) {
                var row = action.selfMarbles[i].row + action.direction.row;
                var col = action.selfMarbles[i].col + action.direction.col;
                if (row < 0 || row >= gameLogic.ROWS || col < 0 || col >= gameLogic.COLS || board[row][col] !== 'O')
                    throw new Error("You should move your marbles to open space!");
            }
            if (action.selfMarbles.length > 1) {
                var row_delta1 = action.selfMarbles[1].row - action.selfMarbles[0].row;
                var col_delta1 = action.selfMarbles[1].col - action.selfMarbles[0].col;
                var temp_direc1 = { row: row_delta1, col: col_delta1 };
                if (!isDirectionValid(temp_direc1))
                    throw new Error("Marbles should be neighbors to each other!");
                if (action.selfMarbles.length === 3) {
                    var row_delta2 = action.selfMarbles[2].row - action.selfMarbles[1].row;
                    var col_delta2 = action.selfMarbles[2].col - action.selfMarbles[1].col;
                    var temp_direc2 = { row: row_delta2, col: col_delta2 };
                    if (!isDirectionValid(temp_direc2))
                        throw new Error("Marbles should be neighbors to each other!");
                    if (temp_direc1 !== temp_direc2) {
                        throw new Error("Marbles should be in the same line!");
                    }
                }
            }
        }
        if (action.isInline) {
            for (var i = 1; i < action.selfMarbles.length; i++) {
                var row_1 = action.selfMarbles[i - 1].row + action.direction.row;
                var col_1 = action.selfMarbles[i - 1].col + action.direction.col;
                if (row_1 !== action.selfMarbles[i].row
                    || col_1 !== action.selfMarbles[i].col)
                    throw new Error("Marbles should be placed along the moving direction!");
            }
            var len = action.selfMarbles.length;
            var row = action.selfMarbles[len - 1].row + action.direction.row;
            var col = action.selfMarbles[len - 1].col + action.direction.col;
            if (row < 0 || row >= gameLogic.ROWS || col < 0 || col >= gameLogic.COLS)
                throw new Error("You cannot eject your own marbles!");
            len = action.opponentMarbles.length;
            if (len === 0 && board[row][col] !== 'O')
                throw new Error("You should move your marbles to open space!");
            if (len > 0 &&
                (action.opponentMarbles[0].row !== row || action.opponentMarbles[0].col !== col)) {
                throw new Error("You can only push your opponent's marbles in the nbhd!");
            }
            if (len === 2) {
                var row_delta = action.opponentMarbles[1].row - action.opponentMarbles[0].row;
                var col_delta = action.opponentMarbles[1].col - action.opponentMarbles[0].col;
                if (row_delta !== action.direction.row
                    || col_delta !== action.direction.col)
                    throw new Error("Marbles should be neighbors to each other!");
            }
            if (len > 0) {
                var row_2 = action.opponentMarbles[len - 1].row + action.direction.row;
                var col_2 = action.opponentMarbles[len - 1].col + action.direction.col;
                if (row_2 >= 0 && row_2 < gameLogic.ROWS && col_2 >= 0 && col_2 < gameLogic.COLS
                    && board[row_2][col_2] !== 'O') {
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
    function createMove(stateBeforeMove, action, turnIndexBeforeMove) {
        if (!stateBeforeMove) {
            // Initially (at the beginning of the match), the board in state is undefined.
            var initialBoard = getInitialBoard();
            // let initialState: IState = {board: initialBoard, blackRemoved : 0, whiteRemoved : 0};
            // stateBeforeMove = initialState;
            stateBeforeMove = { board: initialBoard, blackRemoved: 0, whiteRemoved: 0 };
        }
        if (!isStateValid(stateBeforeMove))
            throw new Error("The given state is invalid");
        if (getWinner(stateBeforeMove) === 'B'
            || getWinner(stateBeforeMove) === 'W')
            throw new Error("Can only make a move if the game is not over!");
        if (!isStepValid(stateBeforeMove, action, turnIndexBeforeMove))
            throw new Error("Action is invalid and game is halted!");
        var stateAfterMove = angular.copy(stateBeforeMove);
        if (!action.isInline) {
            for (var i = 0; i < action.selfMarbles.length; i++) {
                var row = action.selfMarbles[i].row;
                var col = action.selfMarbles[i].col;
                stateAfterMove.board[row][col] = 'O';
                row += action.direction.row;
                col += action.direction.col;
                stateAfterMove.board[row][col] = (turnIndexBeforeMove === 0 ? 'B' : 'W');
            }
        }
        if (action.isInline) {
            var row = action.selfMarbles[0].row;
            var col = action.selfMarbles[0].col;
            stateAfterMove.board[row][col] = 'O';
            var len = action.selfMarbles.length;
            row = action.selfMarbles[len - 1].row + action.direction.row;
            col = action.selfMarbles[len - 1].col + action.direction.col;
            stateAfterMove.board[row][col] = (turnIndexBeforeMove === 0 ? 'B' : 'W');
            len = action.opponentMarbles.length;
            if (len > 0) {
                var row_3 = action.opponentMarbles[len - 1].row + action.direction.row;
                var col_3 = action.opponentMarbles[len - 1].col + action.direction.col;
                if (row_3 < 0 || row_3 >= gameLogic.ROWS || col_3 < 0 || col_3 >= gameLogic.COLS) {
                    if (turnIndexBeforeMove === 0) {
                        stateAfterMove.whiteRemoved++;
                    }
                    else
                        stateAfterMove.blackRemoved++;
                }
                else {
                    stateAfterMove.board[row_3][col_3] = (turnIndexBeforeMove === 0 ? 'W' : 'B');
                }
            }
        }
        var winner = getWinner(stateAfterMove);
        var firstOperation;
        if (winner === 'B' || winner === 'W') {
            // Game over.
            firstOperation = { endMatch: { endMatchScores: winner === 'B' ? [1, 0] : [0, 1] } };
        }
        else {
            // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
            firstOperation = { setTurn: { turnIndex: 1 - turnIndexBeforeMove } };
        }
        var move = [firstOperation,
            { set: { key: 'action', value: action } },
            { set: { key: 'state', value: stateAfterMove } }];
        // let fakeMove: IMove = [{setTurn: {turnIndex: 1}},
        //     {set: {key: 'action', value: {isInline: true, direction:  {row: -1, col: 1},
        //     selfMarbles: [{row: 8, col: 4}, {row: 7, col: 5}, {row: 6, col: 6}],
        //                          opponentMarbles: []}}},
        //     {set: {key: 'state', value:
        //     {board: [
        //     ['', '', '', '', 'W', '', 'W', '', 'O', '', 'B', '', 'B', '', '', '', '' ],
        //     ['', '', '', 'W', '', 'W', '', 'W', '', 'B', '', 'B', '', 'B', '', '', '' ],
        //     ['', '', 'O', '', 'W', '', 'W', '', 'O', '', 'B', '', 'B', '', 'O', '', '' ],
        //     ['', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '' ],
        //     ['O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O' ],
        //     ['', 'O', '', 'O', '', 'O', '', 'B', '', 'O', '', 'O', '', 'O', '', 'O', '' ],
        //     ['', '', 'O', '', 'B', '', 'B', '', 'O', '', 'W', '', 'W', '', 'O', '', '' ],
        //     ['', '', '', 'B', '', 'B', '', 'B', '', 'W', '', 'W', '', 'W', '', '', '' ],
        //     ['', '', '', '', 'O', '', 'B', '', 'O', '', 'W', '', 'W', '', '', '', '' ]],
        //     blackRemoved : 0, whiteRemoved : 0}}}];
        //     if (angular.equals(move, fakeMove)) {
        //         throw new Error("Test! Why?");
        //     }
        return move;
    }
    gameLogic.createMove = createMove;
    function isMoveOk(params) {
        var move = params.move;
        var turnIndexBeforeMove = params.turnIndexBeforeMove;
        var stateBeforeMove = params.stateBeforeMove;
        // The state and turn after move are not needed in Abalone (or in any game where all state is public).
        //let turnIndexAfterMove = params.turnIndexAfterMove;
        //let stateAfterMove = params.stateAfterMove;
        // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
        // to verify that move is legal.
        // try {
        //   let action: Action = move[1].set.value;
        //   let expectedMove = createMove(stateBeforeMove, action, turnIndexBeforeMove);
        //   if (!angular.equals(move, expectedMove)) {
        //     return false;
        //   }
        // } catch (e) {
        //   // if there are any exceptions then the move is illegal
        //   return false;
        // }
        var action = move[1].set.value;
        var expectedMove = createMove(stateBeforeMove, action, turnIndexBeforeMove);
        if (angular.equals(move, expectedMove)) {
            return true;
        }
        return false;
    }
    gameLogic.isMoveOk = isMoveOk;
})(gameLogic || (gameLogic = {}));
