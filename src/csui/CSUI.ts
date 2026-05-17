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
*   Licensed under the GNU General Public License v3 or later.
*   See <https://www.gnu.org/licenses/> for details.
*/

import { Euler, Vec3 } from "@s2ze/math";
import { BaseModelEntity, Color, CSInputs, CSPlayerPawn, Entity, Instance, PointTemplate } from "cs_script/point_script";
import { Font } from "./font";
import { Fonts, FontsMap, GetGlyphIndex } from "./font_definitions";

const ANIM_EPS = 0.001;
const PANEL_Z_INCREMENT: number = 0.1;

let Debug = false;

export function UISetDebug(debug: boolean)
{
    Debug = debug;
}

interface Layout
{
    Width: SizeType;
    Height: SizeType;
    Scale?: number,
    VisualScale?: number,
    Flow?: Flow;
    Padding?: { left?: number, right?: number, top?: number, bottom?: number } | number,
    ChildGap?: number,
    AlignX: AlignXType,
    AlignY: AlignYType,
}

export const AlignX = {
    Left: "Left",
    Center: "Center",
    Right: "Right",
    Relative: (value: number) => ({ type: "Relative" as const, value }),
    Absolute: (value: number) => ({ type: "Absolute" as const, value }),
} as const;

export type AlignXType =
    | Exclude<(typeof AlignX)[keyof typeof AlignX], (...args: never[]) => unknown>
    | ReturnType<typeof AlignX.Relative>
    | ReturnType<typeof AlignX.Absolute>;

export const AlignY = {
    Top: "Top",
    Center: "Center",
    Bottom: "Bottom",
    Relative: (value: number) => ({ type: "Relative" as const, value }),
    Absolute: (value: number) => ({ type: "Absolute" as const, value }),
} as const;

export type AlignYType =
    | Exclude<(typeof AlignY)[keyof typeof AlignY], (...args: never[]) => unknown>
    | ReturnType<typeof AlignY.Relative>
    | ReturnType<typeof AlignY.Absolute>;

export enum Shape
{
    Rect,
    Elipse,
}

export const Size = {
    Fit: "Fit",
    Grow: "Grow",
} as const;

export type SizeType = (typeof Size)[keyof typeof Size] | number;

export enum Flow
{
    TopBottom,
    LeftRight,
}

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

export interface Transforms
{ 
    Origin: Vec3, 
    Width: number, 
    Height: number, 
    Z?: number
}

type AnimationValues = number | Vec3 | Color;

export enum AnimationValueTypes
{
    Color,
    Alpha,
    Scale,
    VisualScale,
    Width,
    Height,
}

interface Animation<AnimationValues> 
{
    target: AnimationValues;
    speed: number;
    type: AnimationValueTypes;
}

interface PlayerState
{
    isClicking: boolean;
    clickingChanged: boolean;
}

interface PlayerInteraction
{
    HoveredBy: Set<CSPlayerPawn>,
    ClickingBy: Set<CSPlayerPawn>,
    MousePosByPlayer: Map<CSPlayerPawn, Vec3>,
    MouseMovingBy: Set<CSPlayerPawn>
}

export class Event<TArgs extends unknown[]>
{
    private _callbacks: ((...args: TArgs) => void)[] = [];

    public Add(cb: (...args: TArgs) => void): void
    {
        this._callbacks.push(cb);
    }

    public Invoke(...args: TArgs): void
    {
        for (const cb of this._callbacks)
        {
            cb(...args);
        }
    }
}

export class UI
{
    public Root?: BaseUIPanel;

    public Origin: Vec3 = Vec3.Zero;
    public Angles: Euler = Euler.Zero;
    public Scale: number = 1;
    public Brightness: number = 1;
    public AlignX: AlignXType = AlignX.Left;
    public AlignY: AlignYType = AlignY.Top;

