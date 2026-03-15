
    // --- Video Thumbnail Timeline Preview ---
    const videoThumbnail = document.getElementById('video-thumbnail');
    const previewVideo = document.getElementById('preview-video');
    const timelineBar = document.getElementById('timeline-bar');
    const timelineProgress = document.getElementById('timeline-progress');

    if (videoThumbnail && previewVideo && timelineBar && timelineProgress) {
        videoThumbnail.addEventListener('mousemove', (e) => {
            const rect = videoThumbnail.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = Math.max(0, Math.min(1, x / rect.width));
            timelineProgress.style.width = (percent * 100) + '%';
            if (previewVideo.duration) {
                previewVideo.currentTime = percent * previewVideo.duration;
            }
        });
        videoThumbnail.addEventListener('mouseenter', () => {
            previewVideo.play();
            previewVideo.muted = true;
        });
        videoThumbnail.addEventListener('mouseleave', () => {
            timelineProgress.style.width = '0%';
            previewVideo.pause();
            previewVideo.currentTime = 0;
        });
    }
        // CONFIGURATION
        const CANVAS_SIZE = 320;
        const ASCII_FONT_SIZE = 10; // adjust for density/perf

        // DOM Elements
        const video = document.getElementById('webcamVideo');
        const canvas = document.getElementById('pixelCanvas');
        const ctx = canvas.getContext('2d');
        const btnToggle = document.getElementById('btnToggle');
        const btnDownload = document.getElementById('btnDownload');
        const timerDisplay = document.getElementById('timer');
        const recDot = document.getElementById('recDot');
        const durationInput = document.getElementById('durationInput');
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeLabel = document.getElementById('volumeLabel');
        const modeDisplay = document.getElementById('modeDisplay');
        const breathingGuide = document.getElementById('breathing-guide');
        const tempoBox = document.getElementById('tempo-box');
        const settingsPanel = document.getElementById('settings-panel');
        const previewModal = document.getElementById('preview-modal');
        const countdownOverlay = document.getElementById('countdown-overlay');
        const breathIndicator = document.getElementById('breath-indicator');
        const modeButtons = document.querySelectorAll('.mode-btn');
        const paletteSelector = document.getElementById('palette-selector');

        // IndexedDB configuration
        const dbName = "DotCrossZenDB";
        const storeName = "sessions";
        let db;

        const initDB = () => {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(dbName, 1);
                request.onerror = () => reject("Error opening DB");
                request.onsuccess = (e) => {
                    db = e.target.result;
                    resolve(db);
                };
                request.onupgradeneeded = (e) => {
                    db = e.target.result;
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
                    }
                };
            });
        };

        const saveSession = (blob, durationText, events = []) => {
            return new Promise((resolve, reject) => {
                if (!db) return reject("DB not initialized");
                const transaction = db.transaction([storeName], "readwrite");
                const store = transaction.objectStore(storeName);
                const record = {
                    blob: blob,
                    durationText: durationText,
                    timestamp: Date.now(),
                    events: events
                };
                const request = store.add(record);
                request.onsuccess = (e) => resolve(e.target.result);
                request.onerror = () => reject("Error saving session");
            });
        };

        const loadSessions = () => {
            return new Promise((resolve, reject) => {
                if (!db) return resolve([]);
                const transaction = db.transaction([storeName], "readonly");
                const store = transaction.objectStore(storeName);
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject("Error loading sessions");
            });
        };

        const deleteSession = (id) => {
            return new Promise((resolve, reject) => {
                if (!db) return reject("DB not initialized");
                if (!id) return resolve(); // Just in case it's null
                const transaction = db.transaction([storeName], "readwrite");
                const store = transaction.objectStore(storeName);
                const request = store.delete(id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject("Error deleting session");
            });
        };

        const addSessionToGrid = (blob, durationText, id, events = []) => {
            const url = URL.createObjectURL(blob);
            const grid = document.getElementById('gif-grid');
            if (grid) {
                const card = document.createElement('div');
                card.className = 'gif-card';
                card.dataset.id = id;
                card.dataset.events = JSON.stringify(events);
                const hasEvents = events && events.length > 0;
                // We'll update the .gif-time text after loading video duration
                card.innerHTML = `
                    <div class="gif-card-video-container" style="position: relative; width: 180px; height: 100px; background: #222; border-radius: 6px; overflow: hidden;">
                        <video src="${url}" loop muted playsinline style="width: 100%; height: 100%; object-fit: cover;"></video>
                        <div class="gif-timeline-bar" style="position: absolute; left: 0; bottom: 0; height: 5px; width: 100%; background: rgba(0,0,0,0.4);">
                            <div class="gif-timeline-progress" style="height: 100%; width: 0%; background: linear-gradient(90deg, #00ff9d, #00b36b);"></div>
                        </div>
                    </div>
                    <div class="gif-card-overlay">
                        <div class="gif-card-top-row">
                            <div class="gif-card-delete" title="Delete" style="pointer-events:auto;cursor:pointer;position:relative;z-index:20;">
                                <span style="font-size:28px;line-height:1;">&#8942;</span>
                                <button class="gif-card-delete-btn" style="display:none;position:fixed;top:0;left:0;background:#ff5555;color:#fff;border:none;padding:8px 28px;border-radius:8px;z-index:9999;cursor:pointer;font-weight:bold;box-shadow:0 4px 24px #000a;">Delete</button>
                            </div>
                        </div>
                        <div class="gif-card-play">▶</div>
                        <div class="gif-card-bottom-row">
                            <div class="gif-time">Loading...</div>
                        </div>
                    </div>
                `;

                // Add delete button dropdown logic (event delegation, scoped to card)
                const deleteIcon = card.querySelector('.gif-card-delete');
                const deleteBtn = card.querySelector('.gif-card-delete-btn');
                if (deleteIcon && deleteBtn) {
                    deleteIcon.addEventListener('click', (e) => {
                        e.stopPropagation();
                        // Hide all other delete buttons
                        document.querySelectorAll('.gif-card-delete-btn').forEach(btn => btn.style.display = 'none');
                        // Get icon position
                        const rect = deleteIcon.getBoundingClientRect();
                        deleteBtn.style.display = 'block';
                        deleteBtn.style.top = `${rect.bottom + 4}px`;
                        deleteBtn.style.left = `${rect.left - 10}px`;
                    });
                    // Hide on mouse leave from button
                    deleteBtn.addEventListener('mouseleave', () => {
                        deleteBtn.style.display = 'none';
                    });
                    // Hide only this button on click elsewhere
                    document.body.addEventListener('click', function hideBtn(ev) {
                        if (!deleteBtn.contains(ev.target) && !deleteIcon.contains(ev.target)) {
                            deleteBtn.style.display = 'none';
                        }
                    });
                    // Delete logic
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm('Delete this session record?')) {
                            if (id !== undefined && id !== null) {
                                deleteSession(id).catch(e => console.error(e));
                            }
                            const vid = card.querySelector('video');
                            if (vid) URL.revokeObjectURL(vid.src);
                            card.remove();
                        }
                        deleteBtn.style.display = 'none';
                    });
                }

                // (Removed duplicate deleteIcon/deleteBtn logic)
