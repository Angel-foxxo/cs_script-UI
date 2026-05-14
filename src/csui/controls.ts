import { Color, CSPlayerPawn } from "cs_script/point_script";
import { AlignX, AlignY, AnimationValueTypes, Event, Flow, InvisUIPanel, Remap, Shape, Size, TextUIPanel, UIPanel } from "./CSUI";
import { Fonts } from "./font_definitions";

export const DEFAULT_FONT: Fonts = Fonts.Roboto_Regular;

//////////////// THEME ////////////////

interface ThemeColors
{
    /**For background elements like the window itself and titlebars.*/
    App: Color,
    /**For elements which need to stand out from the background.*/
    AppMiddle: Color,
    /**For elements which need to sit between App and AppSoft colors.*/
    AppSoft: Color,
    /**For borders meant to visually separate parts of the interface.*/
    Border: Color,
    /**For any element which needs contrast from the background, like text*/
    Contrast: Color,
    /**For any element which needs contrast but doesn't have to be as visible, like inactive text or scrollbars*/
    ContrastSoft: Color,
    /**For anything that needs to be accented like hovering over a tab*/
    HoverAccent: Color,
    /**For anything that needs to be accented*/
    Accent: Color,
}

const DarkTheme: ThemeColors = {
    App: { r:22, g:25, b:32, a:255 },
    AppMiddle: { r:34, g:39, b:51, a:255 },
    AppSoft: { r:44, g:49, b:61, a:255 },

    Border: { r:51, g:57, b:74, a:255 },

    Contrast: { r: 255, g: 255, b: 255, a: 255 },
    ContrastSoft: { r:158, g:159, b:164, a:255 },

    HoverAccent: { r:0, g:66, b:151, a:255 },
    Accent: { r:99, g:161, b:255, a:255 },
};

export const CurrentTheme: ThemeColors = DarkTheme;

//////////////// BUTTON ////////////////

export class Button extends UIPanel
{
    private _TextPanel: TextUIPanel;
    private _Text: string = "";
    private _DefaultColor: Color = CurrentTheme.Border;

    public get DefaultColor(): Color 
    {
        return this._DefaultColor;
    }

    public set DefaultColor(color: Color)
    {
        this._DefaultColor = color;
        this.Color = color;
    }

    public PressedColor: Color = CurrentTheme.Accent;
    public HoveredColor: Color = CurrentTheme.HoverAccent;

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

    constructor(parent: UIPanel, shape: Shape = Shape.Rect, name: string | undefined = undefined)
    {
        super(parent, shape, name);

        this.Color = this.DefaultColor;
        this.Layout.Flow = Flow.TopBottom;
        
        this._TextPanel = new TextUIPanel(this, DEFAULT_FONT, "");
        this._TextPanel.Color = CurrentTheme.Contrast;
        this._TextPanel.Layout.Width = Size.Grow;
        this._TextPanel.Layout.Height = Size.Grow;

        this.OnMouseEnter.Add(() => 
        {
            this.Animate(this.HoveredColor, 0.2, AnimationValueTypes.Color);
        });

        this.OnMouseLeave.Add(() => 
        {
            this.Animate(this.DefaultColor, 0.2, AnimationValueTypes.Color);

        });

        this.OnMouseDown.Add(() => 
        {
            this.Animate(this.PressedColor, 0.2, AnimationValueTypes.Color);
        });

        this.OnMouseUp.Add(() => 
        {
            this.Animate(this.AnyHovered ? this.HoveredColor : this.DefaultColor, 0.2, AnimationValueTypes.Color);
        });
    }       

};

//////////////// SLIDER ////////////////

export enum Orientation
{
    Horizontal,
    Vertical,
}

export class Slider extends InvisUIPanel
{
    private _SliderBody: UIPanel;
    private _SliderSpacer: InvisUIPanel;
    private _SliderKnob: UIPanel;
    private _SliderThickness: number = 1;
    private _KnobSize: number = 1;
    private _MouseT: number = 0;
    private _KnobColor: Color = CurrentTheme.Accent;
    private _SliderColor: Color = CurrentTheme.Border;
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
            this._SliderBody.Layout.Height = this.SliderThickness;
        }
        else
        {
            this._SliderBody.Layout.Width = this.SliderThickness;
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
        this._SliderKnob.Color = color;
    }

    public get SliderColor(): Color
    {
        return this._SliderColor; 
    }

    public set SliderColor(color: Color)
    {
        this._SliderColor = color;
        this._SliderBody.Color = color;
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
            this._SliderBody.Layout.Height = this.SliderThickness;
            this._SliderBody.Layout.Width = this.Layout.Width === Size.Fit ? this._SliderLength : Size.Grow;
        }
        else
        {
            this._SliderBody.Layout.Height = this.Layout.Height === Size.Fit ? this._SliderLength : Size.Grow;
            this._SliderBody.Layout.Width = this.SliderThickness;
        }
       
    }

    constructor(parent: UIPanel, orientation: Orientation, name: string | undefined = undefined)
    {
        super(parent, name);

        this.Orientation = orientation;
        this.Layout.Width = this.Orientation === Orientation.Horizontal ? Size.Grow : Size.Fit;
        this.Layout.Height = this.Orientation === Orientation.Horizontal ? Size.Fit : Size.Grow;

        this.LockInput = true;

        this._SliderBody = new UIPanel(this, Shape.Rect);
        this._SliderBody.Color = this.SliderColor;
        this._SliderBody.Layout = { 
            Flow: this.Orientation === Orientation.Horizontal ? Flow.LeftRight : Flow.TopBottom,
            AlignX: this.Orientation === Orientation.Horizontal ? AlignX.Left : AlignX.Center,
            AlignY: this.Orientation === Orientation.Horizontal ? AlignY.Center : AlignY.Top,
        };

        this.SetBodySize();

        this._SliderSpacer = new InvisUIPanel(this._SliderBody);
        this._SliderSpacer.Layout.Height = 0;
        this._SliderSpacer.Layout.Width = 0;
    
        this._SliderKnob = new UIPanel(this._SliderBody, Shape.Elipse);
        this._SliderKnob.Color = this.KnobColor;

        this.OnMouseDown.Add((_, player) => 
        {
            this.CalculateMouseT(player);
        });

        this.OnMouseMoved.Add((_, player) => 
        {
            this.CalculateMouseT(player);
        });

        this.OnThink.Add(() => 
        {
            this._SliderKnob.Layout.Width = this.GetKnobRadius();
            this._SliderKnob.Layout.Height = this.GetKnobRadius();

            const sliderAxis = this.Orientation === Orientation.Horizontal ? this.LayoutTransforms.Width : this.LayoutTransforms.Height;

            const t = Remap(this.MouseT, 0, 1, 0, sliderAxis - this.GetKnobRadius());

            if (this.Orientation === Orientation.Horizontal)
            {
                this._SliderSpacer.Layout.Width = t;
            }
            else
            {
                this._SliderSpacer.Layout.Height = t;
            }
        });
    }
}
