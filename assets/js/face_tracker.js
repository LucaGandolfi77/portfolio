// Face detection logic using BlazeFace
// Requires @tensorflow/tfjs and @tensorflow-models/blazeface

window.FaceTracker = {
    model: null,
    
    async load() {
        if (!this.model) {
            console.log("Loading BlazeFace model...");
            // Ensure tf is ready
            if (window.tf) {
                await window.tf.ready();
            }
            
            // Load the model.
            // Try to use window.blazeface if available
            if (window.blazeface) {
                this.model = await window.blazeface.load();
            } else {
                console.error("BlazeFace library not found on window object.");
                throw new Error("BlazeFace library not loaded");
            }
            console.log("BlazeFace model loaded.");
        }
        return this.model;
    },

    async detect(video) {
        if (!this.model) return [];
        
        // Safety check for video dimensions
        if (video.videoWidth === 0 || video.videoHeight === 0) return [];

        // returnTensors: false means we get JS arrays back.
        const returnTensors = false;
        // flipHorizontal: false because we handle mirroring in canvas context
        const flipHorizontal = false; 
        
        try {
            const predictions = await this.model.estimateFaces(video, returnTensors, flipHorizontal);
            return predictions;
        } catch (e) {
            console.error("Error in BlazeFace detection:", e);
            return [];
        }
    },

    draw(ctx, predictions) {
        if (!predictions) return;

        predictions.forEach(prediction => {
            const start = prediction.topLeft;
            const end = prediction.bottomRight;
            
            // Check if start/end are arrays or tensors (just in case)
            const x1 = Array.isArray(start) ? start[0] : start.dataSync()[0];
            const y1 = Array.isArray(start) ? start[1] : start.dataSync()[1];
            const x2 = Array.isArray(end) ? end[0] : end.dataSync()[0];
            const y2 = Array.isArray(end) ? end[1] : end.dataSync()[1];

            const width = x2 - x1;
            const height = y2 - y1;

            // Face Box (Red)
            ctx.strokeStyle = '#ff0000'; // Red
            ctx.lineWidth = 3;
            ctx.strokeRect(x1, y1, width, height);

            // Landmarks
            // 0: right eye, 1: left eye
            const landmarks = prediction.landmarks;
            
            // Draw green squares around eyes
            ctx.fillStyle = '#00ff00'; // Green
            const eyeSize = width / 8; // Scale relative to face width

            if (landmarks) {
                // Right Eye
                if (landmarks[0]) {
                    const lx = Array.isArray(landmarks[0]) ? landmarks[0][0] : landmarks[0].dataSync()[0];
                    const ly = Array.isArray(landmarks[0]) ? landmarks[0][1] : landmarks[0].dataSync()[1];
                    ctx.fillRect(lx - eyeSize/2, ly - eyeSize/2, eyeSize, eyeSize);
                }
                
                // Left Eye
                if (landmarks[1]) {
                    const lx = Array.isArray(landmarks[1]) ? landmarks[1][0] : landmarks[1].dataSync()[0];
                    const ly = Array.isArray(landmarks[1]) ? landmarks[1][1] : landmarks[1].dataSync()[1];
                    ctx.fillRect(lx - eyeSize/2, ly - eyeSize/2, eyeSize, eyeSize);
                }
            }
        });
    }
};
