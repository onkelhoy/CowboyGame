# Cowboy: plan

Status: **confirmed by the owner, 2026-11-02.** Papit is released and installed from npm.

## Where we are

- **Next:** task 12, the feel pass, and task 31, the live test with a friend. Both need the owner. Everything else is built, except task 28, which is skipped because there are no tests for now. The site is on GitHub Pages at <https://onkelhoy.github.io/CowboyGame/>, built on every push to `main`.
- **Tests:** none for now, the owner's call on 2026-11-02 to save tokens. Don't write or run tests unless the owner asks. The files in `packages/game/tests` are from before that call and aren't kept up. This overrides the brief and any task below that mentions tests, including task 28.
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

1. Hit: `engine.timeScale` drops to 0.1 on both screens. The cowboy starts to reel and blood hangs in the air. Music dips and the slow motion sound plays.
2. About 1.8 s of real time: the win screen appears above the loser. It's anchored to the dead body and follows it as the bullet pushes it back.
3. `timeScale` ramps back to 1, the ragdoll falls, and a blood pool spreads.
4. Score, then the win moment, then rematch.

**Later, not in the first version:** a silly win celebration, such as a mariachi band coming on and playing, with a change of music. Keep a hook for it between the kill and the rematch.

`timeScale` also slows `fixedUpdate`, so this sequence and the network clock run on `performance.now()`, not engine time.

## The flow

The concept is "challenge your friend". There's no main menu, only the game behind whatever is on top.

1. **Landing, host:** a wooden sign asks for a name and sound on or off, on the same sign. A saved name skips the name step. Then the QR dialog opens by itself, with the link and copy button. It shows "waking up" until the link exists. This dialog is plain UI, everything else feels cowboy.
2. **Landing, guest:** the same sign, with the invite on it, "Henry challenges you to a duel!". The link carries the host's name as `by=`. If the name is saved, they join right away.
3. **The pole:** the camera sits zoomed in on a wooden pole at the middle of the map, with two cartoon arrow signs on top pointing left and right, one player's name on each. Until the friend arrives, their sign reads "???". When they arrive the QR dialog closes and their name goes up.
4. **Ready:** both get an "I'm ready" button, and the sign shows who is ready.
5. **Into the duel:** when both are ready, black bars narrow the screen as the camera zooms out to the full map. Then 3, 2, 1, GO! and the bars slide away. The pole stays on the map during the duel, so the names stay visible.
6. **After the match:** back to the pole. A rematch is both players pressing "I'm ready" again.

**Always in the top right corner:** a mute button and a settings button. Settings has the name and three volumes: everything, music and sounds. Name, volumes and mute are saved in `localStorage`. A name change updates the sign for both players.

**Sound permission:** browsers don't really have one, they only need a tap before audio can start. So "sound on" means it starts on the first tap. Pressing the sound icon before accepting asks the question again.

## Design calls

| Call | Decision |
| --- | --- |
| Who decides a hit | The player being shot, since their pose is exact on their screen. A cheat could ignore hits, which is fine between friends. |
| Bullet direction | The gun's real angle along the forearm, lined up once so that fully up it points at the other cowboy's standing head. Shots are taken before the kick moves the arm. |
| Random bullet | The shooter rolls the spread and sends the final angle, so both screens show the same bullet. |
| Both hit at once | A bullet already flying still counts. Both hits within the banner delay make a draw, and nobody scores. |
| On the wire | Pose (stand, shoot) at 30 Hz on an unreliable room channel, `{ ordered: false, maxRetransmits: 0 }`. Shots, hits, round state and pings go reliably through `room.send`. |
| Seeing the raise | The opponent's pose is blended and moved forward by half the round trip, using the known rise speed. This keeps the raise current, where a plain interpolation buffer would show it late. |
| Same start | Five pings at room start give the clock offset, using the lowest round trip. The host sends a start time in shared time. `@papit/webrtc` has no ping, so we write one. |
| Screens | World fits by height and width, and sky and ground run on past it on wider phones. From the pole onward, portrait shows "turn your phone". The name sign and QR dialog work upright, because a friend usually opens the link that way and a landscape keyboard covers half the screen. |
| Names | Sent through the room's `profile`, 16 characters at most. |
| Signs | The old `sign.svg` wooden post and its paper, reused for the landing sign. The pole is built from pieces cut out of it: `plank-1`, `plank-2`, `post`, `rock`, `grass`. The old WANTED poster goes on it with the player's name. |
| Art style | Flat and crisp: hard edges, cel shading, no gradients, haze or transparency, so shapes stay apart. `scene/palette.ts` holds the land's colours: `noon` is the default, `sunset` and `gold` are the other two, `?palette=` tries one. The owner picks after review. |
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

## Blockers, checked 2026-11-02

