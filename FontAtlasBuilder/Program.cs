using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Text;
using System.Globalization;
using System.Text;

//
// Reads a TrueType/OpenType font file and produces all the required files for using this in engine and with typescript
//
static class FontAtlasGenerator
{
    const string Charset =
        " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!\"@#$%^&*}{_+-=,./\\?:;<>][()`'1234567890";

    // all paths are relative to addon root
    const string FontFilesPath = "fonts";
    const string GlyphOutputPath = "materials/csui/fonts";
    const string ScriptOutputPath = "src/csui";
    const string FontParticlePath = "particles/csui/fonts";

    record GlyphInfo(
        char Char,
        int Width,
        int Height,
        float Advance
    );

    static readonly float FontPixelSize = 256f;

    static void Main()
    {
        Console.WriteLine($"\n======================== BUILDING FONTS ========================\n");

        string addonPath = GetAddonContentFolder().FullName;

        Console.WriteLine($"Addon Path: {addonPath}\n");

        string[] fontFiles = Directory.GetFiles(Path.Combine(addonPath, FontFilesPath), "*.ttf", SearchOption.AllDirectories);

        PrivateFontCollection fontCollection = new PrivateFontCollection();
        Console.WriteLine($"Fonts found:\n");
        for (int i = 0; i < fontFiles.Length; i++)
        {
            fontCollection.AddFontFile(fontFiles[i]);
            Console.WriteLine($" - `{fontCollection.Families[i].Name}`");
        }

        Console.WriteLine($"\nAtlas Charset: `{Charset}`");

        string glyphOutputPath = Path.Combine(addonPath, GlyphOutputPath);
        string scriptOutputPath = Path.Combine(addonPath, ScriptOutputPath);
        string fontParticlePath = Path.Combine(addonPath, FontParticlePath);

        // delete old font files in case someone removed a font from the fonts folder
        EmptyFolder(fontParticlePath);
        EmptyFolder(glyphOutputPath);

        Console.WriteLine($"\nGlyphs Output Path: `{GlyphOutputPath}`");
        Console.WriteLine($"Typescript Definition File Output Path: `{ScriptOutputPath}`");
        Console.WriteLine($"Font Particles Output Path: `{FontParticlePath}`");
        Console.WriteLine($"\nFont Bake Size: {FontPixelSize}px");

        var fontDefinitions = Templates.FONT_DEFINITIONS
            .Replace("_HEADER_TEXT_", Templates.GENERATED_FILE_HEADER);

        var fontEnumList = "";
        var fontMapEntries = "";
        var fontClasses = "";
        var vmapFontEnts = "";
        var charToGlyph = "";

        for (int i = 0; i < fontFiles.Length; i++)
        {
            var font = new Font(fontCollection.Families[i], FontPixelSize, FontStyle.Regular, GraphicsUnit.Pixel);

            string fontName = FontName(font);
            string fontNameLower = fontName.ToLower();

            Console.WriteLine($"\n======================== PROCESSING FONT: `{fontName}` ========================\n");

            var glyphs = GetGlyphInfo(font);
            SaveIndividualGlyphPngs(glyphs, glyphOutputPath, font);

            
            fontEnumList += $"    {fontName},\n";
            fontMapEntries += $"FontsMap.set(Fonts.{fontName}, {fontName});\n";

            fontClasses += BuildTypeScriptFontDefinition(glyphs, font);

            // write out particle .vpcf font file
            var fontParticleTemplate = Templates.FONT_PARTICLE.Replace("_FONT_ATLAS_PATH_", $"materials/csui/fonts/{fontNameLower}/{fontNameLower}_atlas.vtex");
            File.WriteAllText(Path.Combine(fontParticlePath, $"{fontNameLower}.vpcf"), fontParticleTemplate);

            // assembling the fonts vmap from string templates instead of using the DataModel package because it doesn't support IOT yet
            vmapFontEnts += Templates.VMAP_FONT_ENTS
               .Replace("_FONT_NAME_", fontName)
               .Replace("_ENT_1_ORIGIN_", $"{i * 16} 0 16")
               .Replace("_ENT_2_ORIGIN_", $"{i * 16} 0 0")
               .Replace("_GUID_1_", Guid.NewGuid().ToString())
               .Replace("_GUID_2_", Guid.NewGuid().ToString())
               .Replace("_GUID_3_", Guid.NewGuid().ToString())
               .Replace("_GUID_4_", Guid.NewGuid().ToString())
               .Replace("_GUID_5_", Guid.NewGuid().ToString());

            if (i < fontFiles.Length - 1)
            {
                vmapFontEnts += ",";
            }
        }

        for (int i = 0; i < Charset.Length; i++)
        {
            var _char = Charset[i];

            charToGlyph += $"CharToGlyphs.set({(int)_char}, {i});\n";
        }

        // write out typescript file containing fonts enums, class definitions and the font map
        fontDefinitions = fontDefinitions
            .Replace("_FONT_ENUM_LIST_", fontEnumList)
            .Replace("_FONT_CLASSES_", fontClasses)
            .Replace("_FONT_MAP_ENTRIES_", fontMapEntries)
            .Replace("_CHAR_TO_GLYPHS_", charToGlyph);

        File.WriteAllText(Path.Combine(scriptOutputPath, $"font_definitions.ts"), fontDefinitions);

        // write out template vmap containing particle + template files for every font
        var vmap = Templates.VMAP
            .Replace("_ENTS_", vmapFontEnts)
            .Replace("_HEADER_TEXT_ORIGIN_", $"{((fontFiles.Length* 16) / 2) - 8} 0 32")
            .Replace("_HEADER_TEXT_", Templates.GENERATED_FILE_HEADER);

        File.WriteAllText(Path.Combine(addonPath, $"maps/prefabs/csui/fonts.vmap"), vmap);

        Console.WriteLine("\nFinished writing font files.\nRecompile your map (entity only compile will do) in order to use any new fonts added.\n");
    }

