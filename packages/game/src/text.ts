import { translator, useTranslator } from "@papit/translator";

/** All the game's own words, from `asset/translations/`. */
export const t = useTranslator("cowboy");

/** Swedish when the browser asks for it, English otherwise. Resolves once the words are here. */
export async function loadText() {
    translator.add({ id: "en", url: "/translations/en.json" });
    translator.add({ id: "sv", url: "/translations/sv.json" });

    const wanted = navigator.language?.toLowerCase().startsWith("sv") ? "sv" : "en";
    if (!await translator.change(wanted) && wanted !== "en") await translator.change("en");

    document.documentElement.lang = translator.locale() ?? "en";
}
