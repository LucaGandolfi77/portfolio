/* Cozy Coloring Book — undo/redo stack */

export class History {
  constructor(limit = 30) {
    this.limit = limit;
    this.past = [];
    this.future = [];
  }

  push(imageData) {
    this.past.push(imageData);
    if (this.past.length > this.limit) this.past.shift();
    this.future.length = 0;
  }

  undo(ctx) {
    if (!this.past.length) return false;
    this.future.push(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
    ctx.putImageData(this.past.pop(), 0, 0);
    return true;
  }

  redo(ctx) {
    if (!this.future.length) return false;
    this.past.push(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
    ctx.putImageData(this.future.pop(), 0, 0);
    return true;
  }

  clear() {
    this.past.length = 0;
    this.future.length = 0;
  }

  get canUndo() { return this.past.length > 0; }
  get canRedo() { return this.future.length > 0; }
}
