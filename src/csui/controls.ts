/*! Copyright (C) 2026 Angel Cazacu - Licensed under the Mozilla Public License Version 2.0. See <https://www.mozilla.org/en-US/MPL/2.0/> for details. */

import { Color, CSPlayerPawn } from "cs_script/point_script";
import { AlignX, AlignY, AnimationValueTypes, BaseUIPanel, Event, Flow, InvisUIPanel, Remap, Shape, Size, TextUIPanel, Transforms, UIPanel } from "./CSUI";
import { Fonts } from "./font_definitions";

export const DEFAULT_FONT: Fonts = Fonts.Roboto_Regular;

//////////////// THEME ////////////////

interface ThemeColors
{
    /**For background elements like the Root.*/
    UI: Color,
    /**For elements which need to stand out from the background.*/
    UIMiddle: Color,
    /**For elements which need to sit on UIMiddle.*/
    UISoft: Color,
    /**For elements meant to pop out slightly.*/
    UISofter: Color,
    /**For any element which needs contrast from the background, like text*/
    Contrast: Color,
    /**For any element which needs contrast but doesn't have to be as visible, like inactive text*/
    ContrastSoft: Color,
    /**For anything that needs to be accented like hovering over a button*/
    HoverAccent: Color,
    /**For anything that needs to be accented*/
    Accent: Color,
}

const DarkTheme: ThemeColors = {
    UI: { r:22, g:25, b:32, a:255 },
    UIMiddle: { r:34, g:39, b:51, a:255 },
    UISoft: { r:44, g:49, b:61, a:255 },

    UISofter: { r:51, g:57, b:74, a:255 },

    Contrast: { r: 255, g: 255, b: 255, a: 255 },
    ContrastSoft: { r:158, g:159, b:164, a:255 },

    HoverAccent: { r:0, g:66, b:151, a:255 },
    Accent: { r:99, g:161, b:255, a:255 },
} as const;

export const CurrentTheme: ThemeColors = DarkTheme;

// use an internal base panel so users can't accidentally override internal layout configuration
export abstract class BaseControl extends InvisUIPanel
{
    protected abstract _BasePanel: UIPanel;

    protected _BaseColor: Color = CurrentTheme.UISofter;
    protected _HoveredColor: Color = CurrentTheme.HoverAccent;
    protected _ClickedColor: Color = CurrentTheme.Accent;

    public get HoveredColor(): Color
    {
        return this._HoveredColor; 
    }

    public set HoveredColor(color: Color)
    {
        this._HoveredColor = color; 

        if (this.AnyHovered && !this.AnyClicking)
        {
            this._BasePanel.Color = color;
        }
    }

    public get ClickedColor(): Color
    {
        return this._ClickedColor; 
    }

    public set ClickedColor(color: Color)
    {
        this._ClickedColor = color; 

        if (this.AnyClicking)
        {
            this._BasePanel.Color = color;
        }
    }

    public get BaseColor(): Color
    {
        return this._BaseColor; 
    }

    public set BaseColor(color: Color)
    {
        this._BaseColor = color; 

        if (!this.AnyClicking && !this.AnyHovered)
        {
            this._BasePanel.Color = color;
        }
    }

    // hack to initialise basepanel color
    private _BaseColorInitialized: boolean = false;
    public override Think(parentWorldTransforms?: Transforms): void
    {
        if (!this._BaseColorInitialized)
        {
            this._BasePanel.Color = this._BaseColor;
            this._BasePanel.Internal = true;
            this._BaseColorInitialized = true;
        }
        super.Think(parentWorldTransforms);
    }

    constructor(parent: BaseUIPanel, name: string | undefined = undefined)
    {
        super(parent, name);
    }

}
//////////////// BUTTON ////////////////

export class Button extends BaseControl
{
    private _TextPanel: TextUIPanel;
    private _Text: string = "";
    protected _BasePanel: UIPanel;

    public get Text(): string
    {
        return this._Text;
    }

    public set Text(text: string)
    {
        this._Text = text;

        this._TextPanel.Text = text;
    }

    private _TextScale: number = 1;

    public get TextScale(): number
    {
        return this._TextScale;
    }

    public set TextScale(scale: number)
    {
        this._TextScale = scale;

        this._TextPanel.Layout.Scale = scale;
    }

    constructor(parent: BaseUIPanel, shape: Shape = Shape.Rect, name: string | undefined = undefined)
    {
        super(parent, name);

        this._BasePanel = new UIPanel(this, shape);
        this._BasePanel.Layout = {
            Flow: Flow.TopBottom,
            Width: Size.Grow,
            Height: Size.Grow,
        };

        this._TextPanel = new TextUIPanel(this._BasePanel, DEFAULT_FONT, "");
        this._TextPanel.Color = CurrentTheme.Contrast;
        this._TextPanel.Layout.Width = Size.Grow;
        this._TextPanel.Layout.Height = Size.Grow;
        this._TextPanel.Internal = true;

        this._BasePanel.OnMouseEnter.Add(() => 
        {
            this._BasePanel.Animate(this.HoveredColor, 0.2, AnimationValueTypes.Color);
        });

        this.OnMouseLeave.Add(() => 
        {
            this._BasePanel.Animate(this.BaseColor, 0.2, AnimationValueTypes.Color);

        });

        this._BasePanel.OnMouseDown.Add(() => 
        {
            this._BasePanel.Animate(this.ClickedColor, 0.2, AnimationValueTypes.Color);
        });

        this._BasePanel.OnMouseUp.Add(() => 
        {
            this._BasePanel.Animate(this.AnyHovered ? this.HoveredColor : this.BaseColor, 0.2, AnimationValueTypes.Color);
        });
    }       

};

