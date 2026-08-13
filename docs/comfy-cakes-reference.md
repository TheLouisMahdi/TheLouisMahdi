# Purble Place / Comfy Cakes reconstruction reference

This document locks the target before implementation: **Purble Place → Comfy Cakes**, the version shipped with Microsoft Windows Vista and Windows 7 and developed for Microsoft by Oberon Games. The playable surface is authored at **800 × 496 px**.

## Evidence and source set

- The installed-game resource containers `PurblePlace.dll` and `PurblePlace2.dll` were enumerated and hashed. The filtered Comfy Cakes/Purble Place set contains **354 resources / 17,132,033 bytes**.
- The complete machine/game definitions came from `UI\COMFYCAKES\COMFYCAKESGAME.XML`; exact difficulty values came from `COMFYCAKESVARS.XML`; the home-screen placement came from `UI\PURBLEPLACE\PURBLEPLACEMANAGER.XML`.
- Cross-checks: [Purble Place overview and rules](https://en.wikipedia.org/wiki/Purble_Place), [Comfy Cakes screenshots at MobyGames](https://www.mobygames.com/game/42794/purble-place/screenshots/), [community sprite inventory](https://www.spriters-resource.com/pc_computer/purbleplace/), and [community sound inventory](https://www.sounds-resource.com/pc_computer/purbleplace/).
- The web runtime is based on the scene/interaction work in [adorzhang/Comfy-Cakes](https://github.com/adorzhang/Comfy-Cakes), then corrected against the original variables, connected to the original SFX set, and wrapped in the Windows 7/Purble Place menus used by this project.

The machine-readable [original resource manifest](./comfy-cakes-original-resource-manifest.json) records DLL, resource type, original path, byte length, and SHA-256 for every matched item.

## Resource inventory

| Group | Count | Contents |
|---|---:|---|
| Comfy Cakes UI | 231 | game layout, machines, tools, cake layers, TV, conveyor, timer, shipping, trash, chef movies, tips |
| Sprite sheets | 78 | 39 JPEG color sheets plus 39 CAB-packed 8-bit alpha masks |
| Purble Place shell UI | 24 | home background/foreground, three game buttons, loading view, exit/new-game/main-menu controls |
| Audio | 18 | the complete Comfy Cakes interaction set plus shared left/right controls |
| Configuration | 3 | game variables and supporting definitions |
| **Total** | **354** | 232 XML, 45 JPG, 39 CAB, 20 PNG, 18 WMA |

Primary visual files and expected dimensions:

| Asset | Original size | Runtime use |
|---|---:|---|
| `PURBLEPLACEBACKGROUND.JPG` | 800 × 259 | pink radial sky behind the home screen |
| `PURBLEPLACEFOREGROUND.PNG` | 800 × 496 | landscape and the three game buildings |
| `PURBLEPLACEBUTTONSHEET18` | 1014 × 1021 | normal/hover/down hit-state art; color JPG + CAB alpha mask |
| `COMFYCAKESBACKGROUND2.JPG` | 800 × 496 | factory wall, counter, conveyor space, trash chute |
| `GAMESCREEN.PNG` | 800 × 496 | shared game-screen surface |
| `comfy-spritesheet.png` | 2044 × 1264 | browser atlas for machines, cakes, conveyor, chef and controls |

Runtime identity hashes:

| File | SHA-256 |
|---|---|
| Aero arrow cursor | `e6e946ecc0a172c5e5b9dc3ef9e1012971f41034a87e6f69cf9bab14ef5cfdb9` |
| Purble Place icon | `f876e2cee3fc7c64ece5f165857146d968d036e7d986aef1b38ff82f028edd17` |
| Main background | `32d814e5bc3459e6be0bc931454a5a45e908c2b1097ce7743f7c2f6a010a95de` |
| Main foreground | `c13c39045188a0759af729a5dc22b09aa72c278503970a007efde85e3f1dea7b` |
| Comfy hover state | `407c0219537b29ced5a4d4c3652312e145d51ecac16e3d3ba4b1f2dcec65d67c` |
| Comfy down state | `9dbe8929cdc3bccf6cdb07e3ea9120b6b1dd529abcb7ecc51681d3bb852e98d2` |
| Game background | `fde19b982a476787854bf2bbc786f704c788d8b47cbc91386d1d775f2bbdca9d` |
| Browser sprite atlas | `7ff24ca379f2aa40bbdb8cd8729231f46ec498a068a4318c2dfb62475c04fac6` |

## Complete sound set

The original WMA resources were transcoded to Ogg Vorbis for Firefox, Chromium, Safari, and mobile web playback. Basenames are preserved:

1. `PURBLES_CAKEBATTERBUTTON`
2. `PURBLES_CAKEBOXED`
3. `PURBLES_CAKEBUTTONS`
4. `PURBLES_CAKEDUMPED`
5. `PURBLES_CAKEFILLINGBUTTON`
6. `PURBLES_CAKEPANBUTTON`
7. `PURBLES_CHEFENTER`
8. `PURBLES_CHEFEXIT`
9. `PURBLES_COMFYWIN`
10. `PURBLES_CONVEYOR`
11. `PURBLES_DECORATIONSBUTTONS`
12. `PURBLES_FLAMEBUTTON`
13. `PURBLES_FROSTINGBUTTON`
14. `PURBLES_LEFTARROWBUTTON`
15. `PURBLES_RIGHTARROWBUTTON`
16. `PURBLES_ROTATEBUTTON`
17. `PURBLES_SHAKERBUTTON`
18. `PURBLES_TVON_DING`

## Screen and menu sequence

1. **Loading** — Purble loading artwork and centered `LOADING...` label.
2. **Purble Place home** — radial pink sky, full 800 × 496 foreground, `PURBLE PLACE` title, Purble Pairs at left, Comfy Cakes at center, Purble Shop at right, and the red exit sign.
3. **Comfy Cakes hover/down** — the center building swaps to the exact button-sheet state before launch.
4. **Select Difficulty** — Windows 7 task-dialog styling with Beginner, Intermediate, Advanced and the original explanatory copy.
5. **Comfy Cakes intro** — TV order ding, chef entrance/talk/blink, then chef exits the work area.
6. **Factory gameplay** — order TV, conveyor and arrows, six tool stations, timer/alarm where applicable, delivery box and trash chute.
7. **Correct cake** — the cake is boxed, delivery animation runs, status indicator advances, and the next order appears.
8. **Incorrect cake** — alarm flashes, trash opens, cake is dumped, and the failure counter advances.
9. **Win / loss** — win animation and sound after the target number of deliveries, or game over after the allowed misses.
10. **Statistics / Options** — Game menu exposes New Game (`F2`), Statistics (`F4`), Options (`F5`), Return to Main Menu, and Exit. Options include difficulty and “One cake at a time in Intermediate, Advanced.”

## Original 800 × 496 layout anchors

| Object | X | Y |
|---|---:|---:|
| Home: Purble Pairs button | 2 | 70 |
| Home: Comfy Cakes button | 210 | 153 |
| Home: Purble Shop button | 491 | 145 |
| Home: exit button | 4 | 377 |
| Order TV | 0 | 0 |
| Order cake inside TV | 65 | 104 |
| Conveyor origin | 0 | 220 |
| Timer | 7 | 339 |
| Alarm light | 13 | 297 |
| Shipping sign | 695 | 19 |
| Cake box | 687 | 155 |
| Trash | 651 | 135 |

## Recipes and progression

Every order is a sequence of features. The player moves the cake to the matching station and selects the requested item in order:

| Station | Choices |
|---|---|
| Pan | heart, rectangle, round |
| Batter | chocolate, strawberry, vanilla/lemon |
| Filling | fudge/chocolate, raspberry, vanilla custard |
| Icing | chocolate, strawberry, lemon/vanilla |
| Decoration | gumdrops/buttons, heart, shamrock/leaf, smiley |
| Final touch | burnt glaze, powdered sugar |

Difficulty values locked from `COMFYCAKESVARS.XML`:

| Difficulty | Correct cakes | Misses allowed | Layers | Toppings | Belt slide | Add-cake interval | Correct / wrong points |
|---|---:|---:|---:|---:|---:|---:|---:|
| Beginner | 5 | 3 | 1 | 2 | 4.0 s | every 5 slides | +10 / −10 |
| Intermediate | 5 | 3 | 2 | 3 | 5.0 s | every 7 slides | +50 / −50 |
| Advanced | 6 | 2 | 3 | 3 | 4.0 s | every 7 slides | +100 / −100 |

Beginner has no time-attack flow. Intermediate and Advanced support concurrent cakes unless “One cake at a time” is enabled.

## Rights and attribution

Purble Place, Comfy Cakes, their characters, artwork, audio, and original UI are Microsoft/Oberon Games material. They are included here solely for a non-commercial archival recreation; no ownership is claimed. Before any broader commercial distribution, obtain the necessary permissions or replace the original media with independently licensed equivalents.
