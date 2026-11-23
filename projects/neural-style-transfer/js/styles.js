/* Neural Style Studio — style registry */

const MODEL_BASE = 'https://media.githubusercontent.com/media/onnx/models/main/validated/vision/style_transfer/fast_neural_style/model/';

export const GPU_STYLES = [
  { id: 'starry', name: 'Starry Night', svg: 'examples/style-0.svg', hue: 205, strokes: 1.0 },
  { id: 'cubismo', name: 'Cubismo', svg: 'examples/style-1.svg', hue: 18, strokes: 0.35 },
  { id: 'pixel', name: 'Pixel Art', svg: 'examples/style-2.svg', hue: 132, strokes: 0.1 },
  { id: 'abstract', name: 'Abstract', svg: 'examples/style-3.svg', hue: 280, strokes: 0.75 },
  { id: 'ukiyoe', name: 'Ukiyo-e', svg: 'examples/style-4.svg', hue: 224, strokes: 0.5 }
];

export const NEURAL_STYLES = [
  { id: 'candy', name: 'Candy', model: MODEL_BASE + 'candy-9.onnx', hue: 330 },
  { id: 'mosaic', name: 'Mosaic', model: MODEL_BASE + 'mosaic-9.onnx', hue: 168 },
  { id: 'rain-princess', name: 'Rain Princess', model: MODEL_BASE + 'rain-princess-9.onnx', hue: 210 },
  { id: 'udnie', name: 'Udnie', model: MODEL_BASE + 'udnie-9.onnx', hue: 48 },
  { id: 'pointilism', name: 'Pointilism', model: MODEL_BASE + 'pointilism-9.onnx', hue: 96 }
];

export const CONTENT_STYLES = [
  { id: 'landscape', name: 'Landscape', svg: 'examples/content-0.svg' },
  { id: 'portrait', name: 'Portrait', svg: 'examples/content-1.svg' },
  { id: 'city', name: 'City', svg: 'examples/content-2.svg' }
];

export function findStyle(id) {
  return GPU_STYLES.find(s => s.id === id) || NEURAL_STYLES.find(s => s.id === id) || GPU_STYLES[0];
}
