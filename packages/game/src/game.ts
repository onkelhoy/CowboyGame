import { Camera, GameEngine } from "@papit/game-engine";
import { effect } from "@papit/signals";

import { loadFont } from "./assets";
import { Cowboy } from "./cowboy/cowboy";
import { loadParts, OUTFITS } from "./cowboy/outfit";
import { Banner } from "./duel/banner";
import { Blood, BloodPools } from "./duel/blood";
import { createBot } from "./duel/bot";
import { Duel } from "./duel/duel";
import { Kill } from "./duel/kill";
import { Hud } from "./hud";
import { Hold } from "./input";
import { parseInvite } from "./link";
import { Online } from "./online";
import { Stage } from "./scene/fit";
import { createMap } from "./scene/map";
import { saveSettings, settings } from "./settings";
import { Sound } from "./sound";
import { loadText, t } from "./text";
import { COWBOY_X, WORLD } from "./tuning";
import { mountCorner } from "./ui/corner";
import { showLanding } from "./ui/landing";

/** Boots the game on the page's canvas. `?bot` is a practice duel and `?stage` an empty map, both with no network. */
export async function startGame() {
    void loadFont();
    await loadText();
    document.querySelector("#turn p")!.textContent = t("turn");

    const query = new URLSearchParams(location.search);
    const practice = query.has("bot");
    const playing = !practice && !query.has("stage");

    const stage = new Stage(playing ? 0 : 1);
    const engine = new GameEngine({ name: "main", query: "canvas" });
    engine.defaultLayer.camera = new Camera({ controllers: [stage.controller()] });

    const [map, you, them] = await Promise.all([createMap(), loadParts(OUTFITS.you), loadParts(OUTFITS.them)]);
    const left = map.actors.add(new Cowboy(you, COWBOY_X, 1));
    const right = map.actors.add(new Cowboy(them, WORLD.width - COWBOY_X, -1));
    right.remote = playing;

    const hold = new Hold(engine.canvas);
    left.control = () => hold.held;

    if (practice)
    {
        const bot = createBot();
        right.control = () => bot(right.state, engine.deltaTime);
    }

    const sound = new Sound();
    sound.unlockOnFirstTap();
    saveSettings();
    mountCorner(sound, hold);

    const hud = new Hud(left, stage);
    hud.hidden = playing;

    let online: Online | null = null;
    const blood = new Blood();
    const pools = new BloodPools();
    const banner = new Banner(map.planks);

    const clear = () => {
        kill.reset();
        duel.clear();
        left.reset();
        right.reset();
    };

    const kill: Kill = new Kill({
        engine, sound, blood, pools, banner,
        cowboys: [left, right],
        follow: target => stage.follow(target),
        text: winner => online ? online.banner(winner) : winner === left ? t("round.win") : winner ? t("round.lose") : t("round.draw"),
        done() {
            if (online) online.roundDone();
            else if (practice) clear();
        },
    });

    const duel: Duel = new Duel(left, right, {
        action(_cowboy, event) {
            sound.play(event.type === "shot" ? "shot" : event.type === "click" ? "empty" : "reload");
        },
        fired: (angle, from) => online?.shot(angle, from),
        flyby: () => sound.play("fly"),
        hit(hit, bullet, target) {
            if (!target) sound.play("hit");
            else if (online) online.hit(hit, bullet);
            else kill.strike(target, hit, bullet.angle);
        },
    });

    engine.add(map.back);
    engine.add(pools);
    engine.add(map.actors);
    engine.add(duel);
    engine.add(map.front);
    engine.add(blood);
    engine.add(hud);
    engine.add(banner);
    engine.add(kill);
    engine.start();

    if (practice) sound.song("duel");
    else if (playing) sound.song("menu");

    if (playing)
    {
        const invite = parseInvite(location.search);
        void showLanding(hold, sound, invite).then(() => {
            online = new Online({ engine, stage, left, right, duel, kill, hud, pole: map.pole, hold, sound, clear });
            return invite ? online.join(invite) : online.host();
        });
    }
    else
    {
        effect(() => {
            map.pole.names[0] = settings().name || "???";
        });
    }

    return { engine, map, left, right, hold, duel, sound, kill, banner, stage, online: () => online };
}
