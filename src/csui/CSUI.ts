// Inspired by the Clay UI library
// https://github.com/nicbarker/clay

import { Euler, Vec3 } from "@s2ze/math";
import { BaseModelEntity, Color, CSInputs, CSPlayerPawn, Entity, Instance, PointTemplate } from "cs_script/point_script";
import { Font } from "./fonts/font";
import { Fonts, FontsMap } from "./fonts/font_definitions";

const ANIM_EPS = 0.001;
const PANEL_Z_INCREMENT: number = 0.1;

let Debug = false;

export function UISetDebug(debug: boolean)
{
    Debug = debug;
}

interface Layout
{
    Width: Size | number;
    Height: Size | number;
    Scale?: number,
    VisualScale?: number,
    Flow?: Flow;
    Padding?: { left?: number, right?: number, top?: number, bottom?: number } | number,
    ChildGap?: number,
    AlignX?: AlignX,
    AlignY?: AlignY,
}

export enum AlignX
{
    Left,
    Center,
    Right,
}

export enum AlignY
{
    Top,
    Center,
    Bottom,
}

export enum Size
{
    Fit = "Fit",
    Grow = "Grow",
}

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
    alongSizeType: Size | number;
    acrossSizeType: Size | number;
    alongPadding: number;
    acrossPadding: number;
    alongPaddingStart: number;
    acrossPaddingStart: number;
}

interface Transforms
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

export class UI
{
    public Root?: BaseUIPanel;

    public Origin: Vec3 = Vec3.Zero;
    public Angles: Euler = Euler.Zero;
    public Scale: number = 1;
    public Brightness: number = 1;
    public AlignX: AlignX = AlignX.Left;
    public AlignY: AlignY = AlignY.Top;

    private readonly _Players: Map<CSPlayerPawn, PlayerState> = new Map();
    public get Players(): ReadonlyMap<CSPlayerPawn, PlayerState>
    {
        return this._Players;
    }

