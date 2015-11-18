module game {
  let animationEnded = false;
  let canMakeMove = false;
  let isComputerTurn = false;
  // let lastUpdateUI: IUpdateUI = null;
  export let isHelpModalShown: boolean = false;

  interface WidthHeight {
      width: number;
      height: number;
  }
  interface TopLeft {
      top: number;
      left: number;
  }

  let state: IState = null;
  let turnIndex: number = null;
  let isInline: boolean = null;
  // let isBroadside: boolean = false;
  let direction: BoardDelta = {row: 10, col: 0};
  let selfMarbles: BoardDelta[] = [];
  let movedDeltas: BoardDelta[] = [];
  // let action: Action = null;
  let readyToSubmit: boolean = false;

  let gameArea: HTMLElement;
  let draggingLines: HTMLElement;
  let verticalDraggingLine: HTMLElement;
  let horizontalDraggingLine: HTMLElement;
  let clickToDragPiece: HTMLElement;
  let clickToSubmit: HTMLElement;


  export function init() {
    console.log("Translation of 'RULES_OF_ABALONE' is " + translate('RULES_OF_ABALONE'));
    resizeGameAreaService.setWidthToHeight(6/5);
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
    gameService.makeMove(
      aiService.createComputerMove(state, turnIndex, {millisecondsLimit: 1000}));
  }

  function updateUI(params: IUpdateUI): void {
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
    canMakeMove = params.turnIndexAfterMove >= 0 && // game is ongoing
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

  export function handleDragEvent(type: string, clientX: number, clientY: number): void {
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
    let row = Math.floor(11 * y / gameArea.clientHeight) - 1;
    let col = 0;
    if (row % 2 == 0) {
      col = Math.floor((x - 0.095 * gameArea.clientWidth)/ (0.09 * gameArea.clientWidth));
    } else if (row < 9) {
      col = Math.floor((x - 0.14 * gameArea.clientWidth)/ (0.09 * gameArea.clientWidth));
    } else if (x > 0.85 * gameArea.clientWidth) {
      col = 9;
    }

    if (row < 9){
      // draggingLines.style.display = "inline";
      if (isValidMarblePosition(row, col)) {
        clickToDragPiece.style.display = "inline";
      }
      let centerXY = getSquareCenterXY(row, col);
      verticalDraggingLine.setAttribute("x1",  centerXY.width.toString());
      verticalDraggingLine.setAttribute("x2",  centerXY.width.toString());
      horizontalDraggingLine.setAttribute("y1", centerXY.height.toString());
      horizontalDraggingLine.setAttribute("y2", centerXY.height.toString());

      //  clickToDragPiece.style.left = topLeft.left + "px";
      let top: number = 9.1 * (row + 1);
      clickToDragPiece.style.top = top.toString() + "%";
      // clickToDragPiece.setAttribute("top", top.toString() +"%");
      let left: number = 9.5 + 9 * col;
      if (row % 2 === 1) {
        left += 4.5;
      }
      clickToDragPiece.style.left = left.toString() + "%";
            // clickToDragPiece.setAttribute("left", left.toString() +"%");
    } else if (row == 9 && col == 9) {
      readyToSubmit = true;
      clickToSubmit.style.display = "inline";

    }

    if (type === "touchstart" && isValidStartPosition(row, col)) {
        let delta: BoardDelta = {row: row, col: row % 2 + 2 * col};
        selfMarbles.push(delta);
    } else if (type === "touchend") {
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
    // log.info(["touch end at", row, col]);
   }
 }


function setDirection(row: number, col: number): void {
  let j = row % 2 + 2 * col;
  if (selfMarbles.length === 0) return;
  let len = selfMarbles.length;
  let row_1 = row - selfMarbles[len - 1].row;
  let col_1 = j - selfMarbles[len - 1].col;
  let scalar: number = (abs(row_1) + abs(col_1)) / 2;
  // the touch direction is invalid
  if (row_1 % scalar !== 0 || col_1 % scalar !== 0){
    selfMarbles.pop();
    return;
  }
  row_1 = row_1 / scalar;
  col_1 = col_1 / scalar;
  if (row_1 !== direction.row || col_1 !== direction.col) {
    let currStart: BoardDelta = selfMarbles[len - 1];
    selfMarbles = [currStart];
    direction = {row: row_1, col: col_1};
    row_1 = selfMarbles[0].row + direction.row;
    col_1 = selfMarbles[0].col + direction.col;
    if (state.board[row_1][col_1] === 'O') {
      isInline = false;
    } else {
      isInline = true;
    }
  } else if (isInline === true) {
    selfMarbles = [selfMarbles[len - 1]];
  }
}

function submitMove(): void {
  if (!canMakeMove) {
    return;
  }
  try {
   movedDeltas = [];
   let action: Action = touchToAction();
  //  log.info(["try to make a move"]);
   let move = gameLogic.createMove (state, action, turnIndex);
   canMakeMove = false;
   gameService.makeMove(move);
 }catch (e) {
     if (isInline === true && selfMarbles.length > 0) {
       log.info(["Illegal inline movement from", selfMarbles[0].row, selfMarbles[0].col]);
     } else if (isInline === false && selfMarbles.length > 0) {
       log.info(["Illegal broadside movement from", selfMarbles[0].row, selfMarbles[0].col]);
    } else log.info(["Illegal movement"]);
 }
 isInline = null;
 direction = {row: 10, col: 0};
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

  function getSquareCenterXY(row: number, col: number): WidthHeight {
    let boardHeight: number = gameArea.clientHeight;
    let boardWidth: number = gameArea.clientWidth;
    let height = 0.091 * boardHeight * (row + 1) + boardHeight * 0.045;
    let width = 0.14 * boardWidth + 0.09 * boardWidth * col + 0.045 * boardWidth * (row % 2) ;
    return {width: width, height: height};
  }

  function getSquareTopLeft(row: number, col: number): TopLeft {
    let boardHeight: number = gameArea.clientHeight;
    let boardWidth: number = gameArea.clientWidth;
    let height = 0.091 * boardHeight * (row + 1);
    let width = 0.095 * boardWidth + 0.09 * boardWidth * col + 0.045 * boardWidth * (row % 2) ;
    return {top: width, left: height};
  }

  function abs(i: number): number{
    if(i >= 0) return i;
    return -i;
  }

  export function touchToAction() : Action {
     let currentPlayer: string = (turnIndex === 0)? 'B' : 'W';
     let currentOpponent: string = (turnIndex === 0)? 'W' : 'B';
     let action : Action = {isInline: isInline, direction: direction,
     selfMarbles: [], opponentMarbles: []};
     if (isInline === true && selfMarbles.length > 0) {
       action.selfMarbles.push(selfMarbles[0]);
       let row_next = selfMarbles[0].row + direction.row;
       let col_next = selfMarbles[0].col + direction.col;
       while(row_next >= 0 && row_next <= 8 && col_next >= 0 && col_next <= 16) {
         let pos: BoardDelta = {row: row_next, col: col_next};
         movedDeltas.push(pos);
         if (state.board[row_next][col_next] === '') {
           movedDeltas.pop();
         }
         if(state.board[row_next][col_next] == currentPlayer) {
           action.selfMarbles.push(pos);
           row_next += direction.row;
           col_next += direction.col;
         } else if (state.board[row_next][col_next] == currentOpponent) {
           action.opponentMarbles.push(pos);
           row_next += direction.row;
           col_next += direction.col;
         } else break;
       }
     }
     if (isInline === false && selfMarbles.length > 0) {
       for (let i = 0; i < selfMarbles.length; i++) {
         action.selfMarbles.push(selfMarbles[i]);
         let row_next = selfMarbles[i].row + direction.row;
         let col_next = selfMarbles[i].col + direction.col;
         movedDeltas.push({row: row_next, col: col_next});
       }
     }
     return action;
  }

  function isValidStartPosition(row: number, col: number): boolean {
    let j: number = row % 2 + 2 * col;
    if (row < 0 || row > 8 || j < 0 || j > 16)
      return false;
    return state.board[row][j] === (turnIndex === 0? 'B' : 'W');
  }

  function isValidMarblePosition(row: number, col: number): boolean {
    let j: number = row % 2 + 2 * col;
    if (row < 0 || row > 8 || j < 0 || j > 16 || state.board[row][j] === '')
      return false;
    return true;
  }
  export function shouldShowImage(row: number, col: number): boolean {
    let j: number = row % 2 + 2 * col;
    let cell = state.board[row][j];
    if (cell === 'B' || cell === 'W')
      return true;
    return false;
  }

  export function isPieceB(row: number, col: number): boolean {
    let j: number = row % 2 + 2 * col;
    return state.board[row][j] === 'B';
  }

  export function isEmpty(row: number, col: number): boolean {
    let j: number = row % 2 + 2 * col;
    return state.board[row][j] === 'O';
  }

  export function isBsTurn(): boolean {
    return turnIndex === 0;
  }

  export function blackWin(): boolean {
    return state.whiteRemoved === 6;
  }

  export function blackRemoved(): number {
    return state.blackRemoved;
  }

  export function isPieceW(row: number, col: number): boolean {
    let j: number = row % 2 + 2 * col;
    return state.board[row][j] === 'W';
  }

  export function isWsTurn(): boolean {
    return turnIndex === 1;
  }
  export function whiteWin(): boolean {
    return state.blackRemoved === 6;
  }

  export function whiteRemoved(): number {
    return state.whiteRemoved;
  }
  export function shouldSlowlyAppear(row: number, col: number): boolean {
    let flag: boolean = false;
    let j: number = row % 2 + 2 * col;
    for (let i = 0; i < movedDeltas.length; i++) {
      if(movedDeltas[i].row === row && movedDeltas[i].col === j) {
        flag = true;
        break;
      }
    }
    return !animationEnded && flag && shouldShowImage(row, col);
  }
}

angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
  .run(function () {
  $rootScope['game'] = game;
  translate.setLanguage('en',  {
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
