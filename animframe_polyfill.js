(() => {
  let lastTime = 0;
  const vendors = ['webkit', 'moz'];
  
  for (const vendor of vendors) {
    if (window.requestAnimationFrame) break;
    window.requestAnimationFrame = window[`${vendor}RequestAnimationFrame`];
    window.cancelAnimationFrame = 
      window[`${vendor}CancelAnimationFrame`] || window[`${vendor}CancelRequestAnimationFrame`];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = callback => {
      const currTime = Date.now();
      const timeToCall = Math.max(0, 16 - (currTime - lastTime));
      const id = setTimeout(() => {
        callback(currTime + timeToCall);
      }, timeToCall);
      
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = id => clearTimeout(id);
  }
})();