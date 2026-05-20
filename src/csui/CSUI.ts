/*!
*   cs_script UI - this code adds an in-world user interface system to Counter-Strike 2.
* 
*   Copyright (C) 2026 Angel Cazacu
* 
*   Inspired by the Clay UI library: https://github.com/nicbarker/clay
* 
*   Contact:
*     GitHub:   https://github.com/Angel-foxxo
*     Website:  https://angelcazacu.com/
*     Discord:  anngell8
*     Email:    angelcazacu8@gmail.com
*
*   Licensed under the Mozilla Public License Version 2.0.
*   See <https://www.mozilla.org/en-US/MPL/2.0/> for details.
* 
*   https://github.com/Angel-foxxo/cs_script-UI
*/
export const VERSION = "v1.1.0";

import { Euler, Vec3 } from "@s2ze/math";
import { BaseModelEntity, Color, CSInputs, CSPlayerPawn, Entity, Instance, PointTemplate } from "cs_script/point_script";
import { Font } from "./font";
import { Fonts, FontsMap, GetGlyphIndex } from "./font_definitions";
import { Lab, OklabToSrgb, SrgbToOklab } from "./oklab";

const ANIM_EPS = 0.001; // epsilon for animation interpolation
const PANEL_Z_INCREMENT: number = 0.1; // panel overlap increment 
const UIArray: UI[] = [];

let DEBUG = false;

/** Enables debug only logs and panel bounds outlines */
export function UISetDebug(debug: boolean)
{
    DEBUG = debug;
}

// slightly horrible workaround, this redefines OnScriptReload to always run our destruction logic first in before()
const originalOnScriptReload = Instance.OnScriptReload.bind(Instance);
Instance.OnScriptReload = (config, ...rest) => 
{
    originalOnScriptReload({
        ...config,
        before: () => 
        {
            // our logic first
            for (const UI of UIArray) 
            {
                UI.Kill();
            }
            // user code
            return config.before?.() as ReturnType<NonNullable<typeof config['before']>>;
        },
    }, ...rest);
};

// workaround for onRoundStart function being global, like this we can have out "our own" onRoundStart function.
Instance.ConnectOutput(Instance.FindEntityByName("*CSUI.roundstart")!, "onuser1", () => 
{
    RegisterThinkCallback();
});

function RegisterThinkCallback()
{
    // same story for think as above
    Instance.ConnectOutput(Instance.FindEntityByName("*CSUI.timer")!, "ontimer", () => 
    {
        for (const UI of UIArray) 
        {
            if (UI.ManualThink === false)
            {
                UI.Think();    
            }
        }
    });
}

RegisterThinkCallback();

// main layout object
interface Layout
{
    Width: SizeType;
    Height: SizeType;
    AlignX: AlignXType,
    AlignY: AlignYType,
    Flow?: Flow;
    ChildGap?: number,
    Padding?: { left?: number, right?: number, top?: number, bottom?: number } | number,
    Scale?: number,
    VisualScale?: number,
}

export const Size = {
    Fit: "Fit",
    Grow: "Grow",
} as const;

/**
 * How the layout system will try to size this panel.
 * 
 * - Fit - Will fit the sizes of its contents.
 * - Grow - Will grow as much as it can inside its parent.
 * - number - Sets a fixed size.
 */
export type SizeType = (typeof Size)[keyof typeof Size] | number;

/**
 * Y axis alignment of a UI panel, alignment takes into account the bounds of the child and parent.
 * 
 * - Top - Align to the top edge of the parent.
 * - Center - Align to the center of the parent.
 * - Bottom - Align to the bottom edge of the parent.
 * - Relative(value: number) - Excludes this panel from the layouting system, value maps 0 = top edge, 1 = bottom edge. 
 * - Absolute(value: number) - Excludes this panel from the layouting system, value is a world unit offset from the top edge.
 */
export const AlignY = {
    Top: "Top",
    Center: "Center",
    Bottom: "Bottom",
    Relative: (value: number) => ({ type: "Relative" as const, value }),
    Absolute: (value: number) => ({ type: "Absolute" as const, value }),
} as const;

/**
 * The type of {@link AlignY} values.
 * See {@link AlignY} for field descriptions.
 */
export type AlignYType =
    | Exclude<(typeof AlignY)[keyof typeof AlignY], (...args: never[]) => unknown>
    | ReturnType<typeof AlignY.Relative>
    | ReturnType<typeof AlignY.Absolute>;

/**
 * X axis alignment of a UI panel, alignment takes into account the bounds of the child and parent.
 * 
 * - Left - Align to the left edge of the parent.
 * - Center - Align to the center of the parent.
 * - Right - Align to the right edge of the parent.
 * - Relative(value: number) - Excludes this panel from the layouting system, value maps 0 = left edge, 1 = right edge. 
 * - Absolute(value: number) - Excludes this panel from the layouting system, value is a world unit offset from the left edge.
 */
export const AlignX = {
    Left: "Left",
    Center: "Center",
    Right: "Right",
    Relative: (value: number) => ({ type: "Relative" as const, value }),
    Absolute: (value: number) => ({ type: "Absolute" as const, value }),
} as const;

/**
 * The type of {@link AlignX} values.
 * See {@link AlignX} for field descriptions.
 */
export type AlignXType =
    | Exclude<(typeof AlignX)[keyof typeof AlignX], (...args: never[]) => unknown>
    | ReturnType<typeof AlignX.Relative>
    | ReturnType<typeof AlignX.Absolute>;

/**
 * The direction of the layout axis, child elements will be placed next to eachother along the axis.
 * 
 * - TopBottom - Aligns from the top edge to the bottom edge.
 * - LeftRight - Aligns from the left edge to the right edge.
 */
export enum Flow
{
    TopBottom,
    LeftRight,
}

/**
 * In world panel rendered look
 * 
 * - Rect - Makes the panel render as a rectangle.
 * - Ellipse - Makes the panel render as an ellipse.
 */
export enum Shape
{
    Rect,
    Ellipse,
}

/**
 * An object representing panel transforms used for transforms after layouting which are not quite world space yet,
 * and fully world space transforms.
 * 
 * Angles are not stored because they will always be the same as UI.Angles
 */
export interface Transforms
{ 
    Origin: Vec3, 
    Width: number, 
    Height: number, 
    Z?: number
}

/**
 *  An event, events can have any number of listening callbacks, when invoked the callbacks will be run 
 *  in the order they were added.
 */
export class Event<TArgs extends unknown[]>
{
    private _callbacks: ((...args: TArgs) => void)[] = [];

    /**
     * Adds a new callback.
     * 
     * - cb - Callback function
     */
    public Add(cb: (...args: TArgs) => void): void
    {
        this._callbacks.push(cb);
    }

    /**
     * Runs all callback functions.
     * 
     * - args - Callback function args
     */
    public Invoke(...args: TArgs): void
    {
        for (const cb of this._callbacks)
        {
            cb(...args);
        }
    }
}

/**
 * Animatable panel properties
 * 
 * - Color - Interpolates from one color to another using the OKLab color space for smoother blending.  
 * - Alpha - Interpolates panel transparency.
 * - Scale - Interpolates real panel scale, the layouting system will recalculate accordingly.
 * - VisualScale - Interpolates visuals only scale, the layouting system is blind to this.
 * - Width - Interpolates panel width, the layout system will recalculate accordingly.
 * - Height - Interpolates panel height, the layout system will recalculate accordingly.
 */
export enum AnimationValueTypes
{
    Color,
    Alpha,
    Scale,
    VisualScale,
    Width,
    Height,
}

// variable types that animations can interpolate
type AnimationTypes = number | Vec3 | Color;

// a panel property animation
interface Animation<AnimationValues> 
{
    target: AnimationValues;
    speed: number;
    type: AnimationValueTypes;
}

// helps with computing layout along or across the layout axis without having to manually deal with the x/y conversions
interface AxisHelper {
    alongSize(): number;
    acrossSize(): number;
    setAlong(v: number): void;
    setAcross(v: number): void;
    alongSizeType: SizeType | number;
    acrossSizeType: SizeType | number;
    alongPadding: number;
    acrossPadding: number;
    alongPaddingStart: number;
    acrossPaddingStart: number;
}

// UI wide per player state
interface PlayerState
{
    isClicking: boolean;
    clickingChanged: boolean;
}

