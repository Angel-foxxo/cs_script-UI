import { CharToGlyphs } from "./font_definitions";

export interface GlyphMetrics {
    /** Glyph pixel width  at baked size */
    pixelW: number;
    /** Glyph pixel height at baked size */
    pixelH: number;
    /** X offset: pen origin quad left  (px, right = +) */
    bearingX: number;
    /** Y offset: baseline   quad top   (px, up    = +) */
    bearingY: number;
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
     * Returns the index of the char's glpyh in the Glyphs array
     */
    public GetGlyphIndex(ch: string): number
    {
        return CharToGlyphs.get(ch.charCodeAt(0)) ?? 0;
    }

    /** 
     * Looks up metrics by char, falling back to '?' if char isn't valid  
     * Valid chars + spaces: ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!\"@#$%^&*}{_+-=,./\\?:;<>][()`'
     */
    public GetGlyph(ch: string): GlyphMetrics
    {
        return this.Glyphs[this.GetGlyphIndex(ch)] ?? this.Glyphs[this.GetGlyphIndex("?")];
    }

    /**
     * Assemble text string into an array of local-space quad positions.
     */
    public AssembleText(text: string, scale = 1): { char: string; x: number; y: number; w: number; h: number }[]
    {
        const quads = [];
        let cx = 0;
        for (const ch of text)
        {
            const g = this.GetGlyph(ch);
            quads.push({
                char: ch,
                x:  cx + g.bearingX * scale,
                y:  g.bearingY * scale, // bearingY up subtract in Y-down
                w:  g.pixelW * scale,
                h:  g.pixelH * scale,
            });
            cx += g.advance * scale;
        }
        return quads;
    }
}
