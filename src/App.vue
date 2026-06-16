<script setup>
import { ref, onMounted, watch } from 'vue';
import Game from './components/Game.vue';
import { Info, BarChart2, X } from 'lucide-vue-next';
import { loadStats } from './utils/daily';

const mode = ref('daily'); // 'daily' or 'infinite'
const subGame = ref('enemy'); // 'enemy', 'boss', or 'npc'

const showHelpModal = ref(false);
const showStatsModal = ref(false);
const stats = ref({
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessesDist: [0, 0, 0, 0, 0, 0, 0]
});

function toggleMode(newMode) {
  mode.value = newMode;
}

function selectSubGame(newSubGame) {
  subGame.value = newSubGame;
}

function openHelp() {
  showHelpModal.value = true;
}

function openStats() {
  stats.value = loadStats(subGame.value);
  showStatsModal.value = true;
}

// Watch active sub-game to sync stats if stats modal is open
watch(subGame, () => {
  if (showStatsModal.value) {
    stats.value = loadStats(subGame.value);
  }
});

onMounted(() => {
  const hasVisited = localStorage.getItem('ds3dl_visited');
  if (!hasVisited) {
    showHelpModal.value = true;
    localStorage.setItem('ds3dl_visited', 'true');
  }
});
</script>

<template>
  <div id="main-layout">
    <!-- Header -->
    <header class="header-container">
      <h1 class="main-title">DS3<span>DL</span></h1>
      <p class="subtitle">Dark Souls III Daily Guesser</p>
    </header>

    <!-- Top Controls: Help & Stats -->
    <div class="top-controls">
      <button class="btn-icon" @click="openHelp" aria-label="How to play">
        <Info size="20" />
      </button>
      <button class="btn-icon" @click="openStats" aria-label="Statistics">
        <BarChart2 size="20" />
      </button>
    </div>

    <!-- Mode Switcher -->
    <div class="mode-container">
      <button 
        class="btn-mode" 
        :class="{ active: mode === 'daily' }" 
        @click="toggleMode('daily')"
      >
        Daily Challenge
      </button>
      <button 
        class="btn-mode" 
        :class="{ active: mode === 'infinite' }" 
        @click="toggleMode('infinite')"
      >
        Infinite Play
      </button>
    </div>

    <!-- Sub-Game Switcher tabs -->
    <div class="subgame-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: subGame === 'enemy' }" 
        @click="selectSubGame('enemy')"
      >
        Enemies
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: subGame === 'boss' }" 
        @click="selectSubGame('boss')"
      >
        Bosses
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: subGame === 'npc' }" 
        @click="selectSubGame('npc')"
      >
        NPC Dialogue
      </button>
    </div>

    <!-- Game Card Component -->
    <main class="game-card">
      <Game 
        :mode="mode" 
        :sub-game="subGame"
        @show-help="openHelp" 
        @show-stats="openStats" 
      />
    </main>

    <!-- Help / Instructions Modal -->
    <div v-if="showHelpModal" class="modal-overlay" @click.self="showHelpModal = false">
      <div class="modal-content">
        <button class="modal-close" @click="showHelpModal = false">
          <X size="24" />
        </button>
        <h2 class="modal-title">How To Play</h2>
        <div class="help-section">
          <p>Test your Dark Souls III knowledge across three distinct games!</p>
          
          <h4 style="margin-top: 15px;">1. Enemies & Bosses Games</h4>
          <p>Guess the target character based on standard feedback attributes. The tile colors show your proximity to the target:</p>
          <ul>
            <li><strong>Type:</strong> Exact match.</li>
            <li><strong>HP / Souls:</strong> Shows ↑ if target has higher value, ↓ if lower.</li>
            <li><strong>Locations / Resistances / Weaknesses:</strong> Green (exact), Yellow (partial overlap), Red (no overlap).</li>
          </ul>

          <h4 style="margin-top: 15px;">2. NPC Dialogue Game</h4>
          <p>Read the dialogue quote displayed at the top and guess which NPC spoke it! 
             Guesses are recorded as a history log. **If you guess incorrectly 5 times, their location(s) will be revealed as a hint!**</p>

          <h4 style="margin-top: 20px;">Color Codes:</h4>
          <div class="help-grid">
            <div class="help-item">
              <span class="help-badge guess-correct">Green</span>
              <span>Correct match</span>
            </div>
            <div class="help-item">
              <span class="help-badge guess-partial">Yellow</span>
              <span>Partial match</span>
            </div>
            <div class="help-item">
              <span class="help-badge guess-incorrect">Red</span>
              <span>Incorrect / No overlap</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Modal -->
    <div v-if="showStatsModal" class="modal-overlay" @click.self="showStatsModal = false">
      <div class="modal-content">
        <button class="modal-close" @click="showStatsModal = false">
          <X size="24" />
        </button>
        <h2 class="modal-title">Your Statistics</h2>
        <p style="color: var(--text-gold); text-transform: uppercase; font-size: 0.9rem; font-family: var(--font-heading); margin-top: -10px; margin-bottom: 20px;">
          Mode: {{ subGame === 'enemy' ? 'Enemies' : (subGame === 'boss' ? 'Bosses' : 'NPC Dialogue') }}
        </p>
        
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ stats.gamesPlayed }}</div>
            <div class="stat-label">Played</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">
              {{ stats.gamesPlayed ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0 }}%
            </div>
            <div class="stat-label">Win %</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.currentStreak }}</div>
            <div class="stat-label">Streak</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.maxStreak }}</div>
            <div class="stat-label">Max Streak</div>
          </div>
        </div>

        <h3 class="modal-title" style="font-size: 1.2rem; margin-top: 30px; margin-bottom: 15px;">Guess Distribution</h3>
        <div style="text-align: left; padding: 0 10px;">
          <div 
            v-for="(count, index) in stats.guessesDist" 
            :key="index"
            style="display: flex; align-items: center; margin-bottom: 8px;"
          >
            <span style="width: 25px; font-weight: bold; color: var(--text-gold);">
              {{ index === 6 ? '7+' : index + 1 }}
            </span>
            <div style="flex-grow: 1; background: var(--bg-darker); height: 20px; border-radius: 3px; overflow: hidden;">
              <div 
                :style="{ width: `${stats.gamesWon ? (count / stats.gamesWon) * 100 : 0}%` }"
                style="background: linear-gradient(90deg, var(--ember-primary), var(--ember-secondary)); height: 100%; display: flex; align-items: center; justify-content: flex-end; padding-right: 5px; box-sizing: border-box; min-width: 15px;"
              >
                <span style="font-size: 0.75rem; color: #fff; font-weight: bold;">{{ count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#main-layout {
  min-height: 100%;
}

.subgame-tabs {
  display: flex;
  justify-content: center;
  gap: 0;
  margin-bottom: 15px;
  background: var(--bg-card);
  border: 1px solid var(--border-dark);
  border-radius: 6px;
  padding: 4px;
}

.tab-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 10px 20px;
  font-family: var(--font-heading);
  font-size: 0.85rem;
  letter-spacing: 1px;
  cursor: pointer;
  flex: 1;
  text-align: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  text-transform: uppercase;
}

.tab-btn.active {
  background: var(--bg-darker);
  color: var(--text-gold);
  border: 1px solid var(--border-gold-glow);
}

.tab-btn:hover:not(.active) {
  color: var(--text-primary);
  background: rgba(255,255,255,0.02);
}
</style>
