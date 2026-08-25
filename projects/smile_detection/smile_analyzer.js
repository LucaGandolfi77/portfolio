/* Smile Detection — Teeth & Smile Analysis Pipeline */

class SmileAnalyzer {
  constructor() {
    /* landmark indices (MediaPipe canonical) */
    this.OUTER_LIPS = [61,146,91,181,84,17,314,405,321,375,291,409,270,269,267,0,37,39,40,185];
    this.INNER_LIPS = [78,95,88,178,87,14,317,402,318,324,308,415,310,311,12,13,82,81,80,191];
    this.UPPER_INNER = [13, 312, 311, 310, 415, 308, 324, 318, 402, 317];
    this.LOWER_INNER = [14, 87, 178, 88, 95, 78, 191, 80, 81, 82];
    this.LEFT_CORNER = 61;
    this.RIGHT_CORNER = 291;
    this.UPPER_LIP_TOP = 0;
    this.LOWER_LIP_BOTTOM = 17;

    /* offscreen canvas for pixel analysis */
    this._cropCanvas = document.createElement('canvas');
    this._cropCanvas.width = 128;
    this._cropCanvas.height = 80;
    this._cropCtx = this._cropCanvas.getContext('2d', { willReadFrequently: true });

    /* smoothing */
    this._smooth = { smile: 0, whiteness: 0, alignment: 0 };
    this._alpha = 0.25;
  }

  analyze(result, videoW, videoH) {
    if (!result || !result.faceLandmarks || result.faceLandmarks.length === 0) {
      return null;
    }

    const lm = result.faceLandmarks[0];
    const bs = result.faceBlendshapes?.[0]?.categories || [];

    /* blendshape values */
    const getBS = (name) => {
      const f = bs.find(b => b.categoryName === name);
      return f ? f.score : 0;
    };

    const smileL = getBS('mouthSmileLeft');
    const smileR = getBS('mouthSmileRight');
    const jawOpen = getBS('jawOpen');
    const mouthPressL = getBS('mouthPressLeft');
    const mouthPressR = getBS('mouthPressRight');

    /* ── 1. Smile Score ── */
    const smileBlend = (smileL + smileR) / 2;

    /* geometric: distance between mouth corners normalized by face width */
    const faceW = Math.abs(lm[234].x - lm[454].x) || 0.1;
    const cornerDist = Math.abs(lm[this.RIGHT_CORNER].x - lm[this.LEFT_CORNER].x);
    const cornerRatio = cornerDist / faceW;

    /* mouth opening gate — smile only counts when mouth is somewhat open */
    const openGate = Math.min(1, jawOpen * 4);

    let smileRaw = smileBlend * 0.7 + (cornerRatio - 0.35) * 0.3;
    smileRaw = Math.max(0, Math.min(1, smileRaw)) * (0.3 + openGate * 0.7);
    const smile = this._smoothVal('smile', smileRaw);

    /* ── 2. Whiteness Score ── */
    let whiteness = 0;
    if (jawOpen > 0.03) {
      whiteness = this._analyzeTeethWhiteness(lm, videoW, videoH);
    }
    whiteness = this._smoothVal('whiteness', whiteness);

    /* ── 3. Alignment Score ── */
    let alignment = 0;
    if (jawOpen > 0.03 && whiteness > 5) {
      alignment = this._analyzeTeethAlignment(lm, videoW, videoH);
    }
    alignment = this._smoothVal('alignment', alignment);

    /* ── Overall ── */
    const overall = Math.round(smile * 40 + whiteness * 30 + alignment * 30);

    return {
      smile: Math.round(smile * 100),
      whiteness: Math.round(whiteness),
      alignment: Math.round(alignment),
      overall: Math.min(100, Math.max(0, overall)),
      jawOpen: jawOpen,
      landmarks: lm,
      blendshapes: { smileL, smileR, jawOpen, mouthPressL, mouthPressR },
      innerLipsBox: this._getBoundingBox(this.INNER_LIPS, lm, videoW, videoH),
    };
  }

  /* ── Teeth whiteness via pixel analysis ── */
  _analyzeTeethWhiteness(lm, vw, vh) {
    const box = this._getBoundingBox(this.INNER_LIPS, lm, vw, vh);
    if (box.w < 8 || box.h < 4) return 0;

    this._cropCtx.drawImage(
      this._videoEl || document.querySelector('video'),
      box.x, box.y, box.w, box.h,
      0, 0, this._cropCanvas.width, this._cropCanvas.height
    );

    const imgData = this._cropCtx.getImageData(0, 0, this._cropCanvas.width, this._cropCanvas.height);
    const data = imgData.data;

    /* adaptive threshold: find bright pixels (teeth) */
    let sumBrightness = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const lum = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
      sumBrightness += lum;
      count++;
    }
    const avgBrightness = sumBrightness / count;