// Restore removeSession for three-dot delete
window.removeSession = (id, el) => {
    if (el) {
        el.stopPropagation();
    }
    if (confirm("Delete this session record?")) {
        if (id !== undefined && id !== null) {
            deleteSession(id).catch(e => console.error(e));
        }
        const card = el.closest('.gif-card');
        if (card) {
            const vid = card.querySelector('video');
            if (vid) URL.revokeObjectURL(vid.src);
            card.remove();
        }
    }
};

                const vid = card.querySelector('video');
                vid.defaultPlaybackRate = 2.0;
                vid.playbackRate = 2.0;
                vid.onplay = () => {
                    vid.playbackRate = 2.0;
                    card.classList.add('playing');
                };
                vid.onpause = () => {
                    card.classList.remove('playing');
                };

                // Show real duration after metadata loads
                vid.addEventListener('loadedmetadata', () => {
                    const realMins = (vid.duration / 60).toFixed(1);
                    // Extract planned duration in minutes from durationText (e.g., '10 Mins' or '1 Min')
                    let planned = durationText.match(/\d+/);
                    planned = planned ? planned[0] : '?';
                    card.querySelector('.gif-time').textContent = `Session ${realMins} / ${planned} mins`;
                });

                // Timeline preview logic
                const videoContainer = card.querySelector('.gif-card-video-container');
                const timelineBar = card.querySelector('.gif-timeline-bar');
                const timelineProgress = card.querySelector('.gif-timeline-progress');
                if (videoContainer && timelineBar && timelineProgress) {
                    videoContainer.addEventListener('mousemove', (e) => {
                        const rect = videoContainer.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const percent = Math.max(0, Math.min(1, x / rect.width));
                        timelineProgress.style.width = (percent * 100) + '%';
                        if (vid.duration) {
                            vid.currentTime = percent * vid.duration;
                        }
                    });
                    videoContainer.addEventListener('mouseenter', () => {
                        // Only play if there is a valid source
                        if (vid.src && vid.src !== '' && vid.readyState > 0) {
                            vid.play();
                            vid.muted = true;
                        }
                    });
                    videoContainer.addEventListener('mouseleave', () => {
                        timelineProgress.style.width = '0%';
                        vid.pause();
                        vid.currentTime = 0;
                    });
                }

                card.addEventListener('click', (e) => {
                    if (e.target.classList.contains('gif-card-delete')) return;
                    if (vid.paused) {
                        vid.play();
                    } else {
                        vid.pause();
                    }
                });

                grid.insertBefore(card, grid.firstChild);
            }
        };

        // Global function for inline onclick handler

