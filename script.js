const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const popup = document.getElementById('video-popup');
const popupVideo = document.getElementById('popup-video');
const musicBtn = document.getElementById('music-control');

let isAudioEnabled = false;
popupVideo.muted = true;

musicBtn.addEventListener('click', () => {
    isAudioEnabled = !isAudioEnabled;
    popupVideo.muted = !isAudioEnabled;
    musicBtn.innerHTML = isAudioEnabled ? "<span>🔊</span> MUSIC IS ON" : "<span>🔈</span> ENABLE MUSIC";
    musicBtn.classList.toggle('active', isAudioEnabled);
});

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // শুধুমাত্র ক্যানভাসে ছবি আঁকা হবে, ভিডিও এলিমেন্টটি হাইড থাকবে
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#ffffff', lineWidth: 2});
            
            const isIndexUp = landmarks[8].y < landmarks[6].y;
            const isPinkyUp = landmarks[20].y < landmarks[18].y;
            const isMiddleDown = landmarks[12].y > landmarks[10].y;
            const isRingDown = landmarks[16].y > landmarks[14].y;

            if (isIndexUp && isPinkyUp && isMiddleDown && isRingDown) {
                if (popup.classList.contains('hidden')) {
                    popup.classList.remove('hidden');
                    popupVideo.play();
                }
            } else {
                popup.classList.add('hidden');
                popupVideo.pause();
            }
        }
    }
    canvasCtx.restore();
}

const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => { await hands.send({image: videoElement}); },
    width: 640,
    height: 480
});
camera.start();
