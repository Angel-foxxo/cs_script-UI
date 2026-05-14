import { Color } from "cs_script/point_script";
import { AnimationValueTypes, Flow, Shape, Size, TextUIPanel, UIPanel } from "./CSUI";
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

    public DefaultColor: Color = CurrentTheme.Border;
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

    constructor(parent: UIPanel, shape: Shape = Shape.Rect, name: string | undefined)
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
