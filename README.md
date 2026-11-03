# Cowboy

A two player online cowboy duel, built on [papit](https://github.com/onkelhoy/papit). Send a friend a link, they open it, and you shoot each other. One hit wins the round, first to three wins the duel.

## How to play

One control: press and hold with the mouse, a finger, or space.

- **Hold:** your cowboy rises and raises his gun. The rise is slow enough for the other player to read.
- **Let go early:** below halfway he just ducks. No shot, no bullet spent. It's a feint.
- **Let go above halfway:** he fires at once, along the way the gun points right then. A low shot goes up into the sky, a high one is nearly dead on.
- **Hold to the top:** he fires by himself, dead on.
- **After a shot:** a short recoil he can't duck out of, then he stays up for as long as you hold. Let go and he goes all the way down. He can't rise again until he has been fully down.
- **Duck to reload:** fully down, bullets come back one at a time, up to six. With none left you only get an empty click.
- Barrels stop low bullets, so ducking behind them is cover.

## Play

1. Open the game, give yourself a name and choose sound or no sound.
2. A dialog shows a QR code and a link. Send the link to a friend, or let them scan the code.
3. Your friend opens it, gives a name, and is at the pole with you. Both press "I'm ready".
4. The camera zooms out, 3, 2, 1, GO!

Phones should be held sideways during a duel. The name sign and the invite dialog work upright. Name, volumes and mute are saved on the device, and the buttons in the top right corner change them any time. The game speaks English and Swedish, by the browser's language.

## Run it

Needs Node 20 or newer.

```bash
npm install
npm start          # builds, then serves http://localhost:3000/views/game/
```

Without a friend: `?bot` gives a practice opponent, `?stage` is the empty map, both with no network. Example: <http://localhost:3000/views/game/?bot>.

Online, the game uses the same signal server as papchat, on Render's free tier. It sleeps when nobody uses it, so the first player may wait a few seconds ("waking up the server"). To run your own and have two browsers play on your machine:

```bash
npm run signal     # a signal server on ws://localhost:3001
npm start
```

Then open `http://localhost:3000/views/game/?signal=ws://localhost:3001` in two browsers or profiles. The invite link keeps the `?signal=` part.

## Commands

| Command | What it does |
| --- | --- |
| `npm start` | Builds the game and serves it with live rebuild |
| `npm run signal` | Runs a local signal server on port 3001 |
| `npm run build` | Builds every package |
| `npm run pages` | Builds the static site into `docs/`, the same build GitHub Pages runs |

No new tests are being written for now, by choice. The ones in `packages/game/tests` are from early on.

## How it works

- **One network per duel.** As in papchat, the host makes a small private mesh network on the signal server and the guest joins it straight through the link. Once the two are linked only the host keeps a socket open, so a game costs the server one connection. (A shared chord lobby was tried first and dropped: it was more machinery than a link between friends needs, and joins through it failed.)
- **The link** carries the network's id and the host's name (`?game=…&by=…`). The network keeps its id if the host's socket drops and comes back, so the link keeps working.
- **On the wire:** pose at 30 Hz over an unreliable data channel; shots, hits and round state over the reliable one. The other cowboy is moved forward by half the round trip. A shared clock, found with five pings, starts everyone on the same GO.
- **The player who is shot decides the hit,** since their own pose is exact on their screen. A bullet already flying still counts, so two hits close together make a draw.
- Everything tuned by playing is in `packages/game/src/tuning.ts`.

## Layout

| Package | What it is |
| --- | --- |
| `packages/game` | The game, its page in `views/game/`, art and sound effects |
| `packages/qr-code` | An SVG QR code element, made in the browser. Copied from papchat, meant for papit |
| `packages/share-link` | A button that shares or copies a link. Copied from papchat, meant for papit |

The songs are in `asset/audio/song/`. Put `logo.svg`, and if you like `manifest.logo.svg` (for the home screen icon), in `asset/`: the page icons are made from them, a drawn revolver cylinder stands in until then.

## Put it online

Every push to `main` builds the site with `@papit/static` and publishes it to <https://onkelhoy.github.io/CowboyGame/>, see `.github/workflows/pages.yml`. The site expects to live under `/CowboyGame/`, change `--base` in `packages/game/package.json` for another address. The 2018 game is on the `old-version` branch.

## Credits and licences

See [CREDITS.md](CREDITS.md).
