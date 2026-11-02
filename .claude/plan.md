# Cowboy: plan

Status: **waiting for the owner to confirm.** Nothing is built until then.

## The game now

The owner's notes change the brief's controls. This is the version the plan builds.

- Landscape only, and you always see the full map. Each player sees themselves on the left.
- **Press and hold:** the cowboy rises and raises the gun. The rise is slow enough for the other player to read.
- **Let go early:** below the draw line (35% up) he just ducks, no shot and no bullet spent. That's a feint. Above it he fires at once, and the earlier the release, the wilder the bullet.
- **Hold to the top:** he fires by himself, dead on. There is no position to wait in, which is what stops camping.
- **After any shot:** a short recoil he can't duck out of, then he ducks by himself. You must let go and press again to rise again.
- **Duck:** fully down, bullets come back one at a time, up to 6. No ammo: an empty click, and you're standing there exposed.
- **One hit:** slow motion, the winner on screen, back to speed, he falls and bleeds.

### Starting values

All in one `tuning.ts`, in seconds and world units, tuned by playing. The world is 1200 × 600.

| Thing | Old | Start at |
| --- | --- | --- |
| Rise, bottom to top | 0.17 s | **0.9 s**, or nobody can see it or time it |
| Duck, top to bottom | 0.33 s | 0.33 s |
| Draw line | none | 35% up |
| Spread | none | ±9° at the draw line, falling to 0 at the top |
| Recoil lock | none | 0.25 s |
| Reload | 0.67 s per bullet | 0.67 s per bullet, only fully down |
| Bullet speed | 3900 per s | 3900 per s, about 0.2 s across |
| Ragdoll | gravity .2, bounce .9, friction .99 per frame | 720 per s², bounce .9, friction `.99 ^ (60 * dt)` |

### The kill

1. Hit: `engine.timeScale` drops to 0.1 on both screens. The cowboy starts to reel and blood hangs in the air. Music dips and the slow motion sound plays.
2. About 1.8 s of real time: "you win" or "you died" on screen.
3. `timeScale` ramps back to 1, the ragdoll falls, and a blood pool spreads.
4. Score, then rematch.

`timeScale` also slows `fixedUpdate`, so this sequence and the network clock run on `performance.now()`, not engine time.

## Design calls

| Call | Decision |
| --- | --- |
| Who decides a hit | The player being shot, since their pose is exact on their screen. A cheat could ignore hits, which is fine between friends. |
| Random bullet | The shooter rolls the spread and sends the final angle, so both screens show the same bullet. |
| Both hit at once | A bullet already flying still counts. Both hits within the banner delay make a draw, and nobody scores. |
| On the wire | Pose (stand, shoot) at 30 Hz on an unreliable room channel, `{ ordered: false, maxRetransmits: 0 }`. Shots, hits, round state and pings go reliably through `room.send`. |
| Seeing the raise | The opponent's pose is blended and moved forward by half the round trip, using the known rise speed. This keeps the raise current, where a plain interpolation buffer would show it late. |
| Same start | Five pings at room start give the clock offset, using the lowest round trip. The host sends a start time in shared time. `@papit/webrtc` has no ping, so we write one. |
| Screens | World fits by height and width, and sky and ground run on past it on wider phones. In portrait the game shows "turn your phone", but the share dialog still works upright. |
| Phone details | `touch-action: none`, no text selection or callout on long press, safe area insets, wake lock during a duel. Audio starts on the first tap. iPhones have no fullscreen and no orientation lock. |
| Ragdoll | Local Verlet module behind a small interface, drawn through `ik.setPositions`, so papit's can replace it later. |
| Blood | Small stylised particles and a pool, on by default, one constant to turn it off. |
| Barrels | Stop low bullets, so ducking reads as taking cover. |
| Slow motion sound | Made in Web Audio, a whoosh and a heartbeat, plus the old hit sound at a low playback rate. No file needed. Suno is for the songs. |
| Packages | `packages/game` (game template), plus `packages/qr-code` and `packages/share-link`, so those two can move to papit later as they are. |
| QR and share link | Copy from papchat now, move to papit later. The papchat tests are worth bringing along. |
| Hosting | `@papit/static` to GitHub Pages with `--base /cowboy/`, as in papchat's `npm run pages`. |
| Licences | Ship neither ZitronSound nor Durango Western. Suno songs replace the music, and a free-licence western font, self-hosted, replaces the font. |

