/*! Copyright (C) 2026 Angel Cazacu - Licensed under the Mozilla Public License Version 2.0. See <https://www.mozilla.org/en-US/MPL/2.0/> for details. 
*
*   Reads a TrueType/OpenType font file and produces all the required files for using this in engine and with typescript.
*   Ported from C#.
*/

import fs from 'node:fs';
import path from 'node:path';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { v4 as uuidv4 } from 'uuid';
import * as Templates from './Templates';

const VERSION = 'v1.0.6';

const BASE_CHARS = '� ';

const DEFAULT_CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!"@#$%^&*}{_+-=,./?:;<>][()`\'1234567890';

// all paths are relative to addon root
const FONT_FILES_PATH = 'fonts';
const GLYPH_OUTPUT_PATH = 'materials/csui/fonts';
const SCRIPT_OUTPUT_PATH = 'src/csui';
const FONT_PARTICLE_PATH = 'particles/csui/fonts';

const FONT_PIXEL_SIZE = 256;

interface GlyphInfo {
    char: string;
    width: number;
    height: number;
    advance: number;
}

interface RegisteredFont {
    filePath: string;
    family: string;
}

function PrintFloat(v: number): string
{
    return v.toFixed(6).replace(/\.?0+$/, '');
}

function MakeValidFileName(name: string): string
{
    return name.replace(/[/\\?%*:|"<> -]/g, '_');
}

function EmptyFolder(folderPath: string): void
{
    if (!fs.existsSync(folderPath))
    {
        fs.mkdirSync(folderPath, { recursive: true });
        return;
    }
    for (const entry of fs.readdirSync(folderPath, { withFileTypes: true }))
    {
        const full = path.join(folderPath, entry.name);
        if (entry.isDirectory()) fs.rmSync(full, { recursive: true, force: true });
        else fs.unlinkSync(full);
    }
}

// walks up from the working dir looking for the pattern  .../game/csgo_addons/<addonName>/...
// returns the addon name segment, or throws if not found
function GetAddonContentFolder(): string
{
    let dir = process.cwd();
    while (true)
    {
        const parent = path.dirname(dir);
        const grandparent = path.dirname(parent);
        if (
            path.basename(parent).toLowerCase() === 'csgo_addons' &&
            path.basename(grandparent).toLowerCase() === 'content'
        )
        {
            return dir;
        }
        if (parent === dir) break;
        dir = parent;
    }
    throw new Error(
        "Could not find addon name: no 'content/csgo_addons/<addonName>' segment found in path.\n" +
        'Make sure this script is run from inside a CS2 addon.',
    );
}

function GetCharset(mainChars: string): string
{
    return BASE_CHARS + mainChars;
}

function RegisterFont(filePath: string): RegisteredFont | null
{
    // prefix with CSUI_ to not conflict with installed system fonts
    const family =
        'CSUI_' +
        path.basename(filePath, path.extname(filePath));

    const ok = GlobalFonts.registerFromPath(filePath, family);

    if (!ok) return null;

    return { filePath, family };
}

interface FontMetrics {
    /** Distance from alphabetic baseline to the top of the em box, pixels. */
    ascent: number;
    /** Full line height (ascent + descent), pixels. */
    lineHeight: number;
}

/**
 * Returns stable, font-wide ascent and line height.
 * Equivalent to C# font.GetHeight() / Graphics ascent.
 * Measured on a reference string that exercises ascenders and descenders.
 */
function GetFontMetrics(family: string): FontMetrics
{
    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext('2d');
    ctx.font = `${FONT_PIXEL_SIZE}px "${family}"`;
    ctx.textBaseline = 'alphabetic';
    const m = ctx.measureText('Agyp|');
    const ascent = Math.ceil(m.fontBoundingBoxAscent);
    const descent = Math.ceil(m.fontBoundingBoxDescent);
    return { ascent, lineHeight: ascent + descent };
}

/**
 * Mirrors C# GetGlyphInfo, with one improvement:
 *
 * Width  = max(advance, actualBoundingBoxRight)
 *   Using advance alone (like C#) clips glyphs whose ink extends past the
 *   advance width (e.g. 'j', 'f', italic glyphs). Taking the max ensures the
 *   canvas is always wide enough to contain all ink without changing how the
 *   renderer places glyphs - it still advances the pen by `advance`.
 *
 * Height  = shared font line height (same for every glyph, baselines align).
 * Advance = m.width (full pen advance).
 *
 * The glyph PNG is drawn at x=0, y=fontAscent - identical to C# DrawString
 * at (0, 0) with GenericTypographic. No x-offset is needed because we never
 * shift the draw origin; we only make the canvas wide enough on the right.
 */
function GetGlyphInfo(family: string, charset: string): GlyphInfo[]
{
    const { lineHeight } = GetFontMetrics(family);

    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext('2d');
    ctx.font = `${FONT_PIXEL_SIZE}px "${family}"`;
    ctx.textBaseline = 'alphabetic';

    const results: GlyphInfo[] = [];

    for (const ch of charset)
    {
        const m = ctx.measureText(ch);

        const advance = m.width;

        // Right ink extent from the draw origin (x=0).
        // For most glyphs this equals the advance; for descender-heavy glyphs
        // like 'j' it can be larger.
        const rightInkEdge = m.actualBoundingBoxRight;

        // Canvas must be at least as wide as the advance (so the next glyph
        // starts in the right place) AND wide enough for any ink that spills
        // past the advance on the right.
        const canvasW = Math.max(advance, rightInkEdge);

        results.push({
            char: ch,
            width:   Math.ceil(canvasW),
            height:  lineHeight,
            advance,
        });
    }

    return results;
}

/**
 * canvas: glyph.width / glyph.height, glyph drawn at x=0, y=fontAscent - same origin as C# DrawString(char, 0, 0),
 * the renderer places the particle center at pen + pixelW/2, advancing pen by advance
 */
function SaveIndividualGlyphPngs(glyphs: GlyphInfo[], outputPath: string, fontName: string, family: string)
{
    const dir = path.join(outputPath, fontName);
    fs.mkdirSync(dir, { recursive: true });

    const { ascent: fontAscent } = GetFontMetrics(family);

    const mksLines: string[] = ['sequence 0'];

    for (const glyph of glyphs)
    {
        const w = Math.max(glyph.width, 1);
        const h = Math.max(glyph.height, 1);

        const canvas = createCanvas(w, h);
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, w, h);
        ctx.font = `${FONT_PIXEL_SIZE}px "${family}"`;
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = 'white';

        // draw at x=0 so left ink starts at the left canvas edge, matching C# DrawString at x=0 with GenericTypographic
        // y=fontAscent is the shared baseline row across all glyphs
        ctx.fillText(glyph.char, 0, fontAscent);

        const fileName = `${glyph.char.codePointAt(0)}.png`;
        const filePath = path.join(dir, fileName);

        fs.writeFileSync(filePath, canvas.toBuffer('image/png'));

        // add same frame 3 times as padding, since if the atlas index is slightly off due to numerical imprecision
        // it will try to blend with previous or next frame, like this it will look fine
        mksLines.push(`frame ${fileName} 1`);
        mksLines.push(`frame ${fileName} 1`);
        mksLines.push(`frame ${fileName} 1`);
    }

    const mksFileName = `${fontName}_atlas.mks`;
    const vtexFilePath = path.join(dir, `${fontName}_atlas.vtex`);
    const mksFilePath = path.join(dir, mksFileName);

    const vtex = Templates.VTEX.replace(
        '_FILE_NAME_',
        `materials/csui/fonts/${fontName}/${mksFileName}`,
    );

    fs.writeFileSync(vtexFilePath, vtex);
    fs.writeFileSync(mksFilePath, mksLines.join('\n'));
}

function BuildTypeScriptFontDefinition(glyphs: GlyphInfo[], family: string, fontName: string): string
{
    const { lineHeight } = GetFontMetrics(family);
    const lineHeightNorm = lineHeight / FONT_PIXEL_SIZE;

    let fontMetrics = '';
    for (const glyph of glyphs)
    {
        const w = PrintFloat(glyph.width / FONT_PIXEL_SIZE);
        const h = PrintFloat(glyph.height / FONT_PIXEL_SIZE);
        const a = PrintFloat(glyph.advance / FONT_PIXEL_SIZE);

        fontMetrics += Templates.FONT_METRIC
            .replace('_WIDTH_', w)
            .replace('_HEIGHT_', h)
            .replace('_ADVANCE_', a)
            .replace('_CHAR_', glyph.char)
            + '\n';

        console.log(`  Glyph '${glyph.char}': w=${w}, h=${h}, adv=${a}`);
    }

    console.log(`  Line height: ${PrintFloat(lineHeightNorm)}`);

    return Templates.FONT_CLASS
        .replace(/_FONT_NAME_/g, fontName)
        .replace('_LINE_HEIGHT_', PrintFloat(lineHeightNorm))
        .replace('_FONT_METRICS_', fontMetrics);
}

function Main()
{
    console.log(`Font Atlas Generator ${VERSION}`);
    console.log('Reads TrueType/OpenType font files and produces all required files for CS2 addon usage.\n');

    let mainChars = DEFAULT_CHARS;
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++)
    {
        if (args[i].toLowerCase() === '-chars' && args[i + 1])
        {
            mainChars = args[i + 1];
        }
    }

    const charset = GetCharset(mainChars);
    const addonPath = GetAddonContentFolder();

    console.log('======================== BUILDING FONTS ========================\n');
    console.log(`Addon Path: ${addonPath}`);

    const fontDir = path.join(addonPath, FONT_FILES_PATH);
    const ttfFiles = fs.readdirSync(fontDir, { recursive: true, withFileTypes: true })
        .filter(e => e.isFile() && e.name.toLowerCase().endsWith('.ttf'))
        .map(e => path.join(e.parentPath, e.name));

    if (ttfFiles.length === 0) throw new Error(`No .ttf files found in ${fontDir}`);

    const registeredFonts: RegisteredFont[] = [];
    console.log('\nFonts found:');
    for (const filePath of ttfFiles)
    {
        const reg = RegisterFont(filePath);
        if (!reg)
        {
            console.warn(`  Warning: could not register font at ${filePath}`); continue;
        }
        registeredFonts.push(reg);
        console.log(`  - \`${reg.family}\``);
    }

    console.log(`\nAtlas Charset: \`${charset}\``);

    const glyphOutputPath = path.join(addonPath, GLYPH_OUTPUT_PATH);
    const scriptOutputPath = path.join(addonPath, SCRIPT_OUTPUT_PATH);
    const fontParticlePath = path.join(addonPath, FONT_PARTICLE_PATH);

    // delete old font files in case someone removed a font from the fonts folder
    EmptyFolder(fontParticlePath);
    EmptyFolder(glyphOutputPath);

    console.log(`\nGlyphs Output Path:     ${GLYPH_OUTPUT_PATH}`);
    console.log(`TypeScript Definitions: ${SCRIPT_OUTPUT_PATH}`);
    console.log(`Font Particles:         ${FONT_PARTICLE_PATH}`);
    console.log(`Font Bake Size:         ${FONT_PIXEL_SIZE}px\n`);

    let fontDefinitions = Templates.FONT_DEFINITIONS.replace(
        '_HEADER_TEXT_',
        `/*!
* Auto-generated by FontAtlasGenerator.ts - DO NOT EDIT
* Copyright (C) 2026 Angel Cazacu - Licensed under the Mozilla Public License Version 2.0. See <https://www.mozilla.org/en-US/MPL/2.0/> for details.
*/`,
    );

    let fontEnumList = '';
    let fontMapEntries = '';
    let fontClasses = '';
    let vmapFontEnts = '';
    let charToGlyph = '';

    for (let i = 0; i < registeredFonts.length; i++)
    {
        const { family } = registeredFonts[i];
        const fontName = MakeValidFileName(family).replace('CSUI_', '');
        const fontNameLower = fontName.toLowerCase();

        console.log(`======================== PROCESSING FONT: \`${fontName}\` ========================\n`);

        const glyphs = GetGlyphInfo(family, charset);
        SaveIndividualGlyphPngs(glyphs, glyphOutputPath, fontName, family);

        fontEnumList += `    ${fontName},\n`;
        fontMapEntries += `FontsMap.set(Fonts.${fontName}, ${fontName});\n`;
        fontClasses += BuildTypeScriptFontDefinition(glyphs, family, fontName);

        // write out particle .vpcf font file
        const vpcfContent = Templates.FONT_PARTICLE.replace(
            '_FONT_ATLAS_PATH_',
            `materials/csui/fonts/${fontNameLower}/${fontNameLower}_atlas.vtex`,
        );
        fs.writeFileSync(path.join(fontParticlePath, `${fontNameLower}.vpcf`), vpcfContent);

        // manually assembling the fonts vmap from string templates
        vmapFontEnts += Templates.VMAP_FONT_ENTS
            .replace(/_FONT_NAME_/g, fontNameLower)
            .replace('_ENT_1_ORIGIN_', `${i * 16} 0 16`)
            .replace('_ENT_2_ORIGIN_', `${i * 16} 0 0`)
            .replace('_GUID_1_', uuidv4())
            .replace('_GUID_2_', uuidv4())
            .replace('_GUID_3_', uuidv4())
            .replace('_GUID_4_', uuidv4())
            .replace('_GUID_5_', uuidv4())
            .replace('_GUID_6_', uuidv4());

        if (i < registeredFonts.length - 1) vmapFontEnts += ',';
    }

    for (let i = 0; i < charset.length; i++)
    {
        const cp = charset.codePointAt(i)!;
        charToGlyph += `CharToGlyphs.set(${cp}, ${i});\n`;
        if (cp > 0xffff) i++;
    }

    // write out typescript file containing fonts enums, class definitions and the font map
    fontDefinitions = fontDefinitions
        .replace('_FONT_ENUM_LIST_', fontEnumList)
        .replace('_FONT_CLASSES_', fontClasses)
        .replace('_FONT_MAP_ENTRIES_', fontMapEntries)
        .replace('_CHAR_TO_GLYPHS_', charToGlyph);

    fs.mkdirSync(scriptOutputPath, { recursive: true });
    fs.writeFileSync(path.join(scriptOutputPath, 'font_definitions.ts'), fontDefinitions);

    // write out template vmap containing particle + template files for every font
    const vmapContent = Templates.VMAP
        .replace('_ENTS_', vmapFontEnts)
        .replace('_HEADER_TEXT_ORIGIN_', `${Math.floor((registeredFonts.length * 16) / 2) - 8} 0 32`)
        .replace('_HEADER_TEXT_', 'Auto-generated by FontAtlasGenerator.ts \u2014 DO NOT EDIT');

    const vmapDir = path.join(addonPath, 'maps/prefabs/csui');
    fs.mkdirSync(vmapDir, { recursive: true });
    fs.writeFileSync(path.join(vmapDir, 'fonts.vmap'), vmapContent);

    console.log('\nFinished writing font files.');
    console.log('Recompile your map (entity-only compile will do) in order to use any new fonts added.\n');
}

Main();
