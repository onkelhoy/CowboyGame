import "@papit/button";
import "@papit/input";

import { blobOf } from "../assets";
import type { Hold } from "../input";
import type { Invite } from "../link";
import { cleanName, NAME_LENGTH, settings, updateSettings } from "../settings";
import type { Sound } from "../sound";
import { t } from "../text";

type Field = HTMLElement & { value: string };

const escape = (text: string) => text.replace(/[&<>"]/g, char => `&#${char.charCodeAt(0)};`);

/**
 * The wooden sign that opens the game: a name on the WANTED poster and one button. That tap is what
 * lets audio start. Resolves once it's been pressed.
 */
export async function showLanding(hold: Hold, sound: Sound, invite: Invite | null) {
    const { name } = settings();

    // a friend who's been here before goes straight to the duel, the first tap unlocks their sound
    if (invite && name) return;

    const headline = invite?.by ? t("landing.challenged", { name: escape(invite.by) }) : invite ? t("landing.challengedAnon") : t("landing.title");

    const landing = document.createElement("div");
    landing.id = "landing";
    landing.innerHTML = `
        <form class="sign">
            <p class="headline${invite ? "" : " alone"}">${headline}</p>
            <div class="poster">
                <h2>${t("landing.wanted")}</h2>
                ${name
                    ? `<p class="name">${escape(name)}</p>`
                    : `<pap-input id="your-name" placeholder="${t("landing.yourName")}" maxlength="${NAME_LENGTH}" aria-label="${t("landing.yourName")}"></pap-input>`}
            </div>
            <div class="ride">
                <pap-button id="enter" color="primary">${t(invite ? "landing.accept" : "landing.challenge")}</pap-button>
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
        const answer = () => {
            const chosen = field ? cleanName(field.value ?? "") : name;
            if (!chosen)
            {
                sign.classList.remove("nudge");
                void sign.offsetWidth;
                sign.classList.add("nudge");
                field?.focus();
                return;
            }

            updateSettings({ name: chosen });
            sound.unlock();
            resolve();
        };

        landing.querySelector("#enter")!.addEventListener("click", answer);
        sign.addEventListener("submit", event => event.preventDefault());
        sign.addEventListener("keydown", event => {
            if (event.key === "Enter") answer();
        });
    });

    landing.remove();
    document.body.removeAttribute("data-upright");
    hold.pause("landing", false);
}
