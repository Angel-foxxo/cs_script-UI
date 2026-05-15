import { Instance } from "cs_script/point_script";
import { AlignX, AlignY, AnimationValueTypes, BaseUIPanel, Flow, InvisUIPanel, Shape, Size, TextUIPanel, UI, UIPanel, UISetDebug } from "./CSUI";
import { Euler, Vec3 } from "@s2ze/math";
import { Fonts } from "./font_definitions";
import { Button, CurrentTheme, Orientation, RadioButton, Slider } from "./controls";

Instance.ServerCommand("mp_warmup_offline_enabled 1");
Instance.ServerCommand("mp_warmup_pausetimer 1");
Instance.ServerCommand("mp_force_pick_time 0");

const TestUITarget = Instance.FindEntityByName("testui.target")!;
let TestUI: UI | undefined = undefined;

UISetDebug(false);

//UISetDebug(true);

Instance.OnPlayerChat(({ text }) => 
{
    if (text === "test")
    {
        const iconPanels = TestUI!.GetPanels("*iconPanel");

        for (const iconPanel of iconPanels) 
        {
            iconPanel.Layout.Width = 30;
        }
    }
});

function SpawnUI()
{
    TestUI = new UI();
    TestUI.AddPlayer(Instance.GetPlayerController(0)!.GetPlayerPawn()!);
    TestUI.Brightness = 2;
    TestUI.AlignX = AlignX.Center;
    TestUI.AlignY = AlignY.Top;
    TestUI.Origin = new Vec3(TestUITarget.GetAbsOrigin());
    TestUI.Angles = new Euler(TestUITarget.GetAbsAngles());

    const root = new InvisUIPanel(TestUI);
    root.Color = CurrentTheme.App;
    root.Layout = {
        Width: Size.Fit,
        Height: Size.Fit,
        Flow: Flow.LeftRight,
        AlignY: AlignY.Top,
        Padding: 2,
        ChildGap: 10,
    };

    SpawnTestUI(root);
    SpawnTestUIControPanel(root);
}

function SpawnTestUI(parent: BaseUIPanel): UIPanel
{
    const menuItems = ["CMBN", "SCAN IN PROGRESS", "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG", "Lorem          ipsum dolor       sit amet, consectetuer", "!\"@#$%^&*}{_+-=,./\\?:;<>][()`'", "1234567890"];

    const menuColors = [
        { r: 80, g: 212, b: 85, a: 255 },
        { r: 205, g: 212, b: 80, a: 255 },
        { r: 255, g: 255, b: 255, a: 255 },
        { r: 197, g: 41, b: 230, a: 255 },
        { r: 230, g: 129, b: 41, a: 255 },
        { r: 41, g: 230, b: 223, a: 255 },
        
    ];

    const root = new UIPanel(parent);
    root.Color = CurrentTheme.App;
    root.Layout = {
        Width: 140,
        Height: Size.Fit,
        Flow: Flow.TopBottom,
        AlignY: AlignY.Top,
        Padding: 2,
        ChildGap: 2,
    };

    for (let i = 0; i < 6; i++)
    {
        const menuItemPanel = new UIPanel(root);
        menuItemPanel.Color = CurrentTheme.AppSoft;
        menuItemPanel.Layout = {
            Width: Size.Grow,
            Height: Size.Fit,
            AlignX: AlignX.Center,
            AlignY: AlignY.Center,
            Flow: Flow.LeftRight,
            ChildGap: 2,
            Padding: 2,
        };

        const textPanel = new TextUIPanel(menuItemPanel, Fonts.Roboto_Regular, menuItems[i], "mainUIText");
        textPanel.Color = menuColors[i];
        textPanel.Layout = {
            Scale: 5,
            Height: Size.Fit,
            Width: Size.Grow,
            AlignX: AlignX.Center,
        };

        const sliderPanel = new Slider(menuItemPanel, Orientation.Horizontal);
        sliderPanel.Color = CurrentTheme.AppSoft;
        sliderPanel.SliderThickness = 2;
        sliderPanel.OnValueChanged.Add((t) => 
        {
            textPanel.Layout.Scale = ((1 - t) * 5);
        });

        const buttonPanel = new Button(menuItemPanel, Shape.Rect, i + "iconPanel");
        buttonPanel.Text = "test button";
        buttonPanel.TextScale = 4;
        buttonPanel.Layout = {
            Width: 15,
            Height: 15,
        };

        buttonPanel.OnMouseDown.Add(() => 
        {
            buttonPanel.Text = "pressed";
            buttonPanel.Animate(45, 0.2, AnimationValueTypes.Width);

        });

        buttonPanel.OnMouseUp.Add(() => 
        {
            buttonPanel.Text = buttonPanel.AnyHovered ? "hovered" : "test button";
            buttonPanel.Animate(15, 0.2, AnimationValueTypes.Width);
        });

        buttonPanel.OnMouseEnter.Add(() => 
        {
            buttonPanel.Text = "hovered";
            buttonPanel.Animate(1.3, 0.2, AnimationValueTypes.Scale);
        });

        buttonPanel.OnMouseLeave.Add(() => 
        {
            buttonPanel.Text = "test button";
            buttonPanel.Animate(1, 0.2, AnimationValueTypes.Scale);
        });
    }

    return root;
}

function SpawnTestUIControPanel(parent: BaseUIPanel): UIPanel
{
    const root = new UIPanel(parent);
    root.Color = CurrentTheme.App;
    root.Layout = {
        Width: Size.Fit,
        Height: Size.Fit,
        AlignY: AlignY.Top,
        AlignX: AlignX.Left,
        Flow: Flow.TopBottom,
        Padding: 2,
        ChildGap: 2,
    };

    const radioButtonsText = new TextUIPanel(root, Fonts.Roboto_Regular, "Text Alignment");
    radioButtonsText.Color = CurrentTheme.Contrast;
    radioButtonsText.Layout = {
        Width: Size.Fit,
        Height: Size.Fit,
        Flow: Flow.LeftRight,
        AlignX: AlignX.Center,
        AlignY: AlignY.Center,
        ChildGap: 2,
        Scale: 5,
    };

    const radioButtonsPanel = new InvisUIPanel(root);
    radioButtonsPanel.Color = CurrentTheme.AppMiddle;
    radioButtonsPanel.Layout = {
        Width: Size.Grow,
        Height: Size.Fit,
        Flow: Flow.TopBottom,
        AlignX: AlignX.Left,
        AlignY: AlignY.Top,
        ChildGap: 2,
    };

    for (let i = 0; i < 3; i++) 
    {
        const radioButtonPanel = new UIPanel(radioButtonsPanel);
        radioButtonPanel.Color = CurrentTheme.AppMiddle;
        radioButtonPanel.Layout = {
            Width: Size.Grow,
            Height: Size.Fit,
            Flow: Flow.LeftRight,
            AlignX: AlignX.Left,
            ChildGap: 2,
            Padding: 2,
        };
    
        const radioButton = new RadioButton(radioButtonPanel, "testRadioButtons");
        radioButton.Layout = {
            Width: 6,
            Height: Size.Grow,
        };

        const radioButtonText = new TextUIPanel(radioButtonPanel, Fonts.Roboto_Regular, AlignX[i].toString());
        radioButtonText.Layout = {
            Scale: 5,
            Width: Size.Grow,
            Height: Size.Fit,
            AlignX: AlignX.Left,
        };
      
        radioButton.OnPressed.Add((pressed) => 
        {
            if (pressed)
            {
                for (const text of radioButton.UI.GetPanels("mainUIText")) 
                {
                    text.Layout.AlignX = i;
                }
            }
        });
    }

    return root;
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