// panel specific per player state
interface PlayerInteraction
{
    HoveredBy: Set<CSPlayerPawn>,
    ClickingBy: Set<CSPlayerPawn>,
    MousePosByPlayer: Map<CSPlayerPawn, Vec3>,
    MouseMovingBy: Set<CSPlayerPawn>
}

/** Find a UI by name, supports wildcards */
export function GetUI(name: string): UI | undefined
{
    for (const ui of UIArray) 
    {
        if (MatchNamePattern(name, ui.Name))
        {
            return ui;
        }
    }

    return undefined;
}

/** Find multiple UIs by name, supports wildcards */
export function GetUIs(name: string): UI[]
{
    const returnArray: UI[] = [];

    for (const ui of UIArray) 
    {
        if (MatchNamePattern(name, ui.Name))
        {
            returnArray.push(ui);
        }
    }

    return returnArray;
}

/**
 * Main UI class
 */
export class UI
{
    /** Root is the first panel in the UI hierarchy.*/
    public Root?: BaseUIPanel;

    /** World space origin of the entire UI.*/
    public Origin: Vec3 = Vec3.Zero;

    /** World space angles of the entire UI.*/
    public Angles: Euler = Euler.Zero;

    /**
     * World space scale of the entire UI, this does not affect the size units used to size panels,
     * a 10 unit wide panel in a UI with a scale of 2 will have a final world size of 20 units
     */
    public Scale: number = 1;

    /**
     * Panel render brightness for particle based panels
     */
    public Brightness: number = 1;

    /** X axis alignment of the entire UI relative to its world space origin, uses Root panel size to align.*/
    public AlignX: AlignXType = AlignX.Left;
    /** Y axis alignment of the entire UI relative to its world space origin, uses Root panel size to align.*/
    public AlignY: AlignYType = AlignY.Top;
    
    /** Optional name of this UI */
    public get Name(): string | undefined
    {
        return this._Name;
    }
    private _Name: string | undefined;

    constructor(name: string | undefined = undefined)
    {
        this._Name = name;
        UIArray.push(this);
    }

    /**
     * Adds a player to the UI, multiple players can use the UI at the same time.  
     * Input is handled per player.
     */
    public AddPlayer(pawn: CSPlayerPawn): void
    {
        if (!this._Players.has(pawn))
        {
            this._Players.set(pawn, { isClicking: false, clickingChanged: false });
        }
    }

    /**
     * Removes a player from the UI.
     */
    public RemovePlayer(pawn: CSPlayerPawn): void
    {
        this._Players.delete(pawn);
        this._InputLockByPlayer.delete(pawn);

        // remove any lingering player state on every panel
        if (this.Root !== undefined)
        {
            this.Root.CleanupPlayer(pawn);
        }
    }

    /**
     * Get all the players currently using this UI.
     */
    public get Players(): ReadonlyMap<CSPlayerPawn, PlayerState>
    {
        return this._Players;
    }
    private readonly _Players: Map<CSPlayerPawn, PlayerState> = new Map();

    /**
     * Get the control that the player has input lock over.
     */
    public GetInputLock(player: CSPlayerPawn): BaseUIPanel | undefined
    {
        return this._InputLockByPlayer.get(player);
    }

    /**
     * Set the control that the player will have input lock over.
     */
    public SetInputLock(player: CSPlayerPawn, panel: BaseUIPanel): void
    {
        this._InputLockByPlayer.set(player, panel);
    }

    /**
     * Clears input lock for the player.
     */
    public ClearInputLock(player: CSPlayerPawn): void
    {
        this._InputLockByPlayer.delete(player);
    }

    // handles storing control input locks per player, input lock means only that control receives input
    // after being clicked until the click is released
    private readonly _InputLockByPlayer: Map<CSPlayerPawn, BaseUIPanel> = new Map();

    public get Dead(): boolean
    {
        return this._Dead;
    }
    private _Dead: boolean = false;

    /**
     * Enters cleanup mode, removes itself from UIArray and all panels will delete their game entity "renderable" components.  
     */
    public Kill()
    {
        if (this._Dead) return;

        this._Dead = true;
        this.Root?.Kill();
        this.Root = undefined;
        ArrayRemoveByRef<UI>(UIArray, this);
    }

    /**
     * Find a single panel in the UI hierarchy by name.
     */
    public GetPanel(name: string): BaseUIPanel | undefined
    {
        if (this.Root?.Name === name)
        {
            return this.Root;
        }

        return this.Root?.GetPanel(name);
    }

    /**
     * Finds all panels in the hierarchy matching the name, supports * wild cards.   
     */
    public GetPanels(name: string): BaseUIPanel[]
    {
        return this.Root?.GetPanels(name) ?? [];
    }

    /**
     * If this is true, then you must call Think() manually from your own code.
     */
    public ManualThink: boolean = false;
    
    /**
     * Main think function, you should call this once per tick in your own think loop.  
     * Calls into panel think recursively for every panel, starting from Root.
     */
    public Think(): void
    {
        if (this.Root === undefined)
        {
            this.Kill();
            return;
        }
        
        if (this.Dead)
        {
            return;
        }

        for (const [pawn, state] of this._Players)
        {
            if (pawn === undefined || !pawn.IsValid())
            {
                this.RemovePlayer(pawn);
                continue;
            }

            const isClicking = IsPlayerClicking(pawn);

            state.clickingChanged = isClicking !== state.isClicking;
            state.isClicking = isClicking;
        }

        this.Root.Think();
    }
}

interface UIPanelRenderProps
{
    width: number;
    height: number;
    color: Color;
    brightness: number;
    origin: Vec3;
    angles: Euler;
}

/**
 * Main abstract UI panel class, does not handle rendering.  
 * All specialised panels inherit from this.
 */
export abstract class BaseUIPanel
{
    /**
     * The {@link UI} that this panel is a part of. 
     */
    public readonly UI: UI;

    /**
     * The render color of this panel.
     */
    public Color: Color = { r: 255, g: 255, b: 255, a: 255 };
    
    /**
     * Panel Z index, panels with a higher z index get offset more from the surface of their parents, one Z index increment is {@link PANEL_Z_INCREMENT}
     */
    public ZIndex: number = 1;

    /**
     * Get the name of this panel.
     */
    public get Name(): string | undefined
    {
        return this._Name;
    }
    private _Name?: string;

    /**
     * Get the parent of this panel.
     */
    public get Parent(): BaseUIPanel | undefined 
    {
        return this._Parent; 
    }

    /**
     * Set the parent of this panel
     */
    public set Parent(parent: BaseUIPanel)
    {
        if (this._Parent !== undefined)
        {
            ArrayRemoveByRef<BaseUIPanel>(this._Parent._Children, this);
        }

        this._Parent = parent;
        this._Parent._Children.push(this);
    }

    private _Parent?: BaseUIPanel;

    /**
     * Get all children of this panel.
     */
    public get Children(): BaseUIPanel[] 
    {
        return this._Children; 
    }
    private readonly _Children: BaseUIPanel[] = [];

    constructor(parent: BaseUIPanel | UI, name: string | undefined = undefined)
    {
        this._Name = name;

        this._Dummy = SpawnSingleEntityTemplate("*CSUI.dummy.template");

        if (parent instanceof UI)
        {
            this.UI = parent;
            this.UI.Root = this;
        }
        else
        {
            this.Parent = parent;
            this.UI = parent.UI;
        }
    }

    // used to tell if the round restarted
    private _Dummy: Entity | undefined;

    protected _LastRenderProps: UIPanelRenderProps[] = [];

    protected RenderPropsChanged(currentProps: UIPanelRenderProps, lastProps: UIPanelRenderProps | undefined): boolean
    {
        if (currentProps.brightness !== lastProps?.brightness)
        {
            return true;
        }

        if (currentProps.width !== lastProps?.width)
        {
            return true;
        }
        
        if (currentProps.height !== lastProps?.height)
        {
            return true;
        }

        if (!currentProps.origin.equals(lastProps?.origin))
        {
            return true;
        }

        if (!currentProps.angles.equals(lastProps?.angles))
        {
            return true;
        }

        if (currentProps.color.r !== lastProps?.color.r || 
            currentProps.color.g !== lastProps?.color.g ||
            currentProps.color.b !== lastProps?.color.b ||
            currentProps.color.a !== lastProps?.color.a
        )
        {
            return true;
        }

        return false;
    }

