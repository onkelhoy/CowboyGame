const FILES = {
    shot: ["shot1", "shot2"],
    hit: ["hit"],
    reload: ["reload"],
    empty: ["out"],
    fly: ["fly1", "fly2", "fly3", "fly4", "fly5"],
};

/** How much of the music is left during slow motion. */
const MUSIC_DIP = .25;
const HIT_RATE = .35;
/** Seconds from one heartbeat to the next. */
const HEARTBEAT = .78;

const LOUDNESS: Partial<Record<SoundName, number>> = { fly: .35, reload: .2 };

export type SoundName = keyof typeof FILES;
export type Volumes = { everything: number; music: number; sounds: number };

/** Plain Web Audio, one gain for everything with one each for music and sounds under it. */
export class Sound {
    readonly volumes: Volumes = { everything: 1, music: .6, sounds: 1 };
    private context: AudioContext | null = null;
    private master: GainNode | null = null;
    private sounds: GainNode | null = null;
    private music: GainNode | null = null;
    private buffers = new Map<SoundName, AudioBuffer[]>();
    private muted = false;
    private dipped = false;

    /** A browser only starts audio from a tap, so call this from one. */
    unlock() {
        if (!this.context)
        {
            this.context = new AudioContext();
            this.master = this.context.createGain();
            this.sounds = this.context.createGain();
            this.music = this.context.createGain();
            this.sounds.connect(this.master);
            this.music.connect(this.master);
            this.master.connect(this.context.destination);
            this.apply();
            void this.load();
        }

        if (this.context.state === "suspended") void this.context.resume();
    }

    /** Listens for the first tap or key, and takes itself away after it. */
    unlockOnFirstTap() {
        const events = ["pointerdown", "keydown"];
        const once = () => {
            this.unlock();
            for (const event of events) window.removeEventListener(event, once, true);
        };
        for (const event of events) window.addEventListener(event, once, true);
    }

    get running() {
        return this.context?.state === "running";
    }

    get mute() {
        return this.muted;
    }

    set mute(value: boolean) {
        this.muted = value;
        this.apply();
    }

    setVolume(name: keyof Volumes, value: number) {
        this.volumes[name] = value;
        this.apply();
    }

    play(name: SoundName, rate = 1) {
        const { context, sounds } = this;
        const options = this.buffers.get(name);
        if (!context || !sounds || !options?.length) return;

        const source = context.createBufferSource();
        source.buffer = options[Math.floor(Math.random() * options.length)];
        source.playbackRate.value = rate;

        const loudness = context.createGain();
        loudness.gain.value = LOUDNESS[name] ?? 1;
        source.connect(loudness).connect(sounds);
        source.start();
    }

    /** The old hit sound, stretched for slow motion. */
    hitSlow() {
        this.play("hit", HIT_RATE);
    }

    /** A falling whoosh and a heartbeat. Made here, there's no file for it. */
    slowMotion(seconds: number) {
        const { context, sounds } = this;
        this.dip(true);
        if (!context || !sounds) return;

        const now = context.currentTime;

        const noise = context.createBufferSource();
        noise.buffer = whiteNoise(context, seconds);
        const filter = context.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1800, now);
        filter.frequency.exponentialRampToValueAtTime(90, now + seconds);
        const whoosh = context.createGain();
        whoosh.gain.setValueAtTime(.0001, now);
        whoosh.gain.exponentialRampToValueAtTime(.5, now + .12);
        whoosh.gain.exponentialRampToValueAtTime(.0001, now + seconds);
        noise.connect(filter).connect(whoosh).connect(sounds);
        noise.start(now);

        for (let beat = .1; beat < seconds; beat += HEARTBEAT)
        {
            this.thump(now + beat, 62, .8);
            this.thump(now + beat + .26, 48, .55);
        }
    }

    /** Pulls the music down for the slow motion, and lets it back up. */
    dip(value: boolean) {
        this.dipped = value;
        const { context, music } = this;
        if (!context || !music) return;

        const target = this.volumes.music * (value ? MUSIC_DIP : 1);
        music.gain.cancelScheduledValues(context.currentTime);
        music.gain.setTargetAtTime(target, context.currentTime, .12);
    }

    private thump(when: number, frequency: number, loudness: number) {
        const { context, sounds } = this;
        if (!context || !sounds) return;

        const beat = context.createOscillator();
        beat.frequency.setValueAtTime(frequency * 1.6, when);
        beat.frequency.exponentialRampToValueAtTime(frequency, when + .06);
        const gain = context.createGain();
        gain.gain.setValueAtTime(loudness, when);
        gain.gain.exponentialRampToValueAtTime(.0001, when + .24);
        beat.connect(gain).connect(sounds);
        beat.start(when);
        beat.stop(when + .25);
    }

    private apply() {
        if (this.master) this.master.gain.value = this.muted ? 0 : this.volumes.everything;
        if (this.sounds) this.sounds.gain.value = this.volumes.sounds;
        if (this.music) this.music.gain.value = this.volumes.music * (this.dipped ? MUSIC_DIP : 1);
    }

    private async load() {
        await Promise.all((Object.keys(FILES) as SoundName[]).map(async name => {
            const buffers = await Promise.all(FILES[name].map(file => this.decode(`/audio/${file}.mp3`)));
            this.buffers.set(name, buffers.filter(buffer => buffer !== null));
        }));
    }

    /** A missing or broken file means silence, not a crash. */
    private async decode(url: string) {
        try
        {
            const response = await fetch(url);
            if (!response.ok) return null;
            return await this.context!.decodeAudioData(await response.arrayBuffer());
        }
        catch
        {
            return null;
        }
    }
}

function whiteNoise(context: AudioContext, seconds: number) {
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * seconds), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
}
