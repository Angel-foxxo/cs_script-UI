import { Color, CSPlayerPawn } from "cs_script/point_script";
import { AlignX, AnimationValueTypes, Event, Flow, InvisUIPanel, Remap, Shape, Size, TextUIPanel, UIPanel } from "./CSUI";
import { Fonts } from "./font_definitions";

export const DEFAULT_FONT: Fonts = Fonts.Roboto_Regular;

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

export class Slider extends InvisUIPanel
{
    private _SliderBody: UIPanel;
    private _SliderSpacer: InvisUIPanel;
    private _SliderKnob: UIPanel;
    private _SliderThickness: number = 10;
    private _KnobRadius: number = this._SliderThickness;
    private _MouseT: number = 0;

    public readonly OnValueChanged = new Event<[number]>();

    public _KnobColor: Color = CurrentTheme.Accent;
    public _SliderColor: Color = CurrentTheme.Border;

    public get SliderThickness(): number
    {
        return this._SliderThickness;
    }

    public set SliderThickness(thickness: number) 
    {
        this._SliderThickness = thickness;
        this._SliderBody.Layout.Height = this.SliderThickness;
    }

    public get KnobRadius(): number
    {
        return this._KnobRadius;
    }

    public set KnobRadius(radius: number) 
    {
        this._KnobRadius = radius;
        this._SliderKnob.Layout.Height = radius * 2;
        this._SliderKnob.Layout.Width = radius * 2;
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

    private CalculateMouseT(player: CSPlayerPawn)
    {
        const mousePos = this.GetMousePos(player);

        if (mousePos === undefined)
        {
            return;
        }

        if (this.IsClickingBy(player))
        {
            this.MouseT = mousePos.x;
            this.OnValueChanged.Invoke(this.MouseT);
        }
    }

    constructor(parent: UIPanel, name: string | undefined = undefined)
    {
        super(parent, name);

        this._SliderBody = new UIPanel(this, Shape.Rect);
        this._SliderBody.Layout.Height = this.SliderThickness;
        this._SliderBody.Layout.Width = Size.Grow;
        this._SliderBody.Color = this.SliderColor;
        this._SliderBody.Layout.Flow = Flow.LeftRight;
        this._SliderBody.Layout.AlignX = AlignX.Left;

        this._SliderSpacer = new InvisUIPanel(this._SliderBody);
        this._SliderSpacer.Layout.Height = 0;
    
        this._SliderKnob = new UIPanel(this._SliderBody, Shape.Elipse);
        this._SliderKnob.Layout.Height = this.KnobRadius * 2;
        this._SliderKnob.Layout.Width = this.KnobRadius * 2;
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
            const t = Remap(this.MouseT, 0, 1, 0, this.LayoutTransforms.Width - this.KnobRadius * 2);

            this._SliderSpacer.Layout.Width = t;
        });
    }
}