    // abstract methods
    protected abstract Render(worldTransforms: Transforms): void;
    protected abstract Cleanup(): void;

    // for subclasses that have intrinsic content size like text, called during MeasurePanel after children have been measured but before
    // the panel's own Size.Fit dimensions are resolved
    // return the natural { width, height } of the content at scale = 1, return undefined to use the normal child based measurement
    protected MeasureContent(): { width: number; height: number } | undefined
    {
        return undefined;
    }

    private _Internal: boolean = false;

    /**
     * Is this an internal panel? Internal panels are meant for compound controls where the internal implementation panels shouldn't be messed with.  
     * It will make it so this panel can not be found by any of the GetPanel(s) function.
     */
    public get Internal(): boolean
    {
        return this._Internal;
    }

    public set Internal(val: boolean)
    {
        this._Internal = val;
    }

    /**
     * Find a single panel in the UI hierarchy by name.
     */
    public GetPanel(name: string): BaseUIPanel | undefined
    {
        if (this.Name === name && !this.Internal)
        {
            return this;
        }
        
        for (const panel of this.Children) 
        {
            const childPanel = panel.GetPanel(name);   
            
            if (childPanel !== undefined)
            {
                return childPanel;
            }
        }
    }

    /** Finds all panels in the hierarchy matching the name, supports * wild cards */
    public GetPanels(name: string): BaseUIPanel[]
    {
        const panels: BaseUIPanel[] = [];

        this.GetPanelsInternal(name, panels);

        return panels;
    }

    private GetPanelsInternal(name: string, panels: BaseUIPanel[])
    {
        if (MatchNamePattern(name, this.Name) && !this.Internal)
        {
            panels.push(this);
        }
        
        for (const panel of this.Children) 
        {
            panel.GetPanelsInternal(name, panels);
        }
    }

    /**
     * When true, holding the mouse button while hovering this panel will lock all input to it for that player
     * until the button is released.
     */
    public LockInput: boolean = false;

    /**
     * Gets the current {@link Layout} object of this panel.
     */
    public get Layout(): Layout
    {
        return this._Layout;
    }

    /**
     * Sets the current {@link Layout} object of this panel.  
     * Missing params will be defaulted to {@link BaseUIPanel.DefaultLayout}.
     */
    public set Layout(layout: Partial<Layout>)
    {
        this._Layout = { ...BaseUIPanel.DefaultLayout, ...layout };
    }

    private static readonly DefaultLayout: Layout = {
        Width: 50,
        Height: 50,
        Flow: Flow.LeftRight,
        Padding: 0,
        ChildGap: 0,
        AlignX: AlignX.Center,
        AlignY: AlignY.Center,
    };

    private _Layout: Layout = { ...BaseUIPanel.DefaultLayout };

    // written after layouting
    protected readonly LayoutedTransforms: Transforms = { Origin: Vec3.Zero, Width: 0, Height: 0 };

    /**
     * Panel render brightness for particle based panels
     */
    public Brightness: number = 1;

    /**
     * Overloaded function for starting animations.
     * 
     * - target - Target variable to animate towards.
     * - speed - Speed of interpolation from 0 to 1, 0 is no animation, 1 is instant snap.
     * - type - Panel property to animate, see {@link AnimationValueTypes}.
     */
    public Animate(target: Color, speed: number, type: AnimationValueTypes.Color): void;
    public Animate(target: number, speed: number, type: AnimationValueTypes.Color): void;
    public Animate(target: number, speed: number, type: AnimationValueTypes.Alpha): void;
    public Animate(target: number, speed: number, type: AnimationValueTypes.Scale): void;
    public Animate(target: number, speed: number, type: AnimationValueTypes.VisualScale): void;
    public Animate(target: number, speed: number, type: AnimationValueTypes.Width): void;
    public Animate(target: number, speed: number, type: AnimationValueTypes.Height): void;

    public Animate(target: AnimationTypes, speed: number, type: AnimationValueTypes): void 
    {
        const existing = this.Animations.find(a => a.type === type);
        if (existing) 
        {
            existing.target = target;
            existing.speed = speed;
        }
        else 
        {
            this.Animations.push({ target, speed, type });
        }
    }

    private Animations: Animation<unknown>[] = [];

    /** Called when the mouse first enters this panel */
    public readonly OnMouseEnter = new Event<[BaseUIPanel, CSPlayerPawn]>();

    /** Called when the mouse leaves this panel */
    public readonly OnMouseLeave = new Event<[BaseUIPanel, CSPlayerPawn]>();

    /** Called when the mouse is pressed on this panel */
    public readonly OnMouseDown = new Event<[BaseUIPanel, CSPlayerPawn]>();

    /** Called when the mouse is released after being pressed on this panel */
    public readonly OnMouseUp = new Event<[BaseUIPanel, CSPlayerPawn]>();

    /** Called when the mouse is moved on this panel */
    public readonly OnMouseMoved = new Event<[BaseUIPanel, CSPlayerPawn]>();
    
    /** Called after layouting but before rendering every tick. */
    public readonly OnThink = new Event<[BaseUIPanel, Transforms]>();

    /** Is pawn cursor over this panel?*/
    public IsHoveredBy(player: CSPlayerPawn): boolean
    {
        return this.PlayerInteraction.HoveredBy.has(player);
    }

    /** Is pawn clicking this panel?*/
    public IsClickingBy(player: CSPlayerPawn): boolean
    {
        return this.PlayerInteraction.ClickingBy.has(player);
    }

    /** Get mouse position of the pawn, if pawn is not using the UI or is invalid returns undefined. */
    public GetMousePos(player: CSPlayerPawn | undefined): Vec3 | undefined
    {
        if (player === undefined || !player.IsValid()) return undefined;

        return this.PlayerInteraction.MousePosByPlayer.get(player) ?? undefined;
    }

    /** Is pawn cursor moving over this panel? Fired if the cursor pos from last tick doesn't match current tick.*/
    public IsMouseMovingBy(player: CSPlayerPawn): boolean
    {
        return this.PlayerInteraction.MouseMovingBy.has(player);
    }

    /** True if at least one player is hovering. */
    public get AnyHovered(): boolean 
    {
        return this.PlayerInteraction.HoveredBy.size > 0; 
    }

    /** True if at least one player is clicking. */
    public get AnyClicking(): boolean 
    {
        return this.PlayerInteraction.ClickingBy.size > 0; 
    }

    /** Get current world width of the panel, after layouting.*/
    public get WorldWidth(): number
    {
        return this.LayoutedTransforms.Width * this.InheritedScale;
    }

    /** Get current world height of the panel, after layouting.*/
    public get WorldHeight(): number
    {
        return this.LayoutedTransforms.Height * this.InheritedScale;
    }

    /** Current world space scale of this panel, taking into account scales of all parents.*/
    public get InheritedScale(): number
    {
        const ownScale = this.Layout.Scale ?? 1;
        const parentScale = this._Parent?.InheritedScale ?? 1;
        return parentScale * ownScale * (this.Layout.VisualScale ?? 1);
    }

    private _Dead: boolean = false;
    public Kill()
    {
        if (this._Dead) return;

        this._Dead = true;

        this.Cleanup();

        if (this._Dummy !== undefined && this._Dummy.IsValid())
        {
            this._Dummy.Remove();
        }
        this._Dummy = undefined;

        for (const child of this._Children)
        {
            child.Kill();
        }

        if (this.UI.Root === this)
        {
            this.UI.Root = undefined;
        }
    }

