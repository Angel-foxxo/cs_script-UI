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
     * Looks up metrics by char, falling back to '?' if char isn't valid  
     * Valid chars + spaces: ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!\"@#$%^&*}{_+-=,./\\?:;<>][()`'
     */
    public GetGlyph(ch: string): GlyphMetrics
    {
        return this.Glyphs[GetGlyphIndex(ch)] ?? this.Glyphs[GetGlyphIndex("?")];
    }
}
