# Gravity Gardens

A three-level pinball game where each stage warps gravity. The ball is always in control. You never are.

## Play the Game

https://waheedcan.itch.io/gravity-gardens

## How Gameplay Requirements Are Satisfied

### Discrete and Continuous Inputs

**Discrete inputs:**
- A / ← and D / → trigger the left and right flippers on keydown/keyup events
- Spacebar release fires the plunger and launches the ball
- Clicking the Continue button advances past summary screens
- Pressing Space on the title screen starts the game

**Continuous inputs:**
- Holding Space charges the plunger — launch velocity scales with how long Space is held (tracked via timestamp delta)
- Holding Q or E in Level 2 applies a sustained horizontal nudge to the ball each frame via `update()`

### Indirect Player Control

The player only operates the flippers, plunger, and nudge. The physics engine moves the ball into contact with bumpers and targets. The player cannot directly touch any target — all scoring happens through ball trajectory and collision.

### Physics-Based Gameplay Scenes (3 Levels)

All three levels use a single reusable `PinballScene` class configured via `getLevelConfig()`:

**Level 1 — Earth Standard** (`gravity: 980`)
- 5 circular bumpers in the upper playfield
- Standard bottom flippers
- Ball lost when it falls past the gutter

**Level 2 — Lunar Drift** (`gravity: 200`)
- 4 moving rectangular targets tweened across the playfield
- Longer hang time due to low gravity
- Q/E nudge mechanic adds a new continuous input
- Ball lost at the bottom

**Level 3 — Inverted Core** (`gravity: -980`)
- Gravity is reversed — ball rises
- Flippers moved to the top of the screen
- 5 targets near the bottom
- Ball lost when it exits through the ceiling
- Flipper rotation direction is mirrored from Level 1

### Other Scenes

- `TitleScene` — sets tone, waits for Space (discrete input)
- `SummaryScene` — reused after each level, shows score and result, teases next level, Continue button advances
- `GameOverScene` — shows final cumulative score across all levels, Play Again returns to title

## Assets

No external image or audio assets are used. All visuals are drawn with Phaser's built-in shape primitives (`add.circle`, `add.rectangle`) and text objects. No third-party asset credits required.
