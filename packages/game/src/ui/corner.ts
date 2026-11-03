import "@papit/button";
import "@papit/dialog";
import "@papit/icon";
import "@papit/input";
import { effect } from "@papit/signals";

import type { Hold } from "../input";
import { cleanName, NAME_LENGTH, settings, updateSettings } from "../settings";
import type { Sound, Volumes } from "../sound";
import { canFullscreen, toggleFullscreen } from "../fullscreen";
import { t } from "../text";
import { registerIcons } from "./icons";

type Dialog = HTMLElement & { showModal(): void; close(): void };
type Field = HTMLElement & { value: string };

const VOLUMES: { name: keyof Volumes; label: () => string }[] = [
    { name: "everything", label: () => t("corner.everything") },
    { name: "music", label: () => t("corner.music") },
    { name: "sounds", label: () => t("corner.sounds") },
];

const cornerHtml = () => `
    <pap-button id="fullscreen" size="icon" variant="clear" aria-label="${t("corner.fullscreen")}"><pap-icon name="fullscreen"></pap-icon></pap-button>
    <pap-button id="mute" size="icon" variant="clear" aria-label="${t("corner.sound")}"><pap-icon name="sound-on"></pap-icon></pap-button>
    <pap-button id="gear" size="icon" variant="clear" aria-label="${t("corner.settings")}"><pap-icon name="settings"></pap-icon></pap-button>
`;

const dialogsHtml = () => `
    <pap-dialog id="settings" header="${t("corner.settings")}" close-outside-click>
        <label class="row">${t("corner.name")} <pap-input id="name" maxlength="${NAME_LENGTH}"></pap-input></label>
        ${VOLUMES.map(({ name, label }) => `
            <label class="row">${label()} <input type="range" name="${name}" min="0" max="1" step=".01"></label>
        `).join("")}
    </pap-dialog>
`;

/** The buttons that are always in the top right, and what they open. */
export function mountCorner(sound: Sound, hold: Hold) {
    registerIcons();

    const corner = document.createElement("div");
    corner.id = "corner";
    corner.innerHTML = cornerHtml();
    const dialogs = document.createElement("div");
    dialogs.innerHTML = dialogsHtml();
    document.body.append(corner, dialogs);

    const find = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
    const panel = find<Dialog>("#settings");
    const name = find<Field>("#name");
    const icon = find("#mute pap-icon");

    effect(() => {
        const { mute, volumes } = settings();
        sound.mute = mute;
        for (const { name } of VOLUMES) sound.setVolume(name, volumes[name]);
        icon.setAttribute("name", mute ? "sound-off" : "sound-on");
    });

    const full = find("#fullscreen");
    if (canFullscreen()) full.addEventListener("click", event => {
        void toggleFullscreen();
        letGo(event);
    });
    else full.remove();

    find("#mute").addEventListener("click", event => {
        updateSettings({ mute: !settings().mute });
        letGo(event);
    });

    find("#gear").addEventListener("click", event => {
        const { name: current, volumes } = settings();
        name.value = current;
        for (const { name } of VOLUMES) find<HTMLInputElement>(`input[name=${name}]`).value = String(volumes[name]);
        panel.showModal();
        letGo(event);
    });

    name.addEventListener("input", () => {
        const value = cleanName(name.value);
        if (value) updateSettings({ name: value });
    });

    panel.addEventListener("input", event => {
        const target = event.target as HTMLInputElement;
        if (target.type !== "range") return;
        updateSettings({ volumes: { ...settings().volumes, [target.name]: Number(target.value) } });
    });

    // no duel behind a dialog, and whatever was held doesn't fire when it opens
    panel.addEventListener("open", () => hold.pause(panel.id, true));
    panel.addEventListener("close", () => hold.pause(panel.id, false));
}

/** A mouse press leaves the button focused, and then space would press it instead of holding. */
function letGo(event: Event) {
    if ((event as MouseEvent).detail > 0) (event.currentTarget as HTMLElement).blur();
}
