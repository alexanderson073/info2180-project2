/**
 * Extra Features
 * - Multiple backgrounds (graded)
 * - Gametime
 */
'use strict';

let images = [
    {name: 'Default', url: './background.png'},
    {name: 'Tom and Jerry', url: 'http://www.cartoonson.com/_resources/Cartoons/show/12/image/555x418/Tom-and-Jerry-classic.jpg'},
    {name: 'Mario', url: 'https://i.pinimg.com/736x/94/d3/41/94d341a1a069c95c6d08984a54ebf6ff--mario-and-luigi-mario-kart.jpg'},
    {name: 'Mario Yoshi', url: 'http://static.gcstudio.org/fifteen_puzzle/mario_yoshi.jpg'},
];

var tracking = {
    startTime: 0,
    endTime: 0,
    moves: 0
};
let emptyGrid = {
    left: 0,
    top: 0
};

function setImage(image) {
    document
        .querySelectorAll('.puzzlepiece')
        .forEach(function(elem) {
            elem.style.backgroundImage = "url(" + image + ")";
        });
}
function createImageOptions() {
    let options = [];

    images.forEach(function(img) {
        options.push('<option value="' + img.url + '">' + img.name + '</option>');
    });

    $('<select id="imageOption" style="margin-left: 5px;">' + options.join('') + '</select>').insertAfter('#shufflebutton');

    $('#imageOption').on('change', function() {
        // get option which was set in createImageOptions
        setImage(this.selectedOptions[0].value);
    });
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min)) + min;
}

var FifteenPuzzle = {
    grids: null,
    board: null,
    setup: function(gridList) {
        // force nodeList to generic Array
        this.grids = Array.from(gridList);
        this.board = document.getElementById('puzzlearea');

        document.getElementById('shufflebutton').addEventListener('click', function() {
            FifteenPuzzle.shuffle();
        });

        // early set to get props
        this.grids.forEach(function(grid, i) {
            grid.classList.add('puzzlepiece');

            grid.addEventListener('mouseover', function() {
                if ( FifteenPuzzle.canMove(this) ) {
                    this.classList.add('movablepiece');
                }
            });
            grid.addEventListener('mouseleave', function() {
                this.classList.remove('movablepiece');
            });

            // add click handler
            grid.addEventListener('click', function() {
                let left = this.offsetLeft, top = this.offsetTop;

                if ( !FifteenPuzzle.canMove(this) )
                    return false;

                // move to empty slot
                this.style.left = emptyGrid.left + 'px';
                this.style.top = emptyGrid.top + 'px';

                // set empty block to the current grid position
                emptyGrid.top = top;
                emptyGrid.left = left;

                // moves tracking
                tracking.moves++;

                FifteenPuzzle.checkWin();
            });
        });

        let grid = {width: this.grids[0].offsetWidth, height: this.grids[0].offsetHeight};

        let left = 0, top = 0;
        let posLeft = 0, posTop = 0;
        let randImg = images[getRandomInt(1, (images.length - 1))];

        this.grids.forEach(function(elem, i) {

            //elem.classList.add('puzzlepiece');
            elem.style.cssText = 'left: ' + left + 'px; top: ' + top + 'px;';
            elem.style['background-image'] = "url(" + randImg.url + ")";
            elem.style['background-position-x'] = posLeft + "px";
            elem.style['background-position-y'] = posTop + "px";

            // will use to identify correct location eg: 0_100
            elem.dataset.text = elem.innerText;
            elem.dataset.id = top + '_' + left;

            grid.width = elem.offsetWidth;
            grid.height = elem.offsetHeight;

            left += grid.width;
            posLeft -= grid.width;

            // reset left and increment top positioning 
            if ( left >= FifteenPuzzle.board.offsetWidth ) {
                left = 0;
                posLeft = 0;
                top += 100;
                posTop -= 100;
            }

            emptyGrid.top = top;
            emptyGrid.left = left;
        });

        tracking.startTime = new Date();
    },
    reset: function() {
        tracking.moves = 0;
        tracking.startTime = new Date();

        $('#notification').html('');
    },
    shuffle: function() {
        this.reset();
        let len = this.grids.length;
        let left = 0, top = 0, i = 0;

        // radomize grids
        this.grids = this.grids.reverse().sort(function() {
            return .5 - getRandomInt(0, len);
        });


        this.grids.forEach(function(grid) {

            grid.style['left'] = left + 'px';
            grid.style['top'] = top + 'px';

            left += grid.offsetWidth;

            if ( left >= FifteenPuzzle.board.offsetWidth ) {
                left = 0;
                top += 100;
            }

            emptyGrid.top = top;
            emptyGrid.left = left;
        });
    },
    canMove: function(grid) {
        let left = grid.offsetLeft,
            top = grid.offsetTop,
            width = grid.offsetWidth;

        // move right
        if ( emptyGrid.left - width === left && emptyGrid.top === top )
            return true;
        // move left
        if ( emptyGrid.left + width === left && emptyGrid.top === top )
            return true;
        // move down
        if ( emptyGrid.top - width === top && emptyGrid.left === left )
            return true;
        // move down
        if ( emptyGrid.top + width === top && emptyGrid.left === left )
            return true;

        return false;
    },
    checkWin: function() {
        var win = true;

        for (var i = 0; i < this.grids.length; i++) {
            var grid = this.grids[i], id = grid.offsetTop + '_' + grid.offsetLeft;

            if ( grid.dataset.id !== id )
                win = false;
        }

        if ( win )
            this.onWin();
    },
    onWin: function() {
        tracking.endTime = new Date();

        var secs = (tracking.endTime - tracking.startTime) / 1000, playtime;

        if ( secs > 60 ) {
            var mns = Math.floor(secs / 60);

            playtime = mns + 'mns ' + Math.floor(secs - (mns * 60)) + 's';
        } else {
            playtime = Math.floor(secs) + 's';
        }

        $('#notification').html('<p><strong style="font-size: 1.3em;">Congratulation You Won!</strong><br>Playtime: ' + playtime + ' Moves: ' + tracking.moves + '</p>');
    }
};


document.addEventListener('DOMContentLoaded', function() {

    FifteenPuzzle.setup(document.querySelectorAll('#puzzlearea div'));
    
    FifteenPuzzle.shuffle();

    createImageOptions(images);

    $('#puzzlearea').before('<div style="text-align: center;" id="notification"></div>');
});