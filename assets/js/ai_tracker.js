// AI Object Tracker using MobileNet for re-identification
// Requires @tensorflow/tfjs and @tensorflow-models/mobilenet

window.AITracker = {
    net: null,
    targetEmbedding: null,
    lastPosition: null,

    async load() {
        if (!this.net) {
            console.log("Loading MobileNet for tracking...");
            // Load MobileNet - we'll use it to extract feature vectors (embeddings)
            this.net = await mobilenet.load();
            console.log("MobileNet loaded.");
        }
    },

    // Extract features from a specific region of the video
    async getEmbedding(video, box) {
        if (!this.net) return null;
        
        return tf.tidy(() => {
            // 1. Capture the video frame as a tensor
            const frame = tf.browser.fromPixels(video);
            
            // 2. Calculate normalized crop coordinates (0-1)
            const [x, y, w, h] = box;
            const videoH = video.videoHeight;
            const videoW = video.videoWidth;
            
            // Avoid out of bounds
            if (w <= 0 || h <= 0) return null;

            const y1 = y / videoH;
            const x1 = x / videoW;
            const y2 = (y + h) / videoH;
            const x2 = (x + w) / videoW;

            // 3. Crop and resize to 224x224 (MobileNet input size)
            // cropAndResize expects a batch of boxes, so we wrap in arrays
            const crop = tf.image.cropAndResize(
                frame.expandDims(0), 
                [[y1, x1, y2, x2]], 
                [0], 
                [224, 224]
            );

            // 4. Get the embedding (activation of the penultimate layer)
            // infer(img, embedding=true)
            const embedding = this.net.infer(crop, true);
            return embedding;
        });
    },

    async setTarget(video, box) {
        if (this.targetEmbedding) {
            this.targetEmbedding.dispose();
        }
        this.targetEmbedding = await this.getEmbedding(video, box);
        this.lastPosition = box;
        console.log("Target set!");
    },

    async track(video, candidates) {
        if (!this.targetEmbedding || !candidates || candidates.length === 0) return null;

        let bestMatch = null;
        let maxSimilarity = -1;

        // We will compare the target embedding with each candidate's embedding
        for (const candidate of candidates) {
            const embedding = await this.getEmbedding(video, candidate.bbox);
            if (!embedding) continue;

            // Calculate Cosine Similarity
            const similarity = tf.tidy(() => {
                const a = this.targetEmbedding;
                const b = embedding;
                // Cosine similarity: (a . b) / (|a| * |b|)
                const dotProduct = a.mul(b).sum();
                const normA = a.norm();
                const normB = b.norm();
                return dotProduct.div(normA.mul(normB)).dataSync()[0];
            });

            embedding.dispose();

            // Weight by distance (prefer objects close to last position)
            // Simple distance penalty
            const distScore = this.calculateDistanceScore(candidate.bbox);
            
            // Combine scores (mostly similarity, but distance helps disambiguate)
            const finalScore = similarity * 0.7 + distScore * 0.3;

            if (finalScore > maxSimilarity) {
                maxSimilarity = finalScore;
                bestMatch = candidate;
            }
        }

        if (bestMatch && maxSimilarity > 0.5) { // Threshold
            this.lastPosition = bestMatch.bbox;
            return bestMatch;
        }
        
        return null;
    },

    calculateDistanceScore(bbox) {
        if (!this.lastPosition) return 1;
        
        const [x1, y1, w1, h1] = this.lastPosition;
        const [x2, y2, w2, h2] = bbox;
        
        const cx1 = x1 + w1/2;
        const cy1 = y1 + h1/2;
        const cx2 = x2 + w2/2;
        const cy2 = y2 + h2/2;

        // Euclidean distance
        const dist = Math.sqrt(Math.pow(cx2 - cx1, 2) + Math.pow(cy2 - cy1, 2));
        
        // Normalize distance (assuming 1000px is max relevant distance)
        // Return 1 if close, 0 if far
        return Math.max(0, 1 - (dist / 500));
    },

    clear() {
        if (this.targetEmbedding) {
            this.targetEmbedding.dispose();
            this.targetEmbedding = null;
        }
        this.lastPosition = null;
    }
};
