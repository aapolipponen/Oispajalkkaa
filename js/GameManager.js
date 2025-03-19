// GameManager.js

import { Grid } from './Grid.js';
import { Tile } from './Tile.js';
import { CONFIG } from './config.js';

export class GameManager {
  constructor(size, inputManager, actuator, scoreManager) {
    this.size = size;
    this.inputManager = inputManager;
    this.actuator = actuator;
    this.scoreManager = scoreManager;
    this.animationQueue = Promise.resolve();

    this.registerEvents();
    this.setup();
  }

  registerEvents() {
    this.inputManager.on('move', direction => this.animationQueue.then(() => this.move(direction)));
    this.inputManager.on('restart', () => this.restart());
    this.inputManager.on('keepPlaying', () => this.keepPlaying());
    this.inputManager.on('showInfo', () => this.showInfo());
    this.inputManager.on('hideInfo', () => this.hideInfo());
    this.inputManager.on('goKatko', () => this.goKatko());
  }

  restart() {
    this.actuator.continue();
    this.setup();
  }

  keepPlaying() {
    this.keepPlayingState = true;
    this.actuator.continue();
  }

  showInfo() {
    this.actuator.showInfo();
  }

  hideInfo() {
    this.actuator.hideInfo();
  }

  goKatko() {
    if (this.score >= CONFIG.KATKO.COST) {
      this.score -= CONFIG.KATKO.COST;
      this.grid.katkoReissu();
      this.actuate();
      this.actuator.goKatko();
    }
  }

  isGameTerminated() {
    return this.over || (this.won && !this.keepPlayingState);
  }

  setup() {
    this.grid = new Grid(this.size);
    this.score = 0;
    this.over = false;
    this.won = false;
    this.keepPlayingState = false;
    this.addStartTiles();
    this.actuate();
  }

  addStartTiles() {
    for (let i = 0; i < CONFIG.GRID.START_TILES; i++) {
      this.addRandomTile();
    }
  }

  addRandomTile() {
    if (this.grid.cellsAvailable()) {
      const value = Math.random() < CONFIG.GRID.TWO_PROBABILITY ? 2 : 4;
      const tile = new Tile(this.grid.randomAvailableCell(), value);
      this.grid.insertTile(tile);
    }
  }

  actuate() {
    if (this.scoreManager.get() < this.score) {
      this.scoreManager.set(this.score);
    }

    this.actuator.render(this.grid, {
      score: this.score,
      over: this.over,
      won: this.won,
      bestScore: this.scoreManager.get(),
      terminated: this.isGameTerminated()
    });
  }

  prepareTiles() {
    this.grid.eachCell((x, y, tile) => {
      if (tile) {
        tile.mergedFrom = null;
        tile.savePosition();
      }
    });
  }

  moveTile(tile, cell) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
  }

  move(direction) {
    if (this.isGameTerminated()) return;
  
    const vector = this.getVector(direction);
    const traversals = this.buildTraversals(vector);
    let moved = false;
  
    this.prepareTiles();
  
    traversals.x.forEach(x => {
      traversals.y.forEach(y => {
        const cell = { x, y };
        const tile = this.grid.cellContent(cell);
  
        if (tile) {
          const positions = this.findFarthestPosition(cell, vector);
          const next = this.grid.cellContent(positions.next);
  
          if (next && next.value === tile.value && !next.mergedFrom) {
            const merged = new Tile(positions.next, tile.value * 2);
            merged.mergedFrom = [tile, next];
  
            this.grid.insertTile(merged);
            this.grid.removeTile(tile);
            tile.updatePosition(positions.next);
  
            this.score += merged.value;
            if (merged.value === 2048) this.won = true;
          } else {
            this.moveTile(tile, positions.farthest);
          }
  
          if (!this.positionsEqual(cell, tile)) {
            moved = true;
          }
        }
      });
    });
  
    if (moved) {
      this.addRandomTile();
      if (!this.movesAvailable()) this.over = true;
      this.actuate();
    }
  }
    
  getVector(direction) {
    const vectors = {
      0: { x: 0, y: -1 }, // Up
      1: { x: 1, y: 0 },  // Right
      2: { x: 0, y: 1 },  // Down
      3: { x: -1, y: 0 }  // Left
    };
    return vectors[direction];
  }

  buildTraversals(vector) {
    const traversals = { x: [], y: [] };
    for (let pos = 0; pos < this.size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }

    if (vector.x === 1) traversals.x.reverse();
    if (vector.y === 1) traversals.y.reverse();

    return traversals;
  }

  findFarthestPosition(cell, vector) {
    let previous;
    do {
      previous = cell;
      cell = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

    return { farthest: previous, next: cell };
  }

  movesAvailable() {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
  }

  tileMatchesAvailable() {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.grid.cellContent({ x, y });
        if (tile) {
          for (let direction = 0; direction < 4; direction++) {
            const vector = this.getVector(direction);
            const cell = { 
              x: x + vector.x, 
              y: y + vector.y 
            };
            const other = this.grid.cellContent(cell);
            if (other?.value === tile.value) return true;
          }
        }
      }
    }
    return false;
  }

  positionsEqual(first, second) {
    return first.x === second.x && first.y === second.y;
  }
}