    private readonly _Players: Map<CSPlayerPawn, PlayerState> = new Map();
    public get Players(): ReadonlyMap<CSPlayerPawn, PlayerState>
    {
        return this._Players;
    }

    private readonly _InputLockByPlayer: Map<CSPlayerPawn, BaseUIPanel> = new Map();

    public GetInputLock(player: CSPlayerPawn): BaseUIPanel | undefined
    {
        return this._InputLockByPlayer.get(player);
    }

    public SetInputLock(player: CSPlayerPawn, panel: BaseUIPanel): void
    {
        this._InputLockByPlayer.set(player, panel);
    }

    public ClearInputLock(player: CSPlayerPawn): void
    {
        this._InputLockByPlayer.delete(player);
    }

    private _CleanupMode: boolean = false;
    public get CleanupMode(): boolean
    {
        return this._CleanupMode;
    }

    public GetPanel(name: string): BaseUIPanel | undefined
    {
        if (this.Root?.Name === name)
        {
            return this.Root;
        }

        return this.Root?.GetPanel(name);
    }

    public GetPanels(name: string): BaseUIPanel[]
    {
        return this.Root?.GetPanels(name) ?? [];
    }

    public AddPlayer(pawn: CSPlayerPawn): void
    {
        if (!this._Players.has(pawn))
        {
            this._Players.set(pawn, { isClicking: false, clickingChanged: false });
        }
    }

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

    public Cleanup()
    {
        this._CleanupMode = true;
        this.Root?.Think();
    }