// Delete all sessions button logic
document.addEventListener('DOMContentLoaded', () => {
    const deleteAllBtn = document.getElementById('deleteAllSessions');
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', async () => {
            if (confirm('Delete all session records? This cannot be undone.')) {
                // Clear DB
                const db = await initDB();
                const tx = db.transaction([storeName], 'readwrite');
                const store = tx.objectStore(storeName);
                const clearReq = store.clear();
                clearReq.onsuccess = () => {
                    // Remove all cards from grid
                    const grid = document.getElementById('gif-grid');
                    if (grid) grid.innerHTML = '';
                };
                clearReq.onerror = () => alert('Failed to clear session records.');
            }
        });
    }
});

        // Initialize DB and load past sessions
        initDB().then(() => {
            loadSessions().then(sessions => {
                sessions.sort((a, b) => a.timestamp - b.timestamp);
                sessions.forEach(session => {
                    addSessionToGrid(session.blob, session.durationText, session.id, session.events || []);
                });
            }).catch(e => console.error(e));
        }).catch(e => console.error(e));

        // State
        let isMeditating = false;
        let isCountingDown = false;
        let animationId;
        let mediaRecorder;
        let recordedChunks = [];
        let timerInterval;
        let timeLeft = 600;
        const modes = {
    'balance': {
        name: 'Balance (5-5)',
        description: 'Breathe in for 5 seconds, and out for 5 seconds. A simple and effective way to balance your nervous system.',
        visual: {
            shape: 'circle',
            minSize: 80,
            maxSize: 280,
            colors: ['#4A90E2', '#00D4FF', '#2C5F8D'],
            animation: 'ease-in-out',
        },
        audio: {
            pattern: 'up-down',
            minFreq: 110,
            maxFreq: 293,
        },
        breathingPattern: [
            { phase: 'inhale', duration: 5000 },
            { phase: 'exhale', duration: 5000 },
        ],
    },
    'relax': {
        name: 'Relax (4-6)',
        description: 'A calming pattern with a longer exhale. Inhale for 4 seconds, then exhale slowly for 6 seconds to promote relaxation.',
        visual: {
            shape: 'soft-circle',
            minSize: 60,
            maxSize: 240,
            colors: ['#B4A7D6', '#9B87C4', '#5E4B8B'],
            animation: 'asymmetric',
        },
        audio: {
            pattern: 'asymmetric',
            minFreq: 100,
            maxFreq: 250,
        },
        breathingPattern: [
            { phase: 'inhale', duration: 4000 },
            { phase: 'exhale', duration: 6000 },
        ],
    },
    'box': {
        name: 'Box (4-4-4-4)',
        description: 'A structured breathing technique. Inhale for 4, hold for 4, exhale for 4, and hold for 4. Excellent for focus and stress reduction.',
        visual: {
            shape: 'rounded-square',
            minSize: 100,
            maxSize: 260,
            colors: ['#4CAF50', '#66BB6A', '#2E7D32'],
            border: '3px solid',
            glow: true,
        },
        audio: {
            pattern: 'linear',
            holdVibrato: true,
            minFreq: 220,
            maxFreq: 440,
        },
        breathingPattern: [
            { phase: 'inhale', duration: 4000 },
            { phase: 'hold', duration: 4000 },
            { phase: 'exhale', duration: 4000 },
            { phase: 'hold', duration: 4000 },
        ],
    },
    'zen': {
        name: 'Zen',
        description: 'A gentle, natural breathing pattern with no strict timing. Follow the organic pulsing of the visual and the soft metronome sound.',
        visual: {
            shape: 'organic-circle',
            minSize: 120,
            maxSize: 200,
            colors: ['#E8D5B7'],
            opacity: [0.6, 0.85],
            animation: 'ultra-slow',
            particles: true,
        },
        audio: {
            pattern: 'metronome',
            sound: 'wood-block',
            tickFreq: 600,
        },
        breathingPattern: 'natural',
    },
    // 'silent' mode removed
};

let meditationMode = 'balance';
        let breathPhase = 'inhale'; // inhale, hold, exhale
        let sessionStartTime = 0;
        let breathPhaseIndex = 0;
        let rhythmAnimationId;
        let lastTickTime = 0;
        let lastTickCount = -1;
        let breathCycleElapsedTime = 0;