    static List<GlyphInfo> GetGlyphInfo(Font font)
    {
        var results = new List<GlyphInfo>();

        using var probe = new Bitmap(1, 1);
        using var g = Graphics.FromImage(probe);

        g.TextRenderingHint = TextRenderingHint.AntiAlias;

        var sfMeasure = StringFormat.GenericTypographic;
        sfMeasure.FormatFlags |= StringFormatFlags.MeasureTrailingSpaces;

        foreach (char ch in Charset)
        {
            string s = ch.ToString();

            // tight glyph bounds via MeasureCharacterRanges
            sfMeasure.SetMeasurableCharacterRanges([new CharacterRange(0, 1)]);
            var regions = g.MeasureCharacterRanges(s, font!, new RectangleF(0, 0, 4096, 4096), sfMeasure);
            var bounds = regions[0].GetBounds(g);

            // full advance width
            var sfAdv = StringFormat.GenericTypographic;
            sfAdv.FormatFlags |= StringFormatFlags.MeasureTrailingSpaces;
            var advSize = g.MeasureString(s, font!, new PointF(0, 0), sfAdv);

            float glyphW = bounds.Width ;
            float glyphH = bounds.Height;
            float advance = advSize.Width;

            // guard against empty metrics (e.g. space)
            if (glyphW < 1) glyphW = advance;
            if (glyphH < 1) glyphH = font!.GetHeight();

            int cellW = (int)Math.Ceiling(glyphW);
            int cellH = (int)Math.Ceiling(glyphH);

            results.Add(new GlyphInfo(ch, cellW, cellH, advance));
        }

        return results;
    }