## Blockers, checked 2026-11-02

1. **Papit release, needed before task 1.** npm is behind the repo: `game-engine` 0.1.0 against 0.2.0, `vector` and `matrix` 0.0.1 against 0.0.2. `armature`, `quaternion` and `line-intersection` aren't on npm at all.
2. `webrtc` 0.0.7, `signal-server` 0.0.6 and the UI packages match the repo. Nothing to do.
3. `github.com/onkelhoy/cowboy` wasn't reachable from here. The owner needs to create it before task 27.
4. Suno songs: the plan runs without them until task 23.

## Tasks

### Something visible
1. **Package and blank canvas.** Install papit, create `packages/game`, serve an empty engine with `npm start`.
2. **The map.** Fixed world, fit to screen, sky, ground, houses, barrels, cactus, sign, turn-your-phone overlay.
3. **Two cowboys.** Port the armature view, both drawn and mirrored, posed from stand and shoot values.
4. **Hold to rise.** Mouse, touch and space share one input. Long press is safe on a phone.

### Behaviour, played alone
5. **Rules.** Pure module with tests: rise, duck, draw line, release to fire, top fires, recoil, ammo, reload, feint.
6. **Bullets.** Spread from release timing, flight, hits on head, body and barrel through `@papit/line-intersection`.
7. **Practice bot.** `?bot` adds a simple opponent, so feel can be tuned before any network exists.
8. **Ragdoll.** Verlet port, push from the bullet, drawn through `ik.setPositions`.
9. **Sound.** Web Audio loader and first tap unlock. Shots, hit, reload, empty click, fly-by.
10. **Revolver and aim.** Turning ammo cylinder in the corner, and a read on your own aim.
11. **The kill.** Slow motion, sound, banner, blood, return to speed, fall.
12. **Feel pass.** The owner plays against the bot and we tune `tuning.ts`.

### Online
13. **Lobby.** Shared chord network: oldest wins, race guard, retry, friendly "waking up" state.
14. **Host and link.** Bring in `qr-code` and `share-link`. Host opens a room and a dialog shows QR, link and copy. Guest opens the link and joins.
15. **Room link and clock.** Room channels and the ping clock offset. Message handling gets tests.
16. **See the opponent.** Pose over the wire, blended and predicted. Guest sees themselves on the left.
17. **Countdown.** 3, 2, 1 from the host in shared time.
18. **Shots and hits.** Shared bullets, target decides, kill sequence on both screens, draws.
19. **Rounds and rematch.** Score and a rematch button that needs both players.

### Edge cases
20. **Dead links.** "This game has ended" for a stale link, "this game is full" for a third player, a fresh link for a host who reconnected. The brief says peer ids change on reconnect, while the webrtc README says they stay the same inside a network, so test which it is.
21. **Leaving and background tabs.** Opponent left message. A hidden tab pauses the round for both, because a hidden player can't decide hits. Resume through the countdown.
22. **Failed connections.** Clear message when STUN isn't enough, with the tip to try the same wifi.

### Finish
23. **Music.** Menu and duel songs from Suno, dip during slow motion, mute button.
24. **Text and language.** All text in `@papit/translator`, checked. Swedish if chosen below.
25. **Tests.** Fill the gaps in rules and messages, and add a UI smoke test.
26. **Docs.** Real README, credits, how to run with a local signal server.
27. **Pages.** `npm run pages` and a first deploy. The owner pushes.
28. **Live test.** Two phones, two networks, the owner and a friend.

## Ideas, the owner picks

| Idea | Recommendation |
| --- | --- |
| Best of five, first to 3, with a score | Yes |
| Rematch button | Yes, it's part of done |
| Hat flies off on a head shot | Yes, cheap and funny |
| Swedish next to English | Yes, cheap with the translator |
| Outfit colour per player | Later |
| "High noon" bell that forces a move after 20 s of nobody shooting | Only if playing shows that both players sit ducked |

## Papit gaps to report

- No QR or share link component.
- `@papit/webrtc` has no round trip or clock helper.
