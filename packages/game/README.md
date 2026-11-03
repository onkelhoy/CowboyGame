# @cowboy/game

The cowboy duel itself. The page is `views/game/`, it imports the built `lib/bundle.js`, so `npm start` from the root builds first and rebuilds on change.

```bash
npm start            # from the root, then open http://localhost:3000/views/game/?bot
npm run signal       # from the root, a local signal server for two players
```

## Source

| Folder or file | What it holds |
| --- | --- |
| `src/game.ts` | Boots the engine and wires the parts together |
| `src/rules.ts` | Plain rules of one cowboy: rise, duck, draw line, recoil, ammo, reload |
| `src/tuning.ts` | Every number tuned by playing |
| `src/cowboy/` | The body (armature), outfit colours and the Verlet ragdoll |
| `src/duel/` | Bullets, hits, the practice bot, and the kill: slow motion, blood and the win sign |
| `src/scene/` | The drawn map, the pole, and the camera that zooms between pole and map |
| `src/net/` | The connector (one small mesh network per duel), and the match (room, clock, pose channel) |
| `src/online.ts` | The online flow: host or join, ready, countdown, rounds, leaving |
| `src/ui/` | The landing sign, corner buttons, settings and the overlay (bars, countdown, dialogs) |
| `src/sound.ts` | Web Audio: sound effects, songs, volumes, the slow motion whoosh |
| `src/text.ts` | The translator, English and Swedish in `asset/translations/` |
| `bin/sync-assets.mjs` | Copies the root `asset/` folder in, since the server only finds package assets |
| `bin/icons.mjs` | Makes the page icons from the root `asset/logo.svg` |

Assets are loaded with `fetch`, because the static build only rewrites `fetch` under its base, not `<img src>` or CSS `url()`.

## Messages between players

`ready`, `start`, `round`, `shot`, `hit`, `away`, `back`, `bye`, `ping` and `pong` go reliably. Poses go over the `pose` channel. Positions and angles are in the sender's view, every player sees themselves on the left, so the receiver mirrors them.
