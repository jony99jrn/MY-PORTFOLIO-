
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const popup = document.getElementById('video-popup');
const popupVideo = document.getElementById('popup-video');
const statusText = document.getElementById('status-text');

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
            // ড্রয়িং স্টাইল (Professional White & Neon)
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#ffffff', lineWidth: 2});
            drawLandmarks(canvasCtx, landmarks, {color: '#00f2fe', lineWidth: 1, radius: 3});

            // "Rock On" Gesture Logic (🤟)
            const isIndexUp = landmarks[8].y < landmarks[6].y;
            const isPinkyUp = landmarks[20].y < landmarks[18].y;
            const isMiddleDown = landmarks[12].y > landmarks[10].y;
            const isRingDown = landmarks[16].y > landmarks[14].y;

            if (isIndexUp && isPinkyUp && isMiddleDown && isRingDown) {
                if (popup.classList.contains('hidden')) {
                    popup.classList.remove('hidden');
                    popupVideo.play();
                    statusText.innerText = "জেসচার ডিটেক্ট হয়েছে! 🤟";
                    statusText.style.color = "#00f2fe";
                }
            } else {
                hidePopup();
            }
        }
    } else {
        hidePopup();
    }
    canvasCtx.restore();
}

function hidePopup() {
    if (!popup.classList.contains('hidden')) {
        popup.classList.add('hidden');
        popupVideo.pause();
        statusText.innerText = "ক্যামেরার সামনে 🤟 সাইনটি দেখান";
        statusText.style.color = "#94a3b8";
    }
}

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.8,
    minTrackingConfidence: 0.8
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({image: videoElement});
    },
    width: 1280,
    height: 720
});
camera.start();