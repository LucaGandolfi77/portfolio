/* Pixel Studio — configuration, strings and presets */

export const STR = {
  en: {
    app: 'Pixel Studio', untitled: 'Untitled', save: 'Saved', saving: 'Saving…',
    tools: 'Tools', layers: 'Layers', history: 'History', properties: 'Properties',
    brush: 'Brush', eraser: 'Eraser', fill: 'Fill', line: 'Line', rect: 'Rectangle',
    ellipse: 'Ellipse', text: 'Text', sticker: 'Sticker', move: 'Move', pick: 'Eyedropper',
    size: 'Size', opacity: 'Opacity', color: 'Color', blend: 'Blend',
    addLayer: 'New layer', duplicate: 'Duplicate', merge: 'Merge down', flatten: 'Flatten',
    deleteLayer: 'Delete layer', visibility: 'Visibility', lock: 'Lock',
    import: 'Import image', camera: 'Camera', export: 'Export', share: 'Share',
    project: 'Project', open: 'Open', newProject: 'New', saveProject: 'Save project',
    adjustments: 'Adjustments', effects: 'Effects', presets: 'Presets',
    brightness: 'Brightness', contrast: 'Contrast', saturation: 'Saturation', hue: 'Hue',
    blur: 'Blur', sharpen: 'Sharpen', grayscale: 'Grayscale', sepia: 'Sepia', invert: 'Invert',
    flipH: 'Flip H', flipV: 'Flip V', rotate: 'Rotate 90°', crop: 'Crop', resize: 'Resize',
    undo: 'Undo', redo: 'Redo', clear: 'Clear', reset: 'Reset', apply: 'Apply', cancel: 'Cancel',
    width: 'Width', height: 'Height', font: 'Font', textValue: 'Text', stroke: 'Outline',
    fillShape: 'Filled', yes: 'Yes', no: 'No', ok: 'OK', lang: 'IT / EN',
    exported: 'Exported', projectSaved: 'Project saved', projectLoaded: 'Project loaded',
    layerAdded: 'Layer added', layerRemoved: 'Layer removed', imported: 'Image imported',
    cameraFail: 'Camera unavailable', shareFail: 'Sharing unavailable',
    stickers: 'Stickers', recent: 'Recent', palette: 'Palette', zoom: 'Zoom', fit: 'Fit',
    cover: 'Cover', contain: 'Contain', quality: 'Quality', format: 'Format',
    confirmClear: 'Clear the whole canvas?', confirmDelete: 'Delete this layer?',
    blendModes: { normal: 'Normal', multiply: 'Multiply', screen: 'Screen', overlay: 'Overlay', difference: 'Difference' }
  },
  it: {
    app: 'Pixel Studio', untitled: 'Senza titolo', save: 'Salvato', saving: 'Salvataggio…',
    tools: 'Strumenti', layers: 'Livelli', history: 'Cronologia', properties: 'Proprietà',
    brush: 'Pennello', eraser: 'Gomma', fill: 'Riempimento', line: 'Linea', rect: 'Rettangolo',
    ellipse: 'Ellisse', text: 'Testo', sticker: 'Adesivo', move: 'Sposta', pick: 'Contagocce',
    size: 'Dimensione', opacity: 'Opacità', color: 'Colore', blend: 'Fusione',
    addLayer: 'Nuovo livello', duplicate: 'Duplica', merge: 'Unisci giù', flatten: 'Appiattisci',
    deleteLayer: 'Elimina livello', visibility: 'Visibilità', lock: 'Blocca',
    import: 'Importa immagine', camera: 'Fotocamera', export: 'Esporta', share: 'Condividi',
    project: 'Progetto', open: 'Apri', newProject: 'Nuovo', saveProject: 'Salva progetto',
    adjustments: 'Regolazioni', effects: 'Effetti', presets: 'Preset',
    brightness: 'Luminosità', contrast: 'Contrasto', saturation: 'Saturazione', hue: 'Tinta',
    blur: 'Sfocatura', sharpen: 'Nitidezza', grayscale: 'Bianco e nero', sepia: 'Seppia', invert: 'Inverti',
    flipH: 'Rifletti H', flipV: 'Rifletti V', rotate: 'Ruota 90°', crop: 'Ritaglia', resize: 'Ridimensiona',
    undo: 'Annulla', redo: 'Ripeti', clear: 'Pulisci', reset: 'Reimposta', apply: 'Applica', cancel: 'Annulla',
    width: 'Larghezza', height: 'Altezza', font: 'Font', textValue: 'Testo', stroke: 'Contorno',
    fillShape: 'Riempito', yes: 'Sì', no: 'No', ok: 'OK', lang: 'IT / EN',
    exported: 'Esportato', projectSaved: 'Progetto salvato', projectLoaded: 'Progetto caricato',
    layerAdded: 'Livello aggiunto', layerRemoved: 'Livello rimosso', imported: 'Immagine importata',
    cameraFail: 'Fotocamera non disponibile', shareFail: 'Condivisione non disponibile',
    stickers: 'Adesivi', recent: 'Recenti', palette: 'Tavolozza', zoom: 'Zoom', fit: 'Adatta',
    cover: 'Copri', contain: 'Contieni', quality: 'Qualità', format: 'Formato',
    confirmClear: 'Pulire tutta la tavola?', confirmDelete: 'Eliminare questo livello?',
    blendModes: { normal: 'Normale', multiply: 'Moltiplica', screen: 'Schermo', overlay: 'Sovrapponi', difference: 'Differenza' }
  }
};

export const TOOLS = [
  { id: 'move', icon: '✥', key: 'V' },
  { id: 'brush', icon: '✎', key: 'B' },
  { id: 'eraser', icon: '⌫', key: 'E' },
  { id: 'fill', icon: '🪣', key: 'F' },
  { id: 'line', icon: '╱', key: 'L' },
  { id: 'rect', icon: '▭', key: 'R' },
  { id: 'ellipse', icon: '◯', key: 'O' },
  { id: 'text', icon: 'T', key: 'T' },
  { id: 'sticker', icon: '✨', key: 'S' },
  { id: 'pick', icon: '💧', key: 'I' }
];

export const BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'difference'];
export const PALETTE = ['#000000','#ffffff','#ff4d6d','#ff8c42','#ffd166','#5ef0a8','#4de8ff','#8b6cff',
  '#ff6b9d','#c084fc','#22d3ee','#34d399','#fbbf24','#f472b6','#64748b','#0f172a'];
export const EMOJI = ['❤️','⭐','🔥','🌈','🌸','🍀','🌙','☀️','🎉','💎','🦄','🐱','🍕','👑','💯','✨'];
export const PRESETS = {
  none: {},
  vintage: { contrast: 18, saturation: -22, sepia: 30 },
  neon: { contrast: 30, saturation: 45, hue: 12 },
  mono: { grayscale: 100, contrast: 20 },
  dreamy: { brightness: 12, saturation: -10, blur: 1 },
  noir: { grayscale: 100, contrast: 45, brightness: -10 }
};
export const SIZES = [[64,64],[128,128],[256,256],[512,512],[800,600],[1080,1080]];
