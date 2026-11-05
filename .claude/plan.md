# Cowboy: plan

Status: **confirmed by the owner, 2026-11-02.** Papit is released and installed from npm.

## Where we are

- **Done:** the game is built and live on GitHub Pages at <https://onkelhoy.github.io/CowboyGame/>, built on every push to `main`. Done tasks were removed from this plan on 2026-11-05, git history has them.
- **Now:** the SMS invite fix (guest waits for a frozen host, the duel keeps its id) is on `main`, it needs a try on two phones. On papit 0.1.0, merged to `main` and deployed 2026-11-05. Checked once against Render: host and guest meet and start a duel. Lobbies only match their own `meta` (`v: 2`), so old 0.0.x lobbies left on the server are ignored. Next: task 8, the live test, and task 9, both need the owner. The papit gap at the top of [Papit gaps to report](#papit-gaps-to-report) is reported in papit's `COWBOY-FINDINGS.md`.
- **Version page:** `/CowboyGame/version` lists the releases (git tags `v0.0.N`, made by the pages workflow after a deploy) and checks live whether this device reaches the signal server and STUN. `?signal=` is honoured. The pole button is now "Play": it readies and goes fullscreen (locks landscape where allowed), and the corner has a fullscreen toggle.
- **Tests:** none for now, the owner's call on 2026-11-02 to save tokens. Don't write or run tests unless the owner asks. The files in `packages/game/tests` are from before that call and aren't kept up. This overrides the brief.
- **Branch:** `main` is the game and every push to it deploys, so work on a branch and merge. The 2018 game is on `old-version` in the same repo, `onkelhoy/CowboyGame`.
- **Read first:** `BRIEF.md`, this file, then papit's `.claude/CATALOG.md`.
- **Try it alone:** `npm start`, then <http://localhost:3000/views/game/?bot>. `?bot` and `?stage` skip the landing sign and the network.
- **Review the art:** `npm start`, then <http://localhost:3000/views/art/>. It's live game frames per palette, the old art and every piece. It isn't part of the static build. New files in `asset/` need a restart of `npm start`.
- **Try it with two:** `npm run signal` (port 3001) and `npm start`, then open `/views/game/?signal=ws://localhost:3001` in two browsers or profiles, one for the host. The invite link keeps `?signal=`. Without it the deployed server is used, on localhost too, as papchat does.

## The game now

The owner's notes change the brief's controls. This is the version the plan builds.

- Landscape only, and you always see the full map. Each player sees themselves on the left.
- **Press and hold:** the cowboy rises and raises the gun. The rise is slow enough for the other player to read.
- **Let go early:** below the draw line (50% up) he just ducks, no shot and no bullet spent. That's a feint. Above it he fires at once, along the way the gun points right then, so a low shot goes up into the sky. A slight randomness on top shrinks to nothing at the top.
- **Hold to the top:** he fires by himself, dead on.
- **After any shot:** a short recoil he can't duck out of. He then stays up for as long as you hold, and only a release ducks him. Once he lets go he goes all the way down, and he can't rise or shoot again until he has been fully down, so staying up gets you nothing but exposed.
- **Duck:** fully down, bullets come back one at a time, up to 6. No ammo: an empty click, and you're standing there exposed.
- **One hit:** slow motion, the winner on screen, back to speed, he falls and bleeds.

### Starting values

All in one `tuning.ts`, in seconds and world units, tuned by playing. The world is 1200 × 600.

| Thing | Old | Start at |
| --- | --- | --- |
| Rise, bottom to top | 0.17 s | 0.18 s, the owner found 0.9 s, 0.4 s and 0.25 s too slow |
| Duck, top to bottom | 0.33 s | 0.18 s |
| Draw line | none | 50% up, the owner found 35% too low |
| Spread | none | ±3° off the gun at the draw line, falling to 0 at the top |
| Gun level | none | 75% up. Above that the body's lean still tips the gun, so an early release only hits a standing head from about 91% up, roughly 15 ms before the top |
| Recoil lock | none | 0.25 s, a release during it ducks him when it ends |
| Reload | 0.67 s per bullet | 0.67 s per bullet, only fully down |
| Bullet speed | 3900 per s | 3900 per s, about 0.2 s across |
| Ragdoll | gravity .2, bounce .9, friction .99 per frame | 720 per s², bounce .9, friction `.99 ^ (60 * dt)` |

### The kill

1. Hit: `engine.timeScale` drops to 0.1 on both screens and the camera closes in and follows the body. The cowboy starts to reel and blood hangs in the air. Music dips and the slow motion sound plays.
2. About 1.8 s of real time: the win screen appears above the loser. It's anchored to the dead body and follows it as the bullet pushes it back.
3. `timeScale` ramps back to 1, the ragdoll falls, and a blood pool spreads.
4. Score, then the win moment, then rematch.

**Later, not in the first version:** a silly win celebration, such as a mariachi band coming on and playing, with a change of music. Keep a hook for it between the kill and the rematch.

`timeScale` also slows `fixedUpdate`, so this sequence and the network clock run on `performance.now()`, not engine time.

## The flow

The concept is "challenge your friend". There's no main menu, only the game behind whatever is on top.

1. **Landing, host:** a wooden sign asks for a name, with one button, "Challenge a friend". Sound is on by default and the mute icon in the corner is the only control for it. The tap unlocks audio. Then the QR dialog opens by itself, with the link and copy button. It shows "waking up" until the link exists. This dialog is plain UI, everything else feels cowboy.
2. **Landing, guest:** the same sign, with the invite on it, "Henry challenges you to a duel!". The link carries the host's name as `by=`. If the name is saved, they join right away.
3. **The pole:** the camera sits zoomed in on a wooden pole at the middle of the map, with two cartoon arrow signs on top pointing left and right, one player's name on each. Until the friend arrives, their sign reads "???". When they arrive the QR dialog closes and their name goes up.
4. **Ready:** both get an "I'm ready" button, and the sign shows who is ready.
5. **Into the duel:** when both are ready, black bars narrow the screen as the camera zooms out to the full map. Then 3, 2, 1, GO! and the bars slide away. The pole stays on the map during the duel, so the names stay visible.
6. **After the match:** back to the pole. A rematch is both players pressing "I'm ready" again.

**Always in the top right corner:** a mute button and a settings button. Settings has the name and three volumes: everything, music and sounds. Name, volumes and mute are saved in `localStorage`. A name change updates the sign for both players.

**Sound permission:** browsers don't really have one, they only need a tap before audio can start, so sound starts on the first tap.

## Design calls

| Call | Decision |
| --- | --- |
| Who decides a hit | The player being shot, since their pose is exact on their screen. A cheat could ignore hits, which is fine between friends. |
| Bullet direction | The gun's real angle along the forearm, lined up once so that fully up it points at the other cowboy's standing head. Shots are taken before the kick moves the arm. |
| Random bullet | The shooter rolls the spread and sends the final angle, so both screens show the same bullet. |
| Both hit at once | The first one hit is dead. Hits are timed on the shared clock, and within `DRAW_WINDOW` (150 ms) it's a draw and nobody scores. After that the survivor can't be hit. |
| On the wire | Pose (stand, shoot) at 30 Hz on an unreliable room channel, `{ ordered: false, maxRetransmits: 0 }`. Shots, hits, round state and pings go reliably through `room.send`. |
| Seeing the raise | The opponent's pose is blended and moved forward by half the round trip, using the known rise speed. This keeps the raise current, where a plain interpolation buffer would show it late. |
| Same start | Five pings at room start give the clock offset, using the lowest round trip. The host sends a start time in shared time. `@papit/webrtc` has no ping, so we write one. |
| Screens | The map always fills the screen's width, so both players see the same 1200 wide world with the houses at the edges. A wide phone loses sky at the top, it's anchored to the ground. The owner's idea was a shared width from both devices, this does the same with no change to the aim or the network. The HUD follows the top of the view. From the pole onward, portrait shows "turn your phone". The name sign and QR dialog work upright, because a friend usually opens the link that way and a landscape keyboard covers half the screen. |
| Names | Sent through the room's `profile`, 16 characters at most. |
| Signs | The old `sign.svg` wooden post and its paper, reused for the landing sign. The pole is built from pieces cut out of it: `plank-1`, `plank-2`, `post`, `rock`, `grass`. The old WANTED poster goes on it with the player's name. |
| Art style | Flat and crisp: hard edges, cel shading, no gradients, haze or transparency, so shapes stay apart. `scene/palette.ts` holds the land's colours. The sky follows the player's own clock: `gold` from 6, `noon` from 10, `sunset` from 17, `night` from 20. `?palette=` picks one by hand. At night a tint is multiplied into each SVG as it loads, windows and lanterns stay lit. |
| Background | Drawn by us in layers, desert and mesas. The old `background1.jpg` isn't the owner's art: it's a 626 × 626 Freepik image with the watermark in it, so it doesn't ship. |
| Phone details | `touch-action: none`, no text selection or callout on long press, safe area insets, wake lock during a duel. Audio starts on the first tap. iPhones have no fullscreen and no orientation lock. |
| Ragdoll | Local Verlet module behind a small interface, drawn through `ik.setPositions`, so papit's can replace it later. |
| Colours | Each cowboy gets a shirt and hat colour, tinted onto the art, so the two read apart at a glance. Picking a colour stays a later idea. |
| Win screen | Drawn in the world over the ragdoll's torso, so it tracks the body. Clamped to stay on screen. |
| Blood | Small stylised particles and a pool, on by default, one constant to turn it off. |
| Barrels | Stop low bullets, so ducking reads as taking cover. |
| Slow motion sound | Made in Web Audio, a whoosh and a heartbeat, plus the old hit sound at a low playback rate. No file needed. Suno is for the songs. |
| Packages | `packages/game` (game template), plus `packages/qr-code` and `packages/share-link`, so those two can move to papit later as they are. |
| QR and share link | Copy from papchat now, move to papit later. The papchat tests are worth bringing along. |
| Hosting | `@papit/static` to GitHub Pages under `/CowboyGame/`, built by `.github/workflows/pages.yml` as in papchat. `docs/` is not committed. |
| Licences | Ship neither ZitronSound nor Durango Western. Suno songs replace the music. The font is Rye, SIL OFL, self-hosted in `asset/fonts/` with its licence. |

## Owner's files

Suno songs, logo and manifest logo live in the root `asset/` folder. A missing file means silence, not a crash.

Files the game looks for: `asset/music/menu.mp3`, `asset/music/duel.mp3`, `asset/logo.svg`, `asset/manifest.logo.svg`.

The server and static build don't collect the root `asset/`. `packages/game/bin/sync-assets.mjs` copies it to the gitignored `packages/game/asset/owner/` before `start` and `build`, so `/music/menu.mp3` resolves and the owner's side stays the same.

## Tasks

Only what's left. Tasks 1 to 7 are the move to papit 0.1, details under [Network 0.1](#network-01). Work on branch `net-0.1`.

| # | Task | Status |
| --- | --- | --- |
| 1 | **Install 0.1.** Check with `npm view` that `@papit/webrtc`, `@papit/signal-server` and `@papit/peer-message` are at 0.1.0, else stop and tell the owner. Install them, build, reread their READMEs and types, and fix [Network 0.1](#network-01) where the code disagrees. | Done 2026-11-05 |
| 2 | **The lobby.** `src/net/lobby.ts`, app-agnostic: wake with `/health`, find by `/networks`, join or create at once with one anchor, the beacon, `acceptMerge`, retry, the anchor's merge check. Run it with a local `npm run signal`: two tabs, then two lobbies made at once that merge into one. | Done |
| 3 | **Host a duel.** `src/net/match.ts` on a `Network`: `link` events, `name` messages, the `pose` channel, the ping clock. The host makes the carried duel and the link in `src/link.ts`, the QR dialog shows it. | Done |
| 4 | **Join from the link.** The guest in `src/online.ts`: lobby by id or by name, join the invite, "full", "ended" and rehost. Run by hand with two browsers: host, guest, ready, a round, a third player, a dead link. | Done |
| 5 | **The lobby under stress.** By hand on the local server: the anchor closes its tab (a newcomer creates a new lobby at once, the drifted part re-anchors and merges into it), the anchor closes while a host waits (the host re-anchors, the old link still works), the server restarts, a merge while a duel is open (does the duel survive?), a guest whose link names a lobby id that changed by a merge. Write down what we find, and tell the owner about any papit bug. | Done, see technical notes |
| 6 | **Clean up.** Dead code, the `/version` page checks to `/health` and `/networks`, rewrite the network technical notes, strike the papit gaps that 0.1 fixed. | Done, see technical notes |
| 7 | **Roll out, one step.** 0.1 doesn't talk to 0.0.x, so in this order: the owner deploys `@papit/signal-server` 0.1.0 on Render, then `net-0.1` merges to `main` and Pages deploys, then every open tab reloads. | Done 2026-11-05: Render was already on 0.1, `net-0.1` merged and pushed. Reload every open tab |
| 8 | **Live test.** Two phones, two networks, the owner and a friend. The first merge over real WebRTC and the first time on phones. | Not started, needs the owner |
| 9 | **Feel pass.** The owner plays against the bot (`?bot`) and we tune `tuning.ts`. Any time. | Not started, needs the owner |

## Ideas, the owner picks

| Idea | Recommendation |
| --- | --- |
| Best of five, first to 3, with a score | Yes |
| Hat flies off on a head shot | Yes, cheap and funny |
| Swedish next to English | Yes, cheap with the translator |
| Picking your own outfit colour | Later |
| Mariachi band win celebration with its own music | Later, the owner wants this |
| "High noon" bell that forces a move after 20 s of nobody shooting | Only if playing shows that both players sit ducked |

## Technical notes

Found while reading the code on 2026-11-02, and checked against the release.

**Game package**
- `views/*/main.ts` is compiled file by file in dev, so a relative import of `src/` fails on the second file. Pages import `@cowboy/game`, the built `lib/bundle.js`. `npm start` from the root builds first and rebuilds on change.
- Public page in `views/game/`, which `@papit/static` picks by default when `views/github/` is missing. Delete the template's `experiment` view.
- The game template's `views/` and `tests/` use `Engine` and `@papit/game-input-events`, which don't exist any more. `@papit/create` 0.0.20 still has this. Use `GameEngine` and replace those files.
- The template's `tests/playwright.config.ts` runs `npm run server`, which the root doesn't have. Point it at `npx @papit/server --port=3500`. Keep Chromium, and run pure logic tests in a project of their own with no browser. Skip the snapshot test, the owner doesn't want those.
- Move game dependencies from the template's `devDependencies` to `dependencies`, and set `private: true` and `papit.publish: false`.

**Assets**
- The server finds assets by the end of their path, so `/images/x.svg` finds `asset/images/x.svg`. The static build rewrites only `fetch`, not `<img src>` or CSS `url()`. So load images and audio with `fetch`, then a blob.
- Old art and sound: <https://github.com/onkelhoy/CowboyGame/tree/old-version>, under `dist/content/`. The cowboy parts with dashed names are in papit at `packages/algorithms/math/armature/views/cowboy/public/`.

**Engine**
- `engine.timeScale` scales `deltaTime` and the fixed step alike. `dt` is capped at 0.1 s.
- `Camera` position is the centre of the view. Without a camera, units are device pixels. Fit the world with `camera.position = (600, 300)` and `camera.zoom = fit`. The pole shot and the zoom out are the same camera.
- `new Camera()` on a 2D layer multiplies the view into each object's matrix, so `ctx` is already placed in `render`.
- `camera.shake` already skips for reduced motion.
- `InputEvents.on("mouse-down")` falls through its `switch` and also registers on the mouse, touch and keyboard targets. Harmless, those never fire that name. A plain `new InputEvents` requests pointer lock, `engine.input` doesn't.
- `engine.input` can't carry the hold, so the hold uses native pointer events with `setPointerCapture`, plus `blur`, the way the engine's own camera controllers do. `Mouse` listens for `mouseup` on the canvas only, so a release outside it sticks. `Touches` is fine with `touchcancel`, but a tap also gives emulated mouse events, a second press.
- Space is the key name `" "`. `Keyboard.handlekeyup` throws when a key was pressed before the page had focus, because `keys[name]` is undefined there, and `blur` doesn't release keys. The hold listens on `window` itself.

**Cowboy and armature**
- Start from papit's `packages/algorithms/math/armature/views/cowboy/main.js`. Its `limb`, `joint` and `foot` draw order is worth keeping. `Rig` comes from `views/shared/rig.js`, it isn't exported by the package.
- Rig units have y down and the cowboy facing +x. Mirror through `scale.x`.
- `ik.setPositions(positions)` takes x, y, z per head plus the last tail.

**Network**
- Room channels: `room({ media: { channels: { pose: { ordered: false, maxRetransmits: 0 } } } })`, then `room.media.channel("pose")`. Messages that arrive before the first `channel()` call are dropped, so call it early.
- The signal server strikes messages under 200 ms apart. Papchat spaces its own calls 1 s apart.
- `merge` needs `acceptMerge` on the client, or the race guard can't merge two lobbies.
- Lobby logic to copy: `packages/foundations/core/src/lobby.ts` in papchat, lines 410 to 550 and 756 to 815.

**Online, on papit 0.1**
- `src/net/lobby.ts` knows nothing about cowboy: wake with `/health`, list with `/networks`, the lowest id wins, join or create at once (a join gets 6 s, then we make our own), one anchor, 10 s beacon, and the anchor merges into a lower id every 20 s. `src/net/match.ts` is the duel, a mesh carried by the lobby: messages by name, the `pose` channel, names as `name` messages (`ask` gets one back), the clock from five pings. `src/online.ts` is the flow. `src/link.ts` puts `{ lobby, invite }` in the hash as base64url JSON and `by=` in the query.
- Each player sees themselves on the left, so a position or angle sent over the wire is in the sender's view and the receiver mirrors it (`x` to `1200 - x`, angle to `PI - angle`).
- Messages: `name`, `ready`, `start {go}`, `round {go, score, over, restart}`, `shot`, `hit {at}`, `away`, `back`, `bye`, `ping`, `pong`. The host decides when a round starts, the guest takes its score from the host, the target decides hits.
- A host who shares the link by SMS is in Messages with the tab frozen, so a guest who opens it at once gets no answer. So the guest keeps trying for `HOST_WAIT` (2 min, "waiting for Henry to answer"), and only then gets "that duel is over" and a fresh link. A host's duel opened again keeps its id (`duelId`), and papit resumes the peer id, so a link already sent still works. A host back on the tab checks at once. Checked 2026-11-05 with the host's JS paused 25 s: the guest waited and they met. Not checked on a real phone yet.
- Checked 2026-11-05 with Playwright on a local signal server, scripts outside the repo: two lobbies made at once merge in about 20 s, host and guest meet with names and start a duel, a dead link rehosts. Not checked: a third player turned away, a merge while a duel is open, a drifted part merging back after missed beacons.
- Dev server: the root `npm start` serves the page at `/packages/game/views/game/` (port 3000, or the next free one).

## Papit gaps to report

- **0.1.1 (reported in papit's `COWBOY-FINDINGS.md`):** a lone node that re-anchors after its anchor left is listed again but can't take joins (`lookup … timed out`), likely its chord still routing to the dead anchor. The 0.1.0 socket gaps are fixed in 0.1.1, a server restart works, and the waiting host's re-anchor is back on.
- `@papit/webrtc` calls `crypto.randomUUID`, which is missing on a page that isn't secure, so plain `http://` throws "not a function" instead of a clear message. A phone on a LAN address hits this too. `views/game/index.html` redirects github.io to https.
- The server finds assets once at start, so a file added while it runs answers 500 until a restart.
- No QR or share link component.
- `@papit/webrtc` has no round trip or clock helper.
- The `game` package template in `@papit/create` is out of date, see the technical notes.
- No slider or range component. Volumes use a native range input with theme tokens for now.
- `Mouse` only hears `mouseup` on the canvas, so a release outside it leaves `pressing` stuck.
- `Keyboard.handlekeyup` throws on a key whose `keydown` it never saw, and `blur` leaves keys pressed.
- `line-intersection` isn't in `.claude/CATALOG.md`.
- `pap-button` has its own `display`, so the `hidden` attribute doesn't hide it. We set `style.display` as well.
- The server's page template adds its own `<title>@papit/server</title>` first, so a page's title loses in dev. Check the static template too.

## Notes on music, text and pages

- Songs: `La Tierra Va a Hablar` plays at the sign and the pole, `Dust and Steel` in a duel. The owner didn't say which is which, swap them in `SONGS` in `sound.ts` if wrong. They crossfade, and the music dips in slow motion.
- Text: every word is in `asset/translations/en.json` and `sv.json` under `cowboy`. Swedish is picked by the browser's language, with no picker. The Swedish was written by the assistant, the owner should read it.
- Pages: `npm run pages` makes `docs/`, checked under `/cowboy/` with no failed requests, the base is `/CowboyGame/` now. Icons come from `asset/manifest.logo.svg`, else `asset/logo.svg`, else a drawn cylinder, made by `bin/icons.mjs` (PNGs through Playwright, on your machine only: they're committed, so a new logo means committing the new PNGs). No service worker.
- The sound effects' source isn't written down, see `CREDITS.md`.

## Network 0.1

Status: **confirmed by the owner, 2026-11-05.** Source: `PAPIT-INSIGHT.md` and the 0.1 READMEs on papit's `refactor/topology-engine` branch.

Why: on 0.0.x a host kept the member list, and players who left without saying so stayed in it as ghosts. Chord routed through them and joins timed out. 0.1 has no host and no member list, a dead link drops out by itself, and the server only hands out live anchors. Most of our workarounds go away with it.

### Decisions

| Call | Decision |
| --- | --- |
| Lobby | A public `chord` network named `cowboy`, `meta: { app: "cowboy", kind: "lobby", v: 2 }`, one anchor, the default 10 s beacon. `acceptMerge: info => info.name === "cowboy"` on both `create` and `join`. Chord and merging are more than a 1v1 game needs, on purpose: this is a pattern for other games, so `src/net/lobby.ts` takes the app name and settings and knows nothing about cowboy. |
| Anchors | **One** (`anchors: 1`). The creator is the anchor, everyone else closes their socket about 1 s after joining. |
| Never wait for a drifted part | A newcomer reads `GET /networks`. None listed: create one at once. One listed but the join fails: create one at once too, never wait for a lost part to re-anchor. The server drops a dead anchor within about 2 s (its heartbeat), so the list is fresh, and `handshakeTimeout` goes down to about 5 s so a join that can't connect fails fast. |
| Drifted parts come back by merging | A part whose anchor left re-anchors after three missed beacons and comes back under its own id. Now two `cowboy` lobbies are listed, and the anchor of each checks `/networks` every 20 s and merges into the one with the lowest id, so everyone can meet again. Most games are one invite, one duel and both leave, so this is rare, but it works. |
| The waiting host | A host whose link is out, while nobody has joined, checks `/networks` every 5 s. If their lobby is gone they call `lobby.anchor()` at once rather than waiting for the beacon, so the link's lobby id is back within seconds. |
| A duel | Its own `mesh` network carried by the lobby: `client.create({ name: "duel", topology: "mesh", media: { channels: { pose } } }, { bootstrap: new ParentBootstrap(lobby, crypto.randomUUID()), accept })`. The server never sees it, and the two players get their own direct connection. |
| The link | `?by=<name>#<base64 JSON { lobby, invite }>`, where `invite` is `duel.invite()`. `?signal=` stays in it. |
| Guest | Joins the lobby by the link's id, or by name when that id is gone, then joins the invite through `ParentBootstrap(lobby, invite.id)`. |
| Third player | `accept` refuses anyone while `match.peer` is set. A reject means "this game is full". |
| Dead link | Every entry in the invite tried for 5 s each, then "this game has ended" and the guest becomes a host with a fresh link, as now. |
| Names | The `profile` only goes to the entry's `accept` now, so names travel as a `name` message on the duel, sent on arrival and on change. |
| Arrive and leave | The duel's `link` event (`{ peer, open, left }`) replaces `peer` and `peer-left`. `bye` on `pagehide` stays, it's faster than a dead connection. `away` and `back` stay. |
| Host must stay | The duel closes when its lobby does, so the host stays in the lobby. Nothing to do, the lobby is never left until the tab closes. |
| Server waking | `GET /health` until it answers, shown as "waking up". `client.online` for the rest. |
| Goes away | `greet`, the `here` heartbeat, `watch` (the peer id stays the same now), the 18 s join loop, `SERVER_GAP` spacing, `client.list()`, `setProfile`. |

### Known limits we accept

- A carried duel doesn't heal a split. If the two lose each other, the game is over, as it is now.
- A merge over real WebRTC and a busy lobby on Render are untested in papit, so tasks 5 and 8 are where we find out.
- Two players in different parts of a split lobby can't reach each other until the merge. A link that fails in that time reads as a dead link, and the guest rehosts.
