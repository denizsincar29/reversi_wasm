import { AUDIO_CONFIG, PLAYER, SIZE } from './constants.js';

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.buffers = {};
        this.initPromise = null;
    }

    async init() {
        if (this.initPromise) return this.initPromise;

        this.initPromise = (async () => {
            if (this.ctx && this.ctx.state === 'closed') {
                this.ctx = null;
            }

            if (this.ctx) {
                if (this.ctx.state === 'suspended') {
                    await this.ctx.resume().catch(() => {});
                }
                return;
            }

            this.ctx = new (window.AudioContext || window.webkitAudioContext)();

            if (this.ctx.state === 'suspended') {
                await this.ctx.resume().catch(() => {});
            }

            // Load audio files
            const soundPromises = AUDIO_CONFIG.sounds.map(sound => this.loadSound(sound));
            await Promise.all(soundPromises);
        })();

        return this.initPromise;
    }

    async loadSound(soundName) {
        try {
            const url = `sounds/${soundName}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load ${soundName}`);
            const arrayBuffer = await response.arrayBuffer();
            this.buffers[soundName] = await this.ctx.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.warn(`Could not load sound ${soundName}:`, error);
        }
    }

    async play(soundName, r = undefined, c = undefined) {
        try {
            await this.init();

            if (!this.ctx || !this.buffers[soundName]) {
                console.warn(`Cannot play ${soundName}: context or buffer missing`);
                return;
            }

            if (this.ctx.state === 'suspended') {
                await this.ctx.resume().catch(() => {});
            }

            if (this.ctx.state !== 'running') return;

            const source = this.ctx.createBufferSource();
            source.buffer = this.buffers[soundName];

            // Adjust pitch based on row
            if (r !== undefined) {
                const targetFreq = AUDIO_CONFIG.BASE_FREQ + r * AUDIO_CONFIG.STEP;
                source.playbackRate.value = targetFreq / AUDIO_CONFIG.DEFAULT_SAMPLE_RATE;
            }

            // Adjust pan based on column
            const panner = this.ctx.createStereoPanner();
            if (c !== undefined) {
                panner.pan.value = (2 * c / 7) - 1.0;
            } else {
                panner.pan.value = 0;
            }

            source.connect(panner).connect(this.ctx.destination);
            source.start();
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    async playMoveSequence(player, r, c, flippedIndices) {
        await this.play('disk.wav', r, c);
        const sound = player === PLAYER.WHITE ? 'white.wav' : 'black.wav';

        for (const idx of flippedIndices) {
            const fr = Math.floor(idx / SIZE);
            const fc = idx % SIZE;
            await new Promise(resolve => setTimeout(resolve, 120));
            await this.play(sound, fr, fc);
        }
    }
}

export const audioEngine = new AudioEngine();
