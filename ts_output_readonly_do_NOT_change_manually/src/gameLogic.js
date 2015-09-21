var gameLogic;
(function (gameLogic) {
    /** Returns the initial Abalone board called Belgian daisy, which is a 9x17 matrix
    containing 14 'B's(belonging to the black party), 14 'W's(belonging to the white party),
    'O' (open space that 'B' and 'W' can moved to), ''(space that does not exist in a physical board). */
    function getInitialBoard() {
        return [['', '', '', '', 'W', '', 'W', '', 'O', '', 'B', '', 'B', '', '', '', ''],
            ['', '', '', 'W', '', 'W', '', 'W', '', 'B', '', 'B', '', 'B', '', '', ''],
            ['', '', 'O', '', 'W', '', 'W', '', 'O', '', 'B', '', 'B', '', 'O', '', ''],
            ['', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', ''],
            ['O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O'],
            ['', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', ''],
            ['', '', 'O', '', 'B', '', 'B', '', 'O', '', 'W', '', 'W', '', 'O', '', ''],
            ['', '', '', 'B', '', 'B', '', 'B', '', 'W', '', 'W', '', 'W', '', '', ''],
            ['', '', '', '', 'B', '', 'B', '', 'O', '', 'W', '', 'W', '', '', '', '']];
    }
    gameLogic.getInitialBoard = getInitialBoard;
    function getWinner(state) {
        if (state.removedMarbles.black === 6)
            return 'W';
        if (state.removedMarbles.white === 6)
            return 'B';
        return '';
    }
    function abs(a) {
        if (a >= 0)
            return a;
        return -a;
    }
    // Check if a given state is valid
    function isStateValid(state) {
        var board = state.board;
        var numOfBs = 0, numOfWs = 0;
        var row = board.length;
        if (row !== 9)
            return false;
        for (var i = 0; i < row; i++) {
            if (board[i].length !== 17)
                return false;
            for (var j = abs(i - 4); j < 17 - abs(i - 4);) {
                var c = board[i][j];
                if (c !== 'O' || c !== 'B' || c !== 'W')
                    return false;
                if (c === 'B')
                    numOfBs++;
                if (c === 'W')
                    numOfWs++;
                board[i][j] = 'O';
                j += 2;
            }
        }
        if (numOfBs + state.removedMarbles.black !== 14
            || numOfWs + state.removedMarbles.white !== 14)
            return false;
        var board_const = [
            ['', '', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', '', '', ''],
            ['', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', '', ''],
            ['', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', ''],
            ['', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', ''],
            ['O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O'],
            ['', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', ''],
            ['', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', ''],
            ['', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', '', ''],
            ['', '', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', '', '', '']];
        if (board !== board_const)
            return false;
        return true;
    }
    function isDirectionValid(direction) {
        var directionSet = [{ row: 0, col: 2 }, { row: 0, col: -2 },
            { row: 1, col: 1 }, { row: -1, col: -1 }, { row: 1, col: -1 }, { row: -1, col: 1 }];
        for (var i = 0; i < directionSet.length; i++) {
            if (direction === directionSet[i])
                return true;
        }
        return false;
    }
    function isStepValid(board, action, turnIndexBeforeMove) {
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
            if (row < 0 || row > 8 || col < 0 || col > 16 ||
                board[row][col] !== (turnIndexBeforeMove === 0 ? 'B' : 'W'))
                throw new Error("You should move your own marbles!");
        }
        for (var i = 0; i < action.opponentMarbles.length; i++) {
            var row = action.opponentMarbles[i].row;
            var col = action.opponentMarbles[i].col;
            if (row < 0 || row > 8 || col < 0 || col > 16 ||
                board[row][col] !== (turnIndexBeforeMove === 0 ? 'W' : 'B'))
                throw new Error("You should push away your opponent's marbles!");
        }
        /* Check if the marbles to be moved are aligned in the same line and next to each other.
            Moreover, if it is an in-line move, we require that selfMarbles[0],selfMarbles[1],
            selfMarbles[2], opponentMarbles[0],opponentMarbles[1],removingMarble[0]
            are aligned along the moving direction.
        */
        if (!action.isInline) {
            if (action.opponentMarbles.length !== 0)
                throw new Error("Your cannot push away your opponent's marbles in a broadside move!");
            for (var i = 1; i < action.selfMarbles.length; i++) {
                var row_delta = action.selfMarbles[i].row - action.selfMarbles[i - 1].row;
                var col_delta = action.selfMarbles[i].col - action.selfMarbles[i - 1].col;
                var temp_direc = { row: row_delta, col: col_delta };
                if (!isDirectionValid(temp_direc))
                    throw new Error("Marbles should be neighbors to each other!");
            }
            for (var i = 0; i < action.selfMarbles.length; i++) {
                var row = action.selfMarbles[i].row + action.direction.row;
                var col = action.selfMarbles[i].col + action.direction.col;
                if (row < 0 || row > 8 || col < 0 || col > 16 || board[row][col] !== 'O')
                    throw new Error("You should move your marbles to open space!");
            }
        }
        if (action.isInline) {
            for (var i = 1; i < action.selfMarbles.length; i++) {
                var row = action.selfMarbles[i - 1].row + action.direction.row;
                var col = action.selfMarbles[i - 1].col + action.direction.col;
                if (row !== action.selfMarbles[i].row
                    || col !== action.selfMarbles[i].col)
                    throw new Error("Marbles should be neighbors to each other!");
            }
            var len = action.selfMarbles.length;
            var row = action.selfMarbles[len - 1].row + action.direction.row;
            var col = action.selfMarbles[len - 1].col + action.direction.col;
            if (row < 0 || row > 8 || col < 0 || col > 16)
                throw new Error("You cannot eject your own marbles!");
            len = action.opponentMarbles.length;
            if (len === 0 && board[row][col] !== 'O')
                throw new Error("You should move your marbles to open space!");
            if (len > 0 &&
                (action.opponentMarbles[0].row !== row || action.opponentMarbles[0].col !== col)) {
                throw new Error("Marbles should be neighbors to each other!");
            }
            if (len === 2) {
                var row_delta = action.opponentMarbles[1].row - action.opponentMarbles[0].row;
                var col_delta = action.opponentMarbles[1].col - action.opponentMarbles[0].col;
                if (row_delta !== action.direction.row
                    || col_delta !== action.direction.col)
                    throw new Error("Marbles should be neighbors to each other!");
            }
            if (len > 0) {
                row = action.opponentMarbles[len - 1].row + action.direction.row;
                col = action.opponentMarbles[len - 1].col + action.direction.col;
                if (row >= 0 && row <= 8 && col >= 0 && col <= 16
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
    function createMove(stateBeforeMove, action, turnIndexBeforeMove) {
        if (!stateBeforeMove) {
            // Initially (at the beginning of the match), the board in state is undefined.
            stateBeforeMove.board = getInitialBoard();
            stateBeforeMove.removedMarbles = { black: 0, white: 0 };
        }
        if (!isStateValid(stateBeforeMove))
            throw new Error("The given state is invalid");
        if (getWinner(stateBeforeMove) === 'B'
            || getWinner(stateBeforeMove) === 'W')
            throw new Error("Can only make a move if the game is not over!");
        if (!isStepValid(stateBeforeMove.board, action, turnIndexBeforeMove))
            throw new Error("Action is invalid and game is halted!");
        var stateAfterMove = angular.copy(stateBeforeMove);
        if (!action.isInline) {
            for (var i = 0; i < action.selfMarbles.length; i++) {
                var row = action.selfMarbles[i].row;
                var col = action.selfMarbles[i].col;
                stateAfterMove.board[row][col] = 'O';
                row += action.direction.row;
                col += action.direction.col;
                stateAfterMove.board[row][col] = turnIndexBeforeMove === 0 ? 'B' : 'W';
            }
        }
        if (action.isInline) {
            var row = action.selfMarbles[0].row;
            var col = action.selfMarbles[0].col;
            stateAfterMove.board[row][col] = 'O';
            for (var i = 0; i < action.selfMarbles.length; i++) {
                row = action.selfMarbles[i].row + action.direction.row;
                col = action.selfMarbles[i].col + action.direction.col;
                stateAfterMove.board[row][col] = turnIndexBeforeMove === 0 ? 'B' : 'W';
            }
            var len = action.opponentMarbles.length;
            if (len > 0) {
                row = action.opponentMarbles[len - 1].row + action.direction.row;
                col = action.opponentMarbles[len - 1].col + action.direction.col;
                if (row < 0 || row > 8 || col < 0 || col > 16) {
                    if (turnIndexBeforeMove === 0) {
                        stateAfterMove.removedMarbles.white++;
                    }
                    else
                        stateAfterMove.removedMarbles.black++;
                }
                else {
                    stateAfterMove.board[row][col] = turnIndexBeforeMove === 0 ? 'W' : 'B';
                }
                if (len === 2) {
                    row = action.opponentMarbles[1].row;
                    col = action.opponentMarbles[1].col;
                    stateAfterMove.board[row][col] = turnIndexBeforeMove === 0 ? 'W' : 'B';
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
        return [firstOperation,
            { set: { key: 'action', value: action } },
            { set: { key: 'state', value: stateAfterMove } }];
    }
    gameLogic.createMove = createMove;
    function isMoveOk(params) {
        var move = params.move;
        var turnIndexBeforeMove = params.turnIndexBeforeMove;
        var stateBeforeMove = params.stateBeforeMove;
        // The state and turn after move are not needed in Abalone (or in any game where all state is public).
        //var turnIndexAfterMove = params.turnIndexAfterMove;
        //var stateAfterMove = params.stateAfterMove;
        // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
        // to verify that move is legal.
        try {
            // Example move:
            // [{setTurn: {turnIndex : 1},
            //  {set: {key: 'board', value: [['X', '', ''], ['', '', ''], ['', '', '']]}},
            //  {set: {key: 'delta', value: {row: 0, col: 0}}}]
            var action = move[1].set.value;
            var expectedMove = createMove(stateBeforeMove, action, turnIndexBeforeMove);
            if (!angular.equals(move, expectedMove)) {
                return false;
            }
        }
        catch (e) {
            // if there are any exceptions then the move is illegal
            return false;
        }
        return true;
    }
    gameLogic.isMoveOk = isMoveOk;
})(gameLogic || (gameLogic = {}));
