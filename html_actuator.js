class HTMLActuator {
  constructor() {
    this.tileContainer = document.querySelector(".tile-container");
    this.scoreContainer = document.querySelector(".score-container");
    this.bestContainer = document.querySelector(".best-container");
    this.messageContainer = document.querySelector(".game-message");
    this.buttonsContainer = document.querySelector(".lower-container");
    this.info = document.querySelector(".info");
    this.dogeSays = document.querySelector(".doge-says");
    this.katkoViesti = document.querySelector(".katkoviesti");
    this.katkoContainerColor = document.querySelector(".katko-container-color");
    
    this.score = 0;
  }

  static dogeSayings = [
    'PIIEENET Huudot', 'Lisää kimitystä!', 'Lisää huutoa!', 
    'Jälkkää tuli', 'Jussiiih', '', 'Ui helvetti Jari on tuolla', 
    'Jariiih', 'Jussi mee salille', 'Riston kulli'
  ];

  actuate(grid, metadata) {
    window.requestAnimationFrame(() => {
      this.clearContainer(this.tileContainer);

      grid.cells.forEach(column => {
        column.forEach(cell => {
          if (cell) this.addTile(cell);
        });
      });

      this.updateScore(metadata.score);
      this.updateBestScore(metadata.bestScore);

      if (metadata.terminated) {
        metadata.over ? this.message(false) : this.message(true);
      }
    });
  }

  continue() {
    this.clearMessage();
  }

  clearContainer(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  addTile(tile) {
    const wrapper = document.createElement("div");
    const inner = document.createElement("div");
    const position = tile.previousPosition || { x: tile.x, y: tile.y };
    const positionClass = this.positionClass(position);

    const classes = ["tile", `tile-${tile.value}`, positionClass];
    if (tile.value > 2048) classes.push("tile-super");

    this.applyClasses(wrapper, classes);
    inner.classList.add("tile-inner");
    inner.textContent = tile.value;

    if (tile.previousPosition) {
      window.requestAnimationFrame(() => {
        classes[2] = this.positionClass({ x: tile.x, y: tile.y });
        this.applyClasses(wrapper, classes);
      });
    } else if (tile.mergedFrom) {
      classes.push("tile-merged");
      this.applyClasses(wrapper, classes);
      tile.mergedFrom.forEach(merged => this.addTile(merged));
    } else {
      classes.push("tile-new");
      this.applyClasses(wrapper, classes);
    }

    wrapper.appendChild(inner);
    this.tileContainer.appendChild(wrapper);
  }

  applyClasses(element, classes) {
    element.className = classes.join(" ");
  }

  normalizePosition(position) {
    return { x: position.x + 1, y: position.y + 1 };
  }

  positionClass(position) {
    const { x, y } = this.normalizePosition(position);
    return `tile-position-${x}-${y}`;
  }

  updateScore(score) {
    this.clearContainer(this.scoreContainer);
    this.clearContainer(this.dogeSays);

    const difference = score - this.score;
    this.score = score;
    this.scoreContainer.textContent = this.score;

    // Update Katko container color
    const katkoColor = this.score > 1000 ? '#0c0' : '#c00';
    this.katkoContainerColor.style.backgroundColor = katkoColor;

    const addition = document.createElement("div");
    addition.className = "score-addition";
    addition.textContent = `+${difference}`;
    this.scoreContainer.appendChild(addition);

    // Add doge message
    const message = HTMLActuator.dogeSayings[
      Math.floor(Math.random() * HTMLActuator.dogeSayings.length)
    ];
    
    if (message) {
      const messageElement = document.createElement("p");
      messageElement.textContent = message;
      messageElement.style.cssText = `
        left: ${Math.round(Math.random() * 20 + 30)}%;
        top: ${Math.round(Math.random() * 20 + 20)}%;
        color: white;
        text-shadow: 0px 0px 50px #000000;
      `;
      this.dogeSays.appendChild(messageElement);
    }
  }

  updateBestScore(bestScore) {
    this.bestContainer.textContent = bestScore;
  }

  message(won) {
    const [type, message] = won 
      ? ["game-won", "Perkele jäit"] 
      : ["game-over", "Game over!"];
    
    this.messageContainer.classList.add(type);
    this.messageContainer.querySelector("p").textContent = message;
    this.buttonsContainer.style.display = 'none';
  }

  clearMessage() {
    this.messageContainer.classList.remove("game-won", "game-over");
    this.buttonsContainer.style.display = '';
  }

  showInfo() {
    this.info.style.display = this.info.style.display === 'block' ? 'none' : 'block';
  }

  hideInfo() {
    this.info.style.display = 'none';
  }

  goKatko() {
    this.clearContainer(this.scoreContainer);
    this.clearContainer(this.katkoViesti);
    this.clearContainer(this.dogeSays);
    
    this.scoreContainer.textContent = this.score - 1000;

    const addition = document.createElement("div");
    addition.className = "score-addition";
    addition.textContent = "-1000";
    this.scoreContainer.appendChild(addition);

    const katkoImage = document.createElement("img");
    katkoImage.src = "katko.png";
    this.katkoViesti.appendChild(katkoImage);
  }
}