export class ScoreManager {
    constructor() {
      this.bestScoreKey = 'bestScore';
    }
  
    get() {
      return localStorage.getItem(this.bestScoreKey) || 0;
    }
  
    set(score) {
      const currentBest = this.get();
      if (score > currentBest) {
        localStorage.setItem(this.bestScoreKey, score);
      }
    }
  }