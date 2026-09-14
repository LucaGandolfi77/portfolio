window.Games = window.Games || {};
window.Games.colormix = function(ctx) {
  var stage = ctx.stage;
  var difficulty = ctx.difficulty || 'easy';
  var currentRound = 0;
  var totalRounds = 5;
  var score = 0;
  var isPlaying = false;

  var difficulties = {
    easy: { tolerance: 50 },
    medium: { tolerance: 30 },
    hard: { tolerance: 15 }
  };

  var config = difficulties[difficulty] || difficulties.easy;

  var targetColors = {
    easy: [
      { r: 255, g: 0, b: 0, name: 'Red' },
      { r: 0, g: 0, b: 255, name: 'Blue' },
      { r: 0, g: 255, b: 0, name: 'Green' },
      { r: 255, g: 255, b: 0, name: 'Yellow' },
      { r: 128, g: 0, b: 128, name: 'Purple' }
    ],
    medium: [
      { r: 255, g: 165, b: 0, name: 'Orange' },
      { r: 0, g: 128, b: 128, name: 'Teal' },
      { r: 255, g: 0, b: 255, name: 'Magenta' },
      { r: 128, g: 128, b: 0, name: 'Olive' },
      { r: 0, g: 128, b: 0, name: 'Dark Green' }
    ],
    hard: [
      { r: 220, g: 20, b: 60, name: 'Crimson' },
      { r: 75, g: 0, b: 130, name: 'Indigo' },
      { r: 255, g: 99, b: 71, name: 'Tomato' },
      { r: 32, g: 178, b: 170, name: 'Light Sea Green' },
      { r: 255, g: 105, b: 180, name: 'Hot Pink' }
    ]
  };

  var colorList = targetColors[difficulty] || targetColors.easy;
  var targetColor = null;
  var playerColor = { r: 128, g: 128, b: 128 };

  var redSlider, greenSlider, blueSlider;
  var redValue, greenValue, blueValue;
  var previewBox, targetBox, distanceDisplay, hexDisplay, rgbDisplay;
  var scoreDisplay, roundDisplay, messageDisplay;

  function getDistance(c1, c2) {
    var dr = c1.r - c2.r;
    var dg = c1.g - c2.g;
    var db = c1.b - c2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function(x) {
      var hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  function updatePreview() {
    playerColor.r = parseInt(redSlider.value);
    playerColor.g = parseInt(greenSlider.value);
    playerColor.b = parseInt(blueSlider.value);

    redValue.textContent = playerColor.r;
    greenValue.textContent = playerColor.g;
    blueValue.textContent = playerColor.b;

    var hex = rgbToHex(playerColor.r, playerColor.g, playerColor.b);
    hexDisplay.textContent = hex;
    rgbDisplay.textContent = 'RGB(' + playerColor.r + ', ' + playerColor.g + ', ' + playerColor.b + ')';

    previewBox.style.background = 'rgb(' + playerColor.r + ',' + playerColor.g + ',' + playerColor.b + ')';

    if (targetColor) {
      var dist = getDistance(playerColor, targetColor);
      distanceDisplay.textContent = 'Distance: ' + Math.round(dist);
      if (dist < config.tolerance) {
        distanceDisplay.style.color = '#4ade80';
      } else if (dist < config.tolerance * 2) {
        distanceDisplay.style.color = '#ffd93d';
      } else {
        distanceDisplay.style.color = '#ff6b6b';
      }
    }
  }

  function createSliderRow(label, color, min, max, value) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;margin:8px 0;width:100%;';

    var labelText = document.createElement('div');
    labelText.style.cssText = 'width:30px;font-weight:bold;color:' + color + ';';
    labelText.textContent = label;

    var slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.value = value;
    slider.style.cssText = 'flex:1;margin:0 10px;height:8px;cursor:pointer;';

    var valueText = document.createElement('div');
    valueText.style.cssText = 'width:40px;text-align:right;';
    valueText.textContent = value;

    row.appendChild(labelText);
    row.appendChild(slider);
    row.appendChild(valueText);

    return { row: row, slider: slider, valueText: valueText };
  }

  function nextRound() {
    currentRound++;
    if (currentRound >= totalRounds) {
      endGame();
      return;
    }

    targetColor = colorList[Math.floor(Math.random() * colorList.length)];
    targetBox.style.background = 'rgb(' + targetColor.r + ',' + targetColor.g + ',' + targetColor.b + ')';
    targetBox.title = targetColor.name;

    redSlider.value = 128;
    greenSlider.value = 128;
    blueSlider.value = 128;
    playerColor = { r: 128, g: 128, b: 128 };

    messageDisplay.textContent = 'Match the target color!';
    updateDisplays();
    updatePreview();
  }

  function endGame() {
    isPlaying = false;
    var won = score > 0;
    messageDisplay.textContent = 'Game Over! Final Score: ' + score;
    ctx.Session.trackComplete('colormix', score, won);
    ctx.Save.addScore('colormix', score);
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
    roundDisplay.style.cssText = 'font-size:1.2em;margin-bottom:10px;color:#68c2b1;';
    roundDisplay.textContent = 'Round: 1/' + totalRounds;

    var instructions = document.createElement('div');
    instructions.style.cssText = 'font-size:0.9em;color:#888;margin-bottom:15px;';
    instructions.textContent = 'Match the target color using the RGB sliders!';

    var previewContainer = document.createElement('div');
    previewContainer.style.cssText = 'display:flex;justify-content:center;gap:30px;margin:20px 0;';

    var targetContainer = document.createElement('div');
    targetContainer.style.cssText = 'text-align:center;';

    var targetLabel = document.createElement('div');
    targetLabel.style.cssText = 'font-size:0.9em;margin-bottom:5px;color:#888;';
    targetLabel.textContent = 'Target';

    targetBox = document.createElement('div');
    targetBox.style.cssText = 'width:100px;height:100px;border-radius:12px;border:3px solid #444;';

    targetContainer.appendChild(targetLabel);
    targetContainer.appendChild(targetBox);

    var playerContainer = document.createElement('div');
    playerContainer.style.cssText = 'text-align:center;';

    var playerLabel = document.createElement('div');
    playerLabel.style.cssText = 'font-size:0.9em;margin-bottom:5px;color:#888;';
    playerLabel.textContent = 'Your Color';

    previewBox = document.createElement('div');
    previewBox.style.cssText = 'width:100px;height:100px;border-radius:12px;border:3px solid #444;';

    playerContainer.appendChild(playerLabel);
    playerContainer.appendChild(previewBox);

    previewContainer.appendChild(targetContainer);
    previewContainer.appendChild(playerContainer);

    var sliderContainer = document.createElement('div');
    sliderContainer.style.cssText = 'width:100%;max-width:400px;margin:20px auto;';

    var redRow = createSliderRow('R', '#ff4444', 0, 255, 128);
    redSlider = redRow.slider;
    redValue = redRow.valueText;
    redSlider.addEventListener('input', updatePreview);
    sliderContainer.appendChild(redRow.row);

    var greenRow = createSliderRow('G', '#44ff44', 0, 255, 128);
    greenSlider = greenRow.slider;
    greenValue = greenRow.valueText;
    greenSlider.addEventListener('input', updatePreview);
    sliderContainer.appendChild(greenRow.row);

    var blueRow = createSliderRow('B', '#4444ff', 0, 255, 128);
    blueSlider = blueRow.slider;
    blueValue = blueRow.valueText;
    blueSlider.addEventListener('input', updatePreview);
    sliderContainer.appendChild(blueRow.row);

    hexDisplay = document.createElement('div');
    hexDisplay.style.cssText = 'font-size:1.2em;margin:10px 0;color:#68c2b1;';
    hexDisplay.textContent = '#808080';

    rgbDisplay = document.createElement('div');
    rgbDisplay.style.cssText = 'font-size:1em;margin:5px 0;color:#888;';
    rgbDisplay.textContent = 'RGB(128, 128, 128)';

    distanceDisplay = document.createElement('div');
    distanceDisplay.style.cssText = 'font-size:1.1em;margin:10px 0;color:#ff6b6b;';
    distanceDisplay.textContent = 'Distance: 0';

    scoreDisplay = document.createElement('div');
    scoreDisplay.style.cssText = 'font-size:1.3em;margin:10px 0;color:#68c2b1;';
    scoreDisplay.textContent = 'Score: 0';

    messageDisplay = document.createElement('div');
    messageDisplay.style.cssText = 'font-size:1.1em;margin:15px 0;min-height:30px;color:#ffd93d;';

    var submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit Color';
    submitBtn.style.cssText = 'padding:10px 25px;font-size:1.1em;background:#68c2b1;color:white;border:none;border-radius:8px;cursor:pointer;margin:10px;';
    submitBtn.addEventListener('click', function() {
      if (!isPlaying) return;
      var dist = getDistance(playerColor, targetColor);
      var roundScore = Math.max(0, Math.round(100 - dist));
      score += roundScore;
      messageDisplay.textContent = 'Distance: ' + Math.round(dist) + ' | +' + roundScore + ' points';
      updateDisplays();
      setTimeout(function() {
        nextRound();
      }, 1500);
    });

    container.appendChild(roundDisplay);
    container.appendChild(instructions);
    container.appendChild(previewContainer);
    container.appendChild(sliderContainer);
    container.appendChild(hexDisplay);
    container.appendChild(rgbDisplay);
    container.appendChild(distanceDisplay);
    container.appendChild(scoreDisplay);
    container.appendChild(messageDisplay);
    container.appendChild(submitBtn);

    stage.appendChild(container);

    currentRound = 0;
    score = 0;
    isPlaying = true;

    targetColor = colorList[Math.floor(Math.random() * colorList.length)];
    targetBox.style.background = 'rgb(' + targetColor.r + ',' + targetColor.g + ',' + targetColor.b + ')';

    updateDisplays();
    updatePreview();
  }

  init();
};