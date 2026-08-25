/* RAVE — Camera Controller (Front/Back, Landscape/Portrait) */

class CameraController {
  constructor(videoEl) {
    this.video = videoEl;
    this.stream = null;
    this.facing = 'user'; /* 'user' = front, 'environment' = back */
    this.width = 1280;
    this.height = 720;
  }

  async start(facing) {
    if (facing) this.facing = facing;

    /* stop previous stream */
    this.stop();

    const constraints = {
      video: {
        facingMode: this.facing,
        width: { ideal: this.width },
        height: { ideal: this.height },
      },
      audio: false,
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      /* fallback: try without facingMode */
      if (this.facing) {
        try {
          delete constraints.video.facingMode;
          this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err2) {
          console.error('Camera access failed:', err2);
          throw err2;
        }
      } else {
        throw err;
      }
    }

    this.video.srcObject = this.stream;

    return new Promise((resolve) => {
      this.video.onloadedmetadata = () => {
        this.video.play();
        /* read actual resolution */
        const settings = this.stream.getVideoTracks()[0]?.getSettings();
        this.width = settings?.width || this.video.videoWidth || 640;
        this.height = settings?.height || this.video.videoHeight || 480;
        resolve({ width: this.width, height: this.height });
      };
    });
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.video.srcObject = null;
  }

  async switchCamera() {
    this.facing = this.facing === 'user' ? 'environment' : 'user';
    return this.start();
  }

  get isFront() {
    return this.facing === 'user';
  }

  get isRunning() {
    return !!this.stream && this.video.readyState >= 2;
  }
}
