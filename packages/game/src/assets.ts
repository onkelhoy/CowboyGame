/** Assets load through `fetch`, the only way the static build finds them under its base. */
export type Images<T extends string> = Record<T, HTMLImageElement>;

async function loadImage(url: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`could not load ${url}`);

    const blob = await response.blob();
    const image = new Image();
    image.src = URL.createObjectURL(blob);
    await image.decode();
    return image;
}

export async function loadImages<T extends string>(folder: string, names: readonly T[]) {
    const images = await Promise.all(names.map(name => loadImage(`/images/${folder}/${name}.svg`)));
    return Object.fromEntries(names.map((name, i) => [name, images[i]])) as Images<T>;
}