    /**
     * Called once every tick recursively.  
     * You can manually call this if you need to instantly update state within the same tick.
     */
    public Think(parentWorldTransforms?: Transforms): void
    {
        if (this._Dead)
        {
            return;
        }
        
        if (this._Dummy === undefined || !this._Dummy.IsValid() || this.UI.Dead)
        {
            this.Kill();
            return;
        }

        // cleanup axis helper for this UI pass, they get lazily cached on first call of GetAxisHelper()
        this._AxisHelper = undefined;

        // if we have no parent (we are root)
        // set off the recursive calls that will measure and position the entire UI
        if (this.Parent === undefined)
        {
            this.MeasurePanel();
            this.DistributeGrow();
            this.PositionPanel(0, 0);
        }

        for (let i = this.Animations.length - 1; i >= 0; i--)
        {
            this.HandleAnimation(this.Animations[i]);
        }

        const transforms = this.CalculateFinalWorldTransforms(parentWorldTransforms);

        this.OnThink.Invoke(this, transforms);

        if (DEBUG)
        {
            const tl = this.LocalToWorld(new Vec3(0, 0, 0), transforms);
            const tr = this.LocalToWorld(new Vec3(1, 0, 0), transforms);
            const br = this.LocalToWorld(new Vec3(1, 1, 0), transforms);
            const bl = this.LocalToWorld(new Vec3(0, 1, 0), transforms);

            const color = this.GetDebugColor();
            const duration = 1 / 64;

            Instance.DebugLine({ start: tl, end: tr, duration, color });
            Instance.DebugLine({ start: tr, end: br, duration, color });
            Instance.DebugLine({ start: br, end: bl, duration, color });
            Instance.DebugLine({ start: bl, end: tl, duration, color });
        }

        this.Render(transforms);

        for (const [pawn, state] of this.UI.Players)
        {
            this.HandleInteractionForPlayer(pawn, state, transforms);
        }

        for (const child of this._Children)
        {
            child.Think(transforms);
        }
    }

    private HandleAnimation(anim: Animation<unknown>)
    {
        let done: boolean;

        switch (anim.type)
        {
            case AnimationValueTypes.Color:
            {
                const raw = anim.target;
                const t: Color = typeof raw === "number"
                    ? { r: raw, g: raw, b: raw, a: this.Color.a }
                    : raw as Color;
                const r = LerpColor(this.Color, t, anim.speed);
                this.Color = r.value;
                done = r.done;
                break;
            }

            case AnimationValueTypes.Alpha:
            {
                const r = LerpNum(this.Color.a, anim.target as number, anim.speed);
                this.Color.a = r.value;
                done = r.done;
                break;
            }

            case AnimationValueTypes.Scale:
            {
                const r = LerpNum(this.Layout.Scale ?? 1, anim.target as number, anim.speed);
                this.Layout.Scale = r.value;
                done = r.done;
                break;
            }

            case AnimationValueTypes.VisualScale:
            {
                const r = LerpNum(this.Layout.VisualScale ?? 1, anim.target as number, anim.speed);
                this.Layout.VisualScale = r.value;
                done = r.done;
                break;
            }

            case AnimationValueTypes.Width:
            {
                const r = LerpNum((this.Layout.Width as number) ?? 1, anim.target as number, anim.speed);
                this.Layout.Width = r.value;
                done = r.done;
                break;
            }

            case AnimationValueTypes.Height:
            {
                const r = LerpNum((this.Layout.Height as number) ?? 1, anim.target as number, anim.speed);
                this.Layout.Height = r.value;
                done = r.done;
                break;
            }
        }

        if (done) 
        {
            ArrayRemoveByRef<Animation<unknown>>(this.Animations, anim);
        }
    }
    
    // instead of calculating layout different for width and height directly, we can calculate "along" or "across" the layout axis
    // conceptually with this approach layouting UI is mostly a 1 dimensional problem (ignoring grid layouts)
    private _AxisHelper?: AxisHelper;

    private BuildAxisHelper(): AxisHelper
    {
        const { pL, pR, pT, pB } = GetPadding(this.Layout.Padding);
        const h = this.Layout.Flow === Flow.LeftRight;
    
        return {
            alongSize:          () => h ? this.LayoutedTransforms.Width : this.LayoutedTransforms.Height,
            acrossSize:         () => h ? this.LayoutedTransforms.Height : this.LayoutedTransforms.Width,

            setAlong:  (v) => 
            {
                if (h) this.LayoutedTransforms.Width = v; else this.LayoutedTransforms.Height = v; 
            },

            setAcross: (v) => 
            {
                if (h) this.LayoutedTransforms.Height = v; else this.LayoutedTransforms.Width = v; 
            },

            alongSizeType:  h ? this.Layout.Width : this.Layout.Height,
            acrossSizeType: h ? this.Layout.Height : this.Layout.Width,

            alongPadding:      h ? pL + pR : pT + pB,
            acrossPadding:     h ? pT + pB : pL + pR,
            alongPaddingStart: h ? pL : pT,
            acrossPaddingStart: h ? pT : pL,
        };
    }

    protected GetAxisHelper(): AxisHelper
    {
        if (this._AxisHelper === undefined)
        {
            this._AxisHelper = this.BuildAxisHelper();
        }
        return this._AxisHelper;
    }

    // measure initial sizes of all panels
    private MeasurePanel()
    {
        for (const child of this.Children)
        {
            child.MeasurePanel();
        }

        const axisHelper = this.GetAxisHelper();
        const gap = this.Layout.ChildGap ?? 0;
        const scale = this.Layout.Scale ?? 1;

        // check if this panel has intrinsic content (like text) that should drive its Size.Fit dimensions instead of child based measurement
        const intrinsic = this.MeasureContent();

        if (intrinsic !== undefined)
        {
            // intrinsic content panels behave like leaf nodes, children dont contribute to sizing
            if (axisHelper.alongSizeType === Size.Fit || axisHelper.alongSizeType === Size.Grow)
            {
                // Grow is resolved later in DistributeGrow; for Fit we use intrinsic width.
                if (axisHelper.alongSizeType === Size.Fit)
                {
                    axisHelper.setAlong((axisHelper.alongPaddingStart * 2 + intrinsic.width) * scale);
                }
                else
                {
                    axisHelper.setAlong(0); // will be filled in by DistributeGrow
                }
            }
            else
            {
                axisHelper.setAlong((axisHelper.alongSizeType) * scale);
            }

            if (axisHelper.acrossSizeType === Size.Fit || axisHelper.acrossSizeType === Size.Grow)
            {
                if (axisHelper.acrossSizeType === Size.Fit)
                {
                    axisHelper.setAcross((axisHelper.acrossPaddingStart * 2 + intrinsic.height) * scale);
                }
                else
                {
                    axisHelper.setAcross(0); // will be filled in by DistributeGrow
                }
            }
            else
            {
                axisHelper.setAcross((axisHelper.acrossSizeType) * scale);
            }

            return;
        }

        // skip out of flow children (relative or absolute positioning)
        const inFlowChildren = this.Children.filter(c => !IsOutOfFlow(c));

        // total child gap is related to the fence post problem, where total amount of child gap is the amount of children - 1
        // we can begin with this because it wont change based on anything but child count, which we already know
        let alongContentSize = Math.max(inFlowChildren.length - 1, 0) * gap;
        let acrossContentSize = 0;

        const horizontal = this.Layout.Flow === Flow.LeftRight;
        
        for (const child of inFlowChildren)
        {
            // grow children dont contribute to sizing right now, DistributeGrow pass will assign their size later

            const childAlongSize = horizontal ? child.LayoutedTransforms.Width : child.LayoutedTransforms.Height;
            const childAlongSizeType = horizontal ? child.Layout.Width : child.Layout.Height;
            const childAcrossSize = horizontal ? child.LayoutedTransforms.Height : child.LayoutedTransforms.Width;
            const childAcrossSizeType = horizontal ? child.Layout.Height : child.Layout.Width;

            if (childAlongSizeType !== Size.Grow)
            {
                // along the layout direction, we just add together the sizes of children, their gap is already counted above
                alongContentSize += childAlongSize;
            }

            if (childAcrossSizeType !== Size.Grow)
            {
                // across the layout direction, we simply want the size of the biggest child
                acrossContentSize = Math.max(acrossContentSize, childAcrossSize);
            }
        }

        if (axisHelper.alongSizeType === Size.Fit && inFlowChildren.some(c => horizontal ? c.Layout.Width === Size.Grow : c.Layout.Height === Size.Grow))
        {
            Instance.Msg("UI: GROW children inside a FIT parent have no space to grow into");
        }

        switch (axisHelper.alongSizeType)
        {
            case Size.Fit: axisHelper.setAlong((axisHelper.alongPadding + alongContentSize) * scale); break;
            case Size.Grow: axisHelper.setAlong(0); break;
            default: axisHelper.setAlong(axisHelper.alongSizeType * scale); break;
        }

        switch (axisHelper.acrossSizeType)
        {
            case Size.Fit: axisHelper.setAcross((axisHelper.acrossPadding + acrossContentSize) * scale); break;
            case Size.Grow: axisHelper.setAcross(0); break;
            default: axisHelper.setAcross(axisHelper.acrossSizeType * scale); break;
        }
    }

