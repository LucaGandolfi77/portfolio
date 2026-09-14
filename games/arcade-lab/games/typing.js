window.Games = window.Games || {};
window.Games.typing = function(ctx) {
  var stage = ctx.stage;
  var difficulty = ctx.difficulty || 'easy';
  var currentRound = 0;
  var totalRounds = 5;
  var startTime = 0;
  var elapsedTime = 0;
  var currentWord = '';
  var typedText = '';
  var correctChars = 0;
  var totalChars = 0;
  var isPlaying = false;
  var timerInterval = null;

  var words = {
    easy: ['cat', 'sun', 'run', 'top', 'hat', 'dog', 'box', 'red', 'big', 'fun', 'joy', 'map', 'pen', 'cup', 'bed', 'fish', 'tree', 'star', 'moon', 'lake'],
    medium: ['apple', 'river', 'guitar', 'planet', 'market', 'island', 'forest', 'bridge', 'pencil', 'rocket', 'flower', 'sunset', 'ocean', 'planet', 'rocket', 'flower', 'castle', 'forest', 'bridge', 'market'],
    hard: ['the sky', 'blue sea', 'red hat', 'big dog', 'hot sun', 'old map', 'new car', 'red box', 'top hat', 'big jar', 'hot pan', 'old cup', 'new bed', 'red pen', 'big log', 'hot tea', 'old boot', 'new key', 'red jam', 'big pig']
  };

  var wordList = words[difficulty] || words.easy;
  var wordDisplay, inputField, wpmDisplay, accuracyDisplay, timerDisplay, roundDisplay, scoreDisplay, messageDisplay;

  function getWPM() {
    var timeInMinutes = elapsedTime / 60;
    if (timeInMinutes === 0) return 0;
    return Math.round((correctChars / 5) / timeInMinutes);
  }

  function getAccuracy() {
    if (totalChars === 0) return 100;
    return Math.round((correctChars / totalChars) * 100);
  }

  function getScore() {
    var wpm = getWPM();
    var accuracy = getAccuracy();
    return Math.round(wpm * (accuracy / 100));
  }

  function updateDisplays() {
    timerDisplay.textContent = elapsedTime.toFixed(1) + 's';
    wpmDisplay.textContent = getWPM() + ' WPM';
    accuracyDisplay.textContent = getAccuracy() + '%';
    scoreDisplay.textContent = 'Score: ' + getScore();
    roundDisplay.textContent = 'Round: ' + (currentRound + 1) + '/' + totalRounds;
  }

  function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    startTime = Date.now();
    timerInterval = setInterval(function() {
      elapsedTime = (Date.now() - startTime) / 1000;
      updateDisplays();
    }, 100);
  }

  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
  }

  function nextRound() {
    currentRound++;
    if (currentRound >= totalRounds) {
      endGame();
      return;
    }
    typedText = '';
    correctChars = 0;
    totalChars = 0;
    currentWord = wordList[Math.floor(Math.random() * wordList.length)];
    wordDisplay.textContent = currentWord;
    inputField.value = '';
    inputField.disabled = false;
    inputField.focus();
    messageDisplay.textContent = '';
    updateDisplays();
    startTimer();
  }

  function endGame() {
    stopTimer();
    isPlaying = false;
    inputField.disabled = true;
    var score = getScore();
    var won = score > 0;
    messageDisplay.textContent = 'Game Over! Final Score: ' + score;
    ctx.Session.trackComplete('typing', score, won);
    ctx.Save.addScore('typing', score);
  }

  function init() {
    stage.innerHTML = '';
    stage.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;font-family:Arial,sans-serif;background:#1a1a2e;color:white;';

    var container = document.createElement('div');
    container.style.cssText = 'text-align:center;width:90%;max-width:600px;';

    roundDisplay = document.createElement('div');
    roundDisplay.style.cssText = 'font-size:1.2em;margin-bottom:10px;color:#4ade80;';
    roundDisplay.textContent = 'Round: 1/' + totalRounds;

    wordDisplay = document.createElement('div');
    wordDisplay.style.cssText = 'font-size:2em;margin:20px 0;min-height:50px;font-weight:bold;color:#4ade80;';

    var inputContainer = document.createElement('div');
    inputContainer.style.cssText = 'margin:20px 0;';

    inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.style.cssText = 'padding:12px;font-size:1.5em;width:80%;max-width:400px;background:#2d2d44;border:2px solid #4ade80;color:white;text-align:center;border-radius:8px;';
    inputField.placeholder = 'Type here...';

    inputField.addEventListener('input', function() {
      typedText = inputField.value;
      totalChars = typedText.length;
      correctChars = 0;
      for (var i = 0; i < typedText.length; i++) {
        if (typedText[i] === currentWord[i]) {
          correctChars++;
        }
      }
      updateDisplays();

      if (typedText === currentWord) {
        stopTimer();
        inputField.disabled = true;
        messageDisplay.textContent = 'Correct! WPM: ' + getWPM();
        setTimeout(function() {
          nextRound();
        }, 1000);
      }
    });

    inputContainer.appendChild(inputField);

    timerDisplay = document.createElement('div');
    timerDisplay.style.cssText = 'font-size:1.5em;margin:10px 0;color:#ff6b6b;';
    timerDisplay.textContent = '0.0s';

    var statsContainer = document.createElement('div');
    statsContainer.style.cssText = 'display:flex;justify-content:space-around;margin:15px 0;flex-wrap:wrap;';

    wpmDisplay = document.createElement('div');
    wpmDisplay.style.cssText = 'font-size:1.2em;color:#4ade80;';
    wpmDisplay.textContent = '0 WPM';

    accuracyDisplay = document.createElement('div');
    accuracyDisplay.style.cssText = 'font-size:1.2em;color:#ffd93d;';
    accuracyDisplay.textContent = '100%';

    statsContainer.appendChild(wpmDisplay);
    statsContainer.appendChild(accuracyDisplay);

    scoreDisplay = document.createElement('div');
    scoreDisplay.style.cssText = 'font-size:1.3em;margin:10px 0;color:#4ade80;';
    scoreDisplay.textContent = 'Score: 0';

    messageDisplay = document.createElement('div');
    messageDisplay.style.cssText = 'font-size:1.1em;margin:15px 0;min-height:30px;color:#ffd93d;';

    var instructions = document.createElement('div');
    instructions.style.cssText = 'font-size:0.9em;color:#888;margin-bottom:20px;';
    instructions.textContent = 'Type the word as fast as possible!';

    container.appendChild(roundDisplay);
    container.appendChild(instructions);
    container.appendChild(wordDisplay);
    container.appendChild(inputContainer);
    container.appendChild(timerDisplay);
    container.appendChild(statsContainer);
    container.appendChild(scoreDisplay);
    container.appendChild(messageDisplay);

    stage.appendChild(container);

    currentRound = 0;
    typedText = '';
    correctChars = 0;
    totalChars = 0;
    isPlaying = true;

    currentWord = wordList[Math.floor(Math.random() * wordList.length)];
    wordDisplay.textContent = currentWord;
    inputField.focus();

    updateDisplays();
    startTimer();
  }

  init();
};