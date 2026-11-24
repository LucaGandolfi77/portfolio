/**
 * ar.js — sticker AR ancorati ai landmark e indicatore di posa.
 */

export const STICKERS = [
  { id: 'glasses', emoji: '👓', anchor: 'eyes' },
  { id: 'crown', emoji: '👑', anchor: 'forehead' },
  { id: 'moustache', emoji: '🥸', anchor: 'mouth' },
  { id: 'hat', emoji: '🎩', anchor: 'forehead' },
  { id: 'blush', emoji: '😊', anchor: 'cheekL' },
  { id: 'halo', emoji: '😇', anchor: 'forehead' },
  { id: 'dog', emoji: '🐶', anchor: 'eyes' },
  { id: 'cat', emoji: '🐱', anchor: 'eyes' },
  { id: 'bunny', emoji: '🐰', anchor: 'forehead' },
  { id: 'party', emoji: '🎉', anchor: 'cheekR' }
];

export function point(landmarks, index, width, height) {
  const item = landmarks && landmarks[index];
  return item ? { x: item.x * width, y: item.y * height } : null;
}

export function anchorPoint(anchor, landmarks, width, height) {
  const left = point(landmarks, 33, width, height);
  const right = point(landmarks, 263, width, height);
  if (!left || !right) return null;
  switch (anchor) {
    case 'forehead': {
      const top = point(landmarks, 10, width, height);
      return top ? { x: (left.x + right.x) / 2, y: top.y - Math.abs(right.x - left.x) * 0.12 } : null;
    }
    case 'mouth': return point(landmarks, 13, width, height);
    case 'cheekL': return point(landmarks, 50, width, height);
    case 'cheekR': return point(landmarks, 280, width, height);
    default: return { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
  }
}

export function faceSize(landmarks, width, height) {
  const left = point(landmarks, 234, width, height);
  const right = point(landmarks, 454, width, height);
  return left && right ? Math.hypot(right.x - left.x, right.y - left.y) : 0;
}

export function drawStickers(ctx, results, width, height, active = []) {
  if (!ctx || !results || !results.faceLandmarks || !active.length) return;
  const faces = results.faceLandmarks;
  for (const face of faces) {
    const size = faceSize(face, width, height) || 100;
    for (const item of STICKERS) {
      if (!active.includes(item.id)) continue;
      const anchor = anchorPoint(item.anchor, face, width, height);
      if (!anchor) continue;
      ctx.save();
      ctx.font = Math.round(size * 0.45) + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,.55)';
      ctx.shadowBlur = 10;
      ctx.fillText(item.emoji, anchor.x, anchor.y);
      ctx.restore();
    }
  }
}

export function poseFromMatrix(matrix) {
  if (!matrix || matrix.length < 11) return { yaw: 0, pitch: 0, roll: 0 };
  return {
    yaw: Math.atan2(matrix[1], matrix[0]) * 180 / Math.PI,
    pitch: Math.asin(Math.max(-1, Math.min(1, -matrix[2]))) * 180 / Math.PI,
    roll: Math.atan2(matrix[6], matrix[10]) * 180 / Math.PI
  };
}

export function drawPose(ctx, pose, x, y, size = 70) {
  if (!ctx) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(103,232,249,.9)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, size / 2, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - size / 2, y); ctx.lineTo(x + size / 2, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y - size / 2); ctx.lineTo(x, y + size / 2); ctx.stroke();
  ctx.translate(x + (pose.yaw / 90) * size * 0.2, y - (pose.pitch / 90) * size * 0.2);
  ctx.rotate(pose.roll * Math.PI / 180);
  ctx.strokeStyle = '#ff8fc4';
  ctx.beginPath(); ctx.ellipse(0, 0, size * 0.22, size * 0.29, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}
