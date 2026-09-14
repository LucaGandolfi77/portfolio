window.Games = window.Games || {};
window.Games.wordlock = function(ctx) {
  var stage = ctx.stage;
  var difficulty = ctx.difficulty || 'easy';
  var currentRound = 0;
  var totalRounds = 8;
  var currentWord = '';
  var scrambledWord = '';
  var score = 0;
  var roundScore = 0;
  var isPlaying = false;
  var timerInterval = null;
  var timeRemaining = 30;
  var showHint = false;

  var words = {
    easy: ['book', 'hand', 'tree', 'fish', 'moon', 'star', 'bird', 'lamp', 'door', 'wind', 'rain', 'fire', 'boat', 'love', 'time', 'home', 'play', 'jump', 'sing', 'walk'],
    medium: ['apple', 'river', 'ocean', 'house', 'light', 'music', 'dance', 'smile', 'dream', 'cloud', 'storm', 'earth', 'flame', 'grace', 'heart', 'knife', 'lemon', 'night', 'stone', 'water'],
    hard: ['bridge', 'castle', 'dragon', 'flower', 'garden', 'island', 'jungle', 'knight', 'legend', 'mirror', 'pirate', 'rocket', 'shadow', 'temple', 'window', 'zombie', 'wizard', 'forest', 'planet', 'museum']
  };

  var wordList = words[difficulty] || words.easy;
  var wordDisplay, scrambledDisplay, inputField, scoreDisplay, roundDisplay, timerDisplay, messageDisplay, hintDisplay;

  function shuffleWord(word) {
    var arr = word.split('');
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    var result = arr.join('');
    if (result === word && word.length > 1) {
      var temp2 = arr[0];
      arr[0] = arr[1];
      arr[1] = temp2;
      result = arr.join('');
    }
    return result;
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timeRemaining = 30;
    showHint = false;
    timerInterval = setInterval(function() {
      timeRemaining--;
      timerDisplay.textContent = timeRemaining + 's';

      if (timeRemaining <= 20 && !showHint) {
        showHint = true;
        hintDisplay.textContent = 'Hint: First letter is "' + currentWord[0].toUpperCase() + '"';
        hintDisplay.style.display = 'block';
      }

      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        messageDisplay.textContent = 'Time\'s up! The word was: ' + currentWord.toUpperCase();
        setTimeout(function() {
          nextRound();
        }, 1500);
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
  }

  function calculateScore() {
    var timeUsed = 30 - timeRemaining;
    var basePoints = 100;
    var timePenalty = timeUsed * 3;
    return Math.max(10, basePoints - timePenalty);
  }

  function nextRound() {
    currentRound++;
    if (currentRound >= totalRounds) {
      endGame();
      return;
    }

    inputField.value = '';
    hintDisplay.style.display = 'none';
    messageDisplay.textContent = '';
    showHint = false;

    currentWord = wordList[Math.floor(Math.random() * wordList.length)];
    scrambledWord = shuffleWord(currentWord);
    while (scrambledWord === currentWord) {
      scrambledWord = shuffleWord(currentWord);
    }

    wordDisplay.textContent = currentWord.toUpperCase();
    scrambledDisplay.textContent = scrambledWord.toUpperCase();

    updateDisplays();
    startTimer();
    inputField.focus();
  }

  function endGame() {
    stopTimer();
    isPlaying = false;
    inputField.disabled = true;
    var won = score > 0;
    messageDisplay.textContent = 'Game Over! Final Score: ' + score;
    ctx.Session.trackComplete('wordlock', score, won);
    ctx.Save.addScore('wordlock', score);
  }

  function updateDisplays() {
    roundDisplay.textContent = 'Round: ' + (currentRound + 1) + '/' + totalRounds;
    scoreDisplay.textContent = 'Score: ' + score;
  }

  function init() {
    stage.innerHTML = '';
    stage.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;font-family:Arial,sans-serif;background:#1a1a2e;color:white;';

    var container = document.createElement('div');
    container.style.cssText = 'text-align:center;width:90%;max-width:600px;';

    roundDisplay = document.createElement('div');
    roundDisplay.style.cssText = 'font-size:1.2em;margin-bottom:10px;color:#f472b6;';
    roundDisplay.textContent = 'Round: 1/' + totalRounds;

    var instructions = document.createElement('div');
    instructions.style.cssText = 'font-size:0.9em;color:#888;margin-bottom:15px;';
    instructions.textContent = 'Unscramble the word! Type your answer below.';

    scrambledDisplay = document.createElement('div');
    scrambledDisplay.style.cssText = 'font-size:2.5em;margin:20px 0;letter-spacing:8px;font-weight:bold;color:#f472b6;min-height:50px;';

    var inputContainer = document.createElement('div');
    inputContainer.style.cssText = 'margin:15px 0;';

    inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.style.cssText = 'padding:12px;font-size:1.5em;width:70%;max-width:300px;background:#2d2d44;border:2px solid #f472b6;color:white;text-align:center;border-radius:8px;';
    inputField.placeholder = 'Type word...';

    inputField.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && isPlaying) {
        var guess = inputField.value.toLowerCase().trim();
        if (guess === currentWord) {
          stopTimer();
          roundScore = calculateScore();
          score += roundScore;
          messageDisplay.textContent = 'Correct! +' + roundScore + ' points';
          updateDisplays();
          setTimeout(function() {
            nextRound();
          }, 1200);
        } else {
          messageDisplay.textContent = 'Try again!';
          inputField.value = '';
        }
      }
    });

    inputContainer.appendChild(inputField);

    timerDisplay = document.createElement('div');
    timerDisplay.style.cssText = 'font-size:1.5em;margin:10px 0;color:#ff6b6b;';
    timerDisplay.textContent = '30s';

    scoreDisplay = document.createElement('div');
    scoreDisplay.style.cssText = 'font-size:1.3em;margin:10px 0;color:#f472b6;';
    scoreDisplay.textContent = 'Score: 0';

    hintDisplay = document.createElement('div');
    hintDisplay.style.cssText = 'font-size:1em;margin:10px 0;color:#ffd93d;display:none;';
    hintDisplay.textContent = '';

    messageDisplay = document.createElement('div');
    messageDisplay.style.cssText = 'font-size:1.1em;margin:15px 0;min-height:30px;color:#ffd93d;';

    container.appendChild(roundDisplay);
    container.appendChild(instructions);
    container.appendChild(scrambledDisplay);
    container.appendChild(inputContainer);
    container.appendChild(timerDisplay);
    container.appendChild(scoreDisplay);
    container.appendChild(hintDisplay);
    container.appendChild(messageDisplay);

    stage.appendChild(container);

    currentRound = 0;
    score = 0;
    isPlaying = true;

    currentWord = wordList[Math.floor(Math.random() * wordList.length)];
    scrambledWord = shuffleWord(currentWord);
    while (scrambledWord === currentWord) {
      scrambledWord = shuffleWord(currentWord);
    }

    wordDisplay = document.createElement('div');
    wordDisplay.style.cssText = 'display:none;';
    wordDisplay.textContent = currentWord;

    scrambledDisplay.textContent = scrambledWord.toUpperCase();
    updateDisplays();
    startTimer();
    inputField.focus();
  }

  init();
};