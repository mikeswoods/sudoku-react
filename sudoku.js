'use strict';
const assert = require('assert');
const { inspect } = require('util');

// Uniformly generates random integers in the range [lo, hi)
function uniformRand(lo/*: number*/, hi/*: number*/)/*: number*/ {
  return lo + Math.floor(Math.random() * (hi - lo));
}

// Generate a range of numbers [0, n)
function range(lo/*: number*/, hi/*: number*/)/*: Array<number>*/ {
  const lo_ = Math.min(lo, hi);
  const hi_ = Math.max(lo, hi);
  let k = 0;
  const r = new Array(hi_ - lo_);
  for (let i = lo_; i < hi_; i++) {
    r[k++] = i;
  }
  return r;
}

function shuffle(items/*: Array<mixed>*/)/*: Array<mixed>*/ {
  for (let i = 0; i < items.length; i++) {
    const temp/*: mixed*/= items[i];
    const j = uniformRand(0, items.length);
    items[i] = items[j];
    items[j] = temp;
  }
  return items;
}

function makeBoard(squares/*: number*/,
                   cellsPerSquare/*: number*/)/*: Array<Array<number>>*/ {
  const n = squares * cellsPerSquare;
  const b = new Array(n);
  for (let i=0; i<n; i++) {
    b[i] = new Array(n);
    b[i].fill(0);
  }
  return b;
}

class Board {

  static create(squares/*: number*/, cellsPerSquare/*: number*/)/*: Board*/ {
    const b = new Board(squares, cellsPerSquare);
    b.fill();
    return b;
  }

  constructor(squares/*: number*/, cellsPerSquare/*: number*/) {
    this.squares = squares;
    this.cellsPerSquare = cellsPerSquare;
    this.board = makeBoard(this.squares, this.cellsPerSquare);
  }

  maxNumber()/*: number*/ {
    return this.cellsPerSquare * this.cellsPerSquare;
  }

  inBounds(i/*: number*/, j/*: number*/)/*: boolean*/ {
    const z = this.maxNumber();
    return i >= 0 && i < z && j >= 0 && j < z;
  }

  getSquares()/*: Array<[number, number]>*/ {
    const squares/*: Array<[number, number]>*/ = [];
    for (let i = 0; i < this.squares; i++) {
      for (let j = 0; j < this.squares; j++) {
        squares.push([i * this.cellsPerSquare, j * this.cellsPerSquare]);
      }
    }
    return squares;
  }

  getSquareOfIndex(i/*: number*/, j/*: number*/)/*: [number, number]*/ {
    return [Math.min(Math.floor(i / this.squares), this.squares) * this.cellsPerSquare,
            Math.min(Math.floor(j / this.squares), this.squares) * this.cellsPerSquare];
  }

  clearNumberFromBoard(k/*: number*/)/*: Board*/ {
    const z = this.maxNumber();
    for (let i = 0; i < z; i++) {
      for (let j = 0; j < z; j++) {
        if (this.board[i][j] === k) {
          this.board[i][j] = 0;
        }
      }
    }
    return this;
  }

  getRandomCellsInSquare(i/*: number*/, j/*: number*/)/*: Array<[number, number]>*/ {
    const tryPositions = [];
    for (let x = i; x < i + this.cellsPerSquare; x++) {
      for (let y = j; y < j + this.cellsPerSquare; y++) {
        tryPositions.push([x, y]);
      }
    }
    shuffle(tryPositions);
    return tryPositions;
  }

  placeNumberInSquare(k/*: number*/, i/*: number*/, j/*: number*/, first/*: boolean*/)/*: boolean*/ {
    for (const [x, y] of this.getRandomCellsInSquare(i, j)) {
      if (this.board[x][y] === 0) {
        this.board[x][y] = k;
        if (first) {
          return true;
        }
        if (this.validateRow(x) && this.validateColumn(y)) {
          return true;
        } else {
          this.board[x][y] = 0;
        }
      }
    }
    return false;
  }

