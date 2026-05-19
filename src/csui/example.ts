/*! Copyright (C) 2026 Angel Cazacu - Licensed under the GNU General Public License v3 or later. See <https://www.gnu.org/licenses/> for details. */

import { Instance } from "cs_script/point_script";
import { AlignX, AlignXType, AlignY, AnimationValueTypes, BaseUIPanel, Flow, InvisUIPanel, Remap, Shape, Size, TextUIPanel, UI, UIPanel, UISetDebug } from "./CSUI";
import { Euler, Vec3 } from "@s2ze/math";
import { Fonts } from "./font_definitions";
import { Button, CurrentTheme, Orientation, RadioButton, Slider } from "./controls";

Instance.ServerCommand("mp_warmup_offline_enabled 1");
Instance.ServerCommand("mp_warmup_pausetimer 1");
Instance.ServerCommand("mp_force_pick_time 0");

const TestUITarget = Instance.FindEntityByName("testui.target")!;

UISetDebug(false);

function SpawnUI()
{
    const TestUI = new UI();
    TestUI.AddPlayer(Instance.GetPlayerController(0)!.GetPlayerPawn()!);
    TestUI.Brightness = 2;
    TestUI.AlignX = AlignX.Left;
    TestUI.AlignY = AlignY.Top;
    TestUI.Origin = new Vec3(TestUITarget.GetAbsOrigin());
    TestUI.Angles = new Euler(TestUITarget.GetAbsAngles());

    const root = new InvisUIPanel(TestUI);
    root.Color = CurrentTheme.UI;
    root.Layout = {
        Width: Size.Fit,
        Height: Size.Fit,
        Flow: Flow.LeftRight,
        AlignY: AlignY.Top,
        Padding: 2,
        ChildGap: 10,
    };

    SpawnTestUI(root);
    SpawnTestUIControlPanel(root);
}

function SpawnTestUI(parent: BaseUIPanel)
{
    const menuItems = [
        "Hello World!", 
        "New line 1\nNew line 2\nNew line 3", 
        "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG", 
        "the quick			brown fox jumps over the lazy dog", 
        "!\"@#$%^&*}{_+-=,./\\?:;<>][()`'", 
        "1 2  3   4    5     6      7       890"];

    const menuColors = [
        { r: 80, g: 212, b: 85, a: 255 },
        { r: 205, g: 212, b: 80, a: 255 },
        { r: 255, g: 255, b: 255, a: 255 },
        { r: 197, g: 41, b: 230, a: 255 },
        { r: 230, g: 129, b: 41, a: 255 },
        { r: 41, g: 230, b: 223, a: 255 },
        
    ];

    const root = new UIPanel(parent, Shape.Rect, "testUI");
    root.Color = CurrentTheme.UI;
    root.Layout = {
        Width: 150,
        Height: "Fit",
        Flow: Flow.TopBottom,
        AlignY: AlignY.Top,
        Padding: 2,
        ChildGap: 2,
    };

    for (let i = 0; i < 6; i++)
    {
        const menuItemPanel = new UIPanel(root);
        menuItemPanel.Color = CurrentTheme.UISoft;
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
        sliderPanel.Color = CurrentTheme.UISoft;
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
}

function SpawnTestUIControlPanel(parent: BaseUIPanel)
{
    const root = new InvisUIPanel(parent);
    root.Color = CurrentTheme.UI;
    root.Layout = {
        Width: Size.Fit,
        Height: Size.Fit,
        AlignY: AlignY.Top,
        AlignX: AlignX.Absolute(160),
        Flow: Flow.TopBottom,
        ChildGap: 2,
    };

    SpawnTextAlignmentPanel(root);

    // child gap
    SpawnSliderPanel(root, "Child Gap", 0.5, 0.5, (p, l, t) => 
    {
        for (const panel of p.UI.GetPanel("testUI")!.GetPanels("*")) 
        {
            const val = t * 4;
            panel.Layout.ChildGap = val;
            l.Text = val.toFixed(2);
        }
    });

    // width
    SpawnSliderPanel(root, "Width", 1, 150, (p, l, t) => 
    {
        const mainPanel = p.UI.GetPanel("testUI")!;
        const val = Remap(t, 0, 1, 80, 150);
        mainPanel.Layout.Width = val;
        l.Text = val.toFixed(2);
    });

    return root;
}

function SpawnTextAlignmentPanel(parent: BaseUIPanel)
{
    const root = new UIPanel(parent);
    root.Color = CurrentTheme.UI;
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
    radioButtonsPanel.Color = CurrentTheme.UIMiddle;
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
        radioButtonPanel.Color = CurrentTheme.UIMiddle;
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

        let alignX: AlignXType = AlignX.Center;

        switch (i) 
        {
            case 0:
                alignX = AlignX.Left;
                break;

            case 1:
                alignX = AlignX.Center;
                break;

            case 2:
                alignX = AlignX.Right;
                break;
        
            default:
                break;
        }

        const radioButtonText = new TextUIPanel(radioButtonPanel, Fonts.Roboto_Regular, alignX, "radioAlignmentButtonText");
        radioButtonText.Layout = {
            Scale: 5,
            Width: Size.Grow,
            Height: Size.Fit,
        };

        if (i === 1)
        {
            radioButton.Pressed = true;    
        }

        radioButton.OnPressed.Add((pressed) => 
        {
            if (pressed)
            {
                for (const panel of radioButton.UI.GetPanels("*")) 
                {
                    if (panel instanceof TextUIPanel)
                    {
                        panel.Layout.AlignX = alignX;
                    }
                }
            }
        });
    }
}

function SpawnSliderPanel(parent: BaseUIPanel, labelString: string, sliderDefaultVal: number, defaultval: number, callback: (p: BaseUIPanel, l: TextUIPanel, t: number) => void)
{
    const root = new UIPanel(parent);
    root.Color = CurrentTheme.UI;
    root.Layout = {
        Width: Size.Fit,
        Height: Size.Fit,
        AlignY: AlignY.Top,
        AlignX: AlignX.Center,
        Flow: Flow.TopBottom,
        Padding: 2,
        ChildGap: 2,
    };

    const text = new TextUIPanel(root, Fonts.Roboto_Regular, labelString);
    text.Color = CurrentTheme.Contrast;
    text.Layout = {
        Width: Size.Fit,
        Height: Size.Fit,
        Flow: Flow.LeftRight,
        AlignX: AlignX.Center,
        AlignY: AlignY.Center,
        ChildGap: 2,
        Scale: 5,
    };

    const parentPanel = new UIPanel(root);
    parentPanel.Color = CurrentTheme.UIMiddle;
    parentPanel.Layout = {
        Width: Size.Fit,
        Height: Size.Fit,
        Flow: Flow.LeftRight,
        ChildGap: 2,
        Padding: 2,
    };

    const slider = new Slider(parentPanel, Orientation.Horizontal);
    slider.SliderThickness = 2;
    slider.SliderLength = 40;
    slider.MouseT = sliderDefaultVal;
    slider.OnValueChanged.Add((t) => 
    {
        callback(slider, label, t);

    });

    const label = new TextUIPanel(parentPanel, Fonts.Roboto_Regular, defaultval.toFixed(2));
    label.Layout.Scale = 5;
}

Instance.OnRoundStart(() => 
{
    SpawnUI();
});

Instance.OnScriptReload({ 

    after: (() => 
    {
        SpawnUI();
    }),
});
