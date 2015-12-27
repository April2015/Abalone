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
        if (!isStateValid(stateBeforeMove))
            throw new Error("The given state is invalid");
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
                if (row_3 >= 0 && row_3 < gameLogic.ROWS && col_3 >= 0 && col_3 < gameLogic.COLS && stateBeforeMove.board[row_3][col_3] === 'O') {
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
;var game;
(function (game) {
    var animationEnded = false;
    var canMakeMove = false;
    var isComputerTurn = false;
    // let lastUpdateUI: IUpdateUI = null;
    game.isHelpModalShown = false;
    var state = null;
    var turnIndex = null;
    var isInline = null;
    // let isBroadside: boolean = false;
    var direction = { row: 10, col: 0 };
    var selfMarbles = [];
    var movedDeltas = [];
    // let action: Action = null;
    var readyToSubmit = false;
    var gameArea;
    var draggingLines;
    var verticalDraggingLine;
    var horizontalDraggingLine;
    var clickToDragPiece;
    var clickToSubmit;
    function init() {
        console.log("Translation of 'RULES_OF_ABALONE' is " + translate('RULES_OF_ABALONE'));
        resizeGameAreaService.setWidthToHeight(6 / 5);
        gameService.setGame({
            minNumberOfPlayers: 2,
            maxNumberOfPlayers: 2,
            isMoveOk: gameLogic.isMoveOk,
            updateUI: updateUI
        });
        // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
        document.addEventListener("animationend", animationEndedCallback, false); // standard
        document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
        document.addEventListener("oanimationend", animationEndedCallback, false); // Opera
        dragAndDropService.addDragListener("gameArea", handleDragEvent);
    }
    game.init = init;
    function animationEndedCallback() {
        $rootScope.$apply(function () {
            log.info("Animation ended");
            animationEnded = true;
            if (isComputerTurn) {
                sendComputerMove();
            }
        });
    }
    function sendComputerMove() {
        gameService.makeMove(aiService.createComputerMove(state, turnIndex, { millisecondsLimit: 1000 }));
    }
    function updateUI(params) {
        log.info("Game got updateUI:", params);
        animationEnded = false;
        // lastUpdateUI = params;
        state = params.stateAfterMove;
        // if (!state.board) {
        //   state.board = gameLogic.getInitialBoard();
        // }
        if (!state.board) {
            state = gameLogic.getInitialState();
        }
        canMakeMove = params.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
        turnIndex = params.turnIndexAfterMove;
        // Is it the computer's turn?
        isComputerTurn = canMakeMove &&
            params.playersInfo[params.yourPlayerIndex].playerId === '';
        if (isComputerTurn) {
            // To make sure the player won't click something and send a move instead of the computer sending a move.
            canMakeMove = false;
            // We calculate the AI move only after the animation finishes,
            // because if we call aiService now
            // then the animation will be paused until the javascript finishes.
            if (state.isInitialState === true) {
                //   // This is the first move in the match, so
                //   // there is not going to be an animation, so
                //   // call sendComputerMove() now (can happen in ?onlyAIs mode)
                sendComputerMove();
            }
        }
    }
    function handleDragEvent(type, clientX, clientY) {
        gameArea = document.getElementById("gameArea");
        draggingLines = document.getElementById("draggingLines");
        verticalDraggingLine = document.getElementById("verticalDraggingLine");
        horizontalDraggingLine = document.getElementById("horizontalDraggingLine");
        clickToDragPiece = document.getElementById("clickToDragPiece");
        clickToSubmit = document.getElementById("clickToSubmit");
        var x = clientX - gameArea.offsetLeft;
        var y = clientY - gameArea.offsetTop;
        // is outside gameArea?
        if (x < 0 || y < 0 || x >= gameArea.clientWidth || y >= gameArea.clientHeight) {
            draggingLines.style.display = "none";
            clickToDragPiece.style.display = "none";
            clickToSubmit.style.display = "none";
            return;
        }
        // Inside gameArea. Let's find the containing board's row and col
        var row = Math.floor(11 * y / gameArea.clientHeight) - 1;
        var col = 0;
        if (row % 2 == 0) {
            col = Math.floor((x - 0.095 * gameArea.clientWidth) / (0.09 * gameArea.clientWidth));
        }
        else if (row < 9) {
            col = Math.floor((x - 0.14 * gameArea.clientWidth) / (0.09 * gameArea.clientWidth));
        }
        else if (x > 0.85 * gameArea.clientWidth) {
            col = 9;
        }
        if (row < 9) {
            // draggingLines.style.display = "inline";
            if (isValidMarblePosition(row, col)) {
                clickToDragPiece.style.display = "inline";
            }
            var centerXY = getSquareCenterXY(row, col);
            verticalDraggingLine.setAttribute("x1", centerXY.width.toString());
            verticalDraggingLine.setAttribute("x2", centerXY.width.toString());
            horizontalDraggingLine.setAttribute("y1", centerXY.height.toString());
            horizontalDraggingLine.setAttribute("y2", centerXY.height.toString());
            //  clickToDragPiece.style.left = topLeft.left + "px";
            var top_1 = 9.1 * (row + 1);
            clickToDragPiece.style.top = top_1.toString() + "%";
            // clickToDragPiece.setAttribute("top", top.toString() +"%");
            var left = 9.5 + 9 * col;
            if (row % 2 === 1) {
                left += 4.5;
            }
            clickToDragPiece.style.left = left.toString() + "%";
        }
        else if (row == 9 && col == 9) {
            readyToSubmit = true;
            clickToSubmit.style.display = "inline";
        }
        if (type === "touchstart" && isValidStartPosition(row, col)) {
            var delta = { row: row, col: row % 2 + 2 * col };
            selfMarbles.push(delta);
        }
        else if (type === "touchend") {
            if (row < 9) {
                setDirection(row, col);
            }
            if (row === 9 && col === 9 && readyToSubmit === true) {
                submitMove();
                // log.info(["submitMove at row, col:", row, col]);
                readyToSubmit = false;
            }
        }
        if (type === "touchend" || type === "touchcancel" || type === "touchleave" || type === "mouseup") {
            draggingLines.style.display = "none";
            clickToDragPiece.style.display = "none";
            clickToSubmit.style.display = "none";
        }
    }
    game.handleDragEvent = handleDragEvent;
    function setDirection(row, col) {
        var j = row % 2 + 2 * col;
        if (selfMarbles.length === 0 || !state || !state.board)
            return;
        var len = selfMarbles.length;
        var row_1 = row - selfMarbles[len - 1].row;
        var col_1 = j - selfMarbles[len - 1].col;
        var scalar = (abs(row_1) + abs(col_1)) / 2;
        // the touch direction is invalid
        if (row_1 % scalar !== 0 || col_1 % scalar !== 0) {
            selfMarbles.pop();
            return;
        }
        row_1 = row_1 / scalar;
        col_1 = col_1 / scalar;
        if (row_1 !== direction.row || col_1 !== direction.col) {
            var currStart = selfMarbles[len - 1];
            selfMarbles = [currStart];
            direction = { row: row_1, col: col_1 };
            row_1 = selfMarbles[0].row + direction.row;
            col_1 = selfMarbles[0].col + direction.col;
            if (state.board[row_1][col_1] === 'O') {
                isInline = false;
            }
            else {
                isInline = true;
            }
        }
        else if (isInline === true) {
            selfMarbles = [selfMarbles[len - 1]];
        }
    }
    function submitMove() {
        if (!canMakeMove) {
            return;
        }
        try {
            movedDeltas = [];
            var action = touchToAction();
            //  log.info(["try to make a move"]);
            var move = gameLogic.createMove(state, action, turnIndex);
            canMakeMove = false;
            gameService.makeMove(move);
        }
        catch (e) {
            if (isInline === true && selfMarbles.length > 0) {
                log.info(["Illegal inline movement from", selfMarbles[0].row, selfMarbles[0].col]);
            }
            else if (isInline === false && selfMarbles.length > 0) {
                log.info(["Illegal broadside movement from", selfMarbles[0].row, selfMarbles[0].col]);
            }
            else
                log.info(["Illegal movement"]);
        }
        isInline = null;
        direction = { row: 10, col: 0 };
        selfMarbles = [];
    }
    // function submitMove(): void {
    //   if (!canMakeMove) {
    //     return;
    //   }
    //   try {
    //    movedDeltas = [];
    //    let action: Action = touchToAction();
    //   //  log.info(["try to make a move"]);
    //    if (gameLogic.isStepValid(state, action, turnIndex)) {
    //      let move = gameLogic.createMove (state, action, turnIndex);
    //      canMakeMove = false;
    //      gameService.makeMove(move);
    //    }
    //    isInline = null;
    //    direction = {row: 10, col: 0};
    //    selfMarbles = [];
    //  }catch (e) {
    //   //  log.info(["Illegal movement from", row, col]);
    //    return;
    //  }
    // }
    function getSquareCenterXY(row, col) {
        var boardHeight = gameArea.clientHeight;
        var boardWidth = gameArea.clientWidth;
        var height = 0.091 * boardHeight * (row + 1) + boardHeight * 0.045;
        var width = 0.14 * boardWidth + 0.09 * boardWidth * col + 0.045 * boardWidth * (row % 2);
        return { width: width, height: height };
    }
    function getSquareTopLeft(row, col) {
        var boardHeight = gameArea.clientHeight;
        var boardWidth = gameArea.clientWidth;
        var height = 0.091 * boardHeight * (row + 1);
        var width = 0.095 * boardWidth + 0.09 * boardWidth * col + 0.045 * boardWidth * (row % 2);
        return { top: width, left: height };
    }
    function abs(i) {
        if (i >= 0)
            return i;
        return -i;
    }
    function touchToAction() {
        var currentPlayer = (turnIndex === 0) ? 'B' : 'W';
        var currentOpponent = (turnIndex === 0) ? 'W' : 'B';
        var action = { isInline: isInline, direction: direction,
            selfMarbles: [], opponentMarbles: [] };
        if (isInline === true && selfMarbles.length > 0) {
            action.selfMarbles.push(selfMarbles[0]);
            var row_next = selfMarbles[0].row + direction.row;
            var col_next = selfMarbles[0].col + direction.col;
            while (row_next >= 0 && row_next <= 8 && col_next >= 0 && col_next <= 16) {
                var pos = { row: row_next, col: col_next };
                movedDeltas.push(pos);
                if (state.board[row_next][col_next] === '') {
                    movedDeltas.pop();
                }
                if (state.board[row_next][col_next] == currentPlayer) {
                    action.selfMarbles.push(pos);
                    row_next += direction.row;
                    col_next += direction.col;
                }
                else if (state.board[row_next][col_next] == currentOpponent) {
                    action.opponentMarbles.push(pos);
                    row_next += direction.row;
                    col_next += direction.col;
                }
                else
                    break;
            }
        }
        if (isInline === false && selfMarbles.length > 0) {
            for (var i = 0; i < selfMarbles.length; i++) {
                action.selfMarbles.push(selfMarbles[i]);
                var row_next = selfMarbles[i].row + direction.row;
                var col_next = selfMarbles[i].col + direction.col;
                movedDeltas.push({ row: row_next, col: col_next });
            }
        }
        return action;
    }
    game.touchToAction = touchToAction;
    function isValidStartPosition(row, col) {
        var j = row % 2 + 2 * col;
        if (row < 0 || row > 8 || j < 0 || j > 16)
            return false;
        return state.board[row][j] === (turnIndex === 0 ? 'B' : 'W');
    }
    function isValidMarblePosition(row, col) {
        var j = row % 2 + 2 * col;
        if (row < 0 || row > 8 || j < 0 || j > 16 || state.board[row][j] === '')
            return false;
        return true;
    }
    function shouldShowImage(row, col) {
        var j = row % 2 + 2 * col;
        var cell = state.board[row][j];
        if (cell === 'B' || cell === 'W')
            return true;
        return false;
    }
    game.shouldShowImage = shouldShowImage;
    function isPieceB(row, col) {
        var j = row % 2 + 2 * col;
        return state.board[row][j] === 'B';
    }
    game.isPieceB = isPieceB;
    function isEmpty(row, col) {
        var j = row % 2 + 2 * col;
        return state.board[row][j] === 'O';
    }
    game.isEmpty = isEmpty;
    function isBsTurn() {
        return turnIndex === 0;
    }
    game.isBsTurn = isBsTurn;
    function blackWin() {
        return state.whiteRemoved === 6;
    }
    game.blackWin = blackWin;
    function blackRemoved() {
        return state.blackRemoved;
    }
    game.blackRemoved = blackRemoved;
    function isPieceW(row, col) {
        var j = row % 2 + 2 * col;
        return state.board[row][j] === 'W';
    }
    game.isPieceW = isPieceW;
    function isWsTurn() {
        return turnIndex === 1;
    }
    game.isWsTurn = isWsTurn;
    function whiteWin() {
        return state.blackRemoved === 6;
    }
    game.whiteWin = whiteWin;
    function whiteRemoved() {
        return state.whiteRemoved;
    }
    game.whiteRemoved = whiteRemoved;
    function shouldSlowlyAppear(row, col) {
        var flag = false;
        var j = row % 2 + 2 * col;
        for (var i = 0; i < movedDeltas.length; i++) {
            if (movedDeltas[i].row === row && movedDeltas[i].col === j) {
                flag = true;
                break;
            }
        }
        return !animationEnded && flag && shouldShowImage(row, col);
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    translate.setLanguage('en', {
        RULES_OF_ABALONE: "Rules of Abalone",
        RULES_SLIDE1: "Each side has 14 marbles and takes turns to move with the black moving first. Whoever first pushes six of the opponent's marbles off board wins.",
        RULES_SLIDE2: "For each move, a player moves a line of one, two or three marbles one space. The move can be either broadside (parallel to the line of marbles) or in-line (serial in respect to the line of marbles)",
        RULES_SLIDE3: "Inline: With an in-line move one can push the opponent′s marbles in an adjacent space to their own; push is valid only if the pushing line has more marbles than the pushed line; marbles must be pushed into an open space or off the board. ",
        RULES_SLIDE4: "Broadside: You can move a line of 1-3 of your marbles parallelly to open space in a neighboring line. ",
        CLOSE: "Close"
    });
    game.init();
});
// click_version of the game
// module game {
//   let animationEnded = false;
//   let canMakeMove = false;
//   let isComputerTurn = false;
//   // let lastUpdateUI: IUpdateUI = null;
//   export let isHelpModalShown: boolean = false;
//
//   let state: IState = null;
//   let turnIndex: number = null;
//   let isInline: boolean = false;
//   let isBroadside: boolean = false;
//   let deltas: BoardDelta[] = [];
//   let movedDeltas: BoardDelta[] = [];
//   // let action: Action = null;
//
//   export function init() {
//     console.log("Translation of 'RULES_OF_ABALONE' is " + translate('RULES_OF_ABALONE'));
//     resizeGameAreaService.setWidthToHeight(1);
//     gameService.setGame({
//       minNumberOfPlayers: 2,
//       maxNumberOfPlayers: 2,
//       isMoveOk: gameLogic.isMoveOk,
//       updateUI: updateUI
//     });
//
//     // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
//     document.addEventListener("animationend", animationEndedCallback, false); // standard
//     document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
//     document.addEventListener("oanimationend", animationEndedCallback, false); // Opera
//   }
//
//   function animationEndedCallback() {
//     $rootScope.$apply(function () {
//       log.info("Animation ended");
//       animationEnded = true;
//       if (isComputerTurn) {
//         sendComputerMove();
//       }
//     });
//   }
//
//   function sendComputerMove() {
//     gameService.makeMove(
//       aiService.createComputerMove(state, turnIndex, {millisecondsLimit: 1000}));
//   }
//
//   function updateUI(params: IUpdateUI): void {
//     log.info("Game got updateUI:", params);
//     animationEnded = false;
//     // lastUpdateUI = params;
//     state = params.stateAfterMove;
//     // if (!state.board) {
//     //   state.board = gameLogic.getInitialBoard();
//     // }
//     if (!state.board) {
//       state = gameLogic.getInitialState();
//     }
//     canMakeMove = params.turnIndexAfterMove >= 0 && // game is ongoing
//       params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
//       turnIndex = params.turnIndexAfterMove;
//
//     // Is it the computer's turn?
//     isComputerTurn = canMakeMove &&
//         params.playersInfo[params.yourPlayerIndex].playerId === '';
//     if (isComputerTurn) {
//       // To make sure the player won't click something and send a move instead of the computer sending a move.
//       canMakeMove = false;
//       // We calculate the AI move only after the animation finishes,
//       // because if we call aiService now
//       // then the animation will be paused until the javascript finishes.
//       if (state.isInitialState === true) {
//       //   // This is the first move in the match, so
//       //   // there is not going to be an animation, so
//       //   // call sendComputerMove() now (can happen in ?onlyAIs mode)
//         sendComputerMove();
//       }
//     }
//   }
//
//   function abs(i: number): number{
//     if(i >= 0) return i;
//     return -i;
//   }
//
//   export function cellClicked(row: number, col: number): void {
//     log.info("Clicked on cell:", row, col);
//     if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
//       throw new Error("Throwing the error because URL has '?throwException'");
//     }
//     if (!canMakeMove) {
//       return;
//     }
//     try {
//       if (row == 9 && col == 0) {
//         isInline = true;
//         isBroadside = false;
//         deltas = [];
//       }
//       if (row == 9 && col == 1) {
//         isBroadside = true;
//         isInline = false;
//         deltas = [];
//       }
//       if (row == 9 && col == 2) {
//         isInline = false;
//         isBroadside = false;
//         deltas = [];
//       }
//       if (row == 9 && col == 3) {
//         movedDeltas = [];
//         let action: Action = clickToAction();
//         if (gameLogic.isStepValid(state, action, turnIndex)) {
//           let move = gameLogic.createMove (state, action, turnIndex);
//           canMakeMove = false;
//           gameService.makeMove(move);
//         }
//         isInline = false;
//         isBroadside = false;
//         deltas = [];
//       }
//       if (row < 9 && (isInline === true || isBroadside === true)) {
//         let delta: BoardDelta = {row: row, col: row % 2 + 2 * col};
//         deltas.push(delta);
//       }
//     } catch (e) {
//       log.info(["Illegal movement from", row, col]);
//       return;
//     }
//   }
//
//   // Convert what is clicked on to an Action
//   export function clickToAction() : Action {
//       // if (!stateBeforeMove || Object.keys(stateBeforeMove).length === 0) {
//       //   stateBeforeMove = gameLogic.getInitialState();
//       // }
//      let currentPlayer: string = (turnIndex === 0)? 'B' : 'W';
//      let currentOpponent: string = (turnIndex === 0)? 'W' : 'B';
//      let action : Action = {isInline: isInline, direction: {row: 0, col: 0},
//      selfMarbles: [], opponentMarbles: []};
//
//      if (isInline === true && deltas.length > 1) {
//        action.direction.row = deltas[1].row - deltas[0].row;
//        action.direction.col = deltas[1].col - deltas[0].col;
//        action.selfMarbles.push(deltas[0]);
//        let row_next = deltas[1].row;
//        let col_next = deltas[1].col;
//        while(row_next >= 0 && row_next <= 8 && col_next >= 0 && col_next <= 16) {
//          let pos: BoardDelta = {row: row_next, col: col_next};
//          movedDeltas.push(pos);
//          if (state.board[row_next][col_next] === '') {
//            movedDeltas.pop();
//          }
//          if(state.board[row_next][col_next] == currentPlayer) {
//            action.selfMarbles.push(pos);
//            row_next += action.direction.row;
//            col_next += action.direction.col;
//          } else if (state.board[row_next][col_next] == currentOpponent) {
//            action.opponentMarbles.push(pos);
//            row_next += action.direction.row;
//            col_next += action.direction.col;
//          } else break;
//        }
//      }
//
//      if (isBroadside === true && deltas.length > 1) {
//        action.direction.row = deltas[1].row - deltas[0].row;
//        action.direction.col = deltas[1].col - deltas[0].col;
//        let i = 0;
//        while (i + 2 <= deltas.length) {
//          action.selfMarbles.push(deltas[i]);
//          movedDeltas.push(deltas[i+1]);
//          i += 2;
//        }
//      }
//      return action;
//   }
//
//   export function shouldShowImage(row: number, col: number): boolean {
//     let j: number = row % 2 + 2 * col;
//     let cell = state.board[row][j];
//     if (cell === 'B' || cell === 'W')
//       return true;
//     return false;
//   }
//
//   export function isPieceB(row: number, col: number): boolean {
//     let j: number = row % 2 + 2 * col;
//     return state.board[row][j] === 'B';
//   }
//
//   export function isEmpty(row: number, col: number): boolean {
//     let j: number = row % 2 + 2 * col;
//     return state.board[row][j] === 'O';
//   }
//
//   export function isBsTurn(): boolean {
//     return turnIndex === 0;
//   }
//
//   export function blackWin(): boolean {
//     return state.whiteRemoved === 6;
//   }
//
//   export function blackRemoved(): number {
//     return state.blackRemoved;
//   }
//
//   export function isPieceW(row: number, col: number): boolean {
//     let j: number = row % 2 + 2 * col;
//     return state.board[row][j] === 'W';
//   }
//
//   export function isWsTurn(): boolean {
//     return turnIndex === 1;
//   }
//   export function whiteWin(): boolean {
//     return state.blackRemoved === 6;
//   }
//
//   export function whiteRemoved(): number {
//     return state.whiteRemoved;
//   }
//   export function shouldSlowlyAppear(row: number, col: number): boolean {
//     let flag: boolean = false;
//     let j: number = row % 2 + 2 * col;
//     for (let i = 0; i < movedDeltas.length; i++) {
//       if(movedDeltas[i].row === row && movedDeltas[i].col === j) {
//         flag = true;
//         break;
//       }
//     }
//     return !animationEnded && flag && shouldShowImage(row, col);
//   }
//
//   function getPieceKind(piece: string): string {
//     if(piece === 'B') return 'imgs/black.png';
//     if(piece === 'W') return 'imgs/white.png';
//     return '';
//   }
//
//  export function getImageSrc(row: number, col: number){
//    let j: number = row % 2 + 2 * col;
//    let cell = state.board[row][j];
//    return getPieceKind(cell);
//  }
//
//
// }
//
// angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
//   .run(function () {
//   $rootScope['game'] = game;
//   translate.setLanguage('en',  {
//     RULES_OF_ABALONE: "Rules of Abalone",
//     RULES_SLIDE1: "Each side has 14 marbles and takes turns to move; whoever first scores 6 points wins. Only in an inline move can one score 1 point by pushing the other's marble off board",
//     RULES_SLIDE2: "Inline: Marbles in a line can be moved along the line by 1 step; at most 3 of your own marbles and less of your opponent's can be moved.",
//     INLINE_MOVE: "Click on 'Inline Move' button; click on a marble to start and the next marble/position along the moving direction; submit move;",
//     RULES_SLIDE3: "Broadside: Two to Three of your own marbles in a line can be moved to empty positions in a neighboring parallel line. ",
//     BROADSIDE: "Click on 'Broad-side' button; for each marble to be moved, first click on the marble and then its new position; submit move;",
//     CLOSE: "Close"
//   });
//   game.init();
// });
;var aiService;
(function (aiService) {
    /** Returns the move that the computer player should do for the given updateUI. */
    // export function findComputerMove(updateUI: IUpdateUI): IMove {
    //   return createComputerMove(
    //       updateUI.stateAfterMove,
    //       updateUI.turnIndexAfterMove,
    //       // at most 1 second for the AI to choose a move (but might be much quicker)
    //       {millisecondsLimit: 1000})
    // }
    function getPossibleMoves(state, turnIndexBeforeMove) {
        var possibleMoves = [];
        var board = state.board;
        var BorW = (turnIndexBeforeMove === 0 ? 'B' : 'W');
        for (var _i = 0, _a = gameLogic.PLACES; _i < _a.length; _i++) {
            var delta = _a[_i];
            var i = delta.row;
            var j = delta.col;
            if (board[i][j] !== BorW) {
                continue;
            }
            for (var k = 0; k < 6; k++) {
                var direction = gameLogic.DIREC[k];
                var i0 = i;
                var j0 = j;
                var selfMarbles = [delta];
                for (var k_1 = 0; k_1 < 2; k_1++) {
                    i0 += direction.row;
                    j0 += direction.col;
                    if (i0 < 0 || i0 >= gameLogic.ROWS || j0 < 0 || j0 >= gameLogic.COLS
                        || board[i0][j0] !== BorW)
                        break;
                    selfMarbles.push({ row: i0, col: j0 });
                }
                var len = selfMarbles.length;
                // First find all valid inline moves
                i0 = i + len * direction.row;
                j0 = j + len * direction.col;
                var marbleOnEdge = (i0 < 0 || i0 >= gameLogic.ROWS || j0 < 0
                    || j0 >= gameLogic.COLS || board[i0][j0] === '' || board[i0][j0] === BorW);
                if (!marbleOnEdge) {
                    if (board[i0][j0] === 'O') {
                        var action = { isInline: true, direction: direction,
                            selfMarbles: selfMarbles, opponentMarbles: [] };
                        try {
                            possibleMoves.push(gameLogic.createMove(state, action, turnIndexBeforeMove));
                        }
                        catch (e) { }
                    }
                    if (board[i0][j0] === (turnIndexBeforeMove === 0 ? 'W' : 'B')) {
                        var opponentMarbles = [{ row: i0, col: j0 }];
                        i0 += direction.row;
                        j0 += direction.col;
                        if (i0 >= 0 && i0 < gameLogic.ROWS && j0 >= 0 && j0 < gameLogic.COLS
                            && board[i0][j0] === (turnIndexBeforeMove === 0 ? 'W' : 'B')) {
                            opponentMarbles.push({ row: i0, col: j0 });
                        }
                        var action = { isInline: true, direction: direction,
                            selfMarbles: selfMarbles, opponentMarbles: opponentMarbles };
                        try {
                            var move = gameLogic.createMove(state, action, turnIndexBeforeMove);
                            if (gameLogic.getWinner(move[2].set.value) !== '') {
                                possibleMoves = [move];
                                return possibleMoves;
                            }
                            possibleMoves.push(move);
                        }
                        catch (e) { }
                    }
                }
                // Second find all possible broadside moves.
                //It is enough to check 3 directions: [0, 2], [1, -1], [1, 1]
                if (len <= 1 || k > 2) {
                    continue;
                }
                for (; len >= 2;) {
                    for (var l = 0; l < 5; l++) {
                        if (l === k || l === k + 3) {
                            continue;
                        }
                        try {
                            var action = { isInline: false, direction: gameLogic.DIREC[l],
                                selfMarbles: selfMarbles, opponentMarbles: [] };
                            if (gameLogic.isStepValid(state, action, turnIndexBeforeMove)) {
                                possibleMoves.push(gameLogic.createMove(state, action, turnIndexBeforeMove));
                            }
                        }
                        catch (e) { }
                    }
                    if (len === 3) {
                        selfMarbles.pop();
                    }
                    len--;
                }
            }
        }
        return possibleMoves;
    }
    aiService.getPossibleMoves = getPossibleMoves;
    /**
     * Returns the move that the computer player should do for the given board.
     * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
     * and it has either a millisecondsLimit or maxDepth field:
     * millisecondsLimit is a time limit, and maxDepth is a depth limit.
     */
    // export function createComputerMove(
    //     state: IState, playerIndex: number, alphaBetaLimits: IAlphaBetaLimits): IMove {
    //   return alphaBetaService.alphaBetaDecision(
    //       [null, null, {set: {key: 'state', value: state}}],
    //       playerIndex, getNextStates, getStateScoreForIndex0,
    //       // If you want to see debugging output in the console, then surf to index.html?debug
    //       window.location.search === '?debug' ? getDebugStateToString : null,
    //       alphaBetaLimits);
    // }
    function createComputerMove(state, playerIndex, alphaBetaLimits) {
        var moves = getPossibleMoves(state, playerIndex);
        var len = moves.length;
        if (len == 0)
            return moves[0];
        var i = Math.floor(Math.random() * len);
        return moves[i];
    }
    aiService.createComputerMove = createComputerMove;
    // function getStateScoreForIndex0(move: IMove, playerIndex: number): number {
    //   if (move[0].endMatch) {
    //     let endMatchScores = move[0].endMatch.endMatchScores;
    //     return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
    //         : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
    //         : 0;
    //   }
    //   return 0;
    // }
    function getNextStates(move, playerIndex) {
        var stateAfterMove = { board: move[1].set.value, isInitialState: move[2].set.value,
            blackRemoved: move[3].set.value, whiteRemoved: move[4].set.value, action: move[5].set.value };
        return getPossibleMoves(stateAfterMove, playerIndex);
    }
    function getDebugStateToString(move) {
        return "\n" + move[4].set.value.join("\n") + "\n";
    }
})(aiService || (aiService = {}));
