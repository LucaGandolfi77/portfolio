// Face detection logic using BlazeFace
// Requires @tensorflow/tfjs and @tensorflow-models/blazeface

window.FaceTracker = {
    model: null,
    
    async load() {
        if (!this.model) {
            console.log("Loading BlazeFace model...");
            // Load the model.
            this.model = await blazeface.load();
            console.log("BlazeFace model loaded.");
        }
        return this.model;
    },

    async detect(video) {
        if (!this.model) return [];
        // returnTensors: false means we get JS arrays back.
        const returnTensors = false;
        // flipHorizontal: false because we handle mirroring in canvas context
        const flipHorizontal = false; 
        const predictions = await this.model.estimateFaces(video, returnTensors, flipHorizontal);
        return predictions;
    },

    draw(ctx, predictions) {
        if (!predictions) return;

        predictions.forEach(prediction => {
            const start = prediction.topLeft;
            const end = prediction.bottomRight;
            const size = [end[0] - start[0], end[1] - start[1]];

            // Face Box (Red)
            ctx.strokeStyle = '#ff0000'; // Red
            ctx.lineWidth = 3;
            ctx.strokeRect(start[0], start[1], size[0], size[1]);

            // Landmarks
            // 0: right eye, 1: left eye
            const landmarks = prediction.landmarks;
            
            // Draw green squares around eyes
            ctx.fillStyle = '#00ff00'; // Green
            const eyeSize = size[0] / 8; // Scale relative to face width

            // Right Eye
            if (landmarks[0]) {
                ctx.fillRect(landmarks[0][0] - eyeSize/2, landmarks[0][1] - eyeSize/2, eyeSize, eyeSize);
            }
            
            // Left Eye
            if (landmarks[1]) {
                ctx.fillRect(landmarks[1][0] - eyeSize/2, landmarks[1][1] - eyeSize/2, eyeSize, eyeSize);
            }
        });
    }
};
