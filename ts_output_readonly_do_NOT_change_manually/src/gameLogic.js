var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 9;
    gameLogic.COLS = 17;
    gameLogic.DIREC = [{ row: 0, col: 2 }, { row: 1, col: -1 },
        { row: 1, col: 1 }, { row: 0, col: -2 }, { row: -1, col: 1 }, { row: -1, col: -1 }];
    gameLogic.PLACES = [{ row: 0, col: 4 }, { row: 0, col: 6 }, { row: 0, col: 8 },
        { row: 0, col: 10 }, { row: 0, col: 12 }, { row: 1, col: 3 }, { row: 1, col: 5 }, { row: 1, col: 7 },
        { row: 1, col: 9 }, { row: 1, col: 11 }, { row: 1, col: 13 }, { row: 2, col: 2 }, { row: 2, col: 4 },
        { row: 2, col: 6 }, { row: 2, col: 8 }, { row: 2, col: 10 }, { row: 2, col: 12 }, { row: 2, col: 14 },
        { row: 3, col: 1 }, { row: 3, col: 3 }, { row: 3, col: 5 }, { row: 3, col: 7 },
        { row: 3, col: 9 }, { row: 3, col: 11 }, { row: 3, col: 13 }, { row: 3, col: 15 },
        { row: 4, col: 0 }, { row: 4, col: 2 }, { row: 4, col: 4 }, { row: 4, col: 6 }, { row: 4, col: 8 },
        { row: 4, col: 10 }, { row: 4, col: 12 }, { row: 4, col: 14 }, { row: 4, col: 16 },
        { row: 5, col: 1 }, { row: 5, col: 3 }, { row: 5, col: 5 }, { row: 5, col: 7 },
        { row: 5, col: 9 }, { row: 5, col: 11 }, { row: 5, col: 13 }, { row: 5, col: 15 },
        { row: 6, col: 2 }, { row: 6, col: 4 }, { row: 6, col: 6 }, { row: 6, col: 8 }, { row: 6, col: 10 },
        { row: 6, col: 12 }, { row: 6, col: 14 },
        { row: 7, col: 3 }, { row: 7, col: 5 }, { row: 7, col: 7 },
        { row: 7, col: 9 }, { row: 7, col: 11 }, { row: 7, col: 13 },
        { row: 8, col: 4 }, { row: 8, col: 6 }, { row: 8, col: 8 },
        { row: 8, col: 10 }, { row: 8, col: 12 }];
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
            // let i = place['row'];
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
        board[7][11] = 'W';
        board[7][13] = 'W';
        board[8][4] = 'B';
        board[8][6] = 'B';
        board[8][10] = 'W';
        board[8][12] = 'W';
        return board;
    }
    gameLogic.getInitialBoard = getInitialBoard;
    function getInitialState() {
        var initialBoard = getInitialBoard();
        var initialState = { board: initialBoard, isInitialState: true, blackRemoved: 0, whiteRemoved: 0 };
        return initialState;
    }
    gameLogic.getInitialState = getInitialState;
    function getWinner(state) {
        if (state.blackRemoved === 6)
            return 'W';
        if (state.whiteRemoved === 6)
            return 'B';
        return '';
    }
    gameLogic.getWinner = getWinner;
    //Check if a given state is valid
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
        if (numOfBs + state.blackRemoved !== 14
            || numOfWs + state.whiteRemoved !== 14)
            return false;
        var emptyboard = getEmptyBoard();
        if (!angular.equals(board, emptyboard))
            return false;
        return true;
    }
    function isDirectionValid(direction) {
        for (var _i = 0; _i < gameLogic.DIREC.length; _i++) {
            var direction_pattern = gameLogic.DIREC[_i];
            if (angular.equals(direction, direction_pattern))
                return true;
        }
        return false;
    }
    function isStepValid(stateBeforeMove, action, turnIndexBeforeMove) {
        var board = stateBeforeMove.board;
        if (action.selfMarbles.length > 3 || action.selfMarbles.length === 0)
            return false;
        if (action.selfMarbles.length <= action.opponentMarbles.length)
            return false;
        if (!isDirectionValid(action.direction))
            return false;
        // check the color of the marbles to be moved
        for (var i = 0; i < action.selfMarbles.length; i++) {
            var row = action.selfMarbles[i].row;
            var col = action.selfMarbles[i].col;
            if (row < 0 || row >= gameLogic.ROWS || col < 0 || col >= gameLogic.COLS
                || board[row][col] !== (turnIndexBeforeMove === 0 ? 'B' : 'W'))
                return false;
        }
        for (var i = 0; i < action.opponentMarbles.length; i++) {
            var row = action.opponentMarbles[i].row;
            var col = action.opponentMarbles[i].col;
            if (row < 0 || row >= gameLogic.ROWS || col < 0 || col >= gameLogic.COLS
                || board[row][col] !== (turnIndexBeforeMove === 0 ? 'W' : 'B'))
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
            for (var i = 0; i < action.selfMarbles.length; i++) {
                var row = action.selfMarbles[i].row + action.direction.row;
                var col = action.selfMarbles[i].col + action.direction.col;
                if (row < 0 || row >= gameLogic.ROWS || col < 0 || col >= gameLogic.COLS || board[row][col] !== 'O')
                    return false;
            }
            var temp_direc1;
            if (action.selfMarbles.length > 1) {
                var row_delta1 = action.selfMarbles[1].row - action.selfMarbles[0].row;
                var col_delta1 = action.selfMarbles[1].col - action.selfMarbles[0].col;
                temp_direc1 = { row: row_delta1, col: col_delta1 };
                if (!isDirectionValid(temp_direc1))
                    return false;
            }
            if (action.selfMarbles.length === 3) {
                var row_delta2 = action.selfMarbles[2].row - action.selfMarbles[1].row;
                var col_delta2 = action.selfMarbles[2].col - action.selfMarbles[1].col;
                var temp_direc2 = { row: row_delta2, col: col_delta2 };
                if (!angular.equals(temp_direc1, temp_direc2))
                    return false;
            }
        }
        if (action.isInline) {
            for (var i = 1; i < action.selfMarbles.length; i++) {
                var row_1 = action.selfMarbles[i - 1].row + action.direction.row;
                var col_1 = action.selfMarbles[i - 1].col + action.direction.col;
                if (row_1 !== action.selfMarbles[i].row
                    || col_1 !== action.selfMarbles[i].col)
                    return false;
            }
            var len = action.selfMarbles.length;
            var row = action.selfMarbles[len - 1].row + action.direction.row;
            var col = action.selfMarbles[len - 1].col + action.direction.col;
            len = action.opponentMarbles.length;
            if (row < 0 || row >= gameLogic.ROWS || col < 0 || col >= gameLogic.COLS ||
                (len === 0 && board[row][col] !== 'O'))
                return false;
            if (len > 0 &&
                (action.opponentMarbles[0].row !== row || action.opponentMarbles[0].col !== col)) {
                return false;
            }
            if (len === 2) {
                var row_delta = action.opponentMarbles[1].row - action.opponentMarbles[0].row;
                var col_delta = action.opponentMarbles[1].col - action.opponentMarbles[0].col;
                if (row_delta !== action.direction.row || col_delta !== action.direction.col)
                    return false;
            }
            if (len > 0) {
                var row_2 = action.opponentMarbles[len - 1].row + action.direction.row;
                var col_2 = action.opponentMarbles[len - 1].col + action.direction.col;
                if (row_2 >= 0 && row_2 < gameLogic.ROWS && col_2 >= 0 && col_2 < gameLogic.COLS
                    && (board[row_2][col_2] === 'B' || board[row_2][col_2] === 'W'))
                    return false;
            }
        }
        return true;
    }
    gameLogic.isStepValid = isStepValid;
    /**
     * Returns the move that should be performed when player
     * with index turnIndexBeforeMove makes a move in cell row X col.
     */
    function createMove(stateBeforeMove, action, turnIndexBeforeMove) {
        if (!stateBeforeMove || Object.keys(stateBeforeMove).length === 0) {
            stateBeforeMove = getInitialState();
        }
        // if (!isStateValid(stateBeforeMove))
        //   throw new Error("The given state is invalid");
        if (getWinner(stateBeforeMove) === 'B'
            || getWinner(stateBeforeMove) === 'W')
            throw new Error("Can only make a move if the game is not over!");
        if (!isStepValid(stateBeforeMove, action, turnIndexBeforeMove))
            throw new Error("Action is invalid and game is halted!");
        var stateAfterMove = angular.copy(stateBeforeMove);
        if (stateAfterMove.isInitialState === true) {
            stateAfterMove.isInitialState = false;
        }
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
                if (row_3 < 0 || row_3 >= gameLogic.ROWS || col_3 < 0 || col_3 >= gameLogic.COLS || stateBeforeMove.board[row_3][col_3] === 'O') {
                    stateAfterMove.board[row_3][col_3] = (turnIndexBeforeMove === 0 ? 'W' : 'B');
                }
                else {
                    if (turnIndexBeforeMove === 0)
                        stateAfterMove.whiteRemoved++;
                    else
                        stateAfterMove.blackRemoved++;
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
            { set: { key: 'board', value: stateAfterMove.board } },
            { set: { key: 'isInitialState', value: stateAfterMove.isInitialState } },
            { set: { key: 'blackRemoved', value: stateAfterMove.blackRemoved } },
            { set: { key: 'whiteRemoved', value: stateAfterMove.whiteRemoved } },
            { set: { key: 'action', value: action } }];
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
        try {
            var action = move[5].set.value;
            var expectedMove = createMove(stateBeforeMove, action, turnIndexBeforeMove);
            if (angular.equals(move, expectedMove)) {
                return true;
            }
        }
        catch (e) {
            // if there are any exceptions then the move is illegal
            return false;
        }
        return false;
    }
    gameLogic.isMoveOk = isMoveOk;
})(gameLogic || (gameLogic = {}));
