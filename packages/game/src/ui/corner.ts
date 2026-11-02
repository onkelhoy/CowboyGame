import "@papit/button";
import "@papit/dialog";
import "@papit/icon";
import "@papit/input";
import { effect } from "@papit/signals";

import type { Hold } from "../input";
import { cleanName, NAME_LENGTH, settings, updateSettings } from "../settings";
import type { Sound, Volumes } from "../sound";
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
    <pap-dialog id="ask-sound" header="${t("corner.question")}" close-outside-click>
        <div class="row">
            <pap-button id="sound-yes">${t("corner.on")}</pap-button>
            <pap-button id="sound-no" variant="outline">${t("corner.off")}</pap-button>
        </div>
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
    const question = find<Dialog>("#ask-sound");
    const name = find<Field>("#name");
    const icon = find("#mute pap-icon");

    effect(() => {
        const { mute, volumes } = settings();
        sound.mute = mute === true;
        for (const { name } of VOLUMES) sound.setVolume(name, volumes[name]);
        icon.setAttribute("name", mute === true ? "sound-off" : "sound-on");
    });

    find("#mute").addEventListener("click", event => {
        const { mute } = settings();
        if (mute === null) question.showModal();
        else updateSettings({ mute: !mute });
        letGo(event);
    });

    find("#gear").addEventListener("click", event => {
        const { name: current, volumes } = settings();
        name.value = current;
        for (const { name } of VOLUMES) find<HTMLInputElement>(`input[name=${name}]`).value = String(volumes[name]);
        panel.showModal();
        letGo(event);
    });

    const answer = (mute: boolean) => () => {
        updateSettings({ mute });
        sound.unlock();
        question.close();
    };
    find("#sound-yes").addEventListener("click", answer(false));
    find("#sound-no").addEventListener("click", answer(true));

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
    for (const dialog of [panel, question])
    {
        dialog.addEventListener("open", () => hold.pause(dialog.id, true));
        dialog.addEventListener("close", () => hold.pause(dialog.id, false));
    }
}

/** A mouse press leaves the button focused, and then space would press it instead of holding. */
function letGo(event: Event) {
    if ((event as MouseEvent).detail > 0) (event.currentTarget as HTMLElement).blur();
}