//
        let cameraReady = false;

        let cameraError = false;
        let cameraNeedsPermission = false;
        let countdownValue = 0;
        let selectedPaletteKey = 'classic';

        // Pause menu state
        let isPaused = false;
        let pauseMenuSelectedIndex = 0;
        const pauseMenuOptions = [
            { label: '🧘 Resume Session', action: 'resume' },
            { label: '⏹️ Stop Session', action: 'stop' }
        ];

        // Keyboard listener for pause menu and spacebar

        document.addEventListener('keydown', (e) => {
            // Pause menu navigation only
            if (isPaused) {
                if (e.code === 'ArrowUp') {
                    e.preventDefault();
                    pauseMenuSelectedIndex = Math.max(0, pauseMenuSelectedIndex - 1);
                    renderPauseMenu();
                    return;
                }
                if (e.code === 'ArrowDown') {
                    e.preventDefault();
                    pauseMenuSelectedIndex = Math.min(pauseMenuOptions.length - 1, pauseMenuSelectedIndex + 1);
                    renderPauseMenu();
                    return;
                }
                if (e.code === 'Enter' || e.code === 'Space') {
                    e.preventDefault();
                    executePauseMenuAction();
                    return;
                }
                if (e.code === 'Escape') {
                    e.preventDefault();
                    hidePauseMenu();
                    return;
                }
                return;
            }
            // Spacebar to pause during meditation
            if (e.code === 'Space' && isMeditating && !isCountingDown) {
                e.preventDefault();
                showPauseMenu();
            }
        });

        function showPauseMenu() {
            isPaused = true;
            pauseMenuSelectedIndex = 0;
            
            // Pause the timer
            clearInterval(timerInterval);
            cancelAnimationFrame(rhythmAnimationId);
            
            // Stop the sound
            stopMeditationSound();
            
            renderPauseMenu();
            document.getElementById('pause-menu').style.display = 'block';
        }

        function hidePauseMenu() {
            isPaused = false;
            document.getElementById('pause-menu').style.display = 'none';
            
            // Resume timer
            timerInterval = setInterval(updateTimer, 1000);
            sessionStartTime = Date.now() - breathCycleElapsedTime; // Adjust start time
            manageBreathRhythm();
            
            // Resume sound
            if (meditationMode !== 'silent') {
                startMeditationSound(meditationMode);
            }
        }

        function renderPauseMenu() {
            const container = document.getElementById('pause-menu-options');
            if (!container) return;
            
            container.innerHTML = pauseMenuOptions.map((option, index) => `
                <div data-index="${index}" style="padding:10px 15px;border-radius:6px;cursor:pointer;font-size:13px;transition:all 0.2s;${index === pauseMenuSelectedIndex ? 'background:#00ff9d;color:#000;font-weight:bold;' : 'background:rgba(255,255,255,0.05);color:#00ff9d;border:1px solid #00ff9d;'}">
                    ${option.label}
                </div>
            `).join('');
        }

        function executePauseMenuAction() {
            const action = pauseMenuOptions[pauseMenuSelectedIndex].action;
            
            switch(action) {
                case 'resume':
                    hidePauseMenu();
                    break;
                case 'mark_wander':
                    markMindEvent('Mind Wandered');
                    hidePauseMenu();
                    break;
                case 'mark_sleepy':
                    markMindEvent('Feeling Sleepy');
                    hidePauseMenu();
                    break;
                case 'mark_focus':
                    markMindEvent('Lost Focus');
                    hidePauseMenu();
                    break;
                case 'mark_distract':
                    markMindEvent('Distracted');
                    hidePauseMenu();
                    break;
                case 'stop':
                    stopMeditation();
                    break;
            }
        }

        function markMindEvent(eventType) {
            const elapsedSeconds = (parseInt(durationInput.value) * 60) - timeLeft;
            const minutes = Math.floor(elapsedSeconds / 60);
            const seconds = elapsedSeconds % 60;
            const timestamp = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            sessionEvents.push({
                timestamp: timestamp,
                elapsedSeconds: elapsedSeconds,
                type: eventType,
                note: 'Returned to present moment'
            });
            
            // Show visual feedback
            showMindEventFeedback(eventType);
            
            // Play gentle acknowledgment sound
            playBeep(1200, 100, 0.2, 'sine');
            setTimeout(() => playBeep(1400, 150, 0.25, 'sine'), 100);
        }

        function showMindEventFeedback(eventType) {
            const indicator = document.getElementById('mind-event-indicator');
            const eventTypeEl = document.getElementById('mind-event-type');
            
            if (indicator && eventTypeEl) {
                eventTypeEl.textContent = eventType;
                indicator.style.display = 'block';
                
                setTimeout(() => {
                    indicator.style.display = 'none';
                }, 2000);
            }
        }

        // Global function to show session info
        window.showSessionInfo = (event, id) => {
            event.stopPropagation();
            event.preventDefault();
            
            const modal = document.getElementById('session-info-modal');
            const content = document.getElementById('session-info-content');
            
            console.log('showSessionInfo called, modal:', modal, 'content:', content);
            
            if (!modal || !content) {
                console.error('Modal or content not found');
                return;
            }
            
            // Get events from the clicked element's parent card
            const card = event.target.closest('.gif-card');
            console.log('Card found:', card);
            console.log('Card dataset:', card?.dataset);
            
            const events = card ? JSON.parse(card.dataset.events || '[]') : [];
            const durationText = card ? card.querySelector('.gif-time')?.textContent : 'Session';
            
            console.log('Events:', events);
            
            modal.style.display = 'flex';
            
            if (events.length === 0) {
                content.innerHTML = `
                    <div style="color:#00ff9d;text-align:center;padding:40px;">
                        <div style="font-size:48px;margin-bottom:20px;">🧘</div>
                        <div style="font-size:18px;margin-bottom:10px;">Perfect Focus!</div>
                        <div style="color:#888;">No mind-wandering events were marked during this session.</div>
                    </div>
                `;
                return;
            }
            
            let html = `
                <div style="margin-bottom:15px;color:#888;font-size:12px;">${durationText} - ${events.length} event(s) marked</div>
                <div style="display:flex;flex-direction:column;gap:10px;">
            `;
            
            events.forEach((evt, index) => {
                const icons = {
                    'Mind Wandered': '💭',
                    'Feeling Sleepy': '😴',
                    'Lost Focus': '🌫️',
                    'Distracted': '🔔'
                };
                const icon = icons[evt.type] || '📝';
                
                html += `
                    <div style="background:#0a0a0a;border:1px solid #333;border-left:3px solid #ff5555;border-radius:6px;padding:12px;display:flex;align-items:center;gap:12px;">
                        <div style="font-size:24px;">${icon}</div>
                        <div style="flex:1;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
                                <span style="color:#ff5555;font-weight:bold;">${evt.type}</span>
                                <span style="color:#00ff9d;font-family:monospace;font-size:14px;">${evt.timestamp}</span>
                            </div>
                            <div style="color:#888;font-size:11px;">${evt.note}</div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
            content.innerHTML = html;
        };

        // Close session info modal
        document.getElementById('sessionInfoClose')?.addEventListener('click', () => {
            document.getElementById('session-info-modal').style.display = 'none';
        });

        // Close modal on outside click
        document.getElementById('session-info-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'session-info-modal') {
                e.target.style.display = 'none';
            }
        });

        // ASCII palettes (dot/cross style)
        const palettes = {
            classic: [' ', '.', '+', 'x', 'X', '#', 'W'],
            matrix: [' ', '.', ':', '+', '*', 'x', 'X', 'M'],
            retro: [' ', '.', 'o', 'O', '0', '8', '@'],
            inverted: ['@', '#', 'X', 'x', '+', '.', ' ']
        };

        const paletteTheme = {
            classic: { bg: '#000000', fg: '#ffffff' },
            matrix: { bg: '#052e16', fg: '#4ade80' },
            retro: { bg: '#291c0e', fg: '#fbbf24' },
            inverted: { bg: '#ffffff', fg: '#000000' }
        };

        // Offscreen sampling canvas for ASCII mapping
        const sampleCanvas = document.createElement('canvas');
        const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

        function mapToAscii(brightness, palette) {
            const idx = Math.floor((brightness / 255) * (palette.length - 1));
            return palette[idx];
        }

        function setSelectedPalette(nextKey) {
            if (!palettes[nextKey]) return;
            selectedPaletteKey = nextKey;
            const dots = paletteSelector.querySelectorAll('.palette-dot');
            dots.forEach(btn => {
                btn.setAttribute('aria-pressed', btn.dataset.palette === selectedPaletteKey ? 'true' : 'false');
            });
        }

        paletteSelector.addEventListener('click', (e) => {
            const btn = e.target.closest('.palette-dot');
            if (!btn) return;
            setSelectedPalette(btn.dataset.palette);
        });

        

        // Initialize Canvas
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        ctx.imageSmoothingEnabled = false;

        

        // Setup Camera
        async function setupCamera(forcePrompt = false) {
            if (cameraReady) return;
            
            // If it needs permission and we aren't forcing the prompt via click yet, back out.
            if (cameraNeedsPermission && !forcePrompt) return;

            cameraError = false;
            cameraNeedsPermission = false;
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    cameraReady = true;
                    // Remember that we have permission
                    localStorage.setItem('cameraAllowed', 'true');
                    console.log('Camera ready');
                };
            } catch (err) {
                console.log("Camera access denied or not available");
                cameraError = true;
            }
        }

        // Initialize camera on page load
        window.addEventListener('load', async () => {
            // Check if we should auto-start camera
            let shouldAutoStart = localStorage.getItem('cameraAllowed') === 'true';

            if (!shouldAutoStart && navigator.permissions) {
                try {
                    const perm = await navigator.permissions.query({ name: 'camera' });
                    if (perm.state === 'granted') {
                        shouldAutoStart = true;
                        localStorage.setItem('cameraAllowed', 'true');
                    }
                } catch(e) {}
            }

            if (!shouldAutoStart) {
                 cameraNeedsPermission = true;
            }

            // Ensure countdown overlay is hidden on load
            countdownOverlay.classList.remove('show');
            isCountingDown = false;
            countdownValue = 0;

            // setupCamera will respect cameraNeedsPermission unless we force it
            setupCamera(false);
            draw(); // Start the continuous draw loop
        });

        // Click to allow camera if denied or needs click
        canvas.addEventListener('click', () => {
            if (!cameraReady && (cameraError || cameraNeedsPermission)) {
                setupCamera(true); // Force the prompt since user clicked
            }
        });

        // Mode button handlers
        modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        meditationMode = btn.dataset.mode;
        showPreviewModal();
    });
});

        // Show preview modal
        function showPreviewModal() {
    const mode = modes[meditationMode];
    if (!mode) return;

    document.getElementById('previewTitle').textContent = mode.name;
    document.getElementById('previewDescription').textContent = mode.description;

    const previewGuide = document.getElementById('previewGuide');
    if (mode.visual) {
        previewGuide.innerHTML = `<div class="preview-breathing" style="--min-size: ${mode.visual.minSize}px; --max-size: ${mode.visual.maxSize}px;"></div>`;
    } else {
        previewGuide.innerHTML = '';
    }

    // Hide countdown overlay if it's showing
    countdownOverlay.classList.remove('show');
    isCountingDown = false;
    countdownValue = 0;

    previewModal.classList.add('show');
}

        // Preview sound: simulate one full breathing cycle
        let previewTimer = null;
        let previewTimeout = null;
        let previewAnimationId = null;
        let previewAnimationStart = 0;

        function stopPreviewSound() {
            if (previewTimer) {
                clearInterval(previewTimer);
                previewTimer = null;
            }
            if (previewTimeout) {
                clearTimeout(previewTimeout);
                previewTimeout = null;
            }
            if (previewAnimationId) {
                cancelAnimationFrame(previewAnimationId);
                previewAnimationId = null;
            }
            stopMeditationSound();
        }

        function runPreviewAnimation(mode) {
            const previewGuide = document.getElementById('previewGuide');
            const visualElement = previewGuide ? previewGuide.querySelector('div') : null;
            if (!mode || !mode.breathingPattern || mode.breathingPattern === 'natural' || !visualElement) {
                return;
            }

            const pattern = mode.breathingPattern;
            const totalCycleTime = pattern.reduce((sum, p) => sum + p.duration, 0);
            previewAnimationStart = Date.now();

            const animate = () => {
                if (!previewAnimationId) return;

                const elapsed = (Date.now() - previewAnimationStart) % totalCycleTime;
                let cumulativeTime = 0;
                let currentPhaseIndex = 0;
                for (let i = 0; i < pattern.length; i++) {
                    if (elapsed < cumulativeTime + pattern[i].duration) {
                        currentPhaseIndex = i;
                        break;
                    }
                    cumulativeTime += pattern[i].duration;
                }

                const currentPhase = pattern[currentPhaseIndex];
                const phaseElapsedTime = elapsed - cumulativeTime;
                const progress = currentPhase.duration > 0 ? phaseElapsedTime / currentPhase.duration : 0;

                const visualSettings = mode.visual || {};
                const minSize = Number.isFinite(visualSettings.minSize) ? visualSettings.minSize : 60;
                const maxSize = Number.isFinite(visualSettings.maxSize) ? visualSettings.maxSize : 200;
                const maxScale = maxSize / Math.max(1, minSize);
                const currentScale = visualElement.style.transform.match(/scale\(([^)]+)\)/);
                const currentScaleValue = currentScale ? parseFloat(currentScale[1]) : 1;

                switch (currentPhase.phase) {
                    case 'inhale':
                        visualElement.style.transform = `scale(${1 + progress * (maxScale - 1)})`;
                        break;
                    case 'exhale':
                        visualElement.style.transform = `scale(${maxScale - progress * (maxScale - 1)})`;
                        break;
                    case 'hold':
                        if (meditationMode === 'box') {
                            const pulse = Math.sin(phaseElapsedTime / 200) * 0.05;
                            visualElement.style.transform = `scale(${maxScale + pulse})`;
                        } else {
                            visualElement.style.transform = `scale(${maxScale})`;
                        }
                        break;
                    case 'transition':
                        visualElement.style.transform = `scale(${currentScaleValue})`;
                        break;
                }

                previewAnimationId = requestAnimationFrame(animate);
            };

            previewAnimationId = requestAnimationFrame(animate);
        }

        function runPreviewCycle() {
            const mode = modes[meditationMode];
            if (!mode || !mode.audio) return;

            stopPreviewSound();
            startMeditationSound(meditationMode);
            runPreviewAnimation(mode);

            if (!mode.breathingPattern || mode.breathingPattern === 'natural') {
                // Zen/metronome: play a few ticks then stop
                previewTimeout = setTimeout(stopPreviewSound, 5000);
                return;
            }

            const pattern = mode.breathingPattern;
            const totalCycleTime = pattern.reduce((sum, p) => sum + p.duration, 0);
            const previewStart = Date.now();

            previewTimer = setInterval(() => {
                const elapsed = (Date.now() - previewStart);
                if (elapsed >= totalCycleTime) {
                    stopPreviewSound();
                    return;
                }

                let cumulativeTime = 0;
                let currentPhaseIndex = 0;
                for (let i = 0; i < pattern.length; i++) {
                    if (elapsed < cumulativeTime + pattern[i].duration) {
                        currentPhaseIndex = i;
                        break;
                    }
                    cumulativeTime += pattern[i].duration;
                }

                const currentPhase = pattern[currentPhaseIndex];
                const phaseElapsedTime = elapsed - cumulativeTime;

                manageBreathAudioPhase(meditationMode, currentPhase, phaseElapsedTime);

                if (mode.audio && mode.audio.pattern !== 'metronome') {
                    let audioPhase = currentPhase.phase;
                    let audioPhaseElapsed = phaseElapsedTime;
                    let audioPhaseDuration = currentPhase.duration;
                    if (audioPhase === 'transition') {
                        const nextPhase = pattern[(currentPhaseIndex + 1) % pattern.length];
                        if (nextPhase) {
                            audioPhase = nextPhase.phase;
                            const mappedElapsed = (currentPhase.duration > 0)
                                ? (phaseElapsedTime / currentPhase.duration) * nextPhase.duration
                                : 0;
                            audioPhaseElapsed = mappedElapsed;
                            audioPhaseDuration = nextPhase.duration;
                        }
                    }
                    manageBreathAudio(meditationMode, audioPhase, audioPhaseElapsed, audioPhaseDuration);
                }
            }, 50);
        }

        document.getElementById('previewPlaySound').addEventListener('click', () => {
            if (meditationMode === 'silent') {
                alert('Silent mode has no sound');
                return;
            }
            runPreviewCycle();
        });

        // Preview cancel
        document.getElementById('previewCancel').addEventListener('click', () => {
            previewModal.classList.remove('show');
            stopPreviewSound();
            // Ensure countdown is hidden and reset
            countdownOverlay.classList.remove('show');
            isCountingDown = false;
            countdownValue = 0;
            // Ensure camera preview continues
            if (!isMeditating) {
                draw();
            }
        });

        // Preview start
        document.getElementById('previewStart').addEventListener('click', () => {
            previewModal.classList.remove('show');
            stopPreviewSound();
            startCountdown();
        });

        // Countdown before meditation
        function startCountdown() {
            let count = 3;
            isCountingDown = true;
            countdownValue = count;
            
            // Update the overlay countdown number element
            const countdownEl = document.getElementById('countdownNumber');
            countdownEl.textContent = count;
            countdownEl.style.animation = 'none';
            countdownEl.offsetHeight; // Trigger reflow
            countdownEl.style.animation = 'countdown-pop 0.5s ease-out';
            
            countdownOverlay.classList.add('show');
            countdownOverlay.style.display = 'flex';
            playCountdownBeep(count);

            const countdown = setInterval(() => {
                count--;
                countdownValue = count;
                
                if (count >= 0) {
                    countdownEl.textContent = count;
                    countdownEl.style.animation = 'none';
                    countdownEl.offsetHeight; // Trigger reflow
                    countdownEl.style.animation = 'countdown-pop 0.5s ease-out';
                    playCountdownBeep(count);
                }

                if (count < 0) {
                    clearInterval(countdown);
                    isCountingDown = false;
                    countdownValue = 0;
                    countdownOverlay.classList.remove('show');
                    countdownOverlay.style.display = 'none';
                    startMeditation();
                }
            }, 1000);
        }

        // Volume slider
        volumeSlider.addEventListener('input', (e) => {
            volumeLabel.textContent = e.target.value + '%';
        });

        // Duration input
        durationInput.addEventListener('change', (e) => {
            let minutes = parseInt(e.target.value);
            if (minutes < 1) minutes = 1;
            if (minutes > 60) minutes = 60;
            e.target.value = minutes;
            // Update display if not meditating
            if (!isMeditating && !isCountingDown) {
                timeLeft = minutes * 60;
                updateTimer();
            }
        });

        // Duration input on input (live update)
        durationInput.addEventListener('input', (e) => {
            let minutes = parseInt(e.target.value);
            if (minutes >= 1 && minutes <= 60 && !isMeditating && !isCountingDown) {
                timeLeft = minutes * 60;
                updateTimer();
            }
        });

        // ASCII (dot/cross) draw loop - continuous
        function draw() {
            if (cameraReady && video.srcObject && video.readyState === video.HAVE_ENOUGH_DATA) {
                const charW = Math.max(4, Math.floor(ASCII_FONT_SIZE * 0.6));
                const cols = Math.max(40, Math.floor(canvas.width / charW));
                const rows = Math.max(25, Math.floor(canvas.height / ASCII_FONT_SIZE));

                sampleCanvas.width = cols;
                sampleCanvas.height = rows;

                // Mirror effect (selfie camera)
                sampleCtx.save();
                sampleCtx.scale(-1, 1);
                sampleCtx.drawImage(video, -cols, 0, cols, rows);
                sampleCtx.restore();

                const imageData = sampleCtx.getImageData(0, 0, cols, rows);
                const pixels = imageData.data;
                const palette = palettes[selectedPaletteKey];
                const theme = paletteTheme[selectedPaletteKey];

                // Background
                ctx.fillStyle = theme.bg;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Text
                ctx.fillStyle = theme.fg;
                ctx.textBaseline = 'top';
                ctx.textAlign = 'left';
                ctx.font = `${ASCII_FONT_SIZE}px "Courier New", Courier, monospace`;

                const lineHeight = ASCII_FONT_SIZE;
                for (let y = 0; y < rows; y++) {
                    let line = '';
                    for (let x = 0; x < cols; x++) {
                        const idx = (y * cols + x) * 4;
                        const r = pixels[idx];
                        const g = pixels[idx + 1];
                        const b = pixels[idx + 2];
                        const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
                        line += mapToAscii(brightness, palette);
                    }
                    ctx.fillText(line, 0, y * lineHeight);
                }
            } else {
                // Show placeholder when camera not ready
                ctx.fillStyle = '#111';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#00ff9d';
                ctx.font = '12px Courier New';
                ctx.textAlign = 'center';
                if (cameraError) {
                    ctx.fillText('Camera access denied.', canvas.width / 2, canvas.height / 2 - 15);
                    ctx.fillText('[ CLICK TO ALLOW CAMERA ]', canvas.width / 2, canvas.height / 2 + 15);
                } else if (cameraNeedsPermission) {
                    ctx.fillText('Camera paused.', canvas.width / 2, canvas.height / 2 - 15);
                    ctx.fillText('[ CLICK TO START CAMERA ]', canvas.width / 2, canvas.height / 2 + 15);
                } else {
                    ctx.fillText('Waiting for camera...', canvas.width / 2, canvas.height / 2);
                }
            }

            // Show countdown timer on canvas during countdown (only if preview modal is not open)
            // Note: Countdown is now shown via the overlay element, not drawn on canvas
            // This block is kept for backwards compatibility but can be removed if not needed

            animationId = requestAnimationFrame(draw);
        }

        // Track last beep times to avoid duplicate beeps
        // let lastBreathBeepTime = 0; // This is now handled in audio.js


        function manageBreathRhythm() {
            if (!isMeditating || isPaused) {
                return;
            }
        
            const mode = modes[meditationMode];
            if (!mode || !mode.breathingPattern || mode.breathingPattern === 'natural') {
                breathIndicator.textContent = 'MEDITATION';
                rhythmAnimationId = requestAnimationFrame(manageBreathRhythm);
                return;
            }
        
            const pattern = mode.breathingPattern;
            const totalCycleTime = pattern.reduce((sum, p) => sum + p.duration, 0);
        
            const elapsed = (Date.now() - sessionStartTime) % totalCycleTime;
            breathCycleElapsedTime = elapsed;
        
            let cumulativeTime = 0;
            let currentPhaseIndex = 0;
            for (let i = 0; i < pattern.length; i++) {
                if (elapsed < cumulativeTime + pattern[i].duration) {
                    currentPhaseIndex = i;
                    break;
                }
                cumulativeTime += pattern[i].duration;
            }
        
            const currentPhase = pattern[currentPhaseIndex];
            const phaseElapsedTime = elapsed - cumulativeTime;


            // Refactored: handle sound for each phase
            manageBreathAudioPhase(meditationMode, currentPhase, phaseElapsedTime);
            // Drive continuous high/low pitch for breathing modes
            if (mode.audio && mode.audio.pattern !== 'metronome') {
                let audioPhase = currentPhase.phase;
                let audioPhaseElapsed = phaseElapsedTime;
                let audioPhaseDuration = currentPhase.duration;
                if (audioPhase === 'transition') {
                    const nextPhase = pattern[(currentPhaseIndex + 1) % pattern.length];
                    if (nextPhase) {
                        audioPhase = nextPhase.phase;
                        // Map transition time into the next phase so audio doesn't lag
                        const mappedElapsed = (currentPhase.duration > 0)
                            ? (phaseElapsedTime / currentPhase.duration) * nextPhase.duration
                            : 0;
                        audioPhaseElapsed = mappedElapsed;
                        audioPhaseDuration = nextPhase.duration;
                    }
                }
                manageBreathAudio(meditationMode, audioPhase, audioPhaseElapsed, audioPhaseDuration);
            }

            if (currentPhaseIndex !== breathPhaseIndex) {
                breathPhaseIndex = currentPhaseIndex;
                breathPhase = currentPhase.phase;
                lastTickCount = -1; // Reset tick count for new phase
            }

            breathIndicator.textContent = currentPhase.phase.toUpperCase();
            updateVisuals(mode, currentPhase, phaseElapsedTime);
            rhythmAnimationId = requestAnimationFrame(manageBreathRhythm);
        }
        
        function updateVisuals(mode, currentPhase, phaseElapsedTime) {
            const visualElement = breathingGuide.querySelector('div');
            if (!visualElement) return;

            const progress = phaseElapsedTime / currentPhase.duration;
            const visualSettings = mode.visual;
            const maxScale = visualSettings.maxSize / visualSettings.minSize;
            const currentScale = visualElement.style.transform.match(/scale\(([^)]+)\)/);
            const currentScaleValue = currentScale ? parseFloat(currentScale[1]) : 1;


            switch (currentPhase.phase) {
                case 'inhale':
                    visualElement.style.transform = `scale(${1 + progress * (maxScale - 1)})`;
                    break;
                case 'exhale':
                    visualElement.style.transform = `scale(${maxScale - progress * (maxScale - 1)})`;
                    break;
                case 'hold':
                     if (meditationMode === 'box') {
                        // Subtle pulse for box mode hold
                        const pulse = Math.sin(phaseElapsedTime / 200) * 0.05; // Gentle pulse
                        visualElement.style.transform = `scale(${maxScale + pulse})`;
                    } else {
                        visualElement.style.transform = `scale(${maxScale})`;
                    }
                    break;
                case 'transition':
                    // Hold the scale
                    visualElement.style.transform = `scale(${currentScaleValue})`;
                    break;
            }
        }


        // Recording
        function startRecording() {
            const stream = canvas.captureStream(30);
            mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) recordedChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                btnDownload.disabled = false;
                btnDownload.onclick = () => {
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'dot_cross_meditation_session.webm';
                    document.body.appendChild(a);
                    a.click();
                };

                // Save to IndexedDB and add to gif grid
                const durationVal = durationInput.value;
                const minText = durationVal === '1' ? '1 Min' : `${durationVal} Mins`;

                saveSession(blob, minText, sessionEvents)
                    .then((id) => {
                        addSessionToGrid(blob, minText, id, sessionEvents);
                    })
                    .catch(e => {
                        console.error("Failed to save session to IndexedDB:", e);
                        // Still display it even if DB write fails
                        addSessionToGrid(blob, minText, null, sessionEvents);
                    });
            };

            mediaRecorder.start();
            recDot.style.display = 'block';
        }

        function stopRecording() {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
            recDot.style.display = 'none';
        }

        // Timer (syncs both main and top panel)
        function updateTimer() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            timerDisplay.textContent = timeStr;
            document.getElementById('rec-timer-top').textContent = timeStr;
            // Progress bar
            const duration = parseInt(durationInput.value) * 60;
            const percent = 100 - (timeLeft / duration) * 100;
            document.getElementById('rec-progress').style.width = percent + '%';
            if (timeLeft > 0) {
                timeLeft--;
            } else {
                stopMeditation();
            }
        }

        function updateVisualGuide() {
    const mode = modes[meditationMode];
    if (!mode || !mode.visual) {
        breathingGuide.innerHTML = '';
        breathingGuide.classList.remove('active');
        return;
    }

    // Remove fixed animations from CSS
    const visualElement = document.createElement('div');
    visualElement.className = `${mode.visual.shape}-visual`;
    visualElement.style.animation = 'none'; // Disable CSS animation
    
    breathingGuide.innerHTML = ''; // Clear previous guide
    breathingGuide.appendChild(visualElement);
    breathingGuide.classList.add('active');

    if (mode.visual.particles) {
        createParticles();
    }
}

        // Start meditation (after countdown)
        async function startMeditation() {
            // Ensure camera is ready
            if (!cameraReady) {
                await setupCamera();
            }

            // Start meditation sound
            startMeditationSound(meditationMode);

            isMeditating = true;
            const duration = parseInt(durationInput.value);
            timeLeft = duration * 60;
            recordedChunks = [];
            sessionEvents = []; // Reset session events
            btnDownload.disabled = true;
            btnToggle.textContent = "Stop Session";
            btnToggle.style.borderColor = "#ff5555";
            btnToggle.style.color = "#ff5555";
            settingsPanel.style.opacity = "0.5";
            settingsPanel.style.pointerEvents = "none";

            // Reset record panel
            document.getElementById('rec-progress').style.width = '0%';
            document.getElementById('rec-timer-top').textContent = `${duration.toString().padStart(2, '0')}:00`;
            // Animate dots
            document.querySelectorAll('.rec-dot-top').forEach(dot => dot.classList.remove('active'));
            document.querySelectorAll('.rec-dot-top').forEach((dot, i) => {
                setTimeout(() => dot.classList.add('active'), i * 120);
            });

            lastBreathBeepTime = 0; // Reset beep timer
            sessionStartTime = Date.now();
            breathPhaseIndex = 0;

            updateVisualGuide();
            updateModeDisplay();
            
            startRecording();

            // No pitch up/down at session start; only metronome ticks during phases

            timerInterval = setInterval(updateTimer, 1000);
            updateTimer();
            manageBreathRhythm(); // Start the rhythm loop
        }

        // Stop meditation
        function stopMeditation() {
            isMeditating = false;
            isCountingDown = false;
            isPaused = false;
            countdownValue = 0;
            
            // Hide pause menu if showing
            document.getElementById('pause-menu').style.display = 'none';
            
            cancelAnimationFrame(animationId);
            cancelAnimationFrame(rhythmAnimationId);
            clearInterval(timerInterval);

            stopRecording();
            stopMeditationSound();

            // Don't stop camera - keep it running for welcome page

            btnToggle.textContent = "Start Meditation";
            btnToggle.style.borderColor = "#00ff9d";
            btnToggle.style.color = "#00ff9d";
            settingsPanel.style.opacity = "1";
            settingsPanel.style.pointerEvents = "auto";

            previewModal.classList.remove('show');
            countdownOverlay.classList.remove('show');

            breathingGuide.classList.remove('active');
            tempoBox.classList.remove('active');
            breathIndicator.textContent = 'Ready';

            // Reset record panel
            document.getElementById('rec-progress').style.width = '0%';
            document.getElementById('rec-timer-top').textContent = `${parseInt(durationInput.value).toString().padStart(2, '0')}:00`;
            document.querySelectorAll('.rec-dot-top').forEach(dot => dot.classList.remove('active'));

            // Reset timer display
            const duration = parseInt(durationInput.value);
            timeLeft = duration * 60;
            updateTimer();

            // Restart draw loop to show camera preview if it's not running
            if (!animationId) {
                draw();
            }
        }


// Main button handler: ensure DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const btnToggle = document.getElementById('btnToggle');
    if (btnToggle) {
        btnToggle.addEventListener('click', () => {
            if (!isMeditating) {
                showPreviewModal();
            } else {
                stopMeditation();
            }
        });
    }
});

        

        // Update mode display
        function updateModeDisplay() {
            if (modes[meditationMode] && modes[meditationMode].name) {
                modeDisplay.textContent = modes[meditationMode].name;
            }
        }

        // Initialize
        updateModeDisplay();

        function createParticles() {
    const particleContainer = document.getElementById('breathing-guide');
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${Math.random() * 5 + 5}s`;
        particleContainer.appendChild(particle);
    }
}

        

        // Update mode display
        function updateModeDisplay() {
            if (modes[meditationMode] && modes[meditationMode].name) {
                modeDisplay.textContent = modes[meditationMode].name.toUpperCase().replace(' ', '_');
            }
        }

        // Initialize
        updateModeDisplay();

        function createParticles() {
    const particleContainer = document.getElementById('breathing-guide');
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.animationDuration = `${Math.random() * 5 + 5}s`;
        particleContainer.appendChild(particle);
    }
}
    