    /* threshold at 70% of average — teeth are brighter than mouth interior */
    const thresh = avgBrightness * 1.2;
    let teethSum = 0;
    let teethCount = 0;
    for (let i = 0; i < data.length; i += 4) {
      const lum = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
      if (lum > thresh) {
        teethSum += lum;
        teethCount++;
      }
    }

    if (teethCount < 20) return 0;

    const teethAvg = teethSum / teethCount;
    /* normalize: 255 = perfect white, 150 = typical teeth */
    return Math.min(100, Math.max(0, ((teethAvg - 120) / (255 - 120)) * 100));
  }

  /* ── Teeth alignment via edge/gap analysis ── */
  _analyzeTeethAlignment(lm, vw, vh) {
    const box = this._getBoundingBox(this.INNER_LIPS, lm, vw, vh);
    if (box.w < 12 || box.h < 6) return 50;

    this._cropCtx.drawImage(
      this._videoEl || document.querySelector('video'),
      box.x, box.y, box.w, box.h,
      0, 0, this._cropCanvas.width, this._cropCanvas.height
    );

    const imgData = this._cropCtx.getImageData(0, 0, this._cropCanvas.width, this._cropCanvas.height);
    const w = this._cropCanvas.width;
    const h = this._cropCanvas.height;
    const data = imgData.data;

    /* build brightness profile per column */
    const colBrightness = new Float32Array(w);
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let y = 0; y < h; y++) {
        const idx = (y * w + x) * 4;
        sum += data[idx] * 0.299 + data[idx+1] * 0.587 + data[idx+2] * 0.114;
      }
      colBrightness[x] = sum / h;
    }

    /* find the "teeth line" — upper row of bright pixels per column */
    const thresh = colBrightness.reduce((a, b) => a + b, 0) / w * 1.15;
    const teethLine = new Float32Array(w);
    for (let x = 0; x < w; x++) {
      teethLine[x] = -1;
      for (let y = 0; y < h; y++) {
        const idx = (y * w + x) * 4;
        const lum = data[idx] * 0.299 + data[idx+1] * 0.587 + data[idx+2] * 0.114;
        if (lum > thresh) {
          teethLine[x] = y / h;
          break;
        }
      }
    }

    /* valid columns (have teeth detected) */
    const valid = [];
    for (let x = 0; x < w; x++) {
      if (teethLine[x] >= 0) valid.push({ x, y: teethLine[x] });
    }
    if (valid.length < 6) return 30;

    /* fit line (least squares) and compute residuals for straightness */
    const meanX = valid.reduce((s, v) => s + v.x, 0) / valid.length;
    const meanY = valid.reduce((s, v) => s + v.y, 0) / valid.length;
    let num = 0, den = 0;
    valid.forEach(v => {
      num += (v.x - meanX) * (v.y - meanY);
      den += (v.x - meanX) ** 2;
    });
    const slope = den > 0 ? num / den : 0;
    const intercept = meanY - slope * meanX;

    let rmsResidual = 0;
    valid.forEach(v => {
      const expected = slope * v.x + intercept;
      rmsResidual += (v.y - expected) ** 2;
    });
    rmsResidual = Math.sqrt(rmsResidual / valid.length);

    /* gap analysis: find local minima in column brightness → interdental spaces */
    const gaps = [];
    for (let x = 2; x < w - 2; x++) {
      if (colBrightness[x] < colBrightness[x-1] && colBrightness[x] < colBrightness[x+1] && colBrightness[x] < thresh) {
        gaps.push(x);
      }
    }

    /* regularity: spacing variance between gaps */
    let gapRegularity = 50;
    if (gaps.length >= 2) {
      const spacings = [];
      for (let i = 1; i < gaps.length; i++) {
        spacings.push(gaps[i] - gaps[i-1]);
      }
      const meanSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
      const variance = spacings.reduce((s, v) => s + (v - meanSpacing) ** 2, 0) / spacings.length;
      const cv = Math.sqrt(variance) / (meanSpacing || 1); /* coefficient of variation */
      gapRegularity = Math.max(0, Math.min(100, 100 - cv * 80));
    }

    /* straightness score: lower RMS = straighter teeth line */
    const straightness = Math.max(0, Math.min(100, 100 - rmsResidual * 800));

    /* combined alignment */
    return (straightness * 0.6 + gapRegularity * 0.4);
  }

  _getBoundingBox(indices, lm, vw, vh) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const i of indices) {
      const x = lm[i].x * vw;
      const y = lm[i].y * vh;
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
    }
    const pad = 4;
    return {
      x: Math.max(0, minX - pad),
      y: Math.max(0, minY - pad),
      w: Math.min(vw, maxX - minX + pad * 2),
      h: Math.min(vh, maxY - minY + pad * 2),
    };
  }

  _smoothVal(key, raw) {
    this._smooth[key] = this._smooth[key] * (1 - this._alpha) + raw * this._alpha;
    return this._smooth[key];
  }

  reset() {
    this._smooth = { smile: 0, whiteness: 0, alignment: 0 };
  }
}
