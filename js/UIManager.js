import { CONFIG } from './config.js';

export class UIManager {
  constructor() {
    this.selectors = {
      tileContainer: '.tile-container',
      scoreContainer: '.score-container',
      bestContainer: '.best-container',
      messageContainer: '.game-message',
      buttonsContainer: '.lower-container',
      infoPanel: '.info',
      dogeSays: '.doge-says',
      katkoMessage: '.katkoviesti',
      katkoColor: '.katko-container-color'
    };
    this.cacheDOM();
    this.resetState();
    this.tileElements = new Map(); // Track tile DOM elements by ID
  }

  renderGrid(grid) {
    const newTileIds = new Set();
  
    // Add or update tiles
    grid.cells.forEach(column => {
      column.forEach(tile => {
        if (tile) {
          newTileIds.add(tile.id);
          if (this.tileElements.has(tile.id)) {
            this.updateTileElement(tile);
          } else {
            this.createTileElement(tile);
          }
        }
      });
    });
  
    // Remove old tiles
    this.tileElements.forEach((element, id) => {
      if (!newTileIds.has(id)) {
        element.remove();
        this.tileElements.delete(id);
      }
    });
  }
  
  cacheDOM() {
    this.elements = Object.fromEntries(
      Object.entries(this.selectors).map(([key, selector]) => 
        [key, document.querySelector(selector)]
      )
    );
  }

  resetState() {
    this.score = 0;
  }

  render(grid, metadata) {
    this.updateTiles(grid);
    this.updateScore(metadata);
    this.handleMessages(metadata);
    this.updateKatkoUI(metadata.score);
  }

  renderGrid(grid) {
    this.clearContainer(this.elements.tileContainer);
    grid.cells.forEach(column => {
      column.forEach(cell => {
        if (cell) this.createTileElement(cell);
      });
    });
  }

  createTileElement(tile) {
    const wrapper = document.createElement('div');
    const inner = document.createElement('div');
    
    // Use previousPosition for initial placement
    const prevPos = tile.previousPosition || { x: tile.x, y: tile.y };
    const initialClass = `tile-position-${prevPos.x + 1}-${prevPos.y + 1}`;
    
    // Add 'tile-new' class for appear animation
    wrapper.className = `tile tile-${tile.value} ${initialClass} tile-new`;
    inner.className = 'tile-inner';
    inner.textContent = tile.value;
    wrapper.appendChild(inner);
  
    // Remove 'tile-new' class after animation
    setTimeout(() => {
      wrapper.classList.remove('tile-new');
    }, CONFIG.ANIMATION_DURATION); // Adjust duration as needed
  
    this.tileElements.set(tile.id, wrapper);
    this.elements.tileContainer.appendChild(wrapper);
    return wrapper;
  }

  updateTiles(grid) {
    const newTileIds = new Set();
  
    // Track all current tiles
    grid.eachCell((x, y, tile) => {
      if (!tile) return;
      newTileIds.add(tile.id);
      
      if (this.tileElements.has(tile.id)) {
        this.updateTileElement(tile);
      } else {
        this.createTileElement(tile);
      }
    });
  
    // Remove tiles with fade-out animation
    this.tileElements.forEach((element, id) => {
      if (!newTileIds.has(id)) {
        element.style.opacity = '0';
        element.addEventListener('transitionend', () => {
          element.remove();
          this.tileElements.delete(id);
        });
      }
    });
  }
  
  createTileElement(tile) {
    const element = document.createElement('div');
    const inner = document.createElement('div');
    element.className = `tile tile-${tile.value}`;
    inner.className = 'tile-inner';
    inner.textContent = tile.value;
    element.appendChild(inner);

    // Set initial position from previousPosition if available
    const fromPos = tile.previousPosition || tile;
    element.style.transform = this.getPositionStyle(fromPos);
    
    // Force layout calculation before updating to new position
    void element.offsetHeight; // Trigger reflow
    
    // Set initial position from grid coordinates
    element.style.transform = this.getPositionStyle(tile);
    element.classList.add('tile-new');
    
    // Force reflow to trigger animation
    void element.offsetHeight;
    
    this.tileElements.set(tile.id, element);
    this.elements.tileContainer.appendChild(element);
    return element;
  }
  
  updateTileElement(tile) {
    const element = this.tileElements.get(tile.id);
    
    // Update value if changed
    if (element.firstChild.textContent !== tile.value.toString()) {
      element.className = `tile tile-${tile.value}`;
      element.firstChild.textContent = tile.value;
      element.classList.add('tile-merged');
    }

    // Animate to new position
    element.style.transform = this.getPositionStyle(tile);
  }

  getPositionStyle(position) {
    const cellSize = 106.25;    // From CSS
    const margin = 15;          // From CSS
    const step = cellSize + margin;
    
    return `translate(
      ${position.y * step}px, 
      ${position.x * step}px
    )`;
  }

  updateScore({ score, bestScore }) {
    this.elements.scoreContainer.textContent = score;
    this.elements.bestContainer.textContent = bestScore;
    this.handleScoreAnimation(score);
  }

  handleScoreAnimation(newScore) {
    const difference = newScore - this.score;
    if (difference > 0) {
      this.createScoreAddition(difference);
      this.showDogeMessage();
    }
    this.score = newScore;
  }

  createScoreAddition(difference) {
    const addition = document.createElement('div');
    addition.className = 'score-addition';
    addition.textContent = `+${difference}`;
    this.elements.scoreContainer.appendChild(addition);
  }

  showDogeMessage() {
    const message = CONFIG.DOGE_SAYINGS[Math.floor(Math.random() * CONFIG.DOGE_SAYINGS.length)];
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style = `left:${Math.random() * 20 + 30}%;top:${Math.random() * 20 + 20}%;color:white;`;
    this.elements.dogeSays.appendChild(messageElement);
  }

  handleMessages({ over, won, terminated }) {
    if (terminated) {
      this.showGameOverMessage(won ? 'Perkele jäit' : 'Jälkkää tuli!');
    } else {
      this.clearMessages();
    }
  }

  showGameOverMessage(message) {
    this.elements.messageContainer.classList.add(message.includes('jäit') ? 'game-won' : 'game-over');
    this.elements.messageContainer.querySelector('p').textContent = message;
    this.elements.buttonsContainer.style.display = 'none';
  }

  clearMessages() {
    this.elements.messageContainer.classList.remove('game-won', 'game-over');
    this.elements.buttonsContainer.style.display = '';
  }

  updateKatkoUI(score) {
    this.elements.katkoColor.style.backgroundColor = 
      score >= CONFIG.KATKO.COST ? CONFIG.KATKO.ACTIVE_COLOR : CONFIG.KATKO.INACTIVE_COLOR;
  }

  showKatkoEffect() {
    const img = document.createElement('img');
    img.src = 'katko.png';
    this.elements.katkoMessage.appendChild(img);
  }

  clearContainer(container) {
    while (container.firstChild) container.removeChild(container.firstChild);
  }

  toggleInfo() {
    this.elements.infoPanel.style.display = 
      this.elements.infoPanel.style.display === 'block' ? 'none' : 'block';
  }

  hideInfo() {
    this.elements.infoPanel.style.display = 'none';
  }
}