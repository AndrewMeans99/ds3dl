<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import enemiesData from '../data/enemies.json';
import bossesData from '../data/bosses.json';
import npcsData from '../data/npcs.json';
import {
  getTodayDateString,
  getDailyCharacter,
  loadDailyState,
  saveDailyState,
  loadInfiniteState,
  saveInfiniteState,
  updateStats
} from '../utils/daily';
import { Share2, RefreshCw } from 'lucide-vue-next';

const props = defineProps({
  mode: {
    type: String,
    required: true
  },
  subGame: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['show-help', 'show-stats']);

const guesses = ref([]);
const won = ref(false);
const finished = ref(false);
const target = ref(null);

const searchQuery = ref('');
const showSuggestions = ref(false);

// Dynamically select characters dataset based on current game mode
const currentDataset = computed(() => {
  if (props.subGame === 'boss') return bossesData;
  if (props.subGame === 'npc') return npcsData;
  return enemiesData;
});

// Autocomplete suggestions filtered by search input and excluding already guessed characters
const filteredSuggestions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return [];
  
  const guessedNames = guesses.value.map(g => g.name.toLowerCase());
  return currentDataset.value.filter(char => 
    char.name.toLowerCase().includes(query) &&
    !guessedNames.includes(char.name.toLowerCase())
  );
});

// Check if Locations/Resistances/Weaknesses overlap with target character values
function checkArrayOverlap(guessArr, targetArr) {
  if (!guessArr || !targetArr) return 'incorrect';
  const sortedGuess = [...guessArr].sort().join(',');
  const sortedTarget = [...targetArr].sort().join(',');
  
  if (sortedGuess === sortedTarget) return 'correct';
  
  const hasOverlap = guessArr.some(item => targetArr.includes(item));
  return hasOverlap ? 'partial' : 'incorrect';
}

// Check difference for numeric fields (HP/Souls)
function checkNumericValue(guessVal, targetVal) {
  if (guessVal === targetVal) {
    return { status: 'correct', arrow: '' };
  }
  return {
    status: 'incorrect',
    arrow: guessVal < targetVal ? ' ↑' : ' ↓'
  };
}

// Compare user's guess character attributes with daily/infinite target
function compareGuess(guessChar) {
  const isCorrect = guessChar.name === target.value.name;

  if (props.subGame === 'npc') {
    // For Game 3 (Dialogue), we return a simplified comparison
    return {
      name: guessChar.name,
      isCorrect
    };
  }

  // Games 1 & 2 use full comparative attributes
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
    isCorrect
  };
}

function submitGuess(character) {
  if (finished.value) return;
  
  const compared = compareGuess(character);
  guesses.value.unshift(compared);
  
  searchQuery.value = '';
  showSuggestions.value = false;
  
  if (compared.isCorrect) {
    won.value = true;
    finished.value = true;
    
    if (props.mode === 'daily') {
      updateStats(props.subGame, true, guesses.value.length);
      emit('show-stats');
    }
  }
  
  saveState();
}

