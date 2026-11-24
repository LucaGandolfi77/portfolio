/**
 * camera.js — controllo webcam frontale/posteriore.
 */

export class CameraController {
  constructor(video) {
    this.video = video;
    this.stream = null;
    this.facing = 'user';
  }

  async start(facing = this.facing) {
    this.facing = facing;
    this.stop();
    const base = {
      width: { ideal: 1280 },
      height: { ideal: 720 }
    };
    const constraints = { video: { ...base, facingMode: this.facing }, audio: false };
    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: base, audio: false });
    }
    this.video.srcObject = this.stream;
    await this.video.play().catch(() => {});
    return this.state;
  }

  stop() {
    if (this.stream) this.stream.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.video.srcObject = null;
  }

  async switchCamera() { return this.start(this.facing === 'user' ? 'environment' : 'user'); }

  get isFront() { return this.facing === 'user'; }
  get isRunning() { return !!this.stream && this.video.readyState >= 2; }
  get state() {
    const track = this.stream && this.stream.getVideoTracks()[0];
    const settings = track && track.getSettings ? track.getSettings() : {};
    return {
      width: settings.width || this.video.videoWidth || 640,
      height: settings.height || this.video.videoHeight || 480,
      facing: this.facing
    };
  }
}
