export class AssetLoader {
    static preloadImages() {
      const images = [
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
  
      return Promise.all(images.map(src => 
        new Promise((resolve, reject) => {
          const img = new Image();
          img.src = `assets/${src}`;
          img.onload = resolve;
          img.onerror = () => reject(`Failed to load ${src}`);
        })
      ));
    }
  }