    private _CleanupMode: boolean = false;
    public get CleanupMode(): boolean
    {
        return this._CleanupMode;
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

    public Color: Color = { r: 255, g: 255, b: 255, a: 255 };
    public ZIndex: number = 1;

    ///////// Layout /////////
    public Layout: Layout = {

        Width: 50,
        Height: 50,
        Flow: Flow.LeftRight,
        Padding: 0,
        ChildGap: 0,
        AlignX: AlignX.Center,
        AlignY: AlignY.Center,
    };

    ///////// Animation /////////
    private Animations: Animation<unknown>[] = [];

    public Animate(target: Color, speed: number, type: AnimationValueTypes.Color): void;
    public Animate(target: number, speed: number, type: AnimationValueTypes.Color): void;
    public Animate(target: number, speed: number, type: AnimationValueTypes.Alpha): void;
    public Animate(target: number, speed: number, type: AnimationValueTypes.Scale): void;
    public Animate(target: number, speed: number, type: AnimationValueTypes.VisualScale): void;

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
    private OnMouseEnterCallback?: (panel: BaseUIPanel, player: CSPlayerPawn) => void;
    private OnMouseLeaveCallback?: (panel: BaseUIPanel, player: CSPlayerPawn) => void;
    private OnMouseDownCallback?: (panel: BaseUIPanel, player: CSPlayerPawn) => void;
    private OnMouseUpCallback?: (panel: BaseUIPanel, player: CSPlayerPawn) => void;
    private MouseMovedCallback?: (panel: BaseUIPanel, player: CSPlayerPawn) => void;
    private ThinkCallback?: (p: BaseUIPanel, transforms: Transforms) => void;

    public OnMouseEnter(cb: (panel: BaseUIPanel, player: CSPlayerPawn) => void): void  
    {
        this.OnMouseEnterCallback = cb; 
    }
    public OnMouseLeave(cb: (panel: BaseUIPanel, player: CSPlayerPawn) => void): void  
    {
        this.OnMouseLeaveCallback = cb; 
    }
    public OnMouseDown(cb: (panel: BaseUIPanel, player: CSPlayerPawn) => void): void  
    {
        this.OnMouseDownCallback = cb; 
    }
    public OnMouseUp(cb: (panel: BaseUIPanel, player: CSPlayerPawn) => void): void  
    {
        this.OnMouseUpCallback = cb; 
    }
    public OnMouseMoved(cb: (panel: BaseUIPanel, player: CSPlayerPawn) => void): void  
    {
        this.MouseMovedCallback = cb; 
    }
    public OnThink(cb: (p: BaseUIPanel, transforms: Transforms) => void): void                        
    {
        this.ThinkCallback = cb; 
    }

    constructor(parent: BaseUIPanel | UI)
    {
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
        // set off the two recursive calls that will measure and position the entire UI
        if (this.Parent === undefined)
        {
            this.MeasurePanel();
            this.DistributeGrow();
            this.PositionPanel(0, 0);
        }

        const transforms = this.CalculateWorldTransforms(parentWorldTransforms);

        if (this.ThinkCallback !== undefined) this.ThinkCallback(this, transforms);

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
        const alongAlignment = horizontal ? (this.Layout.AlignX ?? AlignX.Left) : (this.Layout.AlignY ?? AlignY.Top);
        let alongOffset = axisHelper.alongPaddingStart;
        if (alongAlignment === AlignX.Center || alongAlignment === AlignY.Center) 
        {
            alongOffset += (alongInner - alongContent) / 2;
        }
        else if (alongAlignment === AlignX.Right || alongAlignment === AlignY.Bottom) 
        {
            alongOffset += (alongInner - alongContent);
        }

        // position each child, advancing the 'along' cursor by child size + gap after each
        for (const child of this.Children) 
        {
            const childAlong = horizontal ? child.LayoutTransforms.Width : child.LayoutTransforms.Height;
            const childCross = horizontal ? child.LayoutTransforms.Height : child.LayoutTransforms.Width;

            // each child is independently aligned on the cross axis
            const crossAlignment = horizontal ? (this.Layout.AlignY ?? AlignY.Top) : (this.Layout.AlignX ?? AlignX.Left);
            let crossOffset = axisHelper.acrossPaddingStart;
            if (crossAlignment === AlignY.Center || crossAlignment === AlignX.Center) 
            {
                crossOffset += (crossInner - childCross) / 2;
            }
            else if (crossAlignment === AlignY.Bottom || crossAlignment === AlignX.Right) 
            {
                crossOffset += (crossInner - childCross);
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
            if (this.OnMouseLeaveCallback !== undefined) this.OnMouseLeaveCallback(this, player);
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

        if (!isHit)
        {
            if (this.PlayerInteraction.HoveredBy.delete(player))
            {
                if (this.OnMouseLeaveCallback !== undefined) this.OnMouseLeaveCallback(this, player);
            }

            this.PlayerInteraction.MouseMovingBy.delete(player);
            return;
        }

        if (!this.PlayerInteraction.HoveredBy.has(player))
        {
            this.PlayerInteraction.HoveredBy.add(player);
            if (this.OnMouseEnterCallback !== undefined) this.OnMouseEnterCallback(this, player);
        }

        if (state.clickingChanged)
        {
            if (state.isClicking)
            {
                this.PlayerInteraction.ClickingBy.add(player);
                if (this.OnMouseDownCallback !== undefined) this.OnMouseDownCallback(this, player);
            }
            else
            {
                this.PlayerInteraction.ClickingBy.delete(player);
                if (this.OnMouseUpCallback !== undefined) this.OnMouseUpCallback(this, player);
            }
        }

        const localHitPos = new Vec3(barycentricUVT.u, barycentricUVT.v, 0);
        const prevPos = this.PlayerInteraction.MousePosByPlayer.get(player);

        if (prevPos === undefined || !localHitPos.equals(prevPos))
        {
            this.PlayerInteraction.MousePosByPlayer.set(player, localHitPos);
            this.PlayerInteraction.MouseMovingBy.add(player);
            if (this.MouseMovedCallback !== undefined) this.MouseMovedCallback(this, player);
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

    constructor(parent: BaseUIPanel | UI, model: BaseModelEntity, width: number, height: number)
    {
        super(parent);
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

    constructor(parent: BaseUIPanel | UI)
    {
        super(parent);
        
        const particlePanelTemplate = Instance.FindEntityByName("*csui.particle.panel.template") as PointTemplate;
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
        Instance.EntFireAtTarget({ target: this.Visual, input: "DestroyImmediately" });
        Instance.EntFireAtTarget({ target: this.Visual, input: "kill", delay: 0.1 });
    }
}

export class TextUIPanel extends BaseUIPanel
{
    private Font: Font;
    private ParticleTextPanelTemplate: PointTemplate;
    private TextEnts: Entity[] = [];
    
    private _Text: string = "";

    public get Text(): string
    {
        return this._Text;
    }

    public set Text(text: string)
    {
        this._Text = text;

        for (const char of this._Text) 
        {
            const particleTextPanel = this.ParticleTextPanelTemplate.ForceSpawn();

            if (particleTextPanel === undefined || particleTextPanel.length === 0 || !particleTextPanel[0].IsValid())
            {
                Log("Failed to spawn particle panel");
            }

            const textPanel = particleTextPanel![0];

            this.TextEnts.push(textPanel);

            Instance.EntFireAtTarget({ target: textPanel, input: "start" });
        }
    }

    constructor(parent: BaseUIPanel | UI, font: Fonts, text: string)
    {
        super(parent);

        this.Font = FontsMap.get(font)!;
     
        this.ParticleTextPanelTemplate = Instance.FindEntityByName(`*CSUI.particle.font.panel.${this.Font.FontName}.template`) as PointTemplate;
        if (this.ParticleTextPanelTemplate === undefined || !this.ParticleTextPanelTemplate.IsValid())
        {
            Log("Failed to find particle text panel template");
        }
        
        this.Text = text;
    }

    protected Render(worldTransforms: Transforms): void
    {
        const textAssembly = this.Font.AssembleText(this.Text, this.InheritedScale);

        for (let i = 0; i < textAssembly.length; i++) 
        {
            const textObject = textAssembly[i];

            const alignmentOffset = (textObject.w) / 2;

            const index = (this.Font.GetGlyphIndex(textObject.char) ?? 72) - 0.01;

            Instance.EntFireAtTarget({ target: this.TextEnts[i], input: "SetControlPoint", value: `2: ${this.UI.Brightness} ${this.Color.a} ${index}` });
            Instance.EntFireAtTarget({ target: this.TextEnts[i], input: "SetControlPoint", value: `3: ${textObject.h} ${textObject.w} 0` });
            
            Instance.EntFireAtTarget({ target: this.TextEnts[i], input: "SetControlPoint", value: `1: ${this.Color.r} ${this.Color.g} ${this.Color.b}` });
            this.TextEnts[i].Teleport({ position: worldTransforms.Origin.add(this.UI.Angles.left.multiply((textObject.x + alignmentOffset)).add(this.UI.Angles.up.multiply(textObject.y))), 
                angles: this.UI.Angles,
            });
        }
    }

    protected Cleanup(): void 
    {
        
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
