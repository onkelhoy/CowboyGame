import { GameObject } from "@papit/game-engine";

import { loadImages } from "../assets";
import { GROUND_Y, WORLD } from "../tuning";
import { Backdrop } from "./backdrop";
import { Tumbleweed } from "./dust";
import { Pole } from "./pole";
import { Prop } from "./prop";

export const BARREL_X = 300;
export const BARREL_TOP = GROUND_Y - 106;

/** Draw order: behind the cowboys, the cowboys, in front of them. */
export async function createMap() {
    const props = await loadImages("props", [
        "house", "barrel", "cactus", "dust", "skull", "skull-human", "rock", "grass", "post", "plank-1", "plank-2",
    ]);
    const { width } = WORLD;

    const back = new GameObject();
    back.add(new Backdrop());
    back.add(new Prop(props.house, 130, GROUND_Y + 4, .62));
    back.add(new Prop(props.house, width - 130, GROUND_Y + 4, .62, true));
    back.add(new Prop(props.cactus, width * .39, GROUND_Y + 3, .62));
    back.add(new Prop(props.grass, width * .39 + 42, GROUND_Y + 3, .42));
    back.add(new Prop(props.rock, width * .36 - 18, GROUND_Y + 5, .6));
    back.add(new Prop(props.cactus, width * .655, GROUND_Y + 3, .4, true));

    const pole = back.add(new Pole({ post: props.post, plank1: props["plank-1"], plank2: props["plank-2"], skull: props.skull }));
    back.add(new Prop(props.rock, width / 2 + 34, GROUND_Y + 5, .5, true));
    back.add(new Prop(props.grass, width / 2 - 24, GROUND_Y + 3, .36));
    back.add(new Prop(props.skull, width * .59, GROUND_Y + 4, .36));
    back.add(new Prop(props.grass, width * .59 + 40, GROUND_Y + 3, .3, true));

    const actors = new GameObject();

    const front = new GameObject();
    front.add(new Prop(props.barrel, BARREL_X, GROUND_Y + 4, .42));
    front.add(new Prop(props.barrel, width - BARREL_X, GROUND_Y + 4, .42, true));
    front.add(new Prop(props["skull-human"], BARREL_X + 58, GROUND_Y + 6, .3));
    front.add(new Tumbleweed(props.dust));

    return { back, actors, front, pole };
}
