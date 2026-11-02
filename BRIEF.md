# Cowboy: project brief

The owner is rebuilding their old game, [CowboyGame](https://github.com/onkelhoy/CowboyGame) (2018, p5.js, Howler, Express), on papit. This brief says what the game is, what papit already gives you, and what to watch out for. It's information, not a plan.

**Your first task is to write the plan.** Read this, read the sources below, then write an ordered task list to `.claude/plan.md` and present it to the owner. Don't build anything until they've confirmed it. After that, "do next task" runs one task and stops.

## The game

A two player online duel. You send a friend a link, they open it, and you shoot each other.

- **One control:** click and hold, or touch and hold on a phone, or space. Hold to stand up. Standing fully fires one shot. Let go to duck.
- **Duck to reload:** while fully down, you slowly get bullets back, up to 6.
- **One hit wins:** the bullet hits the head or body and that cowboy goes ragdoll.
- **Fixed positions:** the cowboys face each other across the screen. Nobody walks.

The concept stays, but it can change a bit, and the owner is open to ideas. Suggest a few in the plan, such as rounds, a score, a rematch button or a character outfit, and let them choose.

### Old game values to start from

| Thing | Old value |
| --- | --- |
| Stand speed | `updownratio` +1 per frame of 10 |
| Duck speed | `updownratio` -0.5 per frame |
| Reload | 1 bullet per 40 frames, only when fully down |
| Ammo | 6, shown as a revolver cylinder that turns |
| Bullet | speed 65 per frame, fixed angle from gun to the other side |
| Hit test | bullet segment against a line from head to tail, per frame |
| Start | 3, 2, 1 countdown once both players are in |
| Ragdoll | gravity .2, bounce .9, friction .99, push in the bullet's direction |

These are per frame at 60 fps. The new game must use `delta`, so convert them. Treat them as a starting feel, then tune by playing.

### Old game parts to bring along

Fetch these from the old repo, under `dist/`:
- `content/images/outfits/simple/*.svg`: the cowboy parts. `packages/algorithms/math/armature/views/cowboy` in papit already draws these
- `content/images/props/*.svg`: house, barrel, cactus, sign and dust
- `content/audio/`: shots, hit, reload, out of ammo, bullet fly-by, opening

Read `dist/lib/Cowboy.js` (rules), `Bullet.js`, `Ragdoll.js`, `Body.js` and `main.js`.

**The old game was never finished.** `connect.js` receives the other player's state but does nothing with it, so the opponent never moved online. Don't copy its networking.

## Use papit for everything

Reuse before building, and no runtime dependencies outside `@papit/*` without flagging it to the owner. The old p5 and Howler are gone, so use canvas through the engine and plain Web Audio.

The papit repo is at `~/Developer/projects/papit`. Read its `.claude/CATALOG.md` and each package's README, and trust the code over any doc.

| Need | Use |
| --- | --- |
| Game loop, canvas layers, GameObject, input | `@papit/game-engine` |
| The cowboy body | `@papit/armature`: `new Armature`, `rig.ik(bone, { chain: 2, target, pole })`, `rig.update()` |
| Math | `@papit/vector`, `@papit/matrix`, `@papit/line-intersection` for hits |
| Peer to peer | `@papit/webrtc` rooms on a shared chord network, through `@papit/signal-server` |
| UI | `pap-button`, `pap-dialog`, `pap-input`, `pap-icon`, `pap-tooltip`, `@papit/theme` tokens |
| App state | `@papit/signals` |
| All text | `@papit/translator` |
| Dev server and static site | `@papit/server`, `@papit/static` |

### Starting points

- `packages/algorithms/math/armature/views/cowboy/main.js` in papit is a working body: stand and shoot sliders, IK on arms and legs, a picture on each bone, mirroring through `scale.x`. It's the best place to start.
- `packages/network/webrtc/views/demo` shows the client in use, and papchat shows rooms on a chord lobby at full scale.

## Sharing a link

This should work like the device link in papchat (`~/Developer/projects/webrtc/papchat`). Host a game and a dialog opens with a QR code, the link, and a button that copies it. The friend opens the link and is in the game.

**Papit has no QR or share-link component yet.** They live in papchat as `@papchat/qr-code` and `@papchat/share-link`, in `packages/molecules/`, and they aren't on npm. Read `packages/foundations/core/src/link.ts` there for the flow. Choose in the plan:
- copy them into this project, which is simple and doesn't touch papit, or
- move them into papit as `@papit/qr-code` and `@papit/share-link`, which is the better long-term home, but it's papit work needing its own issues and a release.

Ask the owner. Copying first and moving later is a fair default.

### Networking notes

The signal server should hold one network only, not one per game. Like papchat, every player joins one shared chord network, and each game is a quick 1v1 room inside it. There's no lobby screen or player list, the shared network is just plumbing that players never see.

- **Shared network:** on load, connect a `Client` with `topology: "chord"` and find or create the one public network, for example `name: "cowboy"` with `meta: { app: "cowboy", kind: "lobby", v: 1, created: Date.now() }`. Papchat does exactly this: read `PLAN.md` section 2.2 and `packages/foundations/core/src/lobby.ts` in papchat. Copy the parts that matter: pick the oldest network as the canonical one, the race guard for two people creating at once, and the retry. Leave out profiles, presence, merging and passwords.
- **A game is a room:** `const room = await lobby.room({ name: "duel", accept: (newcomer, info) => info.size < 2 })` costs no server call and has its own peer connections, with `mesh` as the default topology. Check the real shape of `info` in the webrtc README.
- **The link:** it carries `room.network.id` and `room.host`, for example `?game=<id>&host=<peer>`. The friend opens it, joins the shared network, then runs `lobby.joinRoom(id, host)`. Game traffic then goes directly between the two players, never through other players' browsers.
- **A room survives without the server:** once two players are in, the game keeps running if the signal server sleeps or the shared network changes.
- **Stale links:** `joinRoom` needs both players in the shared network and only works through the current `room.host`. Peer ids change on every socket reconnect, so a host who reconnects, or closes the tab, makes the old link dead. Rooms have no list, so nothing else can find the game. The guest needs a clear "this game has ended" message, and a host who reconnected needs a fresh link. Plan both.
- **Third player:** someone opening a full game's link needs a clear message too.
- Read the "Rooms" section of the webrtc README first. It's the base of all this, and `client.create` with a private network per game is exactly what the owner wants to avoid.
- Signal server: `wss://render-webrtc-signal-server.onrender.com` is already deployed and papchat uses it. It's a free tier that sleeps, so the client's `wake` and `status: "waking"` need a friendly "waking up" state. Copy papchat's rule: `ws://localhost:3000` on localhost, `?signal=<url>` to override.
- ICE is STUN only, as in papchat. Some strict mobile or company networks won't connect without TURN, so show a clear failure, and note that a friend on the same network may be easier to test first.
- Handle a player leaving mid-game, and a tab that goes to the background.

## Design calls to settle in the plan

Give a recommendation for each.

- **Who decides a hit?** Each peer owns its own cowboy and sends its state: stand, shoot and ammo. My recommendation is that the player being shot decides, since their own position is exact on their screen. Think about cheating only as far as friends care.
- **What goes over the wire?** Small and often for pose, reliable for shots and hits. Interpolate the opponent.
- **Same start:** agree the countdown through the host, with latency in mind.
- **Screen sizes:** fixed world units scaled to fit, on phones in landscape and portrait, so that both players see the same fight.
- **Ragdoll:** papit gets a ragdoll later, so write it here as a small module that's easy to swap out. Port `Ragdoll.js` to Verlet points and sticks, using `dt`. Start the points from `bone.head` and `bone.tail`, and draw it back through `ik.setPositions`, which exists for this. The owner is happy with a local version for now.
- **Package layout:** one game package or a few. It's an npm workspace, so `npm run create -- --type=…` makes packages. Check the template list with `@papit/create`'s README.
- **Hosting:** the game is static apart from signalling, so `@papit/static` to GitHub Pages like papchat's `npm run pages`.

## Blockers to check first

1. **Papit needs a release before this project can install what it needs.** At the time of writing, npm has `@papit/game-engine` 0.1.0 and `@papit/vector` and `@papit/matrix` 0.0.1, while the repo is at 0.2.0 and 0.0.2. The engine's 0.2.0 was a restructure, so 0.1.0 has a different API. `@papit/armature`, `@papit/quaternion` and `@papit/line-intersection` aren't on npm at all. Check with `npm view`, and if they're still behind, ask the owner to release before starting the game code.
2. **`@papit/webrtc` and `@papit/signal-server` are on npm.** Check their versions against the repo too.
3. **Licences:** the old `credit.md` lists ZitronSound for the music, and the Durango Western font as "all rights reserved". Ask the owner before those ship on a public site. The SVG art is theirs.
4. **Repository:** the project was scaffolded with `https://github.com/onkelhoy/cowboy` as its repository. That repo may not exist yet.

## Known papit limits

- `iterations` on `rig.ik` only matters for chains longer than 2. The cowboy's arms and legs use `chain: 2`, which is exact.
- A bone's `worldMatrix` is in the armature's own space. Put the rig in a `GameObject` and draw with `ctx.transform(m[0], m[1], m[4], m[5], m[12], m[13])`.
- Don't name a GameObject property `draw`, that's the engine's own method.

## How the owner works

- Plan first, then one task per "do next task". Thin slices: something visible early, then behaviour, then edge cases, then tests and docs.
- Keep replies short. Say when an idea is wrong and name a better one, then follow their decision.
- Commit when a piece of work is done. Never push without being asked.
- UI gets a smoke test. Pure logic such as game rules and message handling gets real tests. No CSS or snapshot tests.
- Work inline, no subagents.

## Definition of done for the first version

Two people on different devices can open a link or scan a QR code, see a countdown, and duel by holding a button, with sound, a ragdoll and a way to play again. The owner tests it live with a friend.
