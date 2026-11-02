/** The one control: mouse, touch and space all mean "hold". */
export class Hold {
    private pointer: number | null = null;
    private key = false;
    private enabled = true;

    get held() {
        return this.enabled && (this.pointer !== null || this.key);
    }

    constructor(private target: HTMLElement) {
        target.addEventListener("pointerdown", this.pointerdown);
        target.addEventListener("pointerup", this.pointerup);
        target.addEventListener("pointercancel", this.pointerup);
        target.addEventListener("contextmenu", this.prevent);
        window.addEventListener("keydown", this.keydown);
        window.addEventListener("keyup", this.keyup);
        window.addEventListener("blur", this.release);
        document.addEventListener("visibilitychange", this.release);
    }

    /** A hold never survives a switch off, so nothing fires when control comes back. */
    set active(value: boolean) {
        this.enabled = value;
        if (!value) this.release();
    }

    destroy() {
        const { target } = this;
        target.removeEventListener("pointerdown", this.pointerdown);
        target.removeEventListener("pointerup", this.pointerup);
        target.removeEventListener("pointercancel", this.pointerup);
        target.removeEventListener("contextmenu", this.prevent);
        window.removeEventListener("keydown", this.keydown);
        window.removeEventListener("keyup", this.keyup);
        window.removeEventListener("blur", this.release);
        document.removeEventListener("visibilitychange", this.release);
    }

    private pointerdown = (event: PointerEvent) => {
        if (this.pointer !== null || event.button !== 0) return;
        event.preventDefault();
        this.pointer = event.pointerId;
        // the release still arrives when it happens outside the canvas
        this.target.setPointerCapture(event.pointerId);
    };

    private pointerup = (event: PointerEvent) => {
        if (event.pointerId === this.pointer) this.pointer = null;
    };

    private keydown = (event: KeyboardEvent) => {
        if (event.code !== "Space") return;
        if (event.target instanceof HTMLElement && event.target.closest("input, textarea, button, dialog")) return;
        event.preventDefault();
        this.key = true;
    };

    private keyup = (event: KeyboardEvent) => {
        if (event.code === "Space") this.key = false;
    };

    private release = () => {
        this.pointer = null;
        this.key = false;
    };

    private prevent = (event: Event) => event.preventDefault();
}