1. **Papit release.** Done. npm matches the repo: `game-engine` 0.2.0, `vector` and `matrix` 0.0.2, `armature`, `quaternion` and `line-intersection` 0.0.1.
2. `webrtc` 0.0.7, `signal-server` 0.0.6 and the UI packages match the repo. Nothing to do.
3. Repository: done. The game lives in the existing `github.com/onkelhoy/CowboyGame`.
4. Suno songs, logo and manifest logo: the owner adds them to the root `asset/` folder later. The plan runs without them until task 26, and a missing file means silence, not a crash.

Files the game looks for: `asset/music/menu.mp3`, `asset/music/duel.mp3`, `asset/logo.svg`, `asset/manifest.logo.svg`.

The server and static build don't collect the root `asset/`. `packages/game/bin/sync-assets.mjs` copies it to the gitignored `packages/game/asset/owner/` before `start` and `build`, so `/music/menu.mp3` resolves and the owner's side stays the same.

## Tasks

### Resync
0. **Resync with the papit release.** Removes the stopgap below, then checks that the plan still holds.
   - Check with `npm view` that `game-engine`, `vector`, `matrix`, `armature`, `quaternion` and `line-intersection` are out. If any is missing, tell the owner and stop.
   - Delete `vendor/`. Run `git checkout package.json` to drop the `overrides`.
   - Delete `packages/game/`, which is an uncommitted scaffold with `file:` dependencies and a hand-edited `package.json`. Task 1 makes it again.
   - Delete `node_modules` and `package-lock.json`, then `npm install`, so every `@papit/*` comes in at its newest version.
   - Reread the catalog and the READMEs of `game-engine`, `armature`, `webrtc` and `create`. Compare them with the technical notes below, fix what changed, and tell the owner if a change affects the plan.
   - Commit, including `package-lock.json`.

### Something visible
1. **Package and blank canvas.** Create `packages/game` with `npm create @papit -- --package=game --name=game --description="..." --destination=packages --no --html-prefix=cowboy`, add the papit dependencies, serve an empty engine with `npm start`. Check whether the root `asset/` folder gets served.
2. **The map.** Fixed world, fit to screen, drawn background, ground, houses, barrels, cactus, the pole with two arrow signs, turn-your-phone overlay.
3. **Two cowboys.** Port the armature view, both drawn and mirrored, posed from stand and shoot values.
4. **Hold to rise.** Mouse, touch and space share one input. Long press is safe on a phone.

### Behaviour, played alone
5. **Rules.** Pure module with tests: rise, duck, draw line, release to fire, top fires, recoil, ammo, reload, feint.
6. **Bullets.** Spread from release timing, flight, hits on head, body and barrel through `@papit/line-intersection`.
7. **Practice bot.** `?bot` adds a simple opponent, so feel can be tuned before any network exists.
8. **Ragdoll.** Verlet port, push from the bullet, drawn through `ik.setPositions`.
9. **Sound.** Web Audio loader and first tap unlock, with gains for everything, music and sounds. Shots, hit, reload, empty click, fly-by.
10. **Revolver.** Turning ammo cylinder at the top centre. The aim cone was tried and removed, the owner doesn't want it in the game.
11. **The kill.** Slow motion, sound, banner, blood, return to speed, fall.
12. **Feel pass.** The owner plays against the bot and we tune `tuning.ts`.

### Player and menus
13. **Corner buttons and settings.** Mute and settings in the top right, name and three volumes, saved in `localStorage`. Pressing them never counts as holding.
14. **Landing sign.** Wooden sign with name and sound, the guest's invite line, the western font, upright on phones.

### Online
15. **Lobby.** Shared chord network: oldest wins, race guard, retry, friendly "waking up" state.
16. **Host and link.** Bring in `qr-code` and `share-link`. The room opens and the QR dialog shows link and copy. Guest opens the link and joins.
17. **Room link and clock.** Room channels, names and the ping clock offset. Message handling gets tests.
18. **The pole.** Camera on the pole, names on the arrow signs, "I'm ready" for both.
19. **Zoom and countdown.** Black bars, zoom out to the map, 3, 2, 1, GO! from the host in shared time.
20. **See the opponent.** Pose over the wire, blended and predicted. Guest sees themselves on the left.
21. **Shots and hits.** Shared bullets, target decides, kill sequence on both screens, draws.
22. **Rounds and rematch.** Score, next round, back to the pole after the match.

### Edge cases
23. **Dead links.** "This game has ended" for a stale link, "this game is full" for a third player, a fresh link for a host who reconnected. The brief says peer ids change on reconnect, while the webrtc README says they stay the same inside a network, so test which it is.
24. **Leaving and background tabs.** Opponent left message, back to the pole with the QR. A hidden tab pauses the round for both, because a hidden player can't decide hits. Resume through the countdown.
25. **Failed connections.** Clear message when STUN isn't enough, with the tip to try the same wifi.

