var game;
(function (game) {
    var animationEnded = false;
    var canMakeMove = false;
    var isComputerTurn = false;
    var lastUpdateUI = null;
    game.isHelpModalShown = false;
    var state = null;
    var turnIndex = null;
    var action = null;
    // let setMove: boolean = false;
    var clickCounter = 0;
    var deltaFrom = { row: 1, col: -1 };
    var direction = { row: 0, col: 0 };
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
        lastUpdateUI = params;
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
            if (clickCounter === 0) {
                // deltaFrom.row = -1;
                // deltaFrom.col = -1;
                // direction.row = 0;
                // direction.col = 0;
                action = null;
                deltaFrom.row = row;
                deltaFrom.col = row % 2 + 2 * col;
                clickCounter++;
                return;
            }
            else if (clickCounter === 1) {
                clickCounter = 0;
                direction.row = row - deltaFrom.row;
                direction.col = row % 2 + 2 * col - deltaFrom.col;
                var selfMarbles = [deltaFrom];
                action = { isInline: true, direction: direction,
                    selfMarbles: selfMarbles, opponentMarbles: [] };
                var move = gameLogic.createMove(state, action, lastUpdateUI.turnIndexAfterMove);
                canMakeMove = false; // to prevent making another move
                gameService.makeMove(move);
            }
            else {
                throw new Error("something is wrong");
            }
        }
        catch (e) {
            log.info(["Illegal movement from", row, col]);
            return;
        }
    }
    game.cellClicked = cellClicked;
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
    function isPieceW(row, col) {
        var j = row % 2 + 2 * col;
        return state.board[row][j] === 'W';
    }
    game.isPieceW = isPieceW;
    function shouldSlowlyAppear(row, col) {
        return !animationEnded &&
            state.blackRemoved &&
            shouldShowImage(row, col);
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
    function getImageSrc(row, col) {
        var j = row % 2 + 2 * col;
        var cell = state.board[row][j];
        return getPieceKind(cell);
    }
    game.getImageSrc = getImageSrc;
    function getPieceKind(piece) {
        if (piece === 'B')
            return 'imgs/black.png';
        if (piece === 'W')
            return 'imgs/white.png';
        return '';
    }
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    translate.setLanguage('en', {
        RULES_OF_ABALONE: "Rules of Abalone",
        RULES_SLIDE1: "Each side has 14 marbles and takes turns to move; whoever first removes 6 of the opponent's marbles wins.",
        RULES_SLIDE2: "Marbles in a line can be moved along the line by 1 step; at most 3 of your own marbles and less of your opponent's can be moved.",
        RULES_SLIDE3: "You can also move 2~3 of your own marbles in a line to open space in a neighbor parallel line. ",
        CLOSE: "Close"
    });
    game.init();
});
