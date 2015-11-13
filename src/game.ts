module game {
  let animationEnded = false;
  let canMakeMove = false;
  let isComputerTurn = false;
  // let lastUpdateUI: IUpdateUI = null;
  export let isHelpModalShown: boolean = false;

  let state: IState = null;
  let turnIndex: number = null;
  let isInline: boolean = false;
  let isBroadside: boolean = false;
  let deltas: BoardDelta[] = [];
  let action: Action = null;
  // let setMove: boolean = false;
  // let clickCounter: number = 0;
  // let deltaFrom: BoardDelta = {row: 1, col: -1};
  // let direction: BoardDelta = {row: 0, col: 0};


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

  function abs(i: number): number{
    if(i >= 0) return i;
    return -i;
  }

  export function cellClicked(row: number, col: number): void {
    log.info("Clicked on cell:", row, col);
    if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
      throw new Error("Throwing the error because URL has '?throwException'");
    }
    if (!canMakeMove) {
      return;
    }
    try {
      if (row == 9 && col == 0) {
        isInline = true;
        isBroadside = false;
      }
      if (row == 9 && col == 1) {
        isBroadside = true;
        isInline = false;
      }
      if (row == 9 && col == 2) {
        isInline = false;
        isBroadside = false;
        deltas = [];
      }
      if (row == 9 && col == 3) {
        let action: Action = clickToAction();
        if (gameLogic.isStepValid(state, action, turnIndex)) {
          let move = gameLogic.createMove (state, action, turnIndex);
          canMakeMove = false;
          gameService.makeMove(move);
        }
        isInline = false;
        isBroadside = false;
        deltas = [];
      }
      if (row < 9 && (isInline === true || isBroadside === true)) {
        let delta: BoardDelta = {row: row, col: row % 2 + 2 * col};
        deltas.push(delta);
      }
    } catch (e) {
      log.info(["Illegal movement from", row, col]);
      return;
    }
  }

  // Convert what is clicked on to an Action
  export function clickToAction() : Action {
      // if (!stateBeforeMove || Object.keys(stateBeforeMove).length === 0) {
      //   stateBeforeMove = gameLogic.getInitialState();
      // }
     let currentPlayer: string = (turnIndex === 0)? 'B' : 'W';
     let currentOpponent: string = (turnIndex === 0)? 'W' : 'B';
     let action : Action = {isInline: isInline, direction: {row: 0, col: 0},
     selfMarbles: [], opponentMarbles: []};

     if (isInline === true && deltas.length > 1) {
       action.direction.row = deltas[1].row - deltas[0].row;
       action.direction.col = deltas[1].col - deltas[0].col;
       action.selfMarbles.push(deltas[0]);
       let row_next = deltas[1].row;
       let col_next = deltas[1].col;
       while(row_next >= 0 && row_next <= 8 && col_next >= 0 && col_next <= 16) {
         let pos: BoardDelta = {row: row_next, col: col_next};
         if(state.board[row_next][col_next] == currentPlayer) {
           action.selfMarbles.push(pos);
           row_next += action.direction.row;
           col_next += action.direction.col;
         } else if (state.board[row_next][col_next] == currentOpponent) {
           action.opponentMarbles.push(pos);
           row_next += action.direction.row;
           col_next += action.direction.col;
         } else break;
       }
     }

     if (isBroadside === true && deltas.length > 1) {
       action.direction.row = deltas[1].row - deltas[0].row;
       action.direction.col = deltas[1].col - deltas[0].col;
       let i = 0;
       while (i + 2 <= deltas.length) {
         action.selfMarbles.push(deltas[i]);
         i += 2;
       }
     }
     return action;
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

  export function isPieceW(row: number, col: number): boolean {
    let j: number = row % 2 + 2 * col;
    return state.board[row][j] === 'W';
  }

  export function shouldSlowlyAppear(row: number, col: number): boolean {
    return !animationEnded &&
        state.blackRemoved &&
        shouldShowImage(row, col);
  }

  function getPieceKind(piece: string): string {
    if(piece === 'B') return 'imgs/black.png';
    if(piece === 'W') return 'imgs/white.png';
    return '';
  }

 export function getImageSrc(row: number, col: number){
   let j: number = row % 2 + 2 * col;
   let cell = state.board[row][j];
   return getPieceKind(cell);
 }


}

angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
  .run(function () {
  $rootScope['game'] = game;
  translate.setLanguage('en',  {
    RULES_OF_ABALONE: "Rules of Abalone",
    RULES_SLIDE1: "Each side has 14 marbles and takes turns to move; whoever first removes 6 of the opponent's marbles wins.",
    RULES_SLIDE2: "Inline: Marbles in a line can be moved along the line by 1 step; at most 3 of your own marbles and less of your opponent's can be moved.",
    INLINE_MOVE: "Click on 'Inline Move' button; click on a marble to start and the next marble/position along moving direction; submit move;",
    RULES_SLIDE3: "Broadside: Two to Three of your own marbles in a line can be moved to empty positions in a neighbor parallel line. ",
    BROADSIDE: "Click on 'Broad-side' button; for each marble to be moved, first click on the marble and then its new position; submit move;",
    CLOSE: "Close"
  });
  game.init();
});
