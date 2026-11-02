// Makes the icons of the page: `manifest.logo.svg` from the root `asset/` folder, else `logo.svg`, else a
// drawn revolver cylinder so the manifest never points at nothing. A manifest has no fallback of its own,
// so it's done here. The PNGs are for iPhones (180) and for installing on Android (192, 512).
import fs from "node:fs";
import path from "node:path";

const here = path.dirname(new URL(import.meta.url).pathname);
const assets = path.resolve(here, "../../../asset");
const out = path.resolve(here, "../views/game");
const SIZES = [180, 192, 512];

const FALLBACK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<rect width="100" height="100" rx="22" fill="#2b1d14"/>
<circle cx="50" cy="50" r="40" fill="#a9afb8" stroke="#1a100a" stroke-width="4"/>
${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${50 + Math.cos(i * Math.PI / 3 - Math.PI / 2) * 24}" cy="${50 + Math.sin(i * Math.PI / 3 - Math.PI / 2) * 24}" r="9" fill="#ffd23f" stroke="#1a100a" stroke-width="3"/>`).join("")}
<circle cx="50" cy="50" r="6" fill="#cfd4da" stroke="#1a100a" stroke-width="3"/>
</svg>`;

const source = ["manifest.logo.svg", "logo.svg"].map(name => path.join(assets, name)).find(file => fs.existsSync(file));
const svg = source ? fs.readFileSync(source, "utf8") : FALLBACK;

fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "manifest.logo.svg"), svg);
fs.writeFileSync(path.join(out, "favicon.svg"), svg);
console.log(`icons: ${source ? path.relative(process.cwd(), source) : "no logo yet, using the drawn cylinder"}`);

const stale = SIZES.some(size => {
    const png = path.join(out, `manifest.logo-${size}.png`);
    return !fs.existsSync(png) || fs.statSync(png).mtimeMs < (source ? fs.statSync(source).mtimeMs : 0);
});

if (stale)
{
    try
    {
        const { chromium } = await import("playwright");
        const browser = await chromium.launch();
        const url = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
        for (const size of SIZES)
        {
            const page = await browser.newPage({ viewport: { width: size, height: size } });
            await page.setContent(`<body style="margin:0"><img src="${url}" width="${size}" height="${size}" style="display:block"></body>`);
            await page.locator("img").evaluate(img => img.decode());
            await page.screenshot({ path: path.join(out, `manifest.logo-${size}.png`), omitBackground: true });
            await page.close();
        }
        await browser.close();
    }
    catch (error)
    {
        console.warn("icons: the PNG icons were not made:", error.message);
    }
}
