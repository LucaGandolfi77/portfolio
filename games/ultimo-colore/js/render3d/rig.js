/* ============================================================
   Ultimo Colore — bones (pure)
   ------------------------------------------------------------
   Column-major 4×4 affine matrices. A pose gives each bone a
   turn, a shift and a stretch about its pivot; solve() chains
   them into the palette the vertex shader reads.
   ============================================================ */

export const MAX_BONES = 16;

/** T(pivot + shift) · Ry · Rx · Rz · S · T(−pivot), written into out at offset o. */
export function boneMatrix(out, pivot, p = {}, o = 0) {
  const { rx = 0, ry = 0, rz = 0, tx = 0, ty = 0, tz = 0, s = 1 } = p;
  const kx = s * (p.sx ?? 1), ky = s * (p.sy ?? 1), kz = s * (p.sz ?? 1);
  const cx = Math.cos(rx), ax = Math.sin(rx), cy = Math.cos(ry), ay = Math.sin(ry), cz = Math.cos(rz), az = Math.sin(rz);
  const m00 = (cy * cz + ay * ax * az) * kx, m01 = (-cy * az + ay * ax * cz) * ky, m02 = ay * cx * kz;
  const m10 = cx * az * kx, m11 = cx * cz * ky, m12 = -ax * kz;
  const m20 = (-ay * cz + cy * ax * az) * kx, m21 = (ay * az + cy * ax * cz) * ky, m22 = cy * cx * kz;
  const [px, py, pz] = pivot;
  out[o] = m00; out[o + 1] = m10; out[o + 2] = m20; out[o + 3] = 0;
  out[o + 4] = m01; out[o + 5] = m11; out[o + 6] = m21; out[o + 7] = 0;
  out[o + 8] = m02; out[o + 9] = m12; out[o + 10] = m22; out[o + 11] = 0;
  out[o + 12] = px + tx - (m00 * px + m01 * py + m02 * pz);
  out[o + 13] = py + ty - (m10 * px + m11 * py + m12 * pz);
  out[o + 14] = pz + tz - (m20 * px + m21 * py + m22 * pz);
  out[o + 15] = 1;
  return out;
}

/** out[o…] = a[ao…] · b[bo…] for affine matrices; out may be a or b. */
export function multiply(out, o, a, ao, b, bo) {
  const r = multiply.tmp;
  for (let c = 0; c < 4; c++) {
    for (let row = 0; row < 4; row++) {
      r[c * 4 + row] = a[ao + row] * b[bo + c * 4] + a[ao + 4 + row] * b[bo + c * 4 + 1] + a[ao + 8 + row] * b[bo + c * 4 + 2] + a[ao + 12 + row] * b[bo + c * 4 + 3];
    }
  }
  out.set(r, o);
  return out;
}
multiply.tmp = new Float32Array(16);

/** The palette for a model in a pose. Parents always come before children. */
export function solve(model, pose = {}, out = new Float32Array(MAX_BONES * 16)) {
  const local = solve.tmp;
  model.bones.forEach((bone, i) => {
    boneMatrix(local, bone.pivot, pose[bone.name]);
    if (bone.parent < 0) out.set(local, i * 16);
    else multiply(out, i * 16, out, bone.parent * 16, local, 0);
  });
  return out;
}
solve.tmp = new Float32Array(16);

/** Turns `from` toward `to` (radians) the short way round, by at most the share k. */
export function turnToward(from, to, k) {
  const d = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + d * Math.min(1, Math.max(0, k));
}