  placeNumber(k/*: number*/)/*: boolean*/ {
    const z = this.maxNumber();
    let first = true;
    for (const [i, j] of this.getSquares()) {
      if (!this.placeNumberInSquare(k, i, j, first)) {
        //throw new Error(`Cant place: ${i},${j}`);
        return false;
      }
      first = false;
    }
    return true;
  }

  fill()/*: Board*/ {
    console.time('fill');
    const z = this.maxNumber();
    let nextFillNumber = 1;
    let fillAttempt = 0;
    while (nextFillNumber <= z) {
      if (this.placeNumber(nextFillNumber)) {
        nextFillNumber++;
        fillAttempt = 0;
      } else {
        this.clearNumberFromBoard(nextFillNumber);
        // If we've failed to compute a valid placement for `nextFillNumber`
        // in the board more than 5 times, backtrack to the previous fill
        // number and restart the process from there:
        if (fillAttempt++ > 5) {
          nextFillNumber = Math.max(1, --nextFillNumber);
          fillAttempt = 0;
          this.clearNumberFromBoard(nextFillNumber);
        }
      }
    }
    console.timeEnd('fill');
    return this;
  }

  eraseCellsPerSquare(k/*: number*/)/*: Board*/ {
    for (const square of this.getSquares()) {
      const cells = this.getRandomCellsInSquare(...square);
      for (const [i, j] of cells.slice(0, k)) {
        this.board[i][j] = 0;
      }
    }
  }

  validateSquare(i/*: number*/, j/*: number*/)/*: boolean*/ {
    const [x, y] = this.getSquareOfIndex(i, j); // top-left square
    const z = this.maxNumber();
    const marked = (new Array(z + 1)).fill(0);
    for (let u = x; u < x + this.cellsPerSquare; u++) {
      for (let v = y; v < y + this.cellsPerSquare; v++) {
        assert(typeof this.board[u][v] === 'number', `i=${u}, j=${v} => ${typeof this.board[u][v]}`);
        if (typeof this.board[u][v] === 'number' && this.board[u][v] > 0) {
          marked[this.board[u][v]]++;
        }
      }
    }
    for (const mark of marked) {
      if (mark > 1) {
        return false;
      }
    }
    return true;
  }

  validateRow(i/*: number*/)/*: boolean*/ {
    const z = this.maxNumber()
    const marked = (new Array(z + 1)).fill(0);
    for (let u = 0; u < z; u++) {
      if (typeof this.board[i][u] !== 'number') {
        console.log(this.board);
      }
      assert(typeof this.board[i][u] === 'number', `i=${i}, j=${u} => ${typeof this.board[i][u]}`);
      if (typeof this.board[i][u] === 'number' && this.board[i][u] > 0) {
        marked[this.board[i][u]]++;
      }
    }
    for (const mark of marked) {
      if (mark > 1) {
        return false;
      }
    }
    return true;
  }

  validateColumn(j/*: number*/)/*: boolean*/ {
    const z = this.maxNumber()
    const marked = (new Array(z + 1)).fill(0);
    for (let v = 0; v < z; v++) {
      assert(typeof this.board[v][j] === 'number', `i=${v}, j=${j} => ${typeof this.board[v][j]}`);
      if (typeof this.board[v][j] === 'number' && this.board[v][j] > 0) {
        marked[this.board[v][j]]++;
      }
    }
    for (const mark of marked) {
      if (mark > 1) {
        return false;
      }
    }
    return true;
  }

  validate()/*: boolean*/ {
    const k = this.cellsPerSquare * this.squares;
    for (let i = 0; i < k; i++) {
      if (!this.validateRow(i) || !this.validateColumn(j)) {
        return false;
      }
    }
    for (const [i, j] of this.getSquares()) {
      if (!this.validateSquare(i, j)) {
        return false;
      }
    }
    return true;
  }

  toString()/*: string*/ {
    const k = this.cellsPerSquare * this.squares;
    let b = '';
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < k; j++) {
        b += `${this.board[i][j] === 0 ? '.' : this.board[i][j]} `;
      }
      b += '\n';
    }
    return b;
    //return inspect(this.board);
  }
}

const b = Board.create(3, 3);
console.log(b.toString());
b.eraseCellsPerSquare(7);
console.log(b.toString());


module.exports = Board;