    // runs top-down after MeasurePanel so that each panel's own size is already known
    // before it tries to distribute space to its Grow children.
    private DistributeGrow(): void
    {
        const axisHelper = this.GetAxisHelper();
        const horizontal = this.Layout.Flow === Flow.LeftRight;

        const acrossInterior = axisHelper.acrossSize() - axisHelper.acrossPadding;

        // skip out of flow children (relative or absolute positioning)
        const inFlowChildren = this.Children.filter(c => !IsOutOfFlow(c));

        // along axis: collect grow children and size taken up by fixed children, then distribute remaining space
        let alongFixed = Math.max(inFlowChildren.length - 1, 0) * (this.Layout.ChildGap ?? 0);
        const growChildren: BaseUIPanel[] = [];
        
        for (const child of inFlowChildren)
        {
            const childAlongSizeType = horizontal ? child.Layout.Width : child.Layout.Height;
            if (childAlongSizeType === Size.Grow)
            {
                growChildren.push(child);
            }
            else
            {
                alongFixed += horizontal ? child.LayoutedTransforms.Width : child.LayoutedTransforms.Height;
            }
        }

        if (growChildren.length > 0)
        {
            // subtract padding and space taken up by children from total space to get free space
            const freeSpace = axisHelper.alongSize() - axisHelper.alongPadding - alongFixed;
            // distribute free space equally to all grow children
            // TODO: add a css like flex-grow option to bias grow children sizes
            const share = freeSpace / growChildren.length;
            for (const child of growChildren)
            {
                if (horizontal) child.LayoutedTransforms.Width = share; else child.LayoutedTransforms.Height = share;
            }
        }
        
        // cross axis: grow children simply fill the available interior space
        for (const child of inFlowChildren)
        {
            const childCrossSizeType = horizontal ? child.Layout.Height : child.Layout.Width;
            if (childCrossSizeType === Size.Grow)
            {
                if (horizontal) child.LayoutedTransforms.Height = acrossInterior; else child.LayoutedTransforms.Width = acrossInterior;
            }
        }
    
        // recurse so children can distribute grow space to their own grow children
        for (const child of this.Children)
        {
            child.DistributeGrow();
        }
    }

    // position the panels after they have been sized
    private PositionPanel(x: number, y: number) 
    {
        const parentWidth = this.Parent?.LayoutedTransforms.Width ?? 1;
        const parentHeight = this.Parent?.LayoutedTransforms.Height ?? 1;
        
        // sizing in final UI space will be normalised
        this.LayoutedTransforms.Origin.x = x / parentWidth;
        this.LayoutedTransforms.Origin.y = y / parentHeight;

        const axisHelper = this.GetAxisHelper();
        const horizontal = this.Layout.Flow === Flow.LeftRight;
        const gap = this.Layout.ChildGap ?? 0;

        // skip out of flow children (relative or absolute positioning)
        const inFlowChildren = this.Children.filter(c => !IsOutOfFlow(c));

        // measure total child content size along and across the flow axis, including gaps between children (fence post: n-1 gaps for n children)
        let alongContent = Math.max(inFlowChildren.length - 1, 0) * gap;
        let crossContent = 0;

        for (const child of inFlowChildren) 
        {
            alongContent += horizontal ? child.LayoutedTransforms.Width : child.LayoutedTransforms.Height;
            crossContent = Math.max(crossContent, horizontal ? child.LayoutedTransforms.Height : child.LayoutedTransforms.Width);
        }

        // interior space available for children after removing padding
        const alongInner = axisHelper.alongSize() - axisHelper.alongPadding;
        const crossInner = axisHelper.acrossSize() - axisHelper.acrossPadding;

        // compute starting offset along the flow axis based on alignment, shifting children into the center or end of the available interior space
        let alongOffset = axisHelper.alongPaddingStart;

        if (horizontal)
        {
            if (this.Layout.AlignX === AlignX.Center) 
            {
                alongOffset += (alongInner - alongContent) / 2;
            }
            else if (this.Layout.AlignX === AlignX.Right) 
            {
                alongOffset += (alongInner - alongContent);
            }
        }
        else
        {
            if (this.Layout.AlignY === AlignY.Center) 
            {
                alongOffset += (alongInner - alongContent) / 2;
            }
            else if (this.Layout.AlignY === AlignY.Bottom) 
            {
                alongOffset += (alongInner - alongContent);
            }
        }

        // position each child, advancing the 'along' cursor by child size + gap after each
        for (const child of inFlowChildren) 
        {
            const childAlong = horizontal ? child.LayoutedTransforms.Width : child.LayoutedTransforms.Height;
            const childCross = horizontal ? child.LayoutedTransforms.Height : child.LayoutedTransforms.Width;

            // each child is independently aligned on the cross axis
            let crossOffset = axisHelper.acrossPaddingStart;

            if (horizontal)
            {
                const crossAlignment = this.Layout.AlignY; 

                if (crossAlignment === AlignY.Center) 
                {
                    crossOffset += (crossInner - childCross) / 2;
                }
                else if (crossAlignment === AlignY.Bottom) 
                {
                    crossOffset += (crossInner - childCross);
                }
            } 
            else
            {
                const crossAlignment = this.Layout.AlignX; 

                if (crossAlignment === AlignX.Center) 
                {
                    crossOffset += (crossInner - childCross) / 2;
                }
                else if (crossAlignment === AlignX.Right) 
                {
                    crossOffset += (crossInner - childCross);
                }
            }

            const childX = (horizontal ? alongOffset : crossOffset);
            const childY = (horizontal ? crossOffset : alongOffset);

            child.PositionPanel(childX, childY);

            alongOffset += childAlong + gap;
        }

        // out of layout pass for absolute and relative positioning
        for (const child of this.Children)
        {
            if (!IsOutOfFlow(child)) continue;

            const ax = child.Layout.AlignX;
            const ay = child.Layout.AlignY;

            let childX: number = 0;
            let childY: number = 0;

            if (typeof ax === "object")
            {
                if (ax.type === "Absolute")
                {
                    childX = ax.value;
                }

                if (ax.type === "Relative")
                {
                    childX = ax.value * this.LayoutedTransforms.Width;
                }
            }

            if (typeof ay === "object")
            {
                if (ay.type === "Absolute")
                {
                    childY = ay.value;
                }

                if (ay.type === "Relative")
                {
                    childY = ay.value * this.LayoutedTransforms.Height;
                }
            }

            child.PositionPanel(childX, childY);
        }
    }

    private PlayerInteraction: PlayerInteraction = {

        HoveredBy: new Set<CSPlayerPawn>(),
        ClickingBy: new Set<CSPlayerPawn>(),
        MousePosByPlayer: new Map<CSPlayerPawn, Vec3>(),
        MouseMovingBy: new Set<CSPlayerPawn>(),
    };

    /** Called by UI.RemovePlayer to purge a disconnected player's state. */
    public CleanupPlayer(player: CSPlayerPawn): void
    {
        if (this.PlayerInteraction.HoveredBy.delete(player))
        {
            this.OnMouseLeave.Invoke(this, player);
        }

        this.PlayerInteraction.ClickingBy.delete(player);
        this.PlayerInteraction.MousePosByPlayer.delete(player);
        this.PlayerInteraction.MouseMovingBy.delete(player);

        for (const child of this._Children)
        {
            child.CleanupPlayer(player);
        }
    }

