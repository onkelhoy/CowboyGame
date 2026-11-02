/** Assets load through `fetch`, the only way the static build finds them under its base. */
export type Images<T extends string> = Record<T, HTMLImageElement>;

/** Colours to swap in the SVG source, the way a cowboy gets his outfit. */
export type Recolour = Record<string, string>;

async function loadImage(url: string, recolour: Recolour) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`could not load ${url}`);

    let svg = await response.text();
    for (const [from, to] of Object.entries(recolour)) svg = svg.replaceAll(from, to);

    const image = new Image();
    image.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    await image.decode();
    return image;
}

export async function loadImages<T extends string>(folder: string, names: readonly T[], recolour: Recolour = {}) {
    const images = await Promise.all(names.map(name => loadImage(`/images/${folder}/${name}.svg`, recolour)));
    return Object.fromEntries(names.map((name, i) => [name, images[i]])) as Images<T>;
}
