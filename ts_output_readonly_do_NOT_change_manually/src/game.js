var game;
(function (game) {
    var animationEnded = false;
    var canMakeMove = false;
    var isComputerTurn = false;
    // let lastUpdateUI: IUpdateUI = null;
    game.isHelpModalShown = false;
    var state = null;
    var turnIndex = null;
    var isInline = false;
    var isBroadside = false;
    var deltas = [];
    var movedDeltas = [];
    // let action: Action = null;
    function init() {
        console.log("Translation of 'RULES_OF_ABALONE' is " + translate('RULES_OF_ABALONE'));
        resizeGameAreaService.setWidthToHeight(1);
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
    function abs(i) {
        if (i >= 0)
            return i;
        return -i;
    }
    function cellClicked(row, col) {
        log.info("Clicked on cell:", row, col);
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!canMakeMove) {
            return;
        }
        try {
            if (row == 9 && col == 0) {
                isInline = true;
                isBroadside = false;
                deltas = [];
            }
            if (row == 9 && col == 1) {
                isBroadside = true;
                isInline = false;
                deltas = [];
            }
            if (row == 9 && col == 2) {
                isInline = false;
                isBroadside = false;
                deltas = [];
            }
            if (row == 9 && col == 3) {
                movedDeltas = [];
                var action = clickToAction();
                if (gameLogic.isStepValid(state, action, turnIndex)) {
                    var move = gameLogic.createMove(state, action, turnIndex);
                    canMakeMove = false;
                    gameService.makeMove(move);
                }
                isInline = false;
                isBroadside = false;
                deltas = [];
            }
            if (row < 9 && (isInline === true || isBroadside === true)) {
                var delta = { row: row, col: row % 2 + 2 * col };
                deltas.push(delta);
            }
        }
        catch (e) {
            log.info(["Illegal movement from", row, col]);
            return;
        }
    }
    game.cellClicked = cellClicked;
    // Convert what is clicked on to an Action
    function clickToAction() {
        // if (!stateBeforeMove || Object.keys(stateBeforeMove).length === 0) {
        //   stateBeforeMove = gameLogic.getInitialState();
        // }
        var currentPlayer = (turnIndex === 0) ? 'B' : 'W';
        var currentOpponent = (turnIndex === 0) ? 'W' : 'B';
        var action = { isInline: isInline, direction: { row: 0, col: 0 },
            selfMarbles: [], opponentMarbles: [] };
        if (isInline === true && deltas.length > 1) {
            action.direction.row = deltas[1].row - deltas[0].row;
            action.direction.col = deltas[1].col - deltas[0].col;
            action.selfMarbles.push(deltas[0]);
            var row_next = deltas[1].row;
            var col_next = deltas[1].col;
            while (row_next >= 0 && row_next <= 8 && col_next >= 0 && col_next <= 16) {
                var pos = { row: row_next, col: col_next };
                movedDeltas.push(pos);
                if (state.board[row_next][col_next] === '') {
                    movedDeltas.pop();
                }
                if (state.board[row_next][col_next] == currentPlayer) {
                    action.selfMarbles.push(pos);
                    row_next += action.direction.row;
                    col_next += action.direction.col;
                }
                else if (state.board[row_next][col_next] == currentOpponent) {
                    action.opponentMarbles.push(pos);
                    row_next += action.direction.row;
                    col_next += action.direction.col;
                }
                else
                    break;
            }
        }
        if (isBroadside === true && deltas.length > 1) {
            action.direction.row = deltas[1].row - deltas[0].row;
            action.direction.col = deltas[1].col - deltas[0].col;
            var i = 0;
            while (i + 2 <= deltas.length) {
                action.selfMarbles.push(deltas[i]);
                movedDeltas.push(deltas[i + 1]);
                i += 2;
            }
        }
        return action;
    }
    game.clickToAction = clickToAction;
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
    function getPieceKind(piece) {
        if (piece === 'B')
            return 'imgs/black.png';
        if (piece === 'W')
            return 'imgs/white.png';
        return '';
    }
    function getImageSrc(row, col) {
        var j = row % 2 + 2 * col;
        var cell = state.board[row][j];
        return getPieceKind(cell);
    }
    game.getImageSrc = getImageSrc;
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    translate.setLanguage('en', {
        RULES_OF_ABALONE: "Rules of Abalone",
        RULES_SLIDE1: "Each side has 14 marbles and takes turns to move; whoever first scores 6 points wins. Only in an inline move can one score 1 point by pushing the other's marble off board",
        RULES_SLIDE2: "Inline: Marbles in a line can be moved along the line by 1 step; at most 3 of your own marbles and less of your opponent's can be moved.",
        INLINE_MOVE: "Click on 'Inline Move' button; click on a marble to start and the next marble/position along the moving direction; submit move;",
        RULES_SLIDE3: "Broadside: Two to Three of your own marbles in a line can be moved to empty positions in a neighboring parallel line. ",
        BROADSIDE: "Click on 'Broad-side' button; for each marble to be moved, first click on the marble and then its new position; submit move;",
        CLOSE: "Close"
    });
    game.init();
});