//////////////// RADIO BUTTON ////////////////

export class RadioButton extends BaseControl
{
    private _DotPanel: UIPanel;
    protected _BasePanel: UIPanel;
    private _DotColor: Color = CurrentTheme.UI;
    private _Pressed: boolean = false;

    public readonly OnPressed = new Event<[boolean]>();

    public get Pressed(): boolean 
    {
        return this._Pressed;
    }

    public set Pressed(pressed: boolean)
    {
        if (this._Pressed === pressed)
        {
            return;
        }

        this._Pressed = pressed;
        this.OnPressed.Invoke(this.Pressed);
        this._DotPanel.Animate(pressed ? this.ClickedColor : this.DotColor, 0.6, AnimationValueTypes.Color);
        this._BasePanel.Animate(this.Pressed ? this.HoveredColor : this.BaseColor, 0.2, AnimationValueTypes.Color);

        if (this.Parent === undefined || pressed === false || this.Name === undefined) return;
        
        for (const child of this.UI.GetPanels(this.Name)) 
        {
            const radioButton = child as RadioButton;

            if (radioButton !== undefined && child !== this)
            {
                radioButton.Pressed = false;
            }
        }
    }

    public get DotColor(): Color 
    {
        return this._DotColor;
    }

    public set DotColor(color: Color)
    {
        this._DotColor = color;

        if (!this.Pressed && !this.AnyHovered)
        {
            this._DotPanel.Color = color;
        }
    }

    constructor(parent: BaseUIPanel, name: string | undefined = undefined)
    {
        super(parent, name);

        this._BasePanel = new UIPanel(this, Shape.Ellipse);
        this._BasePanel.Layout = {
            Width: Size.Grow,
            Height: Size.Grow,
        };

        this._DotPanel = new UIPanel(this._BasePanel, Shape.Ellipse, "");
        this._DotPanel.Color = this.DotColor;
        this._DotPanel.Layout.Width = Size.Grow;
        this._DotPanel.Layout.Height = Size.Grow;
        this._DotPanel.Internal = true;

        this._BasePanel.OnMouseEnter.Add(() => 
        {
            this._BasePanel.Animate(this.HoveredColor, 0.2, AnimationValueTypes.Color);
        });

        this._BasePanel.OnMouseLeave.Add(() => 
        {
            this._BasePanel.Animate(this.Pressed ? this.HoveredColor : this.BaseColor, 0.2, AnimationValueTypes.Color);

        });

        this.OnMouseDown.Add(() => 
        {
        });

        this.OnMouseUp.Add(() => 
        {
            this.Pressed = !this.Pressed;
        });

        this.OnThink.Add((_, transforms) => 
        {
            if (transforms.Width > transforms.Height)
            {
                this._BasePanel.Layout.Width = transforms.Height;
                this._BasePanel.Layout.Height = Size.Grow;

            }
            else if (transforms.Width < transforms.Height)
            {
                this._BasePanel.Layout.Height = transforms.Width;
                this._BasePanel.Layout.Width = Size.Grow;
            }
            else
            {
                this._BasePanel.Layout.Width = Size.Grow;
                this._BasePanel.Layout.Height = Size.Grow;
            }
        });

        this._BasePanel.OnThink.Add((_, transforms) => 
        {
            this._DotPanel.Layout.Width = transforms.Height * 0.6;
            this._DotPanel.Layout.Height = transforms.Height * 0.6;
        });
    }       

};

//////////////// SLIDER ////////////////

export enum Orientation
{
    Horizontal,
    Vertical,
}

export class Slider extends BaseControl
{
    protected _BasePanel: UIPanel;
    private _SliderSpacer: InvisUIPanel;
    private _SliderKnob: UIPanel;
    private _SliderThickness: number = 1;
    private _KnobSize: number = 1;
    private _MouseT: number = 0;
    private _KnobColor: Color = CurrentTheme.UISofter;

    private _SliderLength = 10;

    private Orientation: Orientation;

    public readonly OnValueChanged = new Event<[number]>();

    public get SliderThickness(): number
    {
        return this._SliderThickness;
    }

    public set SliderThickness(thickness: number) 
    {
        this._SliderThickness = thickness;

        if (this.Orientation === Orientation.Horizontal)
        {
            this._BasePanel.Layout.Height = this.SliderThickness;
        }
        else
        {
            this._BasePanel.Layout.Width = this.SliderThickness;
        }
    }

    public get KnobSize(): number
    {
        return this._KnobSize;
    }

    public set KnobSize(radius: number) 
    {
        this._KnobSize = radius;
    }

