// Tile.js
export class Tile {
  constructor(position, value = 2) {
    this.x = position.x;
    this.y = position.y;
    this.value = value;
    this.previousPosition = null;
    this.mergedFrom = null;
    this.id = Math.random().toString(36).substr(2, 9); // Unique ID
  }
  
  savePosition() {
    this.previousPosition = { x: this.x, y: this.y };
  }

  updatePosition(position) {
    this.x = position.x;
    this.y = position.y;
  }
}