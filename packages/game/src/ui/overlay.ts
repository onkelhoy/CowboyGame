import "@papit/button";
import "@papit/dialog";
import "@cowboy/qr-code";
import "@cowboy/share-link";

import type { Hold } from "../input";
import { t } from "../text";

type Dialog = HTMLElement & { showModal(): void; close(): void; open: boolean };

export type Choice = { label: string; run(): void };

/** A papit button has its own `display`, so the `hidden` attribute alone doesn't hide it. */
const hide = (element: HTMLElement, hidden: boolean) => {
    element.hidden = hidden;
    element.style.display = hidden ? "none" : "";
};

const escape = (text: string) => text.replace(/[&<>"]/g, char => `&#${char.charCodeAt(0)};`);

const html = () => `
    <div id="bars"><i></i><i></i></div>
    <div id="count" aria-live="assertive"></div>
    <div id="note" role="status" hidden></div>
    <div id="actions" hidden>
        <pap-button id="ready" color="primary">${t("invite.ready")}</pap-button>
        <pap-button id="again" variant="outline" color="primary">${t("invite.link")}</pap-button>
    </div>
    <pap-dialog id="invite" header="${t("invite.header")}" close-outside-click>
        <p id="invite-text"></p>
        <cw-qr-code></cw-qr-code>
        <p id="invite-link"></p>
        <cw-share-link></cw-share-link>
    </pap-dialog>
    <pap-dialog id="message">
        <p id="message-text"></p>
        <div slot="footer" id="message-buttons"></div>
    </pap-dialog>
`;

/** Everything the online game puts over the map, in plain DOM so it works in any layout. */
export function mountOverlay(hold: Hold) {
    const root = document.createElement("div");
    root.id = "overlay";
    root.innerHTML = html();
    document.body.append(root);

    const find = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
    const bars = find("#bars"), count = find("#count"), note = find("#note"), actions = find("#actions");
    const ready = find("#ready"), again = find("#again");
    const invite = find<Dialog>("#invite"), message = find<Dialog>("#message");
    const qr = find<HTMLElement & { value: string }>("cw-qr-code");
    const share = find<HTMLElement & { link: string }>("cw-share-link");

    let sticky = false;
    for (const dialog of [invite, message])
    {
        dialog.addEventListener("open", () => {
            hold.pause(dialog.id, true);
            document.body.toggleAttribute("data-upright", true);
        });
        dialog.addEventListener("close", () => {
            hold.pause(dialog.id, false);
            if (!invite.open && !message.open) document.body.removeAttribute("data-upright");
            // an error with no way on shouldn't be closed with the cross
            if (dialog === message && sticky) setTimeout(() => message.showModal());
        });
    }

    let onReady = () => { };
    ready.addEventListener("click", () => onReady());
    let onInvite = () => { };
    again.addEventListener("click", () => onInvite());

    let countdown: ReturnType<typeof setTimeout> | undefined;

    return {
        /** The black bars that close in on the zoom out. */
        bars(on: boolean) {
            bars.classList.toggle("on", on);
        },

        /** A big word in the middle: 3, 2, 1, GO!. Nothing hides it. */
        count(text: string, hideAfter = 0) {
            clearTimeout(countdown);
            count.textContent = text;
            // the animation starts over for every word
            count.classList.remove("pop");
            void count.offsetWidth;
            if (text) count.classList.add("pop");
            if (hideAfter) countdown = setTimeout(() => { count.textContent = ""; }, hideAfter);
        },

        note(text: string) {
            note.textContent = text;
            note.hidden = !text;
        },

        /** The buttons on the pole. `ready` is null for no button, then true once pressed. */
        actions(state: { ready: boolean | null; waitingFor?: string; invite: boolean }) {
            hide(actions, state.ready === null && !state.invite);
            hide(ready, state.ready === null);
            ready.toggleAttribute("disabled", state.ready === true);
            ready.textContent = state.ready ? t("invite.waiting", { name: state.waitingFor || t("invite.friend") }) : t("invite.ready");
            hide(again, !state.invite);
        },

        onReady(handler: () => void) {
            onReady = handler;
        },

        onInvite(handler: () => void) {
            onInvite = handler;
        },

        invite: {
            open: () => invite.showModal(),
            close: () => invite.close(),
            get isOpen() {
                return invite.open;
            },
            /** What the dialog says while there's no link yet, or null once there is one. */
            text(text: string) {
                find("#invite-text").textContent = text;
            },
            link(link: string | null) {
                qr.value = link ?? "";
                // setting the value after the first render doesn't always redraw it by itself
                (qr as unknown as { update(): void }).update();
                share.link = link ?? "";
                hide(share, !link);
                find("#invite-link").innerHTML = link ? escape(link) : "";
            },
        },

        /** A dialog with something to say and a choice or two. With none, it stays. */
        message(header: string, text: string, choices: Choice[] = []) {
            message.setAttribute("header", header);
            find("#message-text").textContent = text;
            const buttons = find("#message-buttons");
            buttons.replaceChildren(...choices.map(({ label, run }, index) => {
                const button = document.createElement("pap-button");
                button.textContent = label;
                if (index) button.setAttribute("variant", "outline");
                button.addEventListener("click", () => { sticky = false; message.close(); run(); });
                return button;
            }));
            sticky = true;
            if (!message.open) message.showModal();
        },

        closeMessage() {
            sticky = false;
            if (message.open) message.close();
        },
    };
}

export type Overlay = ReturnType<typeof mountOverlay>;