    private HandleInteractionForPlayer(player: CSPlayerPawn, state: PlayerState, worldTransforms: Transforms): void
    {
        // if another panel holds the input lock for this player, skip all interaction on this panel
        const lockHolder = this.UI.GetInputLock(player);
        if (lockHolder !== undefined && lockHolder !== this)
        {
            // ensure we clear any stale hover/click state that may have been set before the lock was acquired
            if (this.PlayerInteraction.HoveredBy.delete(player))
            {
                this.OnMouseLeave.Invoke(this, player);
            }
            this.PlayerInteraction.ClickingBy.delete(player);
            this.PlayerInteraction.MouseMovingBy.delete(player);
            return;
        }

        const edges0 = worldTransforms.Origin;
        const edges1 = edges0.add(this.UI.Angles.left.multiply(worldTransforms.Width));
        const edges2 = edges0.add(this.UI.Angles.down.multiply(worldTransforms.Height));

        const linePos = new Vec3(player.GetEyePosition());
        const lineAng = new Euler(player.GetEyeAngles());

        const barycentricUVT = ComputeIntersectionBarycentricCoordinates(linePos, linePos.add(lineAng.forward.multiply(10000)), edges0, edges1, edges2);

        const isHit = 
            barycentricUVT !== undefined
            && barycentricUVT.t >= 0.0
            && barycentricUVT.u >= 0.0
            && barycentricUVT.v >= 0.0
            && barycentricUVT.u <= 1.0
            && barycentricUVT.v <= 1.0;

        const weHoldLock = lockHolder === this;

        if (!isHit && !weHoldLock)
        {
            if (this.PlayerInteraction.HoveredBy.delete(player))
            {
                this.OnMouseLeave.Invoke(this, player);
                this.PlayerInteraction.ClickingBy.delete(player);

                if (state.isClicking)
                {
                    this.OnMouseUp.Invoke(this, player);
                }
            }

            this.PlayerInteraction.MouseMovingBy.delete(player);
            return;
        }

        // cursor is over this panel or we hold the lock
        if (isHit && !this.PlayerInteraction.HoveredBy.has(player))
        {
            this.PlayerInteraction.HoveredBy.add(player);
            this.OnMouseEnter.Invoke(this, player);
        }

        if (state.clickingChanged)
        {
            if (state.isClicking)
            {
                this.PlayerInteraction.ClickingBy.add(player);
                this.OnMouseDown.Invoke(this, player);

                if (this.LockInput)
                {
                    this.UI.SetInputLock(player, this);
                }
            }
            else
            {
                this.PlayerInteraction.ClickingBy.delete(player);
                this.OnMouseUp.Invoke(this, player);

                // release the lock when the mouse button is released
                if (weHoldLock)
                {
                    this.UI.ClearInputLock(player);

                    // if the cursor is no longer over us, fire a leave now that the lock is gone
                    if (!isHit && this.PlayerInteraction.HoveredBy.delete(player))
                    {
                        this.OnMouseLeave.Invoke(this, player);
                    }
                }
            }
        }

        // normal hit: use the exact barycentric UV
        // lock held and ray still intersects the panel plane: clamp uv to 0..1
        const rayOnPlane = barycentricUVT !== undefined && barycentricUVT.t >= 0.0 && barycentricUVT.t <= 1.0;
        const resolvedPos = isHit
            ? new Vec3(barycentricUVT.u, barycentricUVT.v, 0)
            : (weHoldLock && rayOnPlane) ? new Vec3(Math.max(0, Math.min(1, barycentricUVT.u)), Math.max(0, Math.min(1, barycentricUVT.v)), 0) : undefined;

        if (resolvedPos !== undefined)
        {
            const prevPos = this.PlayerInteraction.MousePosByPlayer.get(player);

            if (prevPos === undefined || !resolvedPos.equals(prevPos))
            {
                this.PlayerInteraction.MousePosByPlayer.set(player, resolvedPos);
                this.PlayerInteraction.MouseMovingBy.add(player);
                this.OnMouseMoved.Invoke(this, player);
            }
            else
            {
                this.PlayerInteraction.MouseMovingBy.delete(player);
            }
        }
        else
        {
            this.PlayerInteraction.MouseMovingBy.delete(player);
        }
    }

    private CalculateFinalWorldTransforms(parentWorldTransforms?: Transforms): Transforms
    {        
        const parentOrigin = parentWorldTransforms !== undefined ? parentWorldTransforms.Origin : (() =>
        {
            // when we are root, shift the UI origin based on the alignment settings
            const w = this.LayoutedTransforms.Width * this.UI.Scale;
            const h = this.LayoutedTransforms.Height * this.UI.Scale;

            let alignOffsetX = 0;
            if (this.UI.AlignX === AlignX.Center) alignOffsetX = -w / 2;
            else if (this.UI.AlignX === AlignX.Right) alignOffsetX = -w;

            let alignOffsetY = 0;
            if (this.UI.AlignY === AlignY.Center) alignOffsetY = -h / 2;
            else if (this.UI.AlignY === AlignY.Bottom) alignOffsetY = -h;

            return this.UI.Origin
                .add(this.UI.Angles.left.multiply(alignOffsetX))
                .add(this.UI.Angles.down.multiply(alignOffsetY));
        })();

        const parentWidth = (this._Parent?.LayoutedTransforms.Width ?? 1) * this.UI.Scale;
        const parentHeight = (this._Parent?.LayoutedTransforms.Height ?? 1) * this.UI.Scale;

        const ox = (this.LayoutedTransforms.Origin.x * parentWidth);
        const oy = (this.LayoutedTransforms.Origin.y * parentHeight);

        const visualScale = this.Layout.VisualScale ?? 1;
        const layoutWidth = this.LayoutedTransforms.Width * this.UI.Scale;
        const layoutHeight = this.LayoutedTransforms.Height * this.UI.Scale;

        const centerOffsetX = (layoutWidth * (1 - visualScale)) / 2;
        const centerOffsetY = (layoutHeight * (1 - visualScale)) / 2;

        const parentZ = parentWorldTransforms?.Z ?? 0;
        const myZ = parentZ + PANEL_Z_INCREMENT * this.ZIndex;
        const deltaZ = this._Parent !== undefined ? myZ - parentZ : 0;

        const offset = this.UI.Angles.forward.multiply(deltaZ)
            .add(this.UI.Angles.left.multiply(ox + centerOffsetX))
            .add(this.UI.Angles.down.multiply(oy + centerOffsetY));

        return {
            Origin: parentOrigin.add(offset),
            Width:  layoutWidth * visualScale,
            Height: layoutHeight * visualScale,
            Z: myZ,
        };
    }

    /**
     * Transforms a local space point into world space.
     * 
     * - uv - Local space point in 0 to 1 space, where x is horizontal and y is vertical.
     * - worldTransforms - World space Transforms object after layouting.
     */
    public LocalToWorld(uv: Vec3, worldTransforms: Transforms): Vec3 
    {
        const ix = uv.x * worldTransforms.Width;
        const iy = uv.y * worldTransforms.Height;
        
        return this.UI.Angles.left
            .multiply(ix)
            .add(this.UI.Angles.down.multiply(iy))
            .add(worldTransforms.Origin);
    }

    private DebugColor: Color | undefined;

    // get a random color for the debug bounds, color is computed once and stored so it doesn't keep changing every frame
    private GetDebugColor(): Color
    {
        let color = this.DebugColor;
        if (color === undefined)
        {
            color = {
                r: Math.floor(Math.random() * 200) + 55,
                g: Math.floor(Math.random() * 200) + 55,
                b: Math.floor(Math.random() * 200) + 55,
                a: 255,
            };
            this.DebugColor = color;
        }
        return color;
    }
}

export class InvisUIPanel extends BaseUIPanel
{
    protected Render()
    {
    }

    protected Cleanup(): void 
    {
    }
}

export class ModelUIPanel extends BaseUIPanel
{
    private _Visual: BaseModelEntity;
    private ModelUnfuckTicks: number = 0;

    public get Visual(): BaseModelEntity
    {
        return this._Visual;
    }

    constructor(parent: BaseUIPanel | UI, model: BaseModelEntity, width: number, height: number, name: string | undefined = undefined)
    {
        super(parent, name);
        this.Layout.Width = width;
        this.Layout.Height = height;
        this._Visual = model;
    }

    protected Render(worldTransforms: Transforms): void
    {
        // models spawned and moved on same ticks bug out and become invisible
        if (this.ModelUnfuckTicks < 16) 
        {
            this.ModelUnfuckTicks++;
            return;
        }

        const renderProps: UIPanelRenderProps = {
            width: this.InheritedScale * this.UI.Scale,
            height: 0,
            color: this.Color,
            brightness: 0,
            origin: worldTransforms.Origin,
            angles: this.UI.Angles,
        };

        if (!this.RenderPropsChanged(renderProps, this._LastRenderProps[0]))
        {
            return;
        }

        this._Visual.Teleport({ position: worldTransforms.Origin, angles: renderProps.angles });
        this._Visual.SetModelScale(renderProps.width);
        this._Visual.SetColor(renderProps.color);

        this._LastRenderProps[0] = renderProps;
    }

