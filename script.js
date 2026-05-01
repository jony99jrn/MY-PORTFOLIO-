const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const popup = document.getElementById('video-popup');
const statusText = document.getElementById('status-text');
const musicBtn = document.getElementById('music-control');

// ভিডিও লিস্ট
const videoList = {
    cat: document.getElementById('video-cat'),
    dipjol: document.getElementById('video-dipjol'),
    newVid: document.getElementById('video-new')
};

let isAudioEnabled = false;

musicBtn.addEventListener('click', () => {
    isAudioEnabled = !isAudioEnabled;
    Object.values(videoList).forEach(v => v.muted = !isAudioEnabled);
    musicBtn.innerHTML = isAudioEnabled ? "<span>🔊</span> MUSIC IS ON" : "<span>🔈</span> ENABLE MUSIC";
    musicBtn.classList.toggle('active', isAudioEnabled);
});

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#ffffff', lineWidth: 2});

        const indexUp = landmarks[8].y < landmarks[6].y;
        const middleUp = landmarks[12].y < landmarks[10].y;
        const ringUp = landmarks[16].y < landmarks[14].y;
        const pinkyUp = landmarks[20].y < landmarks[18].y;

        // ১. 🖐️ (Hi) -> Dipjol
        if (indexUp && middleUp && ringUp && pinkyUp) {
            playSelected('dipjol', "সালাম নিন বড় ভাই! 🖐️");
        } 
        // ২. 🤟 (Rock) -> Scuba Cat
        else if (indexUp && pinkyUp && !middleUp && !ringUp) {
            playSelected('cat', "Scuba Cat ডিটেক্ট হয়েছে! 🤟");
        }
        // ৩. ☝️ (Point) -> New Video
        else if (indexUp && !middleUp && !ringUp && !pinkyUp) {
            playSelected('newVid', "নতুন ভিডিও চলছে! ☝️");
        }
        else {
            stopAll();
        }
    } else {
        stopAll();
    }
    canvasCtx.restore();
}

function playSelected(key, msg) {
    Object.keys(videoList).forEach(k => {
        if (k === key) {
            videoList[k].style.display = 'block';
            videoList[k].play();
        } else {
            videoList[k].style.display = 'none';
            videoList[k].pause();
        }
    });
    popup.classList.remove('hidden');
    statusText.innerText = msg;
    statusText.style.color = "#00f2fe";
}

function stopAll() {
    if (!popup.classList.contains('hidden')) {
        popup.classList.add('hidden');
        Object.values(videoList).forEach(v => v.pause());
        statusText.innerText = "🤟, 🖐️ অথবা ☝️ সাইনটি দেখান";
        statusText.style.color = "#94a3b8";
    }
}

const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => { await hands.send({image: videoElement}); },
    width: 640, height: 480
});
camera.start();
