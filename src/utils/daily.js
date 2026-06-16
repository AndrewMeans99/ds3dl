// Simple seedable pseudo-random number generator (LCG)
export function getSeededRandom(seed) {
  const m = 0x80000000; // 2**31
  const a = 1103515245;
  const c = 12345;
  
  let state = seed ? seed : Math.floor(Math.random() * m);
  
  return function() {
    state = (a * state + c) % m;
    return state / (m - 1);
  };
}

// Generate a seed integer from a YYYY-MM-DD date string + optional modifier
export function getSeedFromDate(dateStr, modifier = 0) {
  let hash = 0;
  const combined = dateStr + modifier.toString();
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Get the date string in YYYY-MM-DD UTC format
export function getTodayDateString() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get the daily character based on UTC date and game type
export function getDailyCharacter(characters, dateStr, subGame) {
  // Use different modifiers for seed to avoid picking same index across modes
  const modMap = { enemy: 100, boss: 200, npc: 300 };
  const seed = getSeedFromDate(dateStr, modMap[subGame] || 0);
  const random = getSeededRandom(seed);
  
  const index = Math.floor(random() * characters.length);
  const target = characters[index];
  
  // If it's an NPC, pick a quote deterministically
  if (subGame === 'npc' && target.quotes && target.quotes.length > 0) {
    const quoteIndex = Math.floor(random() * target.quotes.length);
    target.selectedQuote = target.quotes[quoteIndex];
  }
  
  return target;
}

// LocalStorage helpers for Daily Mode (partitioned by subGame)
export function loadDailyState(dateStr, subGame) {
  const data = localStorage.getItem(`ds3dl_daily_${subGame}_${dateStr}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing daily state", e);
    }
  }
  return {
    date: dateStr,
    guesses: [],
    won: false,
    finished: false
  };
}

export function saveDailyState(dateStr, subGame, state) {
  localStorage.setItem(`ds3dl_daily_${subGame}_${dateStr}`, JSON.stringify(state));
}

// LocalStorage helpers for Infinite Mode (partitioned by subGame)
export function loadInfiniteState(subGame) {
  const data = localStorage.getItem(`ds3dl_infinite_${subGame}_state`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing infinite state", e);
    }
  }
  return {
    targetCharacter: null,
    guesses: [],
    won: false,
    finished: false
  };
}

export function saveInfiniteState(subGame, state) {
  localStorage.setItem(`ds3dl_infinite_${subGame}_state`, JSON.stringify(state));
}

// Statistics helpers (partitioned by subGame)
export function loadStats(subGame) {
  const data = localStorage.getItem(`ds3dl_stats_${subGame}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing stats", e);
    }
  }
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessesDist: [0, 0, 0, 0, 0, 0, 0] // 1 guess, 2 guesses ... up to 6, and 7+
  };
}

export function saveStats(subGame, stats) {
  localStorage.setItem(`ds3dl_stats_${subGame}`, JSON.stringify(stats));
}

export function updateStats(subGame, isWon, guessCount) {
  const stats = loadStats(subGame);
  stats.gamesPlayed += 1;
  
  if (isWon) {
    stats.gamesWon += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.maxStreak) {
      stats.maxStreak = stats.currentStreak;
    }
    
    const distIndex = Math.min(guessCount - 1, 6);
    stats.guessesDist[distIndex] = (stats.guessesDist[distIndex] || 0) + 1;
  } else {
    stats.currentStreak = 0;
  }
  
  saveStats(subGame, stats);
  return stats;
}
