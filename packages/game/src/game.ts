import { Camera, GameEngine } from "@papit/game-engine";
import { effect } from "@papit/signals";

import { Cowboy } from "./cowboy/cowboy";
import { loadParts, OUTFITS } from "./cowboy/outfit";
import { Banner } from "./duel/banner";
import { Blood, BloodPools } from "./duel/blood";
import { createBot } from "./duel/bot";
import { Duel } from "./duel/duel";
import { Kill } from "./duel/kill";
import { Hud } from "./hud";
import { Hold } from "./input";
import { saveSettings, settings } from "./settings";
import { Sound } from "./sound";
import { fitWorld } from "./scene/fit";
import { createMap } from "./scene/map";
import { COWBOY_X, WORLD } from "./tuning";
import { mountCorner } from "./ui/corner";

/** Boots the game on the page's canvas. */
export async function startGame() {
    const engine = new GameEngine({ name: "main", query: "canvas" });
    engine.defaultLayer.camera = new Camera({ controllers: [fitWorld()] });

    const [map, you, them] = await Promise.all([createMap(), loadParts(OUTFITS.you), loadParts(OUTFITS.them)]);
    const left = map.actors.add(new Cowboy(you, COWBOY_X, 1));
    const right = map.actors.add(new Cowboy(them, WORLD.width - COWBOY_X, -1));

    const hold = new Hold(engine.canvas);
    left.control = () => hold.held;

    const practice = new URLSearchParams(location.search).has("bot");
    if (practice)
    {
        const bot = createBot();
        right.control = () => bot(right.state, engine.deltaTime);
    }

    const sound = new Sound();
    sound.unlockOnFirstTap();
    saveSettings();
    mountCorner(sound, hold);
    effect(() => {
        map.pole.names[0] = settings().name || "???";
    });

    const blood = new Blood();
    const pools = new BloodPools();
    const banner = new Banner();
    const kill: Kill = new Kill({
        engine, sound, blood, pools, banner,
        cowboys: [left, right],
        text: winner => winner === left ? "You win!" : winner ? "They win!" : "Draw!",
        done() {
            if (!practice) return;

            kill.reset();
            duel.clear();
            left.reset();
            right.reset();
        },
    });

    const duel = new Duel(left, right, {
        action(_cowboy, event) {
            sound.play(event.type === "shot" ? "shot" : event.type === "click" ? "empty" : "reload");
        },
        flyby: () => sound.play("fly"),
        hit(hit, bullet, target) {
            if (target) kill.strike(target, hit, bullet);
            else sound.play("hit");
        },
    });

    engine.add(map.back);
    engine.add(pools);
    engine.add(map.actors);
    engine.add(duel);
    engine.add(map.front);
    engine.add(blood);
    engine.add(new Hud(left));
    engine.add(banner);
    engine.add(kill);

    engine.start();
    return { engine, map, left, right, hold, duel, sound, kill, banner };
}