    public Think(): void
    {
        if (this.Root === undefined || this.CleanupMode)
        {
            return;
        }

        for (const [pawn, state] of this._Players)
        {
            if (pawn == undefined || !pawn.IsValid())
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

export abstract class BaseUIPanel
{
    ///////// UI /////////
    public readonly UI: UI;

    protected readonly LayoutTransforms: Transforms = { Origin: Vec3.Zero, Width: 0, Height: 0 };

    private _Name?: string;

    public get Name(): string | undefined
    {
        return this._Name;
    }

    public GetPanel(name: string): BaseUIPanel | undefined
    {
        if (this.Name === name)
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

    private MatchNamePattern(pattern: string, name: string | undefined): boolean
    {
        if (name === undefined)
        {
            return false;
        }

        return new RegExp("^" + pattern.replace(/\*/g, ".*") + "$").test(name);
    }

    private GetPanelsInternal(name: string, panels: BaseUIPanel[])
    {
        if (this.MatchNamePattern(name, this.Name))
        {
            panels.push(this);
        }
        
        for (const panel of this.Children) 
        {
            panel.GetPanelsInternal(name, panels);
        }
    }

    /** Finds all panels in the hierarchy matching the name, supports * wild cards */
    public GetPanels(name: string): BaseUIPanel[]
    {
        const panels: BaseUIPanel[] = [];

        this.GetPanelsInternal(name, panels);

        return panels;
    }

    public Color: Color = { r: 255, g: 255, b: 255, a: 255 };
    public ZIndex: number = 1;

    ///////// Layout /////////

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

    public get Layout(): Layout
    {
        return this._Layout;
    }

    public set Layout(layout: Partial<Layout>)
    {
        this._Layout = { ...BaseUIPanel.DefaultLayout, ...layout };
    }

    ///////// Input lock /////////

    /**
     * When true, holding the mouse button while hovering this panel will lock all input to it for that player until the button is released
     */
    public LockInput: boolean = false;

    ///////// Animation /////////
    private Animations: Animation<unknown>[] = [];

    public Animate(target: Color, speed: number, type: AnimationValueTypes.Color): void;
    public Animate(target: number, speed: number, type: AnimationValueTypes.Color): void;
    public Animate(target: number, speed: number, type: AnimationValueTypes.Alpha): void;
    public Animate(target: number, speed: number, type: AnimationValueTypes.Scale): void;
    public Animate(target: number, speed: number, type: AnimationValueTypes.VisualScale): void;
    public Animate(target: number, speed: number, type: AnimationValueTypes.Width): void;
    public Animate(target: number, speed: number, type: AnimationValueTypes.Height): void;

    public Animate(target: AnimationValues, speed: number, type: AnimationValueTypes): void 
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

    ///////// Parent /////////
    private _Parent?: BaseUIPanel;

    public get Parent(): BaseUIPanel | undefined 
    {
        return this._Parent; 
    }

    public set Parent(parent: BaseUIPanel)
    {
        if (this._Parent !== undefined)
        {
            ArrayRemoveByRef<BaseUIPanel>(this._Parent._Children, this);
        }

        this._Parent = parent;
        this._Parent._Children.push(this);
    }

    ///////// Children /////////
    private readonly _Children: BaseUIPanel[] = [];
    public get Children(): BaseUIPanel[] 
    {
        return this._Children; 
    }

    ///////// Per-player interaction state /////////
    private PlayerInteraction: PlayerInteraction = {

        HoveredBy: new Set<CSPlayerPawn>(),
        ClickingBy: new Set<CSPlayerPawn>(),
        MousePosByPlayer: new Map<CSPlayerPawn, Vec3>(),
        MouseMovingBy: new Set<CSPlayerPawn>(),
    };

    public IsHoveredBy(player: CSPlayerPawn): boolean
    {
        return this.PlayerInteraction.HoveredBy.has(player);
    }

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

    public get WorldWidth(): number
    {
        return this.LayoutTransforms.Width * this.UI.Scale;
    }

    public get WorldHeight(): number
    {
        return this.LayoutTransforms.Height * this.UI.Scale;
    }

    public get InheritedScale(): number
    {
        const ownScale = this.Layout.Scale ?? 1;
        const parentScale = this._Parent?.InheritedScale ?? 1;
        return parentScale * ownScale * (this.Layout.VisualScale ?? 1);
    }

    ///////// Callbacks (panel, player) /////////
    public readonly OnMouseEnter = new Event<[BaseUIPanel, CSPlayerPawn]>();
    public readonly OnMouseLeave = new Event<[BaseUIPanel, CSPlayerPawn]>();
    public readonly OnMouseDown = new Event<[BaseUIPanel, CSPlayerPawn]>();
    public readonly OnMouseUp = new Event<[BaseUIPanel, CSPlayerPawn]>();
    public readonly OnMouseMoved = new Event<[BaseUIPanel, CSPlayerPawn]>();
    public readonly OnThink = new Event<[BaseUIPanel, Transforms]>();

    constructor(parent: BaseUIPanel | UI, name: string | undefined = undefined)
    {
        this._Name = name;

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

    protected abstract Render(worldTransforms: Transforms): void;
    protected abstract Cleanup(): void;

    // for subclasses that have intrinsic content size like text, called during MeasurePanel after children have been measured but before
    // the panel's own Size.Fit dimensions are resolved
    // return the natural { width, height } of the content at scale = 1, return undefined to use the normal child based measurement
    protected MeasureContent(): { width: number; height: number } | undefined
    {
        return undefined;
    }

    public Think(parentWorldTransforms?: Transforms): void
    {
        
        if (this.UI.CleanupMode)
        {
            this.Cleanup();
            for (const child of this._Children)
            {
                child.Think(parentWorldTransforms);
            }
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

        const transforms = this.CalculateWorldTransforms(parentWorldTransforms);

        this.OnThink.Invoke(this, transforms);

        if (Debug)
        {
            const tl = this.UIToWorld(new Vec3(0, 0, 0), transforms);
            const tr = this.UIToWorld(new Vec3(1, 0, 0), transforms);
            const br = this.UIToWorld(new Vec3(1, 1, 0), transforms);
            const bl = this.UIToWorld(new Vec3(0, 1, 0), transforms);

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

        for (let i = this.Animations.length - 1; i >= 0; i--)
        {
            const anim = this.Animations[i];
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

            if (done!) this.Animations.splice(i, 1);
        }

        for (const child of this._Children)
        {
            child.Think(transforms);
        }
    }
    
    // instead of calculating layout different for width and height directly, we can calculate "along" or "across" the layout axis
    // conceptually with this approach layouting UI is mostly a 1 dimensional problem (ignoring grid layouts)
    private BuildAxisHelper(): AxisHelper
    {
        const { pL, pR, pT, pB } = GetPadding(this.Layout.Padding);
        const h = this.Layout.Flow === Flow.LeftRight;
    
        return {
            alongSize:          () => h ? this.LayoutTransforms.Width : this.LayoutTransforms.Height,
            acrossSize:         () => h ? this.LayoutTransforms.Height : this.LayoutTransforms.Width,

            setAlong:  (v) => 
            {
                if (h) this.LayoutTransforms.Width = v; else this.LayoutTransforms.Height = v; 
            },

            setAcross: (v) => 
            {
                if (h) this.LayoutTransforms.Height = v; else this.LayoutTransforms.Width = v; 
            },

            alongSizeType:  h ? this.Layout.Width : this.Layout.Height,
            acrossSizeType: h ? this.Layout.Height : this.Layout.Width,

            alongPadding:      h ? pL + pR : pT + pB,
            acrossPadding:     h ? pT + pB : pL + pR,
            alongPaddingStart: h ? pL : pT,
            acrossPaddingStart: h ? pT : pL,
        };
    }

    private _AxisHelper?: AxisHelper;

    protected GetAxisHelper(): AxisHelper
    {
        if (this._AxisHelper === undefined)
        {
            this._AxisHelper = this.BuildAxisHelper();
        }
        return this._AxisHelper;
    }

    private MeasurePanel()
    {
        for (const child of this.Children)
        {
            child.MeasurePanel();
        }

        const axisHelper = this.GetAxisHelper();
        const gap = this.Layout.ChildGap ?? 0;

        // check if this panel has intrinsic content (like text) that should drive its Size.Fit dimensions instead of child based measurement
        const intrinsic = this.MeasureContent();

        if (intrinsic !== undefined)
        {
            // intrinsic content panels behave like leaf nodes, children dont contribute to sizing
            const scale = this.Layout.Scale ?? 1;

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

        // total child gap is related to the fence post problem, where total amount of child gap is the amount of children - 1
        // we can begin with this because it wont change based on anything but child count, which we already know
        let alongContentSize = Math.max(this.Children.length - 1, 0) * gap;
        let acrossContentSize = 0;

        const horizontal = this.Layout.Flow === Flow.LeftRight;
        
        for (const child of this.Children)
        {
            // grow children dont contribute to sizing right now, DistributeGrow pass will assign their size later

            const childAlongSize = horizontal ? child.LayoutTransforms.Width : child.LayoutTransforms.Height;
            const childAlongSizeType = horizontal ? child.Layout.Width : child.Layout.Height;
            const childAcrossSize = horizontal ? child.LayoutTransforms.Height : child.LayoutTransforms.Width;
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

        if (axisHelper.alongSizeType === Size.Fit && this.Children.some(c => horizontal ? c.Layout.Width === Size.Grow : c.Layout.Height === Size.Grow))
        {
            Instance.Msg("UI: GROW children inside a FIT parent have no space to grow into");
        }

        const scale = this.Layout.Scale ?? 1;

        switch (axisHelper.alongSizeType)
        {
            case Size.Fit: axisHelper.setAlong(axisHelper.alongPadding + alongContentSize); break;
            case Size.Grow: axisHelper.setAlong(0); break;
            default: axisHelper.setAlong(axisHelper.alongSizeType * scale); break;
        }

        switch (axisHelper.acrossSizeType)
        {
            case Size.Fit: axisHelper.setAcross(axisHelper.acrossPadding + acrossContentSize); break;
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

        // along axis: collect grow children and size taken up by children, then distribute remaining space
        let alongFixed = Math.max(this.Children.length - 1, 0) * (this.Layout.ChildGap ?? 0);
        const growChildren: BaseUIPanel[] = [];
        
        for (const child of this.Children)
        {
            const childAlongSizeType = horizontal ? child.Layout.Width : child.Layout.Height;
            if (childAlongSizeType === Size.Grow)
            {
                growChildren.push(child);
            }
            else
            {
                alongFixed += horizontal ? child.LayoutTransforms.Width : child.LayoutTransforms.Height;
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
                if (horizontal) child.LayoutTransforms.Width = share; else child.LayoutTransforms.Height = share;
            }
        }
        
        // cross axis: grow children simply fill the available interior space
        for (const child of this.Children)
        {
            const childCrossSizeType = horizontal ? child.Layout.Height : child.Layout.Width;
            if (childCrossSizeType === Size.Grow)
            {
                if (horizontal) child.LayoutTransforms.Height = acrossInterior; else child.LayoutTransforms.Width = acrossInterior;
            }
        }
    
        // recurse so children can distribute grow space to their own grow children
        for (const child of this.Children)
        {
            child.DistributeGrow();
        }
    }

    private PositionPanel(x: number, y: number) 
    {
        const parentWidth = this.Parent?.LayoutTransforms.Width ?? 1;
        const parentHeight = this.Parent?.LayoutTransforms.Height ?? 1;
        
        // sizing in final UI space will be normalised
        this.LayoutTransforms.Origin.x = x / parentWidth;
        this.LayoutTransforms.Origin.y = y / parentHeight;

        const axisHelper = this.GetAxisHelper();
        const horizontal = this.Layout.Flow === Flow.LeftRight;
        const gap = this.Layout.ChildGap ?? 0;

        // measure total child content size along and across the flow axis, including gaps between children (fence post: n-1 gaps for n children)
        let alongContent = Math.max(this.Children.length - 1, 0) * gap;
        let crossContent = 0;

        for (const child of this.Children) 
        {
            alongContent += horizontal ? child.LayoutTransforms.Width : child.LayoutTransforms.Height;
            crossContent = Math.max(crossContent, horizontal ? child.LayoutTransforms.Height : child.LayoutTransforms.Width);
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
        for (const child of this.Children) 
        {
            const childAlong = horizontal ? child.LayoutTransforms.Width : child.LayoutTransforms.Height;
            const childCross = horizontal ? child.LayoutTransforms.Height : child.LayoutTransforms.Width;

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
    }

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

    private CalculateWorldTransforms(parentWorldTransforms?: Transforms): Transforms
    {        
        const parentOrigin = parentWorldTransforms !== undefined ? parentWorldTransforms.Origin : (() =>
        {
            // when we are root, shift the UI origin based on the alignment settings
            const w = this.LayoutTransforms.Width * this.UI.Scale;
            const h = this.LayoutTransforms.Height * this.UI.Scale;

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

        const parentWidth = (this._Parent?.LayoutTransforms.Width ?? 1) * this.UI.Scale;
        const parentHeight = (this._Parent?.LayoutTransforms.Height ?? 1) * this.UI.Scale;

        const ox = (this.LayoutTransforms.Origin.x * parentWidth);
        const oy = (this.LayoutTransforms.Origin.y * parentHeight);

        const visualScale = this.Layout.VisualScale ?? 1;
        const layoutWidth = this.LayoutTransforms.Width * this.UI.Scale;
        const layoutHeight = this.LayoutTransforms.Height * this.UI.Scale;

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

    public UIToWorld(uv: Vec3, worldTransforms: Transforms): Vec3 
    {
        const ix = uv.x * worldTransforms.Width;
        const iy = uv.y * worldTransforms.Height;
        
        return this.UI.Angles.left
            .multiply(ix)
            .add(this.UI.Angles.down.multiply(iy))
            .add(worldTransforms.Origin);
    }

    private DebugColor: Color | undefined;

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

        this._Visual.Teleport({ position: worldTransforms.Origin, angles: this.UI.Angles });
        this._Visual.SetModelScale(this.InheritedScale * this.UI.Scale);
        this._Visual.SetColor(this.Color);
    }

    protected Cleanup(): void 
    {
        this._Visual.Remove();
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

            case Shape.Elipse:
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
        this._Visual.Teleport({ position: worldTransforms.Origin.add(this.UI.Angles.right.multiply(-worldTransforms.Width / 2)), angles: this.UI.Angles });

        Instance.EntFireAtTarget({ target: this.Visual, input: "SetControlPoint", value: `1: ${worldTransforms.Width} ${worldTransforms.Height} ${this.Color.a}` });
        Instance.EntFireAtTarget({ target: this.Visual, input: "SetControlPoint", value: `2: ${this.Color.r} ${this.Color.g} ${this.Color.b}` });
        Instance.EntFireAtTarget({ target: this.Visual, input: "SetControlPoint", value: `3: ${this.UI.Brightness} 0 0` });
    }

    protected Cleanup(): void 
    {
        Instance.EntFireAtTarget({ target: this.Visual, input: "kill" });
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
                // min needed to ensure last char in atlas displays properly, no clue man
                const maxIndex = 2 * this.Font.CharCount - 1;
                index = Math.min((2 * index + 1) / maxIndex, 0.999);

                const textEnt = this.TextEnts[textEntIndex];
                textEntIndex++;

                Instance.EntFireAtTarget({ target: textEnt, input: "SetControlPoint", value: `2: ${this.UI.Brightness} ${this.Color.a} ${index}` });
                Instance.EntFireAtTarget({ target: textEnt, input: "SetControlPoint", value: `3: ${glyphHeight} ${glyphWidth} 0` });
                Instance.EntFireAtTarget({ target: textEnt, input: "SetControlPoint", value: `1: ${this.Color.r} ${this.Color.g} ${this.Color.b}` });
                textEnt.Teleport({ 
                    position: worldTransforms.Origin
                        .add(this.UI.Angles.left.multiply(pen + alignmentOffset))
                        .add(this.UI.Angles.down.multiply(verticalOffset + (i * this.Font.FontLineHeight * scale))), 
                    angles: this.UI.Angles,
                });

                pen += glyph.advance * scale;
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
            Instance.EntFireAtTarget({ target: ent, input: "kill" });
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

export function SpawnModelTemplate(templateName: string): BaseModelEntity
{
    const template = Instance.FindEntityByName(templateName) as PointTemplate;

    if (template === undefined) Log("Failed to find model template!");

    const model = template.ForceSpawn()![0];

    if (model === undefined) Log("Failed to spawn template model!");

    return model as BaseModelEntity;
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
    const n: Color = {
        r: c.r + (t.r - c.r) * speed,
        g: c.g + (t.g - c.g) * speed,
        b: c.b + (t.b - c.b) * speed,
        a: c.a + (t.a - c.a) * speed,
    };
    const done =
        Math.abs(t.r - n.r) < ANIM_EPS &&
        Math.abs(t.g - n.g) < ANIM_EPS &&
        Math.abs(t.b - n.b) < ANIM_EPS &&
        Math.abs(t.a - n.a) < ANIM_EPS;
    return { value: done ? t : n, done };
}

function IsPlayerClicking(player: CSPlayerPawn | undefined)
{
    return (player?.IsInputPressed(CSInputs.ATTACK) || player?.IsInputPressed(CSInputs.USE)) ?? false;
}

function Log(msg: string, debugOnly: boolean = false)
{
    if (debugOnly && Debug)
    {
        return;
    }

    Instance.Msg(`CSUI: ${msg}`);
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
