describe("aiService", function () {
    it("first move by Black", function () {
        var state = { board: [
                ['', '', '', '', 'W', '', 'W', '', 'O', '', 'B', '', 'B', '', '', '', ''],
                ['', '', '', 'W', '', 'W', '', 'W', '', 'B', '', 'B', '', 'B', '', '', ''],
                ['', '', 'O', '', 'W', '', 'W', '', 'O', '', 'B', '', 'B', '', 'O', '', ''],
                ['', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', ''],
                ['O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O'],
                ['', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', '', 'O', ''],
                ['', '', 'O', '', 'B', '', 'B', '', 'O', '', 'W', '', 'W', '', 'O', '', ''],
                ['', '', '', 'B', '', 'B', '', 'B', '', 'W', '', 'W', '', 'W', '', '', ''],
                ['', '', '', '', 'B', '', 'B', '', 'O', '', 'W', '', 'W', '', '', '', '']],
            blackRemoved: 0, whiteRemoved: 0 };
        var move = aiService.createComputerMove(state, 0, { maxDepth: 1 });
        var expectedMove = gameLogic.createMove(state, move[1].set.value, 0);
        expect(angular.equals(move, expectedMove)).toBe(true);
    });
    it("Black finds an immediate winning move in less than a second", function () {
        var state = { board: [
                ['', '', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'W', '', '', '', ''],
                ['', '', '', 'O', '', 'O', '', 'O', '', 'B', '', 'B', '', 'O', '', '', ''],
                ['', '', 'O', '', 'O', '', 'O', '', 'B', '', 'B', '', 'O', '', 'O', '', ''],
                ['', 'O', '', 'O', '', 'B', '', 'B', '', 'O', '', 'O', '', 'B', '', 'O', ''],
                ['O', '', 'O', '', 'B', '', 'W', '', 'W', '', 'O', '', 'O', '', 'O', '', 'O'],
                ['', 'O', '', 'O', '', 'W', '', 'W', '', 'O', '', 'W', '', 'B', '', 'O', ''],
                ['', '', 'O', '', 'O', '', 'O', '', 'W', '', 'W', '', 'B', '', 'B', '', ''],
                ['', '', '', 'O', '', 'B', '', 'O', '', 'O', '', 'W', '', 'O', '', '', ''],
                ['', '', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'B', '', '', '', '']],
            blackRemoved: 1, whiteRemoved: 5 };
        var move = aiService.findComputerMove({
            turnIndexAfterMove: 0, stateAfterMove: state });
        var expectedMove = [{ endMatch: { endMatchScores: [1, 0] } },
            { set: { key: 'action', value: { isInline: true, direction: { row: -1, col: 1 },
                        selfMarbles: [{ row: 2, col: 10 }, { row: 1, col: 11 }],
                        opponentMarbles: [{ row: 0, col: 12 }] } } },
            { set: { key: 'state', value: { board: [
                            ['', '', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'B', '', '', '', ''],
                            ['', '', '', 'O', '', 'O', '', 'O', '', 'B', '', 'B', '', 'O', '', '', ''],
                            ['', '', 'O', '', 'O', '', 'O', '', 'B', '', 'O', '', 'O', '', 'O', '', ''],
                            ['', 'O', '', 'O', '', 'B', '', 'B', '', 'O', '', 'O', '', 'B', '', 'O', ''],
                            ['O', '', 'O', '', 'B', '', 'W', '', 'W', '', 'O', '', 'O', '', 'O', '', 'O'],
                            ['', 'O', '', 'O', '', 'W', '', 'W', '', 'O', '', 'W', '', 'B', '', 'O', ''],
                            ['', '', 'O', '', 'O', '', 'O', '', 'W', '', 'W', '', 'B', '', 'B', '', ''],
                            ['', '', '', 'O', '', 'B', '', 'O', '', 'O', '', 'W', '', 'O', '', '', ''],
                            ['', '', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'B', '', '', '', '']],
                        blackRemoved: 1, whiteRemoved: 6 } } }];
        expect(angular.equals(move, expectedMove)).toBe(true);
    });
    it("Expect a broadside move by Black", function () {
        var state = { board: [
                ['', '', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'W', '', '', '', ''],
                ['', '', '', 'O', '', 'O', '', 'O', '', 'B', '', 'O', '', 'O', '', '', ''],
                ['', '', 'O', '', 'O', '', 'O', '', 'B', '', 'O', '', 'B', '', 'O', '', ''],
                ['', 'O', '', 'O', '', 'B', '', 'B', '', 'O', '', 'B', '', 'O', '', 'B', ''],
                ['O', '', 'O', '', 'B', '', 'W', '', 'W', '', 'O', '', 'O', '', 'O', '', 'O'],
                ['', 'O', '', 'O', '', 'W', '', 'W', '', 'O', '', 'W', '', 'B', '', 'O', ''],
                ['', '', 'O', '', 'O', '', 'O', '', 'W', '', 'W', '', 'B', '', 'B', '', ''],
                ['', '', '', 'O', '', 'B', '', 'O', '', 'O', '', 'W', '', 'O', '', '', ''],
                ['', '', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'B', '', '', '', '']],
            blackRemoved: 1, whiteRemoved: 5 };
        var move = aiService.createComputerMove(state, 0, { maxDepth: 1 });
        var action = { isInline: false, direction: { row: -1, col: -1 },
            selfMarbles: [{ row: 2, col: 12 }, { row: 3, col: 11 }],
            opponentMarbles: [] };
        var expectedMove = gameLogic.createMove(state, move[1].set.value, 0);
        expect(angular.equals(move, expectedMove)).toBe(true);
    });
    // it("Expect a broadside move by Black", function(){
    //   let state: IState = {board: [
    //     ['', '', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'W', '', '', '', '' ],
    //     ['', '', '', 'O', '', 'O', '', 'O', '', 'B', '', 'O', '', 'O', '', '', '' ],
    //     ['', '', 'O', '', 'O', '', 'O', '', 'B', '', 'O', '', 'B', '', 'O', '', '' ],
    //     ['', 'O', '', 'O', '', 'B', '', 'B', '', 'O', '', 'B', '', 'O', '', 'B', '' ],
    //     ['O', '', 'O', '', 'B', '', 'W', '', 'W', '', 'O', '', 'O', '', 'O', '', 'O' ],
    //     ['', 'O', '', 'O', '', 'W', '', 'W', '', 'O', '', 'W', '', 'B', '', 'O', '' ],
    //     ['', '', 'O', '', 'O', '', 'O', '', 'W', '', 'W', '', 'B', '', 'B', '', '' ],
    //     ['', '', '', 'O', '', 'B', '', 'O', '', 'O', '', 'W', '', 'O', '', '', '' ],
    //     ['', '', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'B', '', '', '', '' ]],
    //   blackRemoved: 1, whiteRemoved: 5};
    //   let move = aiService.createComputerMove(state, 0, {maxDepth: 3});
    //   let action: Action = {isInline: false, direction:  {row: -1, col: -1},
    //    selfMarbles: [{row: 2, col: 12}, {row: 3, col: 11}],
    //    opponentMarbles: []};
    //   let expectedMove = [{setTurn: {turnIndex: 1}},
    //    {set: {key: 'action', value: action}},
    //   {set: {key: 'state', value: {board: [
    //     ['', '', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'W', '', '', '', '' ],
    //     ['', '', '', 'O', '', 'O', '', 'O', '', 'B', '', 'B', '', 'O', '', '', '' ],
    //     ['', '', 'O', '', 'O', '', 'O', '', 'B', '', 'B', '', 'O', '', 'O', '', '' ],
    //     ['', 'O', '', 'O', '', 'B', '', 'B', '', 'O', '', 'O', '', 'O', '', 'B', '' ],
    //     ['O', '', 'O', '', 'B', '', 'W', '', 'W', '', 'O', '', 'O', '', 'O', '', 'O' ],
    //     ['', 'O', '', 'O', '', 'W', '', 'W', '', 'O', '', 'W', '', 'B', '', 'O', '' ],
    //     ['', '', 'O', '', 'O', '', 'O', '', 'W', '', 'W', '', 'B', '', 'B', '', '' ],
    //     ['', '', '', 'O', '', 'B', '', 'O', '', 'O', '', 'W', '', 'O', '', '', '' ],
    //     ['', '', '', '', 'O', '', 'O', '', 'O', '', 'O', '', 'B', '', '', '', '' ]],
    //    blackRemoved: 1, whiteRemoved: 5}}}];
    //   expect(angular.equals(move, expectedMove)).toBe(true);
    // });
});
