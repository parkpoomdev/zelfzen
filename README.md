# 🧘 Pixel Zen - Privacy Meditation App

A minimalist, privacy-first meditation app with pixelated video feedback and guided breathing exercises. Built with pure HTML, CSS, and JavaScript—no dependencies required.

## 🎯 Features

### Core Meditation Modes
- **Breathing Guide** - Follow an expanding/contracting circle at a natural 8-second pace (4s inhale, 4s exhale)
- **Tempo Box** - Track a pulsing square rhythm with quick 6-second cycles for focused meditation
- **Silent Zen** - Pure meditation without visual guides or audio cues

### Audio & Visual Feedback
- 🔊 **Ambient Meditation Sound** - Low-frequency (40Hz) sine wave for deep relaxation
- 🔊 **Rhythmic Beeps** - Audio cues at 2 and 1-second marks to sync with breathing cycles
- 📊 **Breath Indicator** - Real-time display showing inhale/exhale phase with countdown
- 📺 **Live Pixelated Camera** - Your video feed with privacy pixelation (adjustable pixel size)
- 🎨 **Retro Aesthetic** - CRT scanlines and grid overlay for nostalgic gaming vibe

### Privacy & Control
- 🔒 **No Data Tracking** - Runs entirely offline in your browser
- 🎬 **Session Recording** - Export your meditation session as a WebM video
- 🎚️ **Volume Control** - Adjust ambient sound from 0-100%
- ⏱️ **Custom Duration** - Set meditation length from 1-60 minutes
- 🎥 **Privacy Pixelation** - Adjustable pixel size for camera feed obfuscation

### User Experience
- 📱 **Fully Responsive** - Works on desktop and mobile devices
- 🖼️ **Preview Modal** - See how each meditation mode looks before starting
- ⏱️ **Countdown Timer** - 5-second pre-meditation countdown displayed on canvas with audio cues
- 🎬 **Auto-Recording** - Captures your meditation session automatically
- 🔄 **Seamless Session Management** - Easy start/stop, automatic reset

---

## 📷 Screenshot & Thumbnail

[Meditation Interface - Pixelated Camera with Breathing Guide]

The app displays:
- **Left/Center**: Pixelated 320x320px canvas showing your face with privacy pixelation
- **Center Overlay**: Animated breathing guide (circle) or tempo box (square)
- **Top Bar**: "ZEN_MODE" status and recording indicator (red dot)
- **Bottom**: Timer showing session countdown
- **Right**: Privacy indicator ("PRIVACY: ON")
- **Bottom Controls**: Start/Stop button, Download video button
- **Top Settings**: Mode selector, duration input, volume slider

---

