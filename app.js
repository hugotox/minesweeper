// create the application module
var app = angular.module('MinesweeperApp', []);

// define application constant values
app.constant('appOptions', {
    rows: 8,
    columns: 8,
    tileWidth: 50,
    tileHeight: 50,
    mines: 10  // make sure mines is less than rows x columns
});

// application controller
app.controller('MinesweeperCtrl', ['$scope', 'appOptions', function ($scope, appOptions) {

    $scope.rows = appOptions.rows;
    $scope.columns = appOptions.columns;
    $scope.containerWidth = '' + (appOptions.tileWidth * appOptions.columns + 30) + 'px';
    $scope.gridWidth = '' + (appOptions.tileWidth * appOptions.columns) + 'px';
    $scope.gameOn = false;  // meaning "game over"

    // one array to hold the mine map
    // minesGrid[x] = false means no mine
    // minesGrid[x] = true means mine present
    $scope.minesGrid = [];

    // utility function to make arrays for ng-repeat to use
    $scope.makeArray = function(howMany) {
        return new Array(howMany);
    };

    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    var getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    // returns the index of the element in minesGrid corresponding to the tile located at row, column
    $scope.getMinesGridIndex = function(row, column) {
        return column + row * appOptions.columns;
    };

    var gameOver = function(){
        $scope.gameOn = false; // GAME OVER!
        alert('Fail! There are ' + ($scope.minesGrid.length - appOptions.mines - getRevealedCount()) + ' tiles to reveal.');
    };

    var calculateCoveringMines = function(row, column) {
        var neighbors = [];
        var minesGridIndex = $scope.getMinesGridIndex(row, column);
        $scope.minesGrid[minesGridIndex].revealed = true;

        // calculate neighborhood if not already calculated
        if($scope.minesGrid[minesGridIndex].neighborCoveringMineCount === null) {

            // traverse the 9 possible neighbors. Add the position only if neighbor is inside the map
            var possibleNeighbors = [
                [row - 1, column - 1],
                [row - 1, column],
                [row - 1, column + 1],
                [row, column - 1],
                [row, column + 1],
                [row + 1, column - 1],
                [row + 1, column],
                [row + 1, column + 1]
            ];

            // save the neighbor positions
            for (var i = 0; i < possibleNeighbors.length; i++) {
                if (possibleNeighbors[i][0] >= 0 && possibleNeighbors[i][1] >= 0 && possibleNeighbors[i][0] < appOptions.rows && possibleNeighbors[i][1] < appOptions.columns) {
                    neighbors.push(possibleNeighbors[i]);
                }
            }

            var neighborCoveringMineCount = 0;
            for (i = 0; i < neighbors.length; i++) {
                var neighborIdx = $scope.getMinesGridIndex(neighbors[i][0], neighbors[i][1]);
                if ($scope.minesGrid[neighborIdx].hasMine) {
                    neighborCoveringMineCount++;
                }
            }
            $scope.minesGrid[minesGridIndex].neighborCoveringMineCount = neighborCoveringMineCount;
        }

        // "if that number was 0, behaves as if the user has clicked on every cell around it"
        if($scope.minesGrid[minesGridIndex].neighborCoveringMineCount == 0) {
            for(var j=0; j<neighbors.length; j++) {
                calculateCoveringMines(neighbors[j][0], neighbors[j][1]);
            }
        }
    };

    // handles the click on an individual tile
    $scope.tileClickHandler = function(row, column){
        if($scope.gameOn) {
            var minesGridIndex = $scope.getMinesGridIndex(row, column);
            var hasMine = $scope.minesGrid[minesGridIndex].hasMine;
            if (hasMine) {
                gameOver();
            } else {
                calculateCoveringMines(row, column);
            }
        }
    };

    // loop until we have appOptions.mines number of indexes to mark as mined
    var initGame = function(){
        $scope.gameOn = true;

        // initialize map with no mines
        $scope.minesGrid = new Array(appOptions.rows * appOptions.columns);
        for(var i=0; i<$scope.minesGrid.length; i++) {
            $scope.minesGrid[i] = {
                hasMine: false,
                neighborCoveringMineCount: null,
                revealed: false
            };
        }

        var minesIndexes = [];  // will hold the indexes of minesGrid containing mines
        while(minesIndexes.length < appOptions.mines) {
            var idx = getRandomInt(0, $scope.minesGrid.length);
            if(minesIndexes.indexOf(idx) === -1) {  // save the random index only if it didn't exist
                minesIndexes.push(idx);
            }
        }

        // apply the mines to the minesGrid
        for(i=0; i<minesIndexes.length; i++) {
            $scope.minesGrid[minesIndexes[i]].hasMine = true;
        }

    };

    initGame();

    var getRevealedCount = function(){
        var revealedCount = 0;
        for(var i=0; i<$scope.minesGrid.length; i++) {
            if($scope.minesGrid[i].revealed) {
                revealedCount += 1;
            }
        }
        return revealedCount;
    };

    // button handlers
    $scope.validateGame = function() {
        if($scope.gameOn) {
            var revealedCount = getRevealedCount();
            if(revealedCount == ($scope.minesGrid.length - appOptions.mines)) {
                // WIN !!!
                alert('Victory!');
                $scope.gameOn = false;
            } else {
                // not done yet
                gameOver();
            }
        }
    };

    $scope.newGame = function(){
        initGame();
    };

}]);