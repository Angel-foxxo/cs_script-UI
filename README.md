# cs_script UI


A in-world UI framework for Counter-Strike 2 [cs_script](https://www.source2.wiki/Scripting/Counter-Strike%202/cs_script/introduction?game=any). CSUI lets you build highly flexible and animated 2D interfaces that live in the game world using a powerful CSS like layouting system.

![Showcase GIF](showcase.gif)

---------------------------------------------------

## Main Features

- **Flexbox-like layout** - Flow.LeftToRight, Flow.TopToBottom, Size.Fit, Size.Grow, Fixed Size, Left / Center / Right / Top / Bottom, plus `Relative` and `Absolute` Alignment, Padding, and Childgap, all resolved automatically every tick.
- **Dynamic UI** - Build truly resizeable and dynamic UIs using custom particle based panels which support arbitrary widths and heights.
- **Custom text support** - The included `FontAtlasBuilder` tool bakes TrueType fonts to an animation atlas, which is used to render text as a collection of particles with correct font metrics.
- **Smooth animations** - Interpolate attributes like Color, Alpha, Scale, etc.. with a single `Animate()` call.

---------------------------------------------------

## Getting Started

### Prerequisites

[cs_script_boilerplate](https://github.com/Source2ZE/cs_script_boilerplate) or a similar typescript bundler setup using these [cs_script packages](https://github.com/Source2ZE/cs_script)


### Installation

Go to the [releases](https://github.com/Angel-foxxo/cs_script-UI/releases) page and download the latest release, unzip the archive and copy everything into your addon's folder.

> [!IMPORTANT]
> Place the `csui_ents.vmap` prefab into your map and recompile! (entity only is enough)

### Basic Example

This code shows how to setup and use the CSUI library. It will display a UI panel containing a text element reading "Hello World!" in front of the player.

```typescript
import { Instance } from "cs_script/point_script";
import { AlignX, AlignY, AnimationValueTypes, Size, TextUIPanel, UI, UIPanel } from "./CSUI";
import { Fonts } from "./font_definitions";
import { Euler, Vec3 } from "@s2ze/math";

function SpawnTextUI()
{
    const DemoUI = new UI();
    DemoUI.AlignX = AlignX.Center;
    DemoUI.AlignY = AlignY.Center;

    const root = new UIPanel(DemoUI);
    root.Color = { r: 36, g: 134, b: 209, a: 255 };
    root.Layout = {
        Width: Size.Fit,
        Height: Size.Fit,
        Padding: 2,
    };

    const text = new TextUIPanel(root, Fonts.Roboto_Regular, "Hello World!");
    text.Layout.Scale = 5;

    // scale text when hovered
    text.OnMouseEnter.Add(p => 
    {
        p.Animate(5.5, 0.3, AnimationValueTypes.Scale);
    });

    text.OnMouseLeave.Add(p => 
    {
        p.Animate(5, 0.1, AnimationValueTypes.Scale);
    });

    const pawn = Instance.GetPlayerController(0)!.GetPlayerPawn()!;

    DemoUI.AddPlayer(pawn);

    const pawnAngles = new Euler(pawn.GetEyeAngles());

    DemoUI.Origin = new Vec3(pawn.GetEyePosition()).add(pawnAngles.forward.multiply(40));
    DemoUI.Angles = pawnAngles.forward.multiply(-1).eulerAngles;
}

Instance.OnRoundStart(() => 
{
    SpawnTextUI();
});

Instance.OnScriptReload({ 
    after: (() => 
    {
        SpawnTextUI();
    }),
});
```

> [!NOTE]
> It is useful to make enclosed functions like above for spawning UIs, this allows calling them in the `after()` callback of `Instance.OnScriptReload()`, enabling live reloading of the UI when saving the script.
>
>Check out `maps/csui/example.vmap` and `src/csui/csui_example.ts` for a more indepth example.

### Adding fonts

Drop `.ttf` font files into the `fonts/` folder then run `FontAtlasBuilder.exe` from the `FontAtlasBuilder/` folder.

This will:
- Render every glyph to its own PNG in `materials/csui/fonts/<FontName>/` and create the required .mks and .vtex files for the atlas.
- Write a `.vpcf` particle file for each font to `particles/csui/fonts/`.
- Regenerate `src/csui/font_definitions.ts` with updated glyph metrics and character mappings.
- Regenerate `maps/prefabs/csui/fonts.vmap` containing the new font particle and template entities.

> [!IMPORTANT]
> Recompile your map after running FontAtlasBuilder.exe (entity only compile is enough) to use newly added fonts.


By default `FontAtlasBuilder.exe` will render glyphs for these characters:

> ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!"@#$%^&*}{_+-=,./\?:;<>][()`'1234567890

You can provide the `-chars 'charset'` parameter to define a custom character set.

---------------------------------------------------

## Core Concepts

### The UI object

`UI` is the main container. It holds the panel hierarchy, tracks which players are interacting with it, and drives the layout and render loops.

```typescript
const DemoUI = new UI();
DemoUI.Origin = new Vec3(someEntity.GetAbsOrigin());
DemoUI.Angles = new Euler(someEntity.GetAbsAngles());
DemoUI.AlignX = AlignX.Center;
DemoUI.AlignY = AlignY.Top;
DemoUI.Brightness = 1.5; // brightness multiplier
DemoUI.Scale = 2; // world space scale of the whole UI

DemoUI.AddPlayer(Instance.GetPlayerController(0)!.GetPlayerPawn()!);
```

UIs run their own Think() loop by default, if you'd rather handle this manually, set `UI.ManualThink` to `true` and call `UI.Think()`

```typescript
DemoUI.ManualThink = true;

Instance.SetThink(() => {
    DemoUI.Think();
    Instance.SetNextThink(Instance.GetGameTime());
});
```

### Panels

Panels are the building blocks of the UI, by itself `BaseUIPanel` just takes part in the Layouting pass, but does no rendering of its own, more specialised panel types handle the rendering:

- **UIPanel** - Particle based sizeable panel. Has full layout system interaction (size to fit content, expand to fill space, etc...).
- **TextUIPanel** Particle based dynamic text panel, supports any font, text shaping (new lines, text wrapping, text alignment) and has full layout system interaction.
- **UIModelPanel** - Model based panel, only supports uniform scale and has limited interaction with the layouting system.

#### Layout

Every panel has a `Layout` property. Assigning a partial object merges with the defaults.

| Property | Type | Description |
|---|---|---|
| `Width` / `Height` | `number \| "Fit" \| "Grow"` | Fixed size, shrink-wrap children, or fill parent |
| `Flow` | `Flow.LeftRight \| Flow.TopBottom` | Main axis direction |
| `AlignX` / `AlignY` | `Center \| Top \| Bottom \| Left \| Right` | Child alignment on each axis |
| `Padding` | `number \| { left, right, top, bottom }` | Inner spacing |
| `ChildGap` | `number` | Gap between children |
| `Scale` | `number` | Layout-aware scale (children reflow) |
| `VisualScale` | `number` | Visual-only scale (layout ignores it) |

```typescript
panel.Layout = {
    Width: Size.Fit,
    Height: 50,
    AlignX: AlignX.Left,
    AlignY: AlignY.Top,
    Flow: Flow.LeftRight,
    ChildGap: 2,
    Padding: { left: 1, right: 2, top: 3, bottom: 4 },
    Scale: 2,
    VisualScale: 2,
};
```

#### Animations

Trigger a smooth interpolation with one call:

```typescript
// Animate color (interpolates in OKLab space)
panel.Animate({ r: 99, g: 161, b: 255, a: 255 }, 0.2, AnimationValueTypes.Color);

// Animate size
panel.Animate(60, 0.3, AnimationValueTypes.Width);

// Animate scale (layout recalculates)
panel.Animate(1.2, 0.25, AnimationValueTypes.Scale);

// Animate opacity
panel.Animate(0, 0.5, AnimationValueTypes.Alpha);
```
> [!NOTE]
> `Animate()` is safe to call at any time even in tight loops, if an animation for a given property hasn't yet finished, any new Animate() calls will simply update the animation state, without adding any new objcts.

### Events

All events follow the `Event<TArgs>` pattern, call `.Add(callback)` to subscribe.

```typescript
panel.OnMouseEnter.Add((panel, player) => { code });
panel.OnMouseLeave.Add((panel, player) => { code });
panel.OnMouseDown .Add((panel, player) => { code });
panel.OnMouseUp .Add((panel, player) => { code });
panel.OnMouseMoved.Add((panel, player) => { code });

// Runs every tick after layouting, but before rendering
panel.OnThink.Add((panel, worldTransforms) => 
{
    // transforms.Width / transforms.Height are postlayout world space values
});
```

### Panel lookup

Name panels at construction time and retrieve them later:

```typescript
new Button(parent, Shape.Rect, "myButton");

// find one
const found = ui.GetPanel("myButton");

const allButtons = ui.GetPanels("*buttonPanel");
for (const button of allButtons) {
    button.Layout.Width = 30;
}
```

---------------------------------------------------

## Controls

Some basic controls are offered by `controls.ts`.

All built in controls read from `CurrentTheme` exported by `controls.ts`. You can change individual color slots before constructing controls, or replace `CurrentTheme` with your own object implementing `ThemeColors`:

| Color | Description |
|---|---|
| `UI` | For background elements like the Root. |
| `UIMiddle` | For elements which need to stand out from the background. |
| `UISoft` | For elements which need to sit on UIMiddle. |
| `UISofter` | For elements meant to pop out slightly. |
| `Contrast` | For any element which needs contrast from the background, like text |
| `ContrastSoft` | For any element which needs contrast but doesn't have to be as visible, like inactive text |
| `HoverAccent` | For anything that needs to be accented like hovering over a button |
| `Accent` | For anything that needs to be accented |

---

## License
- cs_script UI (`/src`) - GPL v3+
- FontAtlasBuilder (`/FontAtlasBuilder`) - MIT