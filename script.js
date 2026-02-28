// Timer State
let totalTime = 300; // default 5 minutes
let timeLeft = totalTime;
let timerInterval = null;
let isRunning = false;

// DOM Elements
const timeDisplay = document.getElementById('time-display');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const increaseBtn = document.getElementById('increase-btn');
const decreaseBtn = document.getElementById('decrease-btn');
const presetBtns = document.querySelectorAll('.preset-btn');
const testSoundBtn = document.getElementById('test-sound-btn');

// Progress Circle
const circle = document.querySelector('.progress-ring__circle');
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;

circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

// Initialize Display
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update circle progress
    const progress = timeLeft / totalTime;
    const offset = circumference - progress * circumference;
    // When time is 0, progress should be 0, offset = circumference. Wait...
    // Actually, progress goes from 1 to 0.
    // So offset should go from 0 to circumference.
    circle.style.strokeDashoffset = circumference - progress * circumference;
}

// Set Timer
function setTimer(seconds) {
    if (isRunning) pauseTimer();
    totalTime = seconds;
    timeLeft = totalTime;
    updateDisplay();
}

// Timer Controls
function startTimer() {
    if (isRunning) return;
    if (timeLeft <= 0) return;
    
    isRunning = true;
    startPauseBtn.textContent = '一時停止';
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft <= 0) {
            pauseTimer();
            playTimerEndSound();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    startPauseBtn.textContent = '開始';
    clearInterval(timerInterval);
}

function resetTimer() {
    pauseTimer();
    timeLeft = totalTime;
    updateDisplay();
}

function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

// Sound Generation (Web Audio API)
// Energetic but relaxing natural chime
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTone(freq, timeOffset, duration) {
    if (!audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    // Use sine wave for a soft, relaxing natural sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + timeOffset);
    
    // ADSR Envelope
    const startTime = audioCtx.currentTime + timeOffset;
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration); // Decay
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
}

function playTimerEndSound() {
    initAudio();
    // A bright, energetic, but soft arpeggio (C Major 9)
    // C5, E5, G5, B5, D6
    const notes = [523.25, 659.25, 783.99, 987.77, 1174.66];
    
    notes.forEach((freq, index) => {
        playTone(freq, index * 0.15, 2.0); // 150ms delay between notes
    });
    
    // Add a final soft chord
    setTimeout(() => {
        playTone(523.25, 0, 3.0);
        playTone(783.99, 0, 3.0);
        playTone(1318.51, 0, 3.0);
    }, notes.length * 150 + 200);
}

// Event Listeners
startPauseBtn.addEventListener('click', () => {
    initAudio(); // Initialize audio context on first interaction to respect autoplay policies
    toggleTimer();
});
resetBtn.addEventListener('click', resetTimer);

increaseBtn.addEventListener('click', () => {
    setTimer(totalTime + 60);
});

decreaseBtn.addEventListener('click', () => {
    if (totalTime > 60) {
        setTimer(totalTime - 60);
    }
});

presetBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const seconds = parseInt(e.target.dataset.time);
        setTimer(seconds);
        
        presetBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
    });
});

testSoundBtn.addEventListener('click', () => {
    initAudio();
    playTimerEndSound();
});

// Initial Render
updateDisplay();
