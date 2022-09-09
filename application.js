// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
    new GameManager(4, KeyboardInputManager, HTMLActuator, LocalScoreManager);
  });
  
  
      var imageList = [
          "2.png",
          "4.png",
          "8.png",
          "16.png",
          "32.png",
          "64.png",
          "128.png",
          "256.png",
          "512.png",
          "1024.png",
          "2048.png",
          "katko.png"
  
      ];
      for(var i = 0; i < imageList.length; i++ ) 
      {
          var imageObject = new Image();
          imageObject.src = imageList[i];
      }
  