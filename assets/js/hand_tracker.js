// Hand tracking using MediaPipe Hands

window.HandTracker = {
    hands: null,
    results: null,
    isReady: false,

    async load() {
        if (!this.hands) {
            console.log("Loading MediaPipe Hands...");
            if (!window.Hands) {
                 throw new Error("MediaPipe Hands library not loaded");
            }

            this.hands = new window.Hands({locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }});

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults((results) => {
                this.results = results;
            });
            
            // Initialize
            await this.hands.initialize();
            this.isReady = true;
            console.log("MediaPipe Hands loaded.");
        }
    },

    async detect(video) {
        if (!this.hands || !this.isReady) return;
        // MediaPipe expects the video element
        await this.hands.send({image: video});
    },

    draw(ctx, canvasWidth, canvasHeight) {
        if (!this.results || !this.results.multiHandLandmarks) return;

        const landmarks = this.results.multiHandLandmarks;
        
        // Draw settings
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (const handLandmarks of landmarks) {
            // Draw connections
            const connections = [
                [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
                [0, 5], [5, 6], [6, 7], [7, 8], // Index
                [5, 9], [9, 10], [10, 11], [11, 12], // Middle
                [9, 13], [13, 14], [14, 15], [15, 16], // Ring
                [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
                [0, 5], [5, 9], [9, 13], [13, 17], [0, 17] // Palm
            ];

            ctx.strokeStyle = '#00d4ff';
            for (const [start, end] of connections) {
                const p1 = handLandmarks[start];
                const p2 = handLandmarks[end];
                ctx.beginPath();
                ctx.moveTo(p1.x * canvasWidth, p1.y * canvasHeight);
                ctx.lineTo(p2.x * canvasWidth, p2.y * canvasHeight);
                ctx.stroke();
            }

            // Draw points
            ctx.fillStyle = '#ff0000';
            for (const landmark of handLandmarks) {
                const x = landmark.x * canvasWidth;
                const y = landmark.y * canvasHeight;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }
};
