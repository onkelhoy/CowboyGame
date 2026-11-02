// A page for reviewing the art on the dev server, the static build only ships `views/game`.
const PALETTES = [
    { name: "noon", label: "High noon", colours: ["#2f9fc7", "#7fcdd3", "#d9613a", "#ecb765"] },
    { name: "sunset", label: "Sunset", colours: ["#352a70", "#e2604f", "#4a2152", "#d9693f"] },
    { name: "gold", label: "Morning", colours: ["#f08a3c", "#f9cd86", "#b9472f", "#e8b873"] },
    { name: "night", label: "Night", colours: ["#0b1030", "#33407a", "#1b2147", "#3f4a80"] },
];

const PIECES = [
    { folder: "props", name: "skull", note: "New, on the pole, the balconies and the dirt" },
    { folder: "props", name: "skull-human", note: "New, by the barrel" },
    { folder: "props", name: "barrel", note: "Redrawn" },
    { folder: "props", name: "cactus", note: "Redrawn" },
    { folder: "props", name: "house", note: "Redrawn" },
    { folder: "props", name: "dust", note: "Redrawn, the tumbleweed" },
    { folder: "cowboy", name: "head", note: "Redrawn, hat and face, same box" },
    { folder: "cowboy", name: "torso", note: "Redrawn, vest, belt and star" },
    { folder: "props", name: "plank-1", note: "Yours, cut from sign.svg" },
    { folder: "props", name: "plank-2", note: "Yours, cut from sign.svg" },
    { folder: "props", name: "post", note: "Yours, cut from sign.svg" },
    { folder: "props", name: "rock", note: "Yours, cut from sign.svg" },
    { folder: "props", name: "grass", note: "Yours, cut from sign.svg" },
    { folder: "props", name: "sign", note: "Yours, the landing sign, unchanged" },
];

type Game = { stage: { go(view: 0 | 1, ms: number): void }; map: { pole: { names: [string, string] } } };

const picked = () => {
    const name = new URLSearchParams(location.search).get("palette");
    return PALETTES.some(palette => palette.name === name) ? name! : "noon";
};

function gameUrl(frame: HTMLElement) {
    return `/views/game/?${"bot" in frame.dataset ? "bot" : "stage"}&palette=${picked()}`;
}

/** Waits for the game inside a frame, then moves it to the pole. */
function toPole(iframe: HTMLIFrameElement) {
    const game = (iframe.contentWindow as unknown as { cowboy?: Game } | null)?.cowboy;
    if (!game)
    {
        setTimeout(() => toPole(iframe), 100);
        return;
    }
    game.map.pole.names = ["Henry", "Billy"];
    game.stage.go(0, 0);
}

function fit(frame: HTMLElement, iframe: HTMLIFrameElement) {
    const width = Number(frame.dataset.width), height = Number(frame.dataset.height);
    const scale = frame.clientWidth / width;
    frame.style.height = `${height * scale}px`;
    iframe.style.transform = `scale(${scale})`;
}

function loadFrames() {
    for (const frame of document.querySelectorAll<HTMLElement>(".frame"))
    {
        frame.querySelector("iframe")?.remove();
        const iframe = document.createElement("iframe");
        iframe.width = frame.dataset.width!;
        iframe.height = frame.dataset.height!;
        iframe.loading = "lazy";
        iframe.title = "The game";
        iframe.src = gameUrl(frame);
        if ("pole" in frame.dataset) iframe.addEventListener("load", () => toPole(iframe));
        frame.append(iframe);
        fit(frame, iframe);
    }
    document.querySelector<HTMLAnchorElement>("#full")!.href = `/views/game/?bot&palette=${picked()}`;
}

function paletteButtons() {
    const nav = document.querySelector("#palettes")!;
    for (const palette of PALETTES)
    {
        const button = document.createElement("button");
        button.innerHTML = `<span>${palette.colours.map(colour => `<i style="background:${colour}"></i>`).join("")}</span>${palette.label}`;
        button.setAttribute("aria-pressed", String(palette.name === picked()));
        button.addEventListener("click", () => {
            history.replaceState(null, "", `?palette=${palette.name}`);
            for (const other of nav.querySelectorAll("button")) other.setAttribute("aria-pressed", String(other === button));
            loadFrames();
        });
        nav.append(button);
    }
}

function sheet() {
    document.querySelector("#sheet")!.innerHTML = PIECES.map(({ folder, name, note }) => `
        <figure class="piece">
            <div><img src="/images/${folder}/${name}.svg" alt="${name}"></div>
            <figcaption><b>${name}</b>${note}</figcaption>
        </figure>
    `).join("");
}

paletteButtons();
sheet();
loadFrames();

new ResizeObserver(() => {
    for (const frame of document.querySelectorAll<HTMLElement>(".frame"))
    {
        const iframe = frame.querySelector("iframe");
        if (iframe) fit(frame, iframe);
    }
}).observe(document.body);
