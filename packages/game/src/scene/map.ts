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
    const props = await loadImages("props", ["house", "barrel", "cactus", "dust"]);
    const { width } = WORLD;

    const back = new GameObject();
    back.add(new Backdrop());
    back.add(new Prop(props.house, 130, GROUND_Y + 4, .62));
    back.add(new Prop(props.house, width - 130, GROUND_Y + 4, .62, true));
    back.add(new Prop(props.cactus, width * .39, GROUND_Y + 3, .46));

    const pole = back.add(new Pole());
    const actors = new GameObject();

    const front = new GameObject();
    front.add(new Prop(props.barrel, BARREL_X, GROUND_Y + 4, .42));
    front.add(new Prop(props.barrel, width - BARREL_X, GROUND_Y + 4, .42, true));
    front.add(new Tumbleweed(props.dust));

    return { back, actors, front, pole };
}
