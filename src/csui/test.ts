import { Color, Instance } from "cs_script/point_script";
import { AlignX, AlignY, Flow, Size, TextUIPanel, UI, UIPanel, UISetDebug } from "./CSUI";
import { Euler, Vec3 } from "@s2ze/math";
import { Fonts } from "./font_definitions";

Instance.ServerCommand("mp_warmup_offline_enabled 1");
Instance.ServerCommand("mp_warmup_pausetimer 1");
Instance.ServerCommand("mp_force_pick_time 0");

const TestUITarget = Instance.FindEntityByName("testui.target")!;
let TestUI: UI | undefined = undefined;

UISetDebug(false);

interface ThemeColors
{
    /**For background elements like the window itself and titlebars.*/
    App: Color,
    /**For element which need to stand out from the background.*/
    AppMiddle: Color,
    /**For element which need to sit between App and AppSoft colors.*/
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

const CurrentTheme: ThemeColors = DarkTheme;

//UISetDebug(true);

function SpawnUI()
{
    const menuItems = ["CMBN", "SCAN IN PROGRESS", "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG", "Lorem ipsum dolor sit amet, consectetuer", "!\"@#$%^&*}{_+-=,./\\?:;<>][()`'", "1234567890"];
    const menuColors = [
        { r: 80, g: 212, b: 85, a: 255 },
        { r: 205, g: 212, b: 80, a: 255 },
        { r: 255, g: 255, b: 255, a: 255 },
        { r: 197, g: 41, b: 230, a: 255 },
        { r: 230, g: 129, b: 41, a: 255 },
        { r: 41, g: 230, b: 223, a: 255 },
        
    ];

    TestUI = new UI();
    TestUI.Brightness = 2;
    TestUI.AlignX = AlignX.Center;
    TestUI.AlignY = AlignY.Center;
    TestUI.Origin = new Vec3(TestUITarget.GetAbsOrigin());
    TestUI.Angles = new Euler(TestUITarget.GetAbsAngles());

    const root = new UIPanel(TestUI);
    root.Color = CurrentTheme.App;
    root.Layout = {
        Width: 140,
        Height: Size.Fit,
        Flow: Flow.TopBottom,
        Padding: 2,
        ChildGap: 2,
    };

    for (let i = 0; i < 6; i++)
    {
        const menuItemPanel = new UIPanel(root);
        menuItemPanel.Color = CurrentTheme.AppSoft;
        menuItemPanel.Layout = {
            Width: Size.Grow,
            Height: 10,
            AlignX: AlignX.Center,
            AlignY: AlignY.Center,
            Padding: 4,
        };

        const textPanel = new TextUIPanel(menuItemPanel, Fonts.Roboto_Regular, menuItems[i]);
        textPanel.Layout = {
            Width: Size.Grow,
            Height: 1,
            Scale: 3,
        };

        textPanel.Color = menuColors[i];
    }
}

Instance.OnRoundStart(() => 
{
    SpawnUI();
});

Instance.OnScriptReload({ 
    before:(() => 
    {
        TestUI?.Cleanup();
    }),
    
    after: (() => 
    {
        SpawnUI();
    }),
});

Instance.SetThink(() => 
{
    TestUI?.Think();
    
    Instance.SetNextThink(Instance.GetGameTime());
});
Instance.SetNextThink(Instance.GetGameTime());
