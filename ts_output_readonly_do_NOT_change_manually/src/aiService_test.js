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
        // let possibleMoves: IMove[] = aiService.getPossibleMoves(state, 0);
        // let move = possibleMoves[0];
        var move = aiService.createComputerMove(state, 0, { maxDepth: 1 });
        var expectedMove = gameLogic.createMove(state, move[1].set.value, 0);
        expect(angular.equals(move, expectedMove)).toBe(true);
    });
    it("Test another choice of first move by Black", function () {
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
        // let possibleMoves: IMove[] = aiService.getPossibleMoves(state, 0);
        // let move = possibleMoves[0];
        var move = aiService.createComputerMove(state, 0, { maxDepth: 2 });
        var expectedMove = gameLogic.createMove(state, move[1].set.value, 0);
        expect(angular.equals(move, expectedMove)).toBe(true);
    });
    // it("X finds an immediate winning move", function() {
    //   var move = aiService.createComputerMove(
    //       [['', '', 'O'],
    //        ['O', 'X', 'X'],
    //        ['O', 'X', 'O']], 0, {maxDepth: 1});
    //   var expectedMove =
    //       [{endMatch: {endMatchScores: [1, 0]}},
    //         {set: {key: 'board', value:
    //             [['', 'X', 'O'],
    //              ['O', 'X', 'X'],
    //              ['O', 'X', 'O']]}},
    //         {set: {key: 'delta', value: {row: 0, col: 1}}}];
    //   expect(angular.equals(move, expectedMove)).toBe(true);
    // });
    //
    // it("O finds an immediate winning move", function() {
    //   var move = aiService.createComputerMove(
    //       [['', '', 'O'],
    //        ['O', 'X', 'X'],
    //        ['O', 'X', 'O']], 1, {maxDepth: 1});
    //   expect(angular.equals(move[2].set.value, {row: 0, col: 0})).toBe(true);
    // });
    //
    // it("X prevents an immediate win", function() {
    //   var move = aiService.createComputerMove(
    //       [['X', '', ''],
    //        ['O', 'O', ''],
    //        ['X', '', '']], 0, {maxDepth: 2});
    //   expect(angular.equals(move[2].set.value, {row: 1, col: 2})).toBe(true);
    // });
    //
    // it("O prevents an immediate win", function() {
    //   var move = aiService.createComputerMove(
    //       [['X', 'X', ''],
    //        ['O', '', ''],
    //        ['', '', '']], 1, {maxDepth: 2});
    //   expect(angular.equals(move[2].set.value, {row: 0, col: 2})).toBe(true);
    // });
    //
    // it("O prevents another immediate win", function() {
    //   var move = aiService.createComputerMove(
    //       [['X', 'O', ''],
    //        ['X', 'O', ''],
    //        ['', 'X', '']], 1, {maxDepth: 2});
    //   expect(angular.equals(move[2].set.value, {row: 2, col: 0})).toBe(true);
    // });
    //
    // it("X finds a winning move that will lead to winning in 2 steps", function() {
    //   var move = aiService.createComputerMove(
    //       [['X', '', ''],
    //        ['O', 'X', ''],
    //        ['', '', 'O']], 0, {maxDepth: 3});
    //   expect(angular.equals(move[2].set.value, {row: 0, col: 1})).toBe(true);
    // });
    //
    // it("O finds a winning move that will lead to winning in 2 steps", function() {
    //   var move = aiService.createComputerMove(
    //       [['', 'X', ''],
    //        ['X', 'X', 'O'],
    //        ['', 'O', '']], 1, {maxDepth: 3});
    //   expect(angular.equals(move[2].set.value, {row: 2, col: 2})).toBe(true);
    // });
    //
    // it("O finds a cool winning move that will lead to winning in 2 steps", function() {
    //   var move = aiService.createComputerMove(
    //       [['X', 'O', 'X'],
    //        ['X', '', ''],
    //        ['O', '', '']], 1, {maxDepth: 3});
    //   expect(angular.equals(move[2].set.value, {row: 2, col: 1})).toBe(true);
    // });
    //
    // it("O finds the wrong move due to small depth", function() {
    //   var move = aiService.createComputerMove(
    //       [['X', '', ''],
    //        ['', '', ''],
    //        ['', '', '']], 1, {maxDepth: 3});
    //   expect(angular.equals(move[2].set.value, {row: 0, col: 1})).toBe(true);
    // });
    //
    // it("O finds the correct move when depth is big enough", function() {
    //   var move = aiService.createComputerMove(
    //       [['X', '', ''],
    //        ['', '', ''],
    //        ['', '', '']], 1, {maxDepth: 6});
    //   expect(angular.equals(move[2].set.value, {row: 1, col: 1})).toBe(true);
    // });
    //
    // it("X finds a winning move that will lead to winning in 2 steps", function() {
    //   var move = aiService.createComputerMove(
    //       [['', '', ''],
    //        ['O', 'X', ''],
    //        ['', '', '']], 0, {maxDepth: 5});
    //   expect(angular.equals(move[2].set.value, {row: 0, col: 0})).toBe(true);
    // });
});