    static void SaveIndividualGlyphPngs(List<GlyphInfo> glyphs, string outputPath, Font font)
    {
        string fontName = FontName(font);

        string dir = Path.Combine(outputPath, fontName);
        Directory.CreateDirectory(dir);

       
        var sf = StringFormat.GenericTypographic;
        sf.FormatFlags |= StringFormatFlags.MeasureTrailingSpaces;

        var sb = new StringBuilder();
        sb.AppendLine("sequence 0");
        foreach (var glyph in glyphs)
        {
            using var bmp = new Bitmap(glyph.Width, glyph.Height, PixelFormat.Format32bppArgb);
            using (var g = Graphics.FromImage(bmp))
            {
                g.Clear(System.Drawing.Color.Transparent);
                g.TextRenderingHint = TextRenderingHint.AntiAlias;
                g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;

                g.DrawString(glyph.Char.ToString(), font!, Brushes.White, 0, 0, sf);
            }
            string fileName = $"{(int)glyph.Char}.png";
            string filePath = Path.Combine(dir, fileName);
            bmp.Save(filePath, ImageFormat.Png);
            sb.AppendLine($"frame {fileName} 1");
        }

        string mksFileName = $"{fontName}_atlas.mks";
        string vtexFilePath = Path.Combine(dir, $"{fontName}_atlas.vtex");
        string mksFilePath = Path.Combine(dir, mksFileName);

        string vtex = Templates.VTEX.Replace("_FILE_NAME_", $"materials/csui/fonts/{fontName}/{mksFileName}");

        File.WriteAllText(vtexFilePath, vtex);
        File.WriteAllText(mksFilePath, sb.ToString());
    }

    static string BuildTypeScriptFontDefinition(List<GlyphInfo> glyphs, Font font)
    {
        float lineHeight = font.GetHeight() / FontPixelSize;
        string fontName = FontName(font);

        var fontClass = Templates.FONT_CLASS
            .Replace("_FONT_NAME_", fontName)
            .Replace("_LINE_HEIGHT_", PrintFloatExactSize(lineHeight));

        var fontMetrics = "";

        for (int i = 0; i < glyphs.Count; i++)
        {
            var glyph = glyphs[i];

            var width = PrintFloatExactSize(glyph.Width / FontPixelSize);
            var height = PrintFloatExactSize(glyph.Height / FontPixelSize);
            var advance = PrintFloatExactSize(glyph.Advance / FontPixelSize);

            fontMetrics += Templates.FONT_METRIC
                .Replace("_WIDTH_", width)
                .Replace("_HEIGHT_", height)
                .Replace("_ADVANCE_", advance)
                .Replace("_CHAR_", EscapeTsKey(glyph.Char)) + "\n";

            Console.WriteLine($"Writing Glyph `{glyph.Char}`: Width: `{width}`, Height: `{height}`, Advance: `{advance}`.");
        }

        Console.WriteLine($"\nLine Height `{PrintFloatExactSize(lineHeight)}`");

        fontClass = fontClass
            .Replace("_FONT_METRICS_", fontMetrics);

        return fontClass;
    }

    static string FontName(Font font) => MakeValidFileName($"{font.Name}_{font.Style}");

    static string PrintFloatExactSize(float v) => v.ToString("0.######", CultureInfo.InvariantCulture);

    static string EscapeTsKey(char ch) => ch switch
    {
        '\\' => "\\\\",
        '"' => "\\\"",
        '`' => "\\`",
        '\'' => "\\'",
        _ => ch.ToString(),
    };

    static void EmptyFolder(string path)
    {
        DirectoryInfo di = new DirectoryInfo(path);

        foreach (FileInfo file in di.GetFiles())
        {
            file.Delete();
        }
        foreach (DirectoryInfo dir in di.GetDirectories())
        {
            dir.Delete(true);
        }
    }

    static string MakeValidFileName(string name)
    {
        string invalidChars = System.Text.RegularExpressions.Regex.Escape(new string(Path.GetInvalidFileNameChars())) + " ";
        string invalidRegStr = string.Format(@"([{0}]*\.+$)|([{0}]+)", invalidChars);

        return System.Text.RegularExpressions.Regex.Replace(name, invalidRegStr, "_");
    }

    // Walks up from the executable's directory looking for the pattern  .../game/csgo_addons/<addonName>/...
    // Returns the addon name segment, or throws if not found.
    static DirectoryInfo GetAddonContentFolder()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);

        while (dir != null)
        {
            if (dir.Parent?.Parent != null &&
                dir.Parent.Name.Equals("csgo_addons", StringComparison.OrdinalIgnoreCase) &&
                dir.Parent.Parent.Name.Equals("content", StringComparison.OrdinalIgnoreCase))
            {
                return dir;
            }

            dir = dir.Parent;
        }

        throw new InvalidOperationException("Could not find addon name: no 'game/csgo_addons/<addonName>' segment found in path.");
    }
}
