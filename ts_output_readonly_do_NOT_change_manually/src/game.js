var game;
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
        else if (x > 0.91 * gameArea.clientWidth) {
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
        if (selfMarbles.length === 0)
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
        RULES_SLIDE1: "Each side has 14 marbles and takes turns to move; whoever first scores 6 points wins. Only in an inline move can one score 1 point by pushing the other's marble off board",
        RULES_SLIDE2: "Inline: You can use n (= 2,3) of your marbles to push against m < n of your opponent's; all moved pieces are required to be neighbors in a line. If you push your opponent's piece off board, you score 1 point.",
        RULES_SLIDE3: "Broadside: You can move 1 to 3 of your marbles that are neighbors in a line to empty positions in a neighboring parallel line. ",
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