    public get KnobColor(): Color
    {
        return this._KnobColor; 
    }

    public set KnobColor(color: Color)
    {
        this._KnobColor = color;

        if (!this.AnyHovered && !this.AnyClicking)
        {
            this._SliderKnob.Color = color;
        }
    }

    public get MouseT(): number
    {
        return this._MouseT; 
    }

    public set MouseT(t: number)
    {
        this._MouseT = t;
    }

    /** Used if the slider is set to Size.Fit */
    public get SliderLength(): number
    {
        return this._SliderLength; 
    }

    /** Used if the slider is set to Size.Fit */
    public set SliderLength(length: number)
    {
        this._SliderLength = length;

        if (this.Orientation === Orientation.Horizontal)
        {
            this.Layout.Width = Size.Fit;
        }
        else
        {
            this.Layout.Height = Size.Fit;
        }
   
        this.SetBodySize();
    }

    private CalculateMouseT(player: CSPlayerPawn)
    {
        const mousePos = this.GetMousePos(player);

        if (mousePos === undefined)
        {
            return;
        }

        if (this.IsClickingBy(player))
        {
            // for now mouse pos is local to panel, we will see if this changes
            this.MouseT = this.Orientation === Orientation.Horizontal ? mousePos.x : mousePos.y;
            this.OnValueChanged.Invoke(this.MouseT);
        }
    }

    private GetKnobRadius(): number
    {
        return this.SliderThickness * this.KnobSize * 2;
    }

    private SetBodySize()
    {
        if (this.Orientation === Orientation.Horizontal)
        {
            this._BasePanel.Layout.Height = this.SliderThickness;
            this._BasePanel.Layout.Width = this.Layout.Width === Size.Fit ? this._SliderLength : Size.Grow;
        }
        else
        {
            this._BasePanel.Layout.Height = this.Layout.Height === Size.Fit ? this._SliderLength : Size.Grow;
            this._BasePanel.Layout.Width = this.SliderThickness;
        }
    }

    constructor(parent: BaseUIPanel, orientation: Orientation, name: string | undefined = undefined)
    {
        super(parent, name);
        this.Orientation = orientation;
        this.LockInput = true;
        
        this.Layout.Width = this.Orientation === Orientation.Horizontal ? Size.Grow : Size.Fit;
        this.Layout.Height = this.Orientation === Orientation.Horizontal ? Size.Fit : Size.Grow;

        this._BasePanel = new UIPanel(this, Shape.Rect);
        this._BasePanel.Layout = { 
            Flow: this.Orientation === Orientation.Horizontal ? Flow.LeftRight : Flow.TopBottom,
            AlignX: this.Orientation === Orientation.Horizontal ? AlignX.Left : AlignX.Center,
            AlignY: this.Orientation === Orientation.Horizontal ? AlignY.Center : AlignY.Top,
        };

        this.SetBodySize();

        this._SliderSpacer = new InvisUIPanel(this._BasePanel);
        this._SliderSpacer.Layout.Height = 0;
        this._SliderSpacer.Layout.Width = 0;
        this._SliderSpacer.Internal = true;
    
        this._SliderKnob = new UIPanel(this._BasePanel, Shape.Ellipse);
        this._SliderKnob.Color = this.KnobColor;
        this._SliderKnob.Internal = true;

        this.OnMouseDown.Add((_, player) => 
        {
            this.CalculateMouseT(player);
            this._SliderKnob.Animate(this.ClickedColor, 0.2, AnimationValueTypes.Color);
        });

        this.OnMouseUp.Add((_, player) => 
        {
            this.CalculateMouseT(player);
            this._SliderKnob.Animate(this.AnyHovered ? this.HoveredColor : this.KnobColor, 0.2, AnimationValueTypes.Color);
        });

        this.OnMouseMoved.Add((_, player) => 
        {
            this.CalculateMouseT(player);
        });

        this.OnMouseEnter.Add(() => 
        {
            this._SliderKnob.Animate(this.HoveredColor, 0.2, AnimationValueTypes.Color);
            this._BasePanel.Animate(this.HoveredColor, 0.2, AnimationValueTypes.Color);

        });

        this.OnMouseLeave.Add(() => 
        {
            this._SliderKnob.Animate(this.KnobColor, 0.2, AnimationValueTypes.Color);
            this._BasePanel.Animate(this.BaseColor, 0.2, AnimationValueTypes.Color);
        });
       
        this.OnThink.Add(() => 
        {
            this._SliderKnob.Layout.Width = this.GetKnobRadius();
            this._SliderKnob.Layout.Height = this.GetKnobRadius();

            const sliderAxis = this.Orientation === Orientation.Horizontal ? this.LayoutedTransforms.Width : this.LayoutedTransforms.Height;

            const t = Remap(this.MouseT, 0, 1, 0, sliderAxis - this.GetKnobRadius());

            if (this.Orientation === Orientation.Horizontal)
            {
                this._SliderSpacer.Animate(t, 0.5, AnimationValueTypes.Width);
            }
            else
            {
                this._SliderSpacer.Animate(t, 0.5, AnimationValueTypes.Height);
            }
        });
    }
}