### Finish
26. **Music.** Menu and duel songs from Suno, dip during slow motion.
27. **Text and language.** All text in `@papit/translator`, checked. Swedish if chosen below.
28. **Tests.** Fill the gaps in rules and messages, and add a UI smoke test.
29. **Docs.** Real README, credits, how to run with a local signal server.
30. **Pages and manifest.** `npm run pages`, `manifest.json` and a first deploy. Icons use `manifest.logo`, falling back to `logo` when it's missing, as a build step, because a manifest has no fallback of its own. Also a PNG for iPhones. The owner pushes.
31. **Live test.** Two phones, two networks, the owner and a friend.

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

Found while reading the code on 2026-11-02, and checked against the release in task 0.

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
- `engine.input` can't carry the hold, so task 4 uses native pointer events with `setPointerCapture`, plus `blur`, the way the engine's own camera controllers do. `Mouse` listens for `mouseup` on the canvas only, so a release outside it sticks. `Touches` is fine with `touchcancel`, but a tap also gives emulated mouse events, a second press.
- Space is the key name `" "`. `Keyboard.handlekeyup` throws when a key was pressed before the page had focus, because `keys[name]` is undefined there, and `blur` doesn't release keys. Task 4 listens on `window` itself.

**Cowboy and armature**
- Start from papit's `packages/algorithms/math/armature/views/cowboy/main.js`. Its `limb`, `joint` and `foot` draw order is worth keeping. `Rig` comes from `views/shared/rig.js`, it isn't exported by the package.
- Rig units have y down and the cowboy facing +x. Mirror through `scale.x`.
- `ik.setPositions(positions)` takes x, y, z per head plus the last tail.

**Network**
- Room channels: `room({ media: { channels: { pose: { ordered: false, maxRetransmits: 0 } } } })`, then `room.media.channel("pose")`. Messages that arrive before the first `channel()` call are dropped, so call it early.
- The signal server strikes messages under 200 ms apart. Papchat spaces its own calls 1 s apart.
- `merge` needs `acceptMerge` on the client, or the race guard can't merge two lobbies.
- Lobby logic to copy: `packages/foundations/core/src/lobby.ts` in papchat, lines 410 to 550 and 756 to 815.

**Online, built in tasks 15 to 25**
- `src/net/lobby.ts` is the shared chord network (oldest wins, race guard, retry, 1 s between server calls). `src/net/match.ts` is the room: reliable messages by name, the `pose` channel, and the clock from five pings. `src/online.ts` is the flow: host and guest, the pole, ready, countdown, rounds, leaving, a hidden tab. `src/ui/overlay.ts` holds the bars, countdown, note, buttons and the two dialogs.
- Each player sees themselves on the left, so a position or angle sent over the wire is in the sender's view and the receiver mirrors it (`x` to `1200 - x`, angle to `PI - angle`).
- Messages: `ready`, `start {go}`, `round {go, score, over, restart}`, `shot`, `hit`, `away`, `back`, `bye`, `ping`, `pong`. The host decides when a round starts, and the guest takes its score from the host. The target decides hits, the remote cowboy has no hit lines.
- A hidden tab sends `away`. Both stop, and the host restarts the round through the countdown when nobody is away, with no score. A closing tab sends `bye`, because a dead connection takes a long time to notice.
- Dead links: a reject means "full", a timeout means "ended" (the text also says to try the same wifi), anything else is "couldn't connect". A host whose lobby id changed while nobody joined opens a new room and a new link. Not tested: whether a socket reconnect changes the peer id, the brief and the webrtc README disagree.
- Checked once by hand with two Chromium pages (host, guest, ready, countdown, a kill on both, next round, tab away, third player, friend leaving, dead link). No test files, see the Tests line above.
- `qr-code` and `share-link` are copies of papchat's under `packages/`, tags `cw-`. The QR didn't redraw when its value was set, so `overlay.ts` calls `update()` after setting it, and `qr-code` finds its own `code` element if `@query` hasn't yet.

## Papit gaps to report

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
- The server's page template adds its own `<title>@papit/server</title>` first, so a page's title loses in dev. Check the static template in task 30.

## Notes from tasks 26 to 30

- Songs: `La Tierra Va a Hablar` plays at the sign and the pole, `Dust and Steel` in a duel. The owner didn't say which is which, swap them in `SONGS` in `sound.ts` if wrong. They crossfade, and the music dips in slow motion.
- Text: every word is in `asset/translations/en.json` and `sv.json` under `cowboy`. Swedish is picked by the browser's language, with no picker. The Swedish was written by the assistant, the owner should read it.
- Pages: `npm run pages` makes `docs/`, checked under `/cowboy/` with no failed requests, the base is `/CowboyGame/` now. Icons come from `asset/manifest.logo.svg`, else `asset/logo.svg`, else a drawn cylinder, made by `bin/icons.mjs` (PNGs through Playwright). No service worker.
- The sound effects' source isn't written down, see `CREDITS.md`.
