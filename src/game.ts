module game {
  let animationEnded = false;
  let canMakeMove = false;
  let isComputerTurn = false;
  let lastUpdateUI: IUpdateUI = null;
  export let isHelpModalShown: boolean = false;

  let state: IState = null;
  let turnIndex: number = null;
  let action: Action = null;
  // let setMove: boolean = false;
  let clickCounter: number = 0;
  let deltaFrom: BoardDelta = {row: 1, col: -1};
  let direction: BoardDelta = {row: 0, col: 0};


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
    lastUpdateUI = params;
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
      if(clickCounter === 0) {
        action = null;
        deltaFrom.row = row;
        deltaFrom.col = row % 2 + 2 * col;
        clickCounter++;
        return;
      }else if (clickCounter === 1) {
        clickCounter = 0;
        direction.row = row - deltaFrom.row;
        direction.col = row % 2 + 2 * col - deltaFrom.col;
        let selfMarbles: BoardDelta[] = [deltaFrom];
        action = {isInline: true, direction: direction,
          selfMarbles: selfMarbles, opponentMarbles: []};
        let move = gameLogic.createMove(
          state, action, lastUpdateUI.turnIndexAfterMove);
        canMakeMove = false; // to prevent making another move
        gameService.makeMove(move);

        deltaFrom.row = -1;
        deltaFrom.col = -1;
        direction.row = 0;
        direction.col = 0;
      }else {
        throw new Error("something is wrong");
      }
    } catch (e) {
      log.info(["Illegal movement from", row, col]);
      return;
    }
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

 export function getImageSrc(row: number, col: number){
   let j: number = row % 2 + 2 * col;
   let cell = state.board[row][j];
   return getPieceKind(cell);
 }

 function getPieceKind(piece: string): string {
   if(piece === 'B') return 'imgs/black.png';
   if(piece === 'W') return 'imgs/white.png';
   return '';
 }
}

angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
  .run(function () {
  $rootScope['game'] = game;
  translate.setLanguage('en',  {
    RULES_OF_ABALONE: "Rules of Abalone",
    RULES_SLIDE1: "Each side has 14 marbles and takes turns to move; whoever first removes 6 of the opponent's marbles wins.",
    RULES_SLIDE2: "Marbles in a line can be moved along the line by 1 step; at most 3 of your own marbles and less of your opponent's can be moved.",
    RULES_SLIDE3: "You can also move 2~3 of your own marbles in a line to open space in a neighbor parallel line. ",
    CLOSE: "Close"
  });
  game.init();
});
