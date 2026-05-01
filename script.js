const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const popup = document.getElementById('video-popup');
const statusText = document.getElementById('status-text');
const musicBtn = document.getElementById('music-control');

// ভিডিও অবজেক্ট লিস্ট
const videos = {
    cat: document.getElementById('video-cat'),
    dipjol: document.getElementById('video-dipjol'),
    newVid: document.getElementById('video-new')
};

let isAudioEnabled = false;

// মিউজিক কন্ট্রোল
musicBtn.addEventListener('click', () => {
    isAudioEnabled = !isAudioEnabled;
    Object.values(videos).forEach(v => v.muted = !isAudioEnabled);
    musicBtn.innerHTML = isAudioEnabled ? "<span>🔊</span> MUSIC IS ON" : "<span>🔈</span> ENABLE MUSIC";
    musicBtn.classList.toggle('active', isAudioEnabled);
});

function onResults(results) {
    // ক্যানভাস সাইজ রিসাইজ করা (যদি দরকার হয়)
    canvasElement.width = canvasElement.clientWidth;
    canvasElement.height = canvasElement.clientHeight;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // জেসচার ড্রয়িং
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#ffffff', lineWidth: 2});

        // আঙুলের লজিক
        const indexUp = landmarks[8].y < landmarks[6].y;
        const middleUp = landmarks[12].y < landmarks[10].y;
        const ringUp = landmarks[16].y < landmarks[14].y;
        const pinkyUp = landmarks[20].y < landmarks[18].y;

        // ১. 🖐️ (Open Palm/Hi) -> Dipjol
        if (indexUp && middleUp && ringUp && pinkyUp) {
            playVideo('dipjol', "সালাম নিন বড় ভাই! 🖐️");
        } 
        // ২. 🤟 (Rock On) -> Scuba Cat
        else if (indexUp && pinkyUp && !middleUp && !ringUp) {
            playVideo('cat', "Scuba Cat মোড অন! 🤟");
        }
        // ৩. ☝️ (Index Finger) -> New Video
        else if (indexUp && !middleUp && !ringUp && !pinkyUp) {
            playVideo('newVid', "নতুন ভিডিও চলছে! ☝️");
        }
        else {
            stopVideos();
        }
    } else {
        stopVideos();
    }
    canvasCtx.restore();
}

function playVideo(key, message) {
    Object.keys(videos).forEach(k => {
        if (k === key) {
            videos[k].style.display = 'block';
            videos[k].play();
        } else {
            videos[k].style.display = 'none';
            videos[k].pause();
        }
    });
    popup.classList.remove('hidden');
    statusText.innerText = message;
    statusText.style.color = "#00f2fe";
}

function stopVideos() {
    if (!popup.classList.contains('hidden')) {
        popup.classList.add('hidden');
        Object.values(videos).forEach(v => v.pause());
        statusText.innerText = "🤟, 🖐️ অথবা ☝️ সাইনটি দেখান";
        statusText.style.color = "#94a3b8";
    }
}

const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
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