function saveState() {
  if (props.mode === 'daily') {
    const today = getTodayDateString();
    saveDailyState(today, props.subGame, {
      date: today,
      guesses: guesses.value,
      won: won.value,
      finished: finished.value,
      targetCharacter: target.value // Save target configuration for deterministic quotes
    });
  } else {
    saveInfiniteState(props.subGame, {
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
    const saved = loadDailyState(today, props.subGame);
    
    if (saved && saved.targetCharacter) {
      target.value = saved.targetCharacter;
    } else {
      target.value = getDailyCharacter(currentDataset.value, today, props.subGame);
    }
    
    guesses.value = saved.guesses;
    won.value = saved.won;
    finished.value = saved.finished;
  } else {
    const saved = loadInfiniteState(props.subGame);
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
  const randomIndex = Math.floor(Math.random() * currentDataset.value.length);
  const character = JSON.parse(JSON.stringify(currentDataset.value[randomIndex]));
  
  if (props.subGame === 'npc' && character.quotes && character.quotes.length > 0) {
    const quoteIndex = Math.floor(Math.random() * character.quotes.length);
    character.selectedQuote = character.quotes[quoteIndex];
  }
  
  target.value = character;
  guesses.value = [];
  won.value = false;
  finished.value = false;
  
  saveInfiniteState(props.subGame, {
    targetCharacter: target.value,
    guesses: [],
    won: false,
    finished: false
  });
}

function generateShareText() {
  const modeLabel = props.mode === 'daily' ? `DS3DL Daily` : 'DS3DL Infinite';
  const gameLabel = props.subGame === 'enemy' ? 'Enemies' : (props.subGame === 'boss' ? 'Bosses' : 'NPC Dialogue');
  const attempts = guesses.value.length;
  
  let grid = '';
  const chronologicalGuesses = [...guesses.value].reverse();
  
  if (props.subGame === 'npc') {
    chronologicalGuesses.forEach(g => {
      grid += g.isCorrect ? '🟩' : '🟥';
    });
    grid += '\n';
  } else {
    chronologicalGuesses.forEach(g => {
      let row = '';
      row += g.isCorrect ? '🟩' : '🟥';
      row += g.type.status === 'correct' ? '🟩' : '🟥';
      row += g.hp.status === 'correct' ? '🟩' : (g.hp.arrow === ' ↑' ? '⬆️' : '⬇️');
      row += g.locations.status === 'correct' ? '🟩' : (g.locations.status === 'partial' ? '🟨' : '🟥');
      row += g.souls.status === 'correct' ? '🟩' : (g.souls.arrow === ' ↑' ? '⬆️' : '⬇️');
      row += g.resistances.status === 'correct' ? '🟩' : (g.resistances.status === 'partial' ? '🟨' : '🟥');
      row += g.weaknesses.status === 'correct' ? '🟩' : (g.weaknesses.status === 'partial' ? '🟨' : '🟥');
      grid += row + '\n';
    });
  }
  
  const text = `${modeLabel} - ${gameLabel} - ${won.value ? attempts : 'X'}/guesses\n\n${grid}Play at: https://dles.aukspot.com/`;
  
  navigator.clipboard.writeText(text).then(() => {
    alert("Copied results to clipboard!");
  }).catch(err => {
    console.error("Failed to copy text: ", err);
  });
}

// Watch both mode and subGame changes to reload the context
watch([() => props.mode, () => props.subGame], () => {
  initGame();
});

onMounted(() => {
  initGame();
});
</script>

<template>
  <div class="game-container">
    <!-- Game 3 Clue Card -->
    <div v-if="subGame === 'npc' && target?.selectedQuote" class="quote-box">
      <p class="quote-title">Who said this?</p>
      <blockquote class="quote-text">"{{ target.selectedQuote }}"</blockquote>
    </div>

    <!-- Location Hint Box when guesses exceed 5 attempts in NPC Dialogue Mode -->
    <div v-if="subGame === 'npc' && guesses.length >= 5 && !won" class="hint-box">
      <strong>HINT (Locations):</strong> {{ target?.locations.join(', ') }}
    </div>

    <!-- Win Banner -->
    <div v-if="won" class="success-banner">
      <h3>VICTORY ACHIEVED</h3>
      <p>You guessed <strong>{{ target?.name }}</strong> correctly in {{ guesses.length }} tries!</p>
      <div style="margin-top: 15px; display: flex; justify-content: center; gap: 10px;">
        <button class="btn-primary" @click="generateShareText">
          <Share2 size="18" /> Share Results
        </button>
        <button v-if="mode === 'infinite'" class="btn-secondary" @click="startNewInfinite">
          <RefreshCw size="18" style="margin-right: 5px;" /> Next Round
        </button>
      </div>
    </div>

    <!-- Search Input & Autocomplete Suggestions -->
    <div v-if="!finished" class="search-wrapper">
      <input
        type="text"
        v-model="searchQuery"
        @focus="showSuggestions = true"
        placeholder="Search names..."
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

    <!-- Guesses history lists -->
    <div v-if="guesses.length > 0" style="overflow-x: auto;">
      <table v-if="subGame === 'npc'" class="guesses-table" style="max-width: 400px; margin: 25px auto 0;">
        <colgroup>
          <col style="width: 100%;" />
        </colgroup>
        <thead>
          <tr>
            <th>Guess Name</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="guess in guesses" :key="guess.name" class="guess-row" :class="{ 'guess-row-win': guess.isCorrect }">
            <td class="guess-cell guess-cell-name" :class="guess.isCorrect ? 'guess-correct' : 'guess-incorrect'">
              {{ guess.name }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Enemies & Bosses Comparative attribute grid -->
      <table v-else class="guesses-table">
        <colgroup>
          <col style="width: 16%;" />
          <col style="width: 9%;" />
          <col style="width: 10%;" />
          <col style="width: 25%;" />
          <col style="width: 10%;" />
          <col style="width: 15%;" />
          <col style="width: 15%;" />
        </colgroup>
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
          <tr v-for="guess in guesses" :key="guess.name" class="guess-row" :class="{ 'guess-row-win': guess.isCorrect }">
            <td class="guess-cell guess-cell-name" :class="guess.isCorrect ? 'guess-correct' : 'guess-incorrect'">
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
