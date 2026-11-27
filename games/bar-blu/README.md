# Bar Blu

**Sette notti in via Padova.** A novel you play, set in a bar on a street corner in Milan.

It began as the cozy game `bar-blu` in the random repository. That version had customers to serve, fortune machines and memories to collect. This version rewrites the story from scratch and changes the architecture. The graphics are new as well: the places are built and lit in Blender, and the characters are shadow-theatre silhouettes.

## The story

You arrive in the rain and answer a handwritten sign in two alphabets: *Cercasi barista*. The owner, Luca Zheng, calls you **Blu**, after the bar, "until you earn a name".

Behind a red velvet curtain there are three gaming machines. Luca's father named them after the Chinese star gods: 福 Fortune, 禄 Prosperity, 寿 Long life. They pay the rent. They are also ruining Gigi, the ex-manager who is saving money for his daughter. They ruined Luca's father, who was found at dawn with a token in his hand.

Over seven nights you serve coffee and you listen. Among the people you meet:

- **Elvira** orders two coffees for Teresa, the woman she shared a table with for 41 years.
- **Sor Ugo**, a typographer without a home, says thank you backwards, *eizarg*.
- **Mirella** says she sang Norma at La Scala.
- **Professor Baldini** knows four bad lines of poetry by heart.

Then it snows, and on that night someone can die.

Your choices decide the rest. They change:

- how much each person trusts you;
- the *caffè sospesi* you leave under the sugar bowl;
- whether you warn Gigi, call his daughter, give Ugo a key or walk him to the shelter;
- whether you play the machines yourself.

There are four endings: **la luce**, **il tramonto**, **il ronzio** and **il buio**. The story is meant to be melancholic and sometimes cruel, but redemption is always possible.

## How it plays

- **Dialogue**: tap to advance, then choose what to say. At the counter you choose what to serve.
- **Quick rounds**: regulars order in a hurry. Serve the right drink and they leave a tip.
- **The saletta**: the three sisters take tips only, never real money. They return about 91 cents for every euro, they love a near miss, and they talk to you.
- **The journal**:
  - what each person has told you;
  - **Anna's postcards**, charcoal drawings of key moments, made from the scene and its silhouettes, which you can save or share;
  - the endings you have found.
- **Saving**: the game saves automatically at the start of every scene.
- **Settings**: text speed, music, sounds, reduced motion.

## Architecture

```
js/story/notte1..7.js   the script, as plain text (one file per night)
js/engine/script.js     parser: scenes, lines, choices, conditions, effects (pure)
js/engine/runner.js     runner + safe expression evaluator, no eval (pure)
js/cast.js              characters, regulars, drinks, SVG silhouettes
js/ui/stage.js          Blender backgrounds, silhouettes, rain/snow/candles/smoke
js/ui/minigames.js      the quick rounds and the saletta
js/ui/journal.js        memories, charcoal postcards, endings
js/audio.js             generative music per mood, the machines' jingle, sounds
js/main.js              wires the runner's events to the UI, saves, settings
blender/build_scenes.py builds and renders every place (11 images)
scripts/pack-art.mjs    PNG renders → WebP in art/
```

Writing a scene looks like this:

```
=== n2_elvira
@bg pomeriggio
@show elvira center
ELVIRA: Due caffè, per cortesia.
+ [☕☕ Due caffè, uno macchiato freddo]
  ~ trust.elvira += 1; mance += 2
- [Le chiedi per chi è il secondo caffè.]
  ELVIRA: Per Teresa.
{trust.elvira >= 2} -> n4_seduta
```

## Rebuilding the art

```bash
/path/to/Blender -b --factory-startup --python games/bar-blu/blender/build_scenes.py
node games/bar-blu/scripts/pack-art.mjs
node tools/quality/generate-bar-blu-icons.mjs
```

Set `BB_SAMPLES` to change the render quality (the default is 96). After `--`, you can pass the names of the scenes to render.

## Checks

```bash
node games/bar-blu/test/logic-test.mjs
npm --prefix tools/quality test -- e2e/bar-blu.spec.mjs
```

The logic tests check:

- every jump goes to an existing scene;
- every command, background and silhouette exists;
- every scene can be reached;
- across 2000 random playthroughs there is no dead end and every ending happens;
- a kind and attentive player can reach *la luce*;
- the machines pay back about 91 % and show frequent near misses;
- the player is never gendered.

The E2E tests play the whole story to an ending and open the journal.

The credits include the free, anonymous national helpline for gambling problems run by the Istituto Superiore di Sanità: **800 558 822**.
