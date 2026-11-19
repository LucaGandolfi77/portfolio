/* Cozy Coloring Book — drawing tools */

const TAU = Math.PI * 2;

export function hexToRgb(hex) {
  const value = hex.replace('#', '');
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
    a: 255
  };
}

export function floodFill(ctx, startX, startY, color, tolerance = 40) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const x0 = Math.floor(startX);
  const y0 = Math.floor(startY);
  if (x0 < 0 || y0 < 0 || x0 >= width || y0 >= height) return false;

  const image = ctx.getImageData(0, 0, width, height);
  const pixels = image.data;
  const start = (y0 * width + x0) * 4;
  const sr = pixels[start], sg = pixels[start + 1], sb = pixels[start + 2], sa = pixels[start + 3];
  if (sr === color.r && sg === color.g && sb === color.b && sa === color.a) return false;

  const visited = new Uint8Array(width * height);
  const matches = index => {
    const pos = index * 4;
    return Math.abs(pixels[pos] - sr) <= tolerance &&
      Math.abs(pixels[pos + 1] - sg) <= tolerance &&
      Math.abs(pixels[pos + 2] - sb) <= tolerance &&
      Math.abs(pixels[pos + 3] - sa) <= tolerance;
  };

  const stack = [y0 * width + x0];
  visited[y0 * width + x0] = 1;
  let count = 0;

  while (stack.length) {
    const index = stack.pop();
    if (!matches(index)) continue;
    const pos = index * 4;
    pixels[pos] = color.r;
    pixels[pos + 1] = color.g;
    pixels[pos + 2] = color.b;
    pixels[pos + 3] = color.a;
    count++;

    const x = index % width;
    const y = (index - x) / width;
    if (x > 0 && !visited[index - 1]) { visited[index - 1] = 1; stack.push(index - 1); }
    if (x < width - 1 && !visited[index + 1]) { visited[index + 1] = 1; stack.push(index + 1); }
    if (y > 0 && !visited[index - width]) { visited[index - width] = 1; stack.push(index - width); }
    if (y < height - 1 && !visited[index + width]) { visited[index + width] = 1; stack.push(index + width); }
  }
  if (count) ctx.putImageData(image, 0, 0);
  return count > 0;
}

export function stroke(ctx, from, to, color, size, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();
}

export function dot(ctx, x, y, color, size, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function erase(ctx, template, x, y, size) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, TAU);
  ctx.clip();
  ctx.drawImage(template, 0, 0);
  ctx.restore();
}

export function pickColor(ctx, x, y) {
  const data = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
  return '#' + [data[0], data[1], data[2]].map(v => v.toString(16).padStart(2, '0')).join('');
}
