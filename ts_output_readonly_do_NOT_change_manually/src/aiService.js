var aiService;
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