    protected Cleanup(): void 
    {
        SafeKill(this._Visual);
    }
}

export class UIPanel extends BaseUIPanel
{
    private _Visual: Entity;

    public get Visual(): Entity
    {
        return this._Visual;
    }

    constructor(parent: BaseUIPanel | UI, shape: Shape = Shape.Rect, name: string | undefined = undefined)
    {
        super(parent, name);

        let particleTemplateName = "";

        switch (shape) 
        {
            case Shape.Rect:
                particleTemplateName = "*csui.particle.panel.template";
                break;

            case Shape.Ellipse:
                particleTemplateName = "*csui.particle.panel.circle.template";
                break;

            default:
                break;
        }
        
        const particlePanelTemplate = Instance.FindEntityByName(particleTemplateName) as PointTemplate;
        if (particlePanelTemplate === undefined || !particlePanelTemplate.IsValid())
        {
            Log("Failed to find particle panel template");
        }

        const particlePanel = particlePanelTemplate.ForceSpawn();

        if (particlePanel === undefined || particlePanel.length === 0 || !particlePanel[0].IsValid())
        {
            Log("Failed to spawn particle panel");
        }

        this._Visual = particlePanel![0];

        Instance.EntFireAtTarget({ target: this.Visual, input: "start" });
    }

    protected Render(worldTransforms: Transforms): void
    {
        const renderProps: UIPanelRenderProps = {
            width: worldTransforms.Width,
            height: worldTransforms.Height,
            color: this.Color,
            brightness: (this.UI.Brightness * this.Brightness) - 1,
            origin: worldTransforms.Origin,
            angles: this.UI.Angles,
        };

        if (!this.RenderPropsChanged(renderProps, this._LastRenderProps[0]))
        {
            return;
        }

        this._Visual.Teleport({ position: renderProps.origin, angles: renderProps.angles });

        Instance.EntFireAtTarget({ target: this.Visual, input: "SetControlPoint", value: `1: ${renderProps.width} ${renderProps.height} ${renderProps.color.a}` });
        Instance.EntFireAtTarget({ target: this.Visual, input: "SetControlPoint", value: `2: ${renderProps.color.r} ${renderProps.color.g} ${renderProps.color.b}` });
        Instance.EntFireAtTarget({ target: this.Visual, input: "SetControlPoint", value: `3: ${renderProps.brightness} 0 0` });

        this._LastRenderProps[0] = renderProps;
    }

    protected Cleanup(): void 
    {
        SafeKill(this.Visual);
    }
}

export class TextUIPanel extends BaseUIPanel
{
    private Font: Font;
    private ParticleTextPanelTemplate: PointTemplate;
    private TextEnts: Entity[] = [];
    private PoolSize: number = 0;
    
    private _Text: string = "";
    private _Lines: string[] = [];

    public get Text(): string
    {
        return this._Text;
    }

    public set Text(text: string)
    {
        const normalized = NormalizeWhitespace(text);
        if (normalized === this._Text) return;
        this._Text = normalized;

        const needed = this._Text.replace("\n", "").length;

        for (let i = this.PoolSize; i < needed; i++)
        {
            const ent = this.ParticleTextPanelTemplate.ForceSpawn()![0];
            Instance.EntFireAtTarget({ target: ent, input: "start" });
            this.TextEnts.push(ent);
        }

        this.PoolSize = Math.max(this.PoolSize, needed);
    }

    constructor(parent: BaseUIPanel | UI, font: Fonts, text: string, name: string | undefined = undefined)
    {
        super(parent, name);

        // text panels size themselves to fit their content by default
        this.Layout.Width = Size.Fit;
        this.Layout.Height = Size.Fit;

        this.Font = FontsMap.get(font)!;
     
        this.ParticleTextPanelTemplate = Instance.FindEntityByName(`*CSUI.particle.font.panel.${this.Font.FontName}.template`) as PointTemplate;
        if (this.ParticleTextPanelTemplate === undefined || !this.ParticleTextPanelTemplate.IsValid())
        {
            Log("Failed to find particle font panel template! Did you forget to recompile your map (entity only compile will do) after running FontAtlasBuilder?");
        }
        
        this.Text = text;
    }

    // returns the natural size of this text so that parent containers can account for the text size when computing their own sizing
    // if the panel has a fixed Width set, text will be wrapped and the height will reflect the wrapped line count
    // If Width is Size.Fit, the text is treated as a single unwrapped line
    protected override MeasureContent(): { width: number; height: number }
    {
        const lineHeight = this.Font.FontLineHeight;

        // fixed width
        if (this.Layout.Width !== Size.Fit && this.Layout.Width !== Size.Grow)
        {
            const rawWidth = this.Layout.Width;
            const wrappedText = WrapText(this._Text, rawWidth, this.Font);
            const lineCount = (wrappedText.match(/\n/g)?.length ?? 0) + 1;
            return { width: rawWidth, height: lineHeight * lineCount };
        }

        // no width constraint, measure the longest line of the raw text, respecting new lines
        const rawLines = this._Text.split("\n");
        let maxLineWidth = 0;
        for (const line of rawLines)
        {
            maxLineWidth = Math.max(maxLineWidth, this.Font.MeasureText(line));
        }
        
        // small epsilon to avoid numerical imprecision causeing last char to wrap
        return { width: maxLineWidth + 0.01, height: lineHeight * rawLines.length };
    }

    protected Render(worldTransforms: Transforms): void
    {
        const scale = this.InheritedScale;

        this._Lines = WrapText(this._Text, worldTransforms.Width / scale, this.Font).split("\n");

        const totalTextHeight = this._Lines.length * this.Font.FontLineHeight * scale;

        let verticalOffset = 0;
        if (this.Layout.AlignY === AlignY.Center)
        {
            verticalOffset = (worldTransforms.Height - totalTextHeight) / 2;
        }
        else if (this.Layout.AlignY === AlignY.Bottom)
        {
            verticalOffset = worldTransforms.Height - totalTextHeight;
        }
    
        let textEntIndex = 0;

        for (let i = 0; i < this._Lines.length; i++) 
        {
            const line = this._Lines[i];

            // measure this line so we can offset the pen start for X alignment
            let lineWidth = 0;
            for (const char of line)
            {
                lineWidth += this.Font.GetGlyph(char).advance * scale;
            }

            let pen = 0;
            if (this.Layout.AlignX === AlignX.Center) 
            {
                pen = (worldTransforms.Width - lineWidth) / 2;
            }
            else if (this.Layout.AlignX === AlignX.Right)
            {
                pen = worldTransforms.Width - lineWidth;
            }

            for (let j = 0; j < line.length; j++) 
            {
                const char = line[j];
                const glyph = this.Font.GetGlyph(char);

                const glyphWidth = glyph.pixelW * scale;
                const glyphHeight = glyph.pixelH * scale;
                
                const alignmentOffset = (glyphWidth) / 2;

                let index = GetGlyphIndex(char);

                // skip past padding frames, padding frames are added to avoid the particle system showing a ghost of the previous glyph
                // min is needed to ensure last char in atlas displays properly, no clue man
                const maxIndex = 3 * this.Font.CharCount - 1;
                index = Math.min((3 * index + 1) / maxIndex, 0.999);

                const textEnt = this.TextEnts[textEntIndex];
                textEntIndex++;

                const renderProps: UIPanelRenderProps = {
                    width: glyphWidth,
                    height: glyphHeight,
                    color: this.Color,
                    brightness: Math.max(this.UI.Brightness * this.Brightness, 0.5),
                    origin: worldTransforms.Origin
                        .add(this.UI.Angles.left.multiply(pen + alignmentOffset))
                        .add(this.UI.Angles.down.multiply(verticalOffset + (i * this.Font.FontLineHeight * scale))),
                    angles: this.UI.Angles,
                };

                if (!this.RenderPropsChanged(renderProps, this._LastRenderProps[textEntIndex]))
                {
                    return;
                }

                Instance.EntFireAtTarget({ target: textEnt, input: "SetControlPoint", value: `2: ${renderProps.brightness} ${renderProps.color.a} ${index}` });
                Instance.EntFireAtTarget({ target: textEnt, input: "SetControlPoint", value: `3: ${renderProps.height} ${renderProps.width} 0` });
                Instance.EntFireAtTarget({ target: textEnt, input: "SetControlPoint", value: `1: ${renderProps.color.r} ${renderProps.color.g} ${renderProps.color.b}` });
                textEnt.Teleport({ 
                    position: renderProps.origin, 
                    angles: renderProps.angles,
                });

                pen += glyph.advance * scale;

                this._LastRenderProps[textEntIndex] = renderProps;
            }    
        }

        // hide unused pool slots
        for (let i = textEntIndex; i < this.PoolSize; i++)
        {
            Instance.EntFireAtTarget({ 
                target: this.TextEnts[i], 
                input: "SetControlPoint", 
                value: "3: 0 0 0",
            });
        }
    }

