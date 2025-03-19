export class InputHandler {
    constructor() {
      this.events = new Map();
      this.keyMap = new Map([
        [38, 0], [87, 0],  [75, 0],  // Up
        [39, 1], [68, 1],  [76, 1],  // Right
        [40, 2], [83, 2],  [74, 2],  // Down
        [37, 3], [65, 3],  [72, 3]   // Left
      ]);
  
      this.setupDomListeners();
    }
  
    on(event, callback) {
      if (!this.events.has(event)) {
        this.events.set(event, []);
      }
      this.events.get(event).push(callback);
    }
  
    emit(event, data) {
      const callbacks = this.events.get(event);
      if (callbacks) callbacks.forEach(cb => cb(data));
    }
  
    setupDomListeners() {
      // Keyboard input
      document.addEventListener('keydown', this.handleKeyDown.bind(this));
      
      // Button handlers
      this.initButton('.retry-button', 'restart');
      this.initButton('.keep-playing-button', 'keepPlaying');
      this.initButton('.info-container', 'showInfo');
      this.initButton('.katko-container', 'goKatko');
      
      // Touch/swipe handling
      this.initTouchHandlers();
    }
  
    handleKeyDown(event) {
      const modifiers = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
      const direction = this.keyMap.get(event.which);
  
      if (!modifiers) {
        if (direction !== undefined) {
          event.preventDefault();
          this.emit('move', direction);
        }
        
        if (event.which === 32) { // Spacebar
          event.preventDefault();
          this.emit('restart');
        }
      }
    }
  
    initButton(selector, eventName) {
      const element = document.querySelector(selector);
      if (!element) return;
  
      const handler = (e) => {
        e.preventDefault();
        this.emit(eventName);
      };
  
      element.addEventListener('click', handler);
      element.addEventListener('touchend', handler);
    }
  
    initTouchHandlers() {
      let touchStartX = 0;
      let touchStartY = 0;
      const gameContainer = document.querySelector('.game-container');
  
      gameContainer?.addEventListener('touchstart', e => {
        if (e.touches.length > 1) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        e.preventDefault();
      });
  
      gameContainer?.addEventListener('touchmove', e => e.preventDefault());
  
      gameContainer?.addEventListener('touchend', e => {
        if (e.touches.length > 0) return;
  
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
  
        if (Math.max(absDx, absDy) > 10) {
          const direction = absDx > absDy 
            ? (dx > 0 ? 1 : 3) 
            : (dy > 0 ? 2 : 0);
          this.emit('move', direction);
        }
      });
    }
  
    // Legacy event handlers preserved for compatibility
    restart = (e) => this.handleButtonEvent(e, 'restart');
    keepPlaying = (e) => this.handleButtonEvent(e, 'keepPlaying');
    showInfo = (e) => this.handleButtonEvent(e, 'showInfo');
    goKatko = (e) => this.handleButtonEvent(e, 'goKatko');
  
    handleButtonEvent(event, eventName) {
      event.preventDefault();
      this.emit(eventName);
    }
  }