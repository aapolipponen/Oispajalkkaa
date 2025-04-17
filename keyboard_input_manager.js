class KeyboardInputManager {
  constructor() {
    this.events = {};
    this.listen();
  }

  on(event, callback) {
    this.events[event] = this.events[event] || [];
    this.events[event].push(callback);
  }

  emit(event, data) {
    this.events[event]?.forEach(callback => callback(data));
  }

  listen() {
    const map = new Map([
      [38, 0], [39, 1], [40, 2], [37, 3],  // Arrows
      [75, 0], [76, 1], [74, 2], [72, 3],  // Vim
      [87, 0], [68, 1], [83, 2], [65, 3]   // WASD
    ]);

    document.addEventListener("keydown", event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      
      const direction = map.get(event.which);
      if (direction !== undefined) {
        event.preventDefault();
        this.emit("move", direction);
      }

      if (event.which === 32) this.restart(event);
    });

    const addHandler = (selector, event, handler) => {
      document.querySelector(selector).addEventListener(event, handler);
    };

    addHandler(".retry-button", "click", this.restart.bind(this));
    addHandler(".retry-button", "touchend", this.restart.bind(this));
    addHandler(".keep-playing-button", "click", this.keepPlaying.bind(this));
    addHandler(".keep-playing-button", "touchend", this.keepPlaying.bind(this));
    addHandler(".info-container", "click", this.showInfo.bind(this));
    addHandler(".info-container", "touchend", this.showInfo.bind(this));
    addHandler(".katko-container", "click", this.goKatko.bind(this));
    addHandler(".katko-container", "touchend", this.goKatko.bind(this));

    const gameContainer = document.querySelector(".game-container");
    let touchStart = { x: 0, y: 0 };

    gameContainer.addEventListener("touchstart", event => {
      if (event.touches.length > 1) return;
      touchStart = { 
        x: event.touches[0].clientX, 
        y: event.touches[0].clientY 
      };
      event.preventDefault();
    });

    gameContainer.addEventListener("touchend", event => {
      if (event.touches.length > 0) return;
      
      const dx = event.changedTouches[0].clientX - touchStart.x;
      const dy = event.changedTouches[0].clientY - touchStart.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > 10) {
        const direction = absDx > absDy 
          ? (dx > 0 ? 1 : 3) 
          : (dy > 0 ? 2 : 0);
        this.emit("move", direction);
      }
    });
  }

  restart(event) {
    event?.preventDefault();
    this.emit("restart");
  }

  keepPlaying(event) {
    event?.preventDefault();
    this.emit("keepPlaying");
  }

  showInfo(event) {
    event?.preventDefault();
    this.emit("showInfo");
  }

  hideInfo(event) {
    event?.preventDefault();
    this.emit("hideInfo");
  }

  goKatko(event) {
    event?.preventDefault();
    this.emit("goKatko");
  }
}