    protected Cleanup(): void 
    {
        for (const ent of this.TextEnts)
        {
            SafeKill(ent);
        }
        this.TextEnts.length = 0;
        this.PoolSize = 0;
    }
}

/////// UTILS ///////

// taken from https://github.com/samisalreadytaken/vs_library
function ComputeIntersectionBarycentricCoordinates(rayStart: Vec3, rayEnd: Vec3, v1: Vec3, v2: Vec3, v3: Vec3): { u: number; v: number; t: number } | undefined 
{
    const edge1 = v2.subtract(v1);
    const edge2 = v3.subtract(v1);
    const rayDelta = rayEnd.subtract(rayStart);

    const dirCrossEdge2 = rayDelta.cross(edge2);

    let denom = dirCrossEdge2.dot(edge1);
    if (denom < 1e-6 && denom > -1e-6) return;

    denom = 1.0 / denom;

    const org = rayStart.subtract(v1);
    const orgCrossEdge1 = org.cross(edge1);

    const t = orgCrossEdge1.dot(edge2) * denom;
    if (t > 1.0) return;

    return {
        u: dirCrossEdge2.dot(org) * denom,
        v: orgCrossEdge1.dot(rayDelta) * denom,
        t,
    };
}

/** Take the name of a point_template and return a spawned model.*/
export function SpawnSingleEntityTemplate(templateName: string): Entity
{
    const template = Instance.FindEntityByName(templateName) as PointTemplate;

    if (template === undefined) Log("Failed to find entity template!");

    const ent = template.ForceSpawn()![0];

    if (ent === undefined) Log("Failed to spawn template model!");

    return ent;
}

function LerpNum(c: number, t: number, speed: number): { value: number; done: boolean }
{
    const n = c + (t - c) * speed;
    const done = Math.abs(t - n) < ANIM_EPS;
    return { value: done ? t : n, done };
}
 
// function LerpVec(c: Vec3, t: Vec3, speed: number): { value: Vec3; done: boolean }
// {
//     const n = t.subtract(c).multiply(speed).add(c);
//     const done = t.subtract(n).length < ANIM_EPS;
//     return { value: done ? t : n, done };
// }
 
function LerpColor(c: Color, t: Color, speed: number): { value: Color; done: boolean }
{
    const cLab = SrgbToOklab(c);
    const tLab = SrgbToOklab(t);

    const n: Lab = {
        l: cLab.l + (tLab.l - cLab.l) * speed,
        a: cLab.a + (tLab.a - cLab.a) * speed,
        b: cLab.b + (tLab.b - cLab.b) * speed,
    };

    const done =
        Math.abs(tLab.l - n.l) < ANIM_EPS &&
        Math.abs(tLab.a - n.a) < ANIM_EPS &&
        Math.abs(tLab.b - n.b) < ANIM_EPS;
    return { value: done ? OklabToSrgb(tLab) : OklabToSrgb(n), done };
}

function MatchNamePattern(pattern: string, name: string | undefined): boolean
{
    if (pattern === "*")
    {
        return true;
    }
    
    if (name === undefined)
    {
        return false;
    }

    return new RegExp("^" + pattern.replace(/\*/g, ".*") + "$").test(name);
}

function IsPlayerClicking(player: CSPlayerPawn | undefined)
{
    return (player?.IsInputPressed(CSInputs.ATTACK) || player?.IsInputPressed(CSInputs.USE)) ?? false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Log(msg: any, debugOnly: boolean = false)
{
    if (debugOnly && !DEBUG)
    {
        return;
    }

    Instance.Msg(`CSUI: ${msg}`);
}

function SafeKill(ent: Entity)
{
    if (ent !== undefined && ent.IsValid())
    {
        ent.Remove();
    }
}

export function Remap(value: number, low1: number, high1: number, low2: number, high2: number) 
{
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function ArrayRemoveByRef<T>(array: T[], item: T): boolean
{
    const index = array.indexOf(item);
    if (index === -1) return false;
    array.splice(index, 1);
    return true;
}

function GetPadding(padding: Layout["Padding"]): { pL: number, pR: number, pT: number, pB: number }
{
    return {
        pL: typeof padding === "number" ? padding : (padding?.left ?? 0),
        pR: typeof padding === "number" ? padding : (padding?.right ?? 0),
        pT: typeof padding === "number" ? padding : (padding?.top ?? 0),
        pB: typeof padding === "number" ? padding : (padding?.bottom ?? 0),
    };
}

function IsOutOfFlow(child: BaseUIPanel): boolean
{
    if (typeof child.Layout.AlignX === "object" && (child.Layout.AlignX.type === "Relative" || child.Layout.AlignX.type === "Absolute")) 
        return true;
    
    if (typeof child.Layout.AlignY === "object" && (child.Layout.AlignY.type === "Relative" || child.Layout.AlignY.type === "Absolute")) 
        return true;

    return false;
}

// https://unicode-explorer.com/articles/space-characters
function NormalizeWhitespace(str: string): string 
{
    // remove zero width chars that have no visual width
    str = str.replace(/[\uFEFF\u200B\u200C\u2060]/g, '');

    // ZWJ (\u200D) must be separate due to eslint no-misleading-character-class
    // flags it inside a character class as it forms emoji sequences
    str = str.replace(/\u200D/g, '');

    // normalize all line endings to \n (CRLF first to avoid double \n)
    str = str
        .replace(/\r\n/g, '\n')
        .replace(/[\r\u0085\u2028\u2029\v\f]/g, '\n');

    // normalize tabs to 4 spaces
    str = str.replace(/\t/g, '    ');
  
    // normalize all weird space chars to a regular space U+0020
    str = str.replace(
        /[\u00A0\u2000-\u200A\u202F\u205F\u3000\u180E\u2800\u3164]/g,
        ' ',
    );

    return str;
}

function WrapWord(word: string, maxWidth: number, font: Font, currentLine: string, currentWidth: number, wrappedLines: string[]): { line: string, width: number }
{
    for (const char of word)
    {
        const charWidth = font.GetGlyph(char).advance;
        if (currentWidth + charWidth > maxWidth)
        {
            wrappedLines.push(currentLine);
            currentLine = '';
            currentWidth = 0;
        }
        currentLine += char;
        currentWidth += charWidth;
    }
    return { line: currentLine, width: currentWidth };
}

function WrapText(text: string, maxWidth: number, font: Font): string
{
    const lines = text.split('\n');
    const wrappedLines: string[] = [];

    for (const line of lines)
    {
        if (line.length === 0)
        {
            wrappedLines.push('');
            continue;
        }

        const words = line.split(' ');
        let currentLine = '';
        let currentWidth = 0;
        const spaceWidth = font.GetGlyph(' ').advance;

        for (const word of words)
        {
            let wordWidth = 0;
            for (const char of word)
            {
                wordWidth += font.GetGlyph(char).advance;
            }

            if (wordWidth > maxWidth)
            {
                if (currentLine.length > 0)
                {
                    wrappedLines.push(currentLine);
                    currentLine = '';
                    currentWidth = 0;
                }
                const result = WrapWord(word, maxWidth, font, currentLine, currentWidth, wrappedLines);
                currentLine = result.line;
                currentWidth = result.width;
            }
            else
            {
                const addWidth = currentLine.length === 0 ? wordWidth : spaceWidth + wordWidth;

                if (currentLine.length > 0 && currentWidth + addWidth > maxWidth)
                {
                    wrappedLines.push(currentLine);
                    currentLine = word;
                    currentWidth = wordWidth;
                }
                else
                {
                    currentLine = currentLine.length === 0 ? word : currentLine + ' ' + word;
                    currentWidth += addWidth;
                }
            }
        }

        if (currentLine.length > 0)
        {
            wrappedLines.push(currentLine);
        }
    }

    return wrappedLines.join('\n');
}
