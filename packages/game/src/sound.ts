const FILES = {
    shot: ["shot1", "shot2"],
    hit: ["hit"],
    reload: ["reload"],
    empty: ["out"],
    fly: ["fly1", "fly2", "fly3", "fly4", "fly5"],
};

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

    private apply() {
        if (this.master) this.master.gain.value = this.muted ? 0 : this.volumes.everything;
        if (this.sounds) this.sounds.gain.value = this.volumes.sounds;
        if (this.music) this.music.gain.value = this.volumes.music;
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