## 🚀 Quick Start

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/parkpoomdev/zelfzen.git
   cd zelfzen
   ```

2. Open in browser:
   ```bash
   # Windows
   start index.html
   
   # macOS
   open index.html
   
   # Linux
   xdg-open index.html
   ```

3. **Grant camera permission** when prompted

That's it! No installation, dependencies, or server required.

---

## 📖 User Manual

### Getting Started

#### 1. **Welcome Screen**
- On page load, you'll see your pixelated camera feed as a live preview
- The camera will show your face with privacy pixelation (no details visible)
- The "PRIVACY: ON" indicator confirms your feed is obfuscated

#### 2. **Select Meditation Mode**
Click one of the three mode buttons at the top:

| Mode | Duration | Feel | Best For |
|------|----------|------|----------|
| **Breathing Guide** | 8 sec/cycle | Gentle, expandable circles | Stress relief, relaxation |
| **Tempo Box** | 6 sec/cycle | Quick, rhythmic pulses | Focus, energy management |
| **Silent Zen** | Custom | No guides or sound | Advanced practitioners |

#### 3. **Preview Your Mode**
A modal will appear showing:
- 🎨 Animation preview (how the guide looks in action)
- 📝 Description of the mode
- 🔊 Preview Sound button (hear the meditation tone)
- ▶️ Start Session button

Click **"Preview Sound"** to hear the ambient meditation tone. Click **"Start Session"** when ready.

#### 4. **Adjust Settings (Optional)**
Before starting, you can customize:
- **Duration** - Set session length (1-60 minutes, default: 10 min)
  - Click `+` to increase / `-` to decrease
  - Changes update the timer display in real-time
- **Volume** - Ambient sound level (default: 50%)
  - Slider range: 0% (silent) to 100% (max volume)

#### 5. **Countdown Sequence**
Once you click "Start Session":
- A **5-second countdown** appears on the canvas (5, 4, 3, 2, 1)
- Each number has an **ascending-pitch beep** (anticipation effect)
- The countdown disappears and meditation begins

#### 6. **During Meditation**

**Visual Feedback:**
- Your pixelated camera feed displays continuously
- The meditation guide animates (circle or square, depending on mode)
- **Breath Indicator** shows your current phase:
  - `INHALE (4s)` → `INHALE (3s)` → `INHALE (2s)` → `INHALE (1s)`
  - `EXHALE (4s)` → `EXHALE (3s)` → `EXHALE (2s)` → `EXHALE (1s)`
- Grid lines appear over the video for a retro gaming aesthetic
- Red dot flashes in top-right corner showing recording is active

**Audio Feedback:**
- **Ambient tone** plays softly in the background (low 40Hz frequency)
- **Beeps at 2s and 1s** help you sync with each breathing cycle:
  - `700Hz beep at 2 seconds` (prepare for transition)
  - `800Hz beep at 1 second` (transition imminent)
- Beep pattern repeats continuously throughout the session

**Timer:**
- Large countdown timer displayed in the center-bottom shows remaining time
- Decrements every second (10:00 → 9:59 → ...)
- Session auto-stops when timer reaches 0:00

#### 7. **Stop Session**
Click the red **"Stop Session"** button anytime to end meditation:
- Audio stops immediately
- Camera feed continues (camera stays on)
- Settings become interactive again
- Timer resets to your selected duration
- You can download your meditation video

#### 8. **Save Your Session**
After meditation:
- Click **"Download Video"** (now enabled) to export the session
- A WebM video file is saved with timestamp: `pixel_meditation_session.webm`
- File contains your pixelated camera feed with all visual overlays and animations
- Great for tracking your meditation practice

---

## ⚙️ Configuration

Edit `index.html` to customize:

```javascript
const PIXEL_SIZE = 12;        // Pixel block size (higher = more pixelated)
const CANVAS_SIZE = 320;      // Canvas dimensions in pixels
```

### Pixel Size Reference
- `PIXEL_SIZE = 4` - Fine detail (less private)
- `PIXEL_SIZE = 8` - Balanced (some features visible)
- `PIXEL_SIZE = 12` - High privacy (recommended, almost no details)
- `PIXEL_SIZE = 20` - Extreme privacy (very blocky)

---

## 🎮 Controls Quick Reference

| Action | Control |
|--------|---------|
| Select Mode | Click mode button (Breathing Guide / Tempo Box / Silent Zen) |
| Preview Mode | Modal automatically opens after mode selection |
| Hear Sound | Click "🔊 Preview Sound" button in modal |
| Start Session | Click "▶️ Start Session" button in modal |
| Adjust Duration | Change number input (1-60 minutes) - updates timer live |
| Adjust Volume | Drag volume slider (0-100%) |
| Stop Session | Click red "Stop Session" button |
| Download Video | Click "Download Video" button after session ends |
| Back to Welcome | Click "Back" in preview modal |

---

## 🔊 Audio Guide

### Meditation Sound
- **Type**: Pure sine wave oscillator
- **Frequency**: 40Hz (infrasonic, felt more than heard)
- **Volume**: 0-10% of selected slider value
- **Effect**: Deep, ambient, meditative tone

### Beep System
- **Countdown beeps** (5, 4, 3, 2, 1):
  - Frequency increases with each count (anticipation)
  - Duration: 150ms per beep
  - Volume: 40% of slider value
  
- **Breathing cycle beeps** (2, 1 markers):
  - `700Hz @ 2s` - Mild alert
  - `800Hz @ 1s` - Slightly higher pitch
  - Duration: 120-150ms
  - Volume: 35% of slider value
  - Repeats continuously during meditation

---

## 🎯 Tips for Best Experience

1. **Privacy**: Keep `PIXEL_SIZE = 12` to maintain full privacy
2. **Lighting**: Use in a well-lit room so the camera can capture your face
3. **Audio**: Use headphones or speakers for better immersion
4. **Volume**: Start at 30-50% and adjust to comfort
5. **Duration**: Begin with 5-10 minutes, extend as you progress
6. **Mode Choice**:
   - New to meditation? Try **Breathing Guide**
   - Want structure? Use **Tempo Box**
   - Advanced? Explore **Silent Zen**
7. **Posture**: Sit upright, relax shoulders, position face 30-60cm from camera

---

## 🛠️ Technical Stack

- **HTML5** - Structure
- **CSS3** - Styling & animations
- **JavaScript (Vanilla)** - Logic
- **Web Audio API** - Sound generation
- **MediaRecorder API** - Video recording
- **getUserMedia API** - Camera access

**No frameworks, no dependencies, no bloat** ✨

---

## 🔒 Privacy & Permissions

- ✅ **Camera Only** - App only requests camera access, no microphone
- ✅ **Offline First** - Everything runs locally, nothing sent to servers
- ✅ **Optional Recording** - You choose whether to save sessions
- ✅ **Pixelation** - Face is always obscured by default
- ✅ **No Analytics** - No tracking, no data collection

---

## 🐛 Troubleshooting

### Camera Not Opening
- **Solution**: Check browser camera permissions in Settings → Privacy
- Refresh the page (F5)
- Try a different browser (Chrome, Edge, Firefox)

### No Sound
- **Solution**: Check browser microphone/speaker permissions
- Verify volume slider is not at 0%
- Try "Preview Sound" button first
- Check system volume is not muted

### Video Won't Download
- **Solution**: Complete the full meditation session
- "Download Video" button only activates after recording
- Try a different file format by renaming the file extension

### Camera Feed Freezes
- **Solution**: Refresh the page
- Restart your browser
- Check if other apps are using the camera

### Beeps Not Syncing
- **Solution**: Audio latency depends on system
- Beeps play at 2s and 1s marks before each new breathing cycle
- Practice syncing visually with the breathing guide animation

---

## 📋 Features Roadmap

- [ ] Multiple language support
- [ ] Meditation stats & history tracking (saved locally)
- [ ] Custom breathing rhythms
- [ ] Guided voice instructions
- [ ] Ambient background scenes
- [ ] Mobile app version
- [ ] Desktop app (Electron)

---

## 📄 License

MIT License - Free to use, modify, and distribute

---

## 🙏 Credits

Built with mindfulness for modern meditators seeking privacy and simplicity.

---

## 📞 Support

For issues, suggestions, or contributions:
- GitHub: [https://github.com/parkpoomdev/zelfzen](https://github.com/parkpoomdev/zelfzen)
- Open an Issue on GitHub
- Fork and submit a Pull Request

---

**Start your mindful journey today. Your privacy matters.** 🧘✨
