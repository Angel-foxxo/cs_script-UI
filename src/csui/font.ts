import { GetGlyphIndex } from "./font_definitions";

export interface GlyphMetrics {
    /** Glyph pixel width  at baked size */
    pixelW: number;
    /** Glyph pixel height at baked size */
    pixelH: number;
    /** Pen advance after this glyph (px) */
    advance: number;
}

export class Font
{
    private _FontName: string;
    private _FontLineHeight: number;
    private Glyphs: GlyphMetrics[];

    public get FontName(): string
    {
        return this._FontName;
    }

    public get CharCount(): number
    {
        return this.Glyphs.length;
    }

    public get FontLineHeight(): number
    {
        return this._FontLineHeight;
    }

    constructor(fontName: string, fontLineHeight: number, glyphs: GlyphMetrics[])
    {
        this._FontName = fontName;
        this._FontLineHeight = fontLineHeight;
        this.Glyphs = glyphs;
    }

    /** 
     * Valid chars + spaces: ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!\"@#$%^&*}{_+-=,./\\?:;<>][()`'
     */
    public GetGlyph(ch: string): GlyphMetrics
    {
        return this.Glyphs[GetGlyphIndex(ch)];
    }

    /** 
     * Measures how much space the text string would take
     */
    public MeasureText(text: string): number
    {
        let space = 0;
        for (let i = 0; i < text.length; i++) 
        {
            const char = text[i];
            const glyph = this.GetGlyph(char);
            space += glyph.advance;
        }

        return space;
    }
}
