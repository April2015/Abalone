module aiService {
  /** Returns the move that the computer player should do for the given updateUI. */
  // export function findComputerMove(updateUI: IUpdateUI): IMove {
  //   return createComputerMove(
  //       updateUI.stateAfterMove,
  //       updateUI.turnIndexAfterMove,
  //       // at most 1 second for the AI to choose a move (but might be much quicker)
  //       {millisecondsLimit: 1000})
  // }

  export function getPossibleMoves(state: IState, turnIndexBeforeMove: number): IMove[] {
    let possibleMoves: IMove[] = [];
    let board = state.board;
    let BorW: string = (turnIndexBeforeMove === 0 ? 'B' : 'W');
    for (let delta of gameLogic.PLACES) {
       let i = delta.row;
       let j = delta.col;
       if (board[i][j] !== BorW) {
           continue;
       }
       for (let k = 0; k < 6; k++) {
         let direction = gameLogic.DIREC[k];
         let i0 = i;
         let j0 = j;
         let selfMarbles: BoardDelta[] = [delta];
         for (let k = 0; k < 2; k++) {
           i0 += direction.row;
           j0 += direction.col;
           if (i0 < 0 || i0 >= gameLogic.ROWS || j0 < 0 || j0 >= gameLogic.COLS
             || board[i0][j0] !== BorW)
              break;
           selfMarbles.push({row: i0, col: j0});
         }
         let len = selfMarbles.length;
// First find all valid inline moves
         i0 = i + len * direction.row;
         j0 = j + len * direction.col;
         let marbleOnEdge: boolean = (i0 < 0 || i0 >= gameLogic.ROWS || j0 < 0
           || j0 >= gameLogic.COLS || board[i0][j0] === '' || board[i0][j0] === BorW);
         if (!marbleOnEdge) {
           if (board[i0][j0] === 'O') {
             let action: Action = {isInline: true, direction:  direction,
             selfMarbles: selfMarbles, opponentMarbles: []};
             try {
               possibleMoves.push(gameLogic.createMove(state, action, turnIndexBeforeMove));
             } catch (e) {}
            }

           if (board[i0][j0] === (turnIndexBeforeMove === 0? 'W':'B')) {
               let opponentMarbles: BoardDelta[] = [{row: i0, col: j0}];
               i0 += direction.row;
               j0 += direction.col;
               if (i0 >= 0 && i0 < gameLogic.ROWS && j0 >= 0 && j0 < gameLogic.COLS
               && board[i0][j0] === (turnIndexBeforeMove === 0? 'W':'B')) {
                 opponentMarbles.push({row: i0, col: j0});
               }
               let action: Action = {isInline: true, direction:  direction,
               selfMarbles: selfMarbles, opponentMarbles: opponentMarbles};
               try {
                 let move = gameLogic.createMove(state, action, turnIndexBeforeMove);
                 if (gameLogic.getWinner(move[2].set.value) !== '') {
                   possibleMoves = [move];
                   return possibleMoves;
                 }
                 possibleMoves.push(move);
               } catch (e) {}
           }
         }
// Second find all possible broadside moves.
//It is enough to check 3 directions: [0, 2], [1, -1], [1, 1]
        if (len <= 1 || k > 2) {
            continue;
        }
        for (; len >= 2; ) {
          for (let l = 0; l < 5; l++) {
              if (l === k || l === k + 3) {
                    continue;
              }
              try {
                let action: Action = {isInline: false, direction:  gameLogic.DIREC[l],
                selfMarbles: selfMarbles, opponentMarbles: []};
                if (gameLogic.isStepValid(state, action, turnIndexBeforeMove)) {
                    possibleMoves.push(gameLogic.createMove(state, action, turnIndexBeforeMove));
                }
              } catch (e) {}
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

  export function createComputerMove(
      state: IState, playerIndex: number, alphaBetaLimits: IAlphaBetaLimits): IMove {
          let moves: IMove[] = getPossibleMoves(state, playerIndex);
          let len: number = moves.length;
          if (len == 0)
            return moves[0];
          let i = Math.floor(Math.random() * len);
          return moves[i];
      }

  // function getStateScoreForIndex0(move: IMove, playerIndex: number): number {
  //   if (move[0].endMatch) {
  //     let endMatchScores = move[0].endMatch.endMatchScores;
  //     return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
  //         : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
  //         : 0;
  //   }
  //   return 0;
  // }

  function getNextStates(move: IMove, playerIndex: number): IMove[] {
    let stateAfterMove: IState = {board: move[1].set.value, isInitialState: move[2].set.value,
    blackRemoved: move[3].set.value, whiteRemoved: move[4].set.value, action: move[5].set.value};
    return getPossibleMoves(stateAfterMove, playerIndex);
  }

  function getDebugStateToString(move: IMove): string {
    return "\n" + move[4].set.value.join("\n") + "\n";
  }
}
