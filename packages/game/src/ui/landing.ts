import "@papit/button";
import "@papit/input";

import { blobOf } from "../assets";
import type { Hold } from "../input";
import type { Invite } from "../link";
import { cleanName, NAME_LENGTH, settings, updateSettings } from "../settings";
import type { Sound } from "../sound";

type Field = HTMLElement & { value: string };

const escape = (text: string) => text.replace(/[&<>"]/g, char => `&#${char.charCodeAt(0)};`);

/**
 * The wooden sign that opens the game: a name on the WANTED poster, and sound on or off. Both answers
 * are one tap, and that tap is what lets audio start. Resolves once it's been answered.
 */
export async function showLanding(hold: Hold, sound: Sound, invite: Invite | null) {
    const { name, mute } = settings();

    // a friend who's been here before goes straight to the duel, the first tap unlocks their sound
    if (invite && name && mute !== null) return;

    const headline = invite?.by ? `${escape(invite.by)} challenges you to a duel!` : invite ? "You're challenged to a duel!" : "Cowboy";

    const landing = document.createElement("div");
    landing.id = "landing";
    landing.innerHTML = `
        <form class="sign">
            <p class="headline">${headline}</p>
            <div class="poster">
                <h2>WANTED</h2>
                ${name
                    ? `<p class="name">${escape(name)}</p>`
                    : `<pap-input id="your-name" placeholder="Your name" maxlength="${NAME_LENGTH}" aria-label="Your name"></pap-input>`}
            </div>
            <div class="ride">
                <pap-button id="with-sound" variant="${mute === true ? "outline" : "filled"}" color="primary">With sound</pap-button>
                <pap-button id="no-sound" variant="${mute === true ? "filled" : "outline"}" color="primary">No sound</pap-button>
            </div>
        </form>
    `;
    document.body.append(landing);
    document.body.toggleAttribute("data-upright", true);
    hold.pause("landing", true);

    const sign = landing.querySelector<HTMLElement>(".sign")!;
    const url = await blobOf("/images/props/sign.svg", "image/svg+xml");
    if (url) sign.style.backgroundImage = `url(${url})`;

    const field = landing.querySelector<Field>("#your-name");

    await new Promise<void>(resolve => {
        const answer = (muted: boolean) => {
            const chosen = field ? cleanName(field.value ?? "") : name;
            if (!chosen)
            {
                sign.classList.remove("nudge");
                void sign.offsetWidth;
                sign.classList.add("nudge");
                field?.focus();
                return;
            }

            updateSettings({ name: chosen, mute: muted });
            sound.unlock();
            resolve();
        };

        landing.querySelector("#with-sound")!.addEventListener("click", () => answer(false));
        landing.querySelector("#no-sound")!.addEventListener("click", () => answer(true));
        sign.addEventListener("submit", event => event.preventDefault());
        sign.addEventListener("keydown", event => {
            if (event.key === "Enter") answer(mute === true);
        });
    });

    landing.remove();
    document.body.removeAttribute("data-upright");
    hold.pause("landing", false);
}
