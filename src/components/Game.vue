<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import charactersData from '../data/characters.json';
import {
  getTodayDateString,
  getDailyCharacter,
  loadDailyState,
  saveDailyState,
  loadInfiniteState,
  saveInfiniteState,
  updateStats,
  loadStats
} from '../utils/daily';
import { Share2, RefreshCw, Trophy, Info } from 'lucide-vue-next';

const props = defineProps({
  mode: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['show-help', 'show-stats']);

const characters = ref(charactersData);
const target = ref(null);
const guesses = ref([]);
const won = ref(false);
const finished = ref(false);

const searchQuery = ref('');
const showSuggestions = ref(false);

// Filter suggestions based on input query and already guessed characters
const filteredSuggestions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return [];
  
  const guessedNames = guesses.value.map(g => g.name.toLowerCase());
  return characters.value.filter(char => 
    char.name.toLowerCase().includes(query) &&
    !guessedNames.includes(char.name.toLowerCase())
  );
});

// Calculate overlap color classification for list values
function checkArrayOverlap(guessArr, targetArr) {
  if (!guessArr || !targetArr) return 'incorrect';
  
  // Sort and compare strings for exact equality
  const sortedGuess = [...guessArr].sort().join(',');
  const sortedTarget = [...targetArr].sort().join(',');
  
  if (sortedGuess === sortedTarget) {
    return 'correct';
  }
  
  // Check for any intersection
  const hasOverlap = guessArr.some(item => targetArr.includes(item));
  return hasOverlap ? 'partial' : 'incorrect';
}

// Check value difference for numbers (HP / Souls)
function checkNumericValue(guessVal, targetVal) {
  if (guessVal === targetVal) {
    return { status: 'correct', arrow: '' };
  }
  return {
    status: 'incorrect',
    arrow: guessVal < targetVal ? ' ↑' : ' ↓'
  };
}

// Compare target character vs guess character
function compareGuess(guessChar) {
  const hpResult = checkNumericValue(guessChar.hp, target.value.hp);
  const soulsResult = checkNumericValue(guessChar.souls, target.value.souls);
  const locationStatus = checkArrayOverlap(guessChar.locations, target.value.locations);
  const resistanceStatus = checkArrayOverlap(guessChar.resistances, target.value.resistances);
  const weaknessStatus = checkArrayOverlap(guessChar.weaknesses, target.value.weaknesses);
  const isTypeCorrect = guessChar.type === target.value.type;

  return {
    name: guessChar.name,
    type: { value: guessChar.type, status: isTypeCorrect ? 'correct' : 'incorrect' },
    hp: { value: guessChar.hp, status: hpResult.status, arrow: hpResult.arrow },
    locations: { value: guessChar.locations.join(', '), status: locationStatus },
    souls: { value: guessChar.souls, status: soulsResult.status, arrow: soulsResult.arrow },
    resistances: { value: guessChar.resistances.join(', ') || 'None', status: resistanceStatus },
    weaknesses: { value: guessChar.weaknesses.join(', ') || 'None', status: weaknessStatus },
    isCorrect: guessChar.name === target.value.name
  };
}

// Add guess to local lists
function submitGuess(character) {
  if (finished.value) return;
  
  const compared = compareGuess(character);
  guesses.value.unshift(compared); // Show newest guess first
  
  searchQuery.value = '';
  showSuggestions.value = false;
  
  if (compared.isCorrect) {
    won.value = true;
    finished.value = true;
    
    // Only update daily persistent stats if it's the daily mode
    if (props.mode === 'daily') {
      updateStats(true, guesses.value.length);
      emit('show-stats');
    }
  }
  
  saveState();
}

function saveState() {
  if (props.mode === 'daily') {
    const today = getTodayDateString();
    saveDailyState(today, {
      date: today,
      guesses: guesses.value,
      won: won.value,
      finished: finished.value
    });
  } else {
    saveInfiniteState({
      targetCharacter: target.value,
      guesses: guesses.value,
      won: won.value,
      finished: finished.value
    });
  }
}

function initGame() {
  if (props.mode === 'daily') {
    const today = getTodayDateString();
    target.value = getDailyCharacter(characters.value, today);
    
    const saved = loadDailyState(today);
    guesses.value = saved.guesses;
    won.value = saved.won;
    finished.value = saved.finished;
  } else {
    const saved = loadInfiniteState();
    if (saved && saved.targetCharacter) {
      target.value = saved.targetCharacter;
      guesses.value = saved.guesses;
      won.value = saved.won;
      finished.value = saved.finished;
    } else {
      startNewInfinite();
    }
  }
}

function startNewInfinite() {
  const randomIndex = Math.floor(Math.random() * characters.value.length);
  target.value = characters.value[randomIndex];
  guesses.value = [];
  won.value = false;
  finished.value = false;
  saveInfiniteState({
    targetCharacter: target.value,
    guesses: [],
    won: false,
    finished: false
  });
}

