window.requestAnimationFrame(() => {
    new GameManager(4, KeyboardInputManager, HTMLActuator, LocalScoreManager);
  });
  
  const imageList = [
    "2.png", "4.png", "8.png", "16.png", "32.png", "64.png",
    "128.png", "256.png", "512.png", "1024.png", "2048.png", "katko.png"
  ];
  
  for (const image of imageList) {
    new Image().src = image;
  }