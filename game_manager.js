class GameManager {
  constructor(size, InputManager, Actuator, ScoreManager) {
    this.size = size;
    this.inputManager = new InputManager();
    this.scoreManager = new ScoreManager();
    this.actuator = new Actuator();

    this.startTiles = 2;

    this.setupEventListeners();
    this.setup();
  }

  setupEventListeners() {
    this.inputManager.on("move", this.move.bind(this));
    this.inputManager.on("restart", this.restart.bind(this));
    this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));
    this.inputManager.on("showInfo", this.showInfo.bind(this));
    this.inputManager.on("hideInfo", this.hideInfo.bind(this));
    this.inputManager.on("goKatko", this.goKatko.bind(this));
  }

  restart() {
    this.actuator.continue();
    this.setup();
  }

  keepPlaying() {
    this.keepPlaying = true;
    this.actuator.continue();
  }

  showInfo() {
    this.actuator.showInfo();
  }

  hideInfo() {
    this.actuator.hideInfo();
  }

  goKatko() {
    if (this.score > 1000) {
      this.score -= 1000;
      this.grid.katkoReissu();
      this.actuate();
      this.actuator.goKatko();
    }
  }

  isGameTerminated() {
    return this.over || (this.won && !this.keepPlaying);
  }

  setup() {
    this.grid = new Grid(this.size);
    this.score = 0;
    this.over = false;
    this.won = false;
    this.keepPlaying = false;

    this.addStartTiles();
    this.actuate();
  }

  addStartTiles() {
    for (let i = 0; i < this.startTiles; i++) {
      this.addRandomTile();
    }
  }

  addRandomTile() {
    if (this.grid.cellsAvailable()) {
      const value = Math.random() < 0.9 ? 2 : 4;
      const tile = new Tile(this.grid.randomAvailableCell(), value);
      this.grid.insertTile(tile);
    }
  }

  actuate() {
    if (this.scoreManager.get() < this.score) {
      this.scoreManager.set(this.score);
    }

    this.actuator.actuate(this.grid, {
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

    let moved = false;
    const vector = this.getVector(direction);
    const traversals = this.buildTraversals(vector);

    this.prepareTiles();

    traversals.x.forEach(x => {
      traversals.y.forEach(y => {
        const cell = { x, y };
        const tile = this.grid.cellContent(cell);

        if (tile) {
          const positions = this.findFarthestPosition(cell, vector);
          const next = this.grid.cellContent(positions.next);

          if (next?.value === tile.value && !next.mergedFrom) {
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
    return [
      { x: 0, y: -1 }, // Up
      { x: 1, y: 0 },  // Right
      { x: 0, y: 1 },  // Down
      { x: -1, y: 0 }  // Left
    ][direction];
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
    let current = cell;

    do {
      previous = current;
      current = {
        x: previous.x + vector.x,
        y: previous.y + vector.y
      };
    } while (this.grid.withinBounds(current) && this.grid.cellAvailable(current));

    return { farthest: previous, next: current };
  }

  movesAvailable() {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
  }

  tileMatchesAvailable() {
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.grid.cellContent({ x, y });
        if (!tile) continue;

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
    return false;
  }

  positionsEqual(first, second) {
    return first.x === second.x && first.y === second.y;
  }
}