// Generate shareable emoji representation
function generateShareText() {
  const modeText = props.mode === 'daily' ? `DS3DL Daily (${getTodayDateString()})` : 'DS3DL Infinite Play';
  const attempts = guesses.value.length;
  
  let grid = '';
  // Convert guesses (in correct order, so reverse guesses to show history chronological)
  const chronologicalGuesses = [...guesses.value].reverse();
  
  chronologicalGuesses.forEach(g => {
    let row = '';
    
    // Name
    row += g.isCorrect ? '🟩' : '🟥';
    // Type
    row += g.type.status === 'correct' ? '🟩' : '🟥';
    // HP
    row += g.hp.status === 'correct' ? '🟩' : (g.hp.arrow === ' ↑' ? '⬆️' : '⬇️');
    // Locations
    row += g.locations.status === 'correct' ? '🟩' : (g.locations.status === 'partial' ? '🟨' : '🟥');
    // Souls
    row += g.souls.status === 'correct' ? '🟩' : (g.souls.arrow === ' ↑' ? '⬆️' : '⬇️');
    // Resistances
    row += g.resistances.status === 'correct' ? '🟩' : (g.resistances.status === 'partial' ? '🟨' : '🟥');
    // Weaknesses
    row += g.weaknesses.status === 'correct' ? '🟩' : (g.weaknesses.status === 'partial' ? '🟨' : '🟥');
    
    grid += row + '\n';
  });
  
  const text = `${modeText} - ${won.value ? attempts : 'X'}/guesses\n\n${grid}Play at: https://dles.aukspot.com/`;
  
  navigator.clipboard.writeText(text).then(() => {
    alert("Copied results to clipboard!");
  }).catch(err => {
    console.error("Failed to copy text: ", err);
  });
}

// Watch for mode shifts to re-initialize targets
watch(() => props.mode, () => {
  initGame();
});

onMounted(() => {
  initGame();
});
</script>

<template>
  <div class="game-container">
    <!-- Win Banner -->
    <div v-if="won" class="success-banner">
      <h3>VICTORY ACHIEVED</h3>
      <p>You guessed <strong>{{ target?.name }}</strong> correctly in {{ guesses.length }} tries!</p>
      <div style="margin-top: 15px; display: flex; justify-content: center; gap: 10px;">
        <button class="btn-primary" @click="generateShareText">
          <Share2 size="18" /> Share Results
        </button>
        <button v-if="mode === 'infinite'" class="btn-secondary" @click="startNewInfinite">
          <RefreshCw size="18" style="margin-right: 5px;" /> Next Character
        </button>
      </div>
    </div>

    <!-- Search Input & Autocomplete Suggestions -->
    <div v-if="!finished" class="search-wrapper">
      <input
        type="text"
        v-model="searchQuery"
        @focus="showSuggestions = true"
        placeholder="Enter a DS3 boss, NPC, or enemy name..."
        class="search-input"
      />
      
      <ul v-if="showSuggestions && filteredSuggestions.length > 0" class="suggestions-list">
        <li
          v-for="char in filteredSuggestions"
          :key="char.name"
          @click="submitGuess(char)"
          class="suggestion-item"
        >
          <span>{{ char.name }}</span>
          <span class="suggestion-type">{{ char.type }}</span>
        </li>
      </ul>
    </div>

    <div v-else-if="!won" class="success-banner" style="background: rgba(231, 76, 60, 0.15); border-color: var(--color-red);">
      <h3>YOU DIED</h3>
      <p>The target was <strong>{{ target?.name }}</strong>.</p>
      <button v-if="mode === 'infinite'" class="btn-primary" @click="startNewInfinite">
        Try Again
      </button>
    </div>

    <!-- Guesses history list -->
    <div v-if="guesses.length > 0" style="overflow-x: auto;">
      <table class="guesses-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>HP</th>
            <th>Location(s)</th>
            <th>Souls</th>
            <th>Resistances</th>
            <th>Weaknesses</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="guess in guesses" :key="guess.name" class="guess-row">
            <td class="guess-cell guess-cell-name guess-incorrect" :class="{ 'guess-correct': guess.isCorrect }">
              {{ guess.name }}
            </td>
            <td class="guess-cell" :class="'guess-' + guess.type.status">
              {{ guess.type.value }}
            </td>
            <td class="guess-cell" :class="'guess-' + guess.hp.status">
              {{ guess.hp.value.toLocaleString() }}{{ guess.hp.arrow }}
            </td>
            <td class="guess-cell" :class="'guess-' + guess.locations.status">
              {{ guess.locations.value }}
            </td>
            <td class="guess-cell" :class="'guess-' + guess.souls.status">
              {{ guess.souls.value.toLocaleString() }}{{ guess.souls.arrow }}
            </td>
            <td class="guess-cell" :class="'guess-' + guess.resistances.status">
              {{ guess.resistances.value }}
            </td>
            <td class="guess-cell" :class="'guess-' + guess.weaknesses.status">
              {{ guess.weaknesses.value }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
