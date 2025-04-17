const API_URL = 'http://your-server.com:3000'; // Update with your server URL

// Add to existing code
async function submitScore(name, score) {
  try {
    const response = await fetch(`${API_URL}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, score })
    });
    return await response.json();
  } catch (err) {
    console.error('Score submission failed:', err);
    return null;
  }
}

async function getLeaderboard() {
  try {
    const response = await fetch(`${API_URL}/scores`);
    return await response.json();
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    return [];
  }
}

// Add these to your GameManager class
async showGameOver() {
  const leaderboard = await getLeaderboard();
  this.actuator.showGameOver(leaderboard);
}

async submitScore(name) {
  return submitScore(name, this.score);
}