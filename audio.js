// Phase-based audio logic for meditation modes
function manageBreathAudioPhase(mode, phase, phaseElapsedTime) {
    if (!audioContext) return;
    const audioSettings = modes[mode]?.audio || {};
    // Use static variables to track last phase and last second for single-tone triggers
    if (!window._audioPhaseState) window._audioPhaseState = {};
    const state = window._audioPhaseState;
    const phaseKey = mode + '_' + phase.phase;
    const nowSecond = Math.floor(phaseElapsedTime / 1000);
    if (!state[phaseKey]) state[phaseKey] = { lastSecond: -1, triggeredStart: false };
    // Paced Breathing: [ ↑ 4 - ↓ 6 ]
    if (mode === 'paced' || mode === 'balance' || mode === 'relax') {
        // Inhale
        if (phase.phase === 'inhale') {
            if (!state[phaseKey].triggeredStart && nowSecond === 0) {
                playBeep(660, 200, 0.18, 'triangle'); // Tone A
                state[phaseKey].triggeredStart = true;
            }
            // Last 2 seconds: countdown beep ONCE per second
            if (phase.duration - phaseElapsedTime <= 2000) {
                if (state[phaseKey].lastSecond !== nowSecond && nowSecond >= Math.floor((phase.duration-2000)/1000)) {
                    playBeep(1200, 100, 0.13, 'sine'); // Countdown Tone
                    state[phaseKey].lastSecond = nowSecond;
                }
            }
        }
        // Exhale
        else if (phase.phase === 'exhale') {
            if (!state[phaseKey].triggeredStart && nowSecond === 0) {
                playBeep(440, 200, 0.18, 'triangle'); // Tone B
                state[phaseKey].triggeredStart = true;
            }
            // Last 2 seconds: countdown beep ONCE per second
            if (phase.duration - phaseElapsedTime <= 2000) {
                if (state[phaseKey].lastSecond !== nowSecond && nowSecond >= Math.floor((phase.duration-2000)/1000)) {
                    playBeep(1200, 100, 0.13, 'sine'); // Countdown Tone
                    state[phaseKey].lastSecond = nowSecond;
                }
            }
        }
        // Reset state if phase restarts
        if (phaseElapsedTime < 100) {
            state[phaseKey].lastSecond = -1;
            state[phaseKey].triggeredStart = false;
        }
    }
    // Tempo Box: [ ↑ 4 - ๐ 4 - ↓ 4 - ๐ 4 ]
    else if (mode === 'box') {
        if (phase.phase === 'inhale') {
            if (!state[phaseKey].triggeredStart && nowSecond === 0) {
                playBeep(660, 200, 0.18, 'triangle'); // Tone A
                state[phaseKey].triggeredStart = true;
            }
        } else if (phase.phase === 'hold') {
            if (!state[phaseKey].triggeredStart && nowSecond === 0) {
                playBeep(330, 120, 0.13, 'square'); // Hold Tone
                state[phaseKey].triggeredStart = true;
            }
        } else if (phase.phase === 'exhale') {
            if (!state[phaseKey].triggeredStart && nowSecond === 0) {
                playBeep(440, 200, 0.18, 'triangle'); // Tone B
                state[phaseKey].triggeredStart = true;
            }
        }
        // Last 2 seconds of any phase: countdown tick
        if (phase.duration - phaseElapsedTime <= 2000) {
            if (state[phaseKey].lastSecond !== nowSecond && nowSecond >= Math.floor((phase.duration-2000)/1000)) {
                playBeep(1200, 100, 0.13, 'sine'); // Countdown Tone
                state[phaseKey].lastSecond = nowSecond;
            }
        }
        // Reset state if phase restarts
        if (phaseElapsedTime < 100) {
            state[phaseKey].lastSecond = -1;
            state[phaseKey].triggeredStart = false;
        }
    }
    // Zen: only ambient, no cues
    else if (mode === 'zen') {
        playAmbientSound();
    }
}

// Helper: play a short pitch glide
function playGlide(freq, duration, type) {
    playBeep(freq, duration * 1000, 0.18, type);
}

// Helper: play a soft chime (for last 2s)
function playChime(phaseElapsedTime) {
    // Only play once per second in last 2s
    if (Math.floor((phaseElapsedTime % 2000) / 1000) === 0) {
        playBeep(1200, 180, 0.13, 'triangle');
    }
}

// Helper: play a steady drone
function playDrone(freq, volume) {
    playBeep(freq, 400, volume, 'sine');
}

// Helper: play metronome (optionally with tone change in last 2s)
function playMetronome(phaseElapsedTime, phaseDuration, isLast2s) {
    // Tick every 1s, change tone in last 2s
    const tick = Math.floor(phaseElapsedTime / 1000);
    if (isLast2s) {
        playBeep(400, 80, 0.13, 'square');
    } else {
        playBeep(600, 80, 0.13, 'square');
    }
}

// Helper: play ambient sound for Zen
function playAmbientSound() {
    // Placeholder: could loop a background audio buffer
    // For now, do nothing (ambient handled elsewhere)
}
let audioContext;
let oscillator;
let gainNode;
let isAudioPlaying = false;


function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playBeep(frequency = 800, duration = 100, volume = 0.3, type = 'sine') {
    initAudioContext();

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = type;
    osc.frequency.value = frequency;

    gain.gain.setValueAtTime(volume * (volumeSlider.value / 100), audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + duration / 1000);
}

function playCountdownBeep(number) {
    const freqs = {
        '3': 880,
        '2': 440,
        '1': 220,
        '0': 110
    };
    if (freqs[number] !== undefined) {
        playBeep(freqs[number], 150, 0.4);
    }
}

// Make playCountdownBeep globally accessible
window.playCountdownBeep = playCountdownBeep;

function startMeditationSound(mode) {
    if (isAudioPlaying) return;

    initAudioContext();
    const audioSettings = modes[mode].audio;
    if (!audioSettings) return;

    if (audioSettings.pattern === 'metronome') {
        // Simple metronome for zen mode
        const interval = 1500; // every 1.5 seconds
        const tickFreq = Number.isFinite(audioSettings.tickFreq) ? audioSettings.tickFreq : 600;
        const playTick = () => {
            playBeep(tickFreq, 50, 0.1, 'square');
        }
        playTick();
        oscillator = setInterval(playTick, interval);
    } else {
        oscillator = audioContext.createOscillator();
        gainNode = audioContext.createGain();

        oscillator.type = 'sine';
        const startFreq = Number.isFinite(audioSettings.minFreq) ? audioSettings.minFreq : 440;
        oscillator.frequency.value = startFreq;

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.08 * (volumeSlider.value / 100), audioContext.currentTime + 1);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start(audioContext.currentTime);
    }


    isAudioPlaying = true;
}

function stopMeditationSound() {
    if (!isAudioPlaying) return;

    if (oscillator) {
        if (gainNode) {
            gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
            oscillator.stop(audioContext.currentTime + 0.5);
        } else {
            clearInterval(oscillator);
        }
    }
    isAudioPlaying = false;
    oscillator = null;
    gainNode = null;
}

function manageBreathAudio(mode, breathPhase, phaseElapsedTime = 0, phaseDuration = 0) {
    const audioSettings = modes[mode].audio;
    if (!audioSettings || !isAudioPlaying || !oscillator || !gainNode) return;

    const now = audioContext.currentTime;
    const highFreq = Number.isFinite(audioSettings.inhaleFreq)
        ? audioSettings.inhaleFreq
        : (Number.isFinite(audioSettings.maxFreq) ? audioSettings.maxFreq : 440);
    const lowFreq = Number.isFinite(audioSettings.exhaleFreq)
        ? audioSettings.exhaleFreq
        : (Number.isFinite(audioSettings.minFreq) ? audioSettings.minFreq : 220);
    const progress = phaseDuration > 0 ? Math.min(1, Math.max(0, phaseElapsedTime / phaseDuration)) : 0;

    if (audioSettings.pattern === 'up-down') {
        if (breathPhase === 'inhale') {
            const target = lowFreq + (highFreq - lowFreq) * progress;
            oscillator.frequency.setValueAtTime(target, now);
        } else if (breathPhase === 'exhale') {
            const target = highFreq - (highFreq - lowFreq) * progress;
            oscillator.frequency.setValueAtTime(target, now);
        }
    } else if (audioSettings.pattern === 'asymmetric') {
        if (breathPhase === 'inhale') {
            const target = lowFreq + (highFreq - lowFreq) * progress;
            oscillator.frequency.setValueAtTime(target, now);
        } else if (breathPhase === 'exhale') {
            const target = highFreq - (highFreq - lowFreq) * progress;
            oscillator.frequency.setValueAtTime(target, now);
        }
    } else if (audioSettings.pattern === 'linear') {
        if (breathPhase === 'inhale') {
            const target = lowFreq + (highFreq - lowFreq) * progress;
            oscillator.frequency.setValueAtTime(target, now);
        } else if (breathPhase === 'hold') {
            oscillator.frequency.setValueAtTime(highFreq / 1.5, now);
            if (audioSettings.holdVibrato) {
                const lfo = audioContext.createOscillator();
                lfo.frequency.value = 3;
                const lfoGain = audioContext.createGain();
                lfoGain.gain.value = 5;
                lfo.connect(lfoGain);
                lfoGain.connect(oscillator.frequency);
                lfo.start(now);
                lfo.stop(now + modes[mode].breathingPattern[1].duration / 1000);
            }
        } else if (breathPhase === 'exhale') {
            const target = highFreq - (highFreq - lowFreq) * progress;
            oscillator.frequency.setValueAtTime(target, now);
        }
    }
}
