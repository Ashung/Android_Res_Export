const sketch = require('sketch/dom');
const {
    Artboard,
    Group,
    Image,
    Page,
    Rectangle,
    ShapePath,
    Style,
    SymbolMaster,
} = require('sketch/dom');

export default function() {

    const document = sketch.getSelectedDocument();

    const logoSVG = `<svg width="192px" height="192px" viewBox="0 0 192 192">
        <path fill="#FFFFFF" d="M60.36 65.11c1.47-1.48 3.74-1.48 5.2 0l10.93 11c5.87-2.97 12.47-4.68 19.51-4.68 6.97 0 13.57 1.7 19.36 4.68l10.85-11c1.47-1.48 3.74-1.48 5.21 0 1.47 1.49 1.47 3.8 0 5.28l-9.53 9.66c11 8.1 18.11 21.17 18.11 35.95H52c0-14.78 7.11-27.78 17.97-35.88l-9.61-9.73c-1.47-1.49-1.47-3.79 0-5.28zm53.52 28.6c-2.28 0-4.13 1.81-4.13 4.06 0 2.24 1.85 4.06 4.13 4.06 2.27 0 4.12-1.82 4.12-4.06 0-2.25-1.85-4.06-4.13-4.06zm-35.75 0c-2.28 0-4.13 1.81-4.13 4.06 0 2.24 1.85 4.06 4.13 4.06 2.27 0 4.12-1.82 4.12-4.06 0-2.25-1.85-4.06-4.13-4.06z"/>
    </svg>`;

    // grid
    const iconGrid = new SymbolMaster({
        name: 'icon_grid',
        frame: new Rectangle(484, 608, 96, 96),
        layers: [
            new Image({
                name: 'grid',
                image: String(__command.pluginBundle().urlForResourceNamed('grid.png').path()),
                frame: new Rectangle(0, 0, 96, 96)
            })
        ]
    });

    // grid_android_o
    const iconGridAndroidO = new SymbolMaster({
        name: 'icon_grid_android_o',
        frame: new Rectangle(316, 400, 108, 108),
        layers: [
            new Image({
                name: 'grid',
                image: String(__command.pluginBundle().urlForResourceNamed('grid_android_o.png').path()),
                frame: new Rectangle(0, 0, 108, 108)
            })
        ]
    });

    // ic_launcher
    const launcherIconLegacy = new SymbolMaster({
        name: 'ic_launcher',
        frame: new Rectangle(0, 608, 192, 192),
        layers: (() => {
            let bg = new ShapePath({
                name: 'bg',
                frame: new Rectangle(20, 20, 152, 152),
                shapeType: ShapePath.ShapeType.Rectangle,
                style: {
                    fills: [
                        { color: '#39AA57' }
                    ],
                    shadows: [
                        { color: '#00000033', x: 0, y: 4, blur: 4 },
                        { color: '#0000001a', x: 0, y: 0, blur: 4 }
                    ],
                    innerShadows: [
                        { color: '#1b5e2033', x: 0, y: -1, blur: 1 },
                    ]
                }
            });
            bg.points.forEach(point => {
                point.cornerRadius = 12;
            });
            bg.sketchObject.setHasClippingMask(true);

            let shadow = ShapePath.fromSVGPath('M52 116 129.05 103 129.05 86.39 172 129.5 172 172 108 172z');
            shadow.name = 'shadow';
            shadow.style.fills = [
                {
                    fillType: Style.FillType.Gradient,
                    gradient: {
                        gradientType: Style.GradientType.Linear,
                        from: { x: 0.248, y: 0.114 },
                        to: { x: 1, y: 1 },
                        stops: [
                            { position: 0, color: '#00000026' },
                            { position: 0.142, color: '#00000026' },
                            { position: 0.643, color: '#00000005' },
                            { position: 1, color: '#00000000' }
                        ]
                    }
                }
            ];

            let logoGroup = sketch.createLayerFromData(logoSVG, 'svg');
            let logo = logoGroup.layers[0];
            logo.name = 'logo';
            logo.frame = logoGroup.frame;

            let grid = iconGrid.createNewInstance();
            grid.name = 'grid';
            grid.frame = new Rectangle(0, 0, 192, 192);
            grid.sketchObject.setShouldBreakMaskChain(true);

            return [bg, shadow, logo, grid];
        })()
    });

    // ic_launcher_round
    const launcherRoundIconLegacy = new SymbolMaster({
        name: 'ic_launcher_round',
        frame: new Rectangle(242, 608, 192, 192),
        layers: (() => {
            let bg = new ShapePath({
                name: 'bg',
                frame: new Rectangle(8, 8, 176, 176),
                shapeType: ShapePath.ShapeType.Oval,
                style: {
                    fills: [
                        { color: '#FFFFFF' }
                    ],
                    shadows: [
                        { color: '#00000033', x: 0, y: 4, blur: 4 },
                        { color: '#0000001a', x: 0, y: 0, blur: 4 }
                    ]
                }
            });
            bg.sketchObject.setHasClippingMask(true);

            let logoGroup = sketch.createLayerFromData(logoSVG, 'svg');
            let logo = logoGroup.layers[0];
            logo.name = 'logo';
            logo.style.fills = [{ color: '#39AA57' }];
            logo.frame = logoGroup.frame;

            let grid = iconGrid.createNewInstance();
            grid.name = 'grid';
            grid.frame = new Rectangle(0, 0, 192, 192);
            grid.sketchObject.setShouldBreakMaskChain(true);

            return [bg, logo, grid];
        })()
    });

    // ic_background
    const iconBackground = new SymbolMaster({
        name: 'ic_background',
        frame: new Rectangle(0, 400, 108, 108),
        background: {
            color: '#FFFFFF',
            includedInExport: true
        },
        layers: (() => {
            let bg = new ShapePath({
                name: 'bg',
                frame: new Rectangle(0, 0, 108, 108),
                shapeType: ShapePath.ShapeType.Rectangle,
                style: {
                    fills: [
                        { color: '#2196F3' }
                    ]
                }
            });

            let grid = iconGridAndroidO.createNewInstance();
            grid.name = 'grid';
            grid.frame = new Rectangle(0, 0, 108, 108);
            
            return [bg, grid];
        })()
    });

    // ic_foreground
    const iconForeground = new SymbolMaster({
        name: 'ic_foreground',
        frame: new Rectangle(158, 400, 108, 108),
        background: {
            color: '#999999',
            enabled: true
        },
        layers: (() => {
            let shadow = ShapePath.fromSVGPath('M32 64 70.52 57.5 70.52 49.19 108 87.31 108 108 75.97 108z');
            shadow.name = 'shadow';
            shadow.style.fills = [
                {
                    fillType: Style.FillType.Gradient,
                    gradient: {
                        gradientType: Style.GradientType.Linear,
                        from: { x: 0.238, y: 0.115 },
                        to: { x: 1, y: 1 },
                        stops: [
                            { position: 0, color: '#00000026' },
                            { position: 0.142, color: '#00000026' },
                            { position: 0.643, color: '#00000005' },
                            { position: 1, color: '#00000000' }
                        ]
                    }
                }
            ];

            let logoGroup = sketch.createLayerFromData(logoSVG, 'svg');
            let logo = logoGroup.layers[0];
            logo.name = 'logo';
            logo.frame = new Rectangle(32, 38, 44, 26);

            let grid = iconGridAndroidO.createNewInstance();
            grid.name = 'grid';
            grid.frame = new Rectangle(0, 0, 108, 108);
            
            return [shadow, logo, grid];
        })()
    });

    // google_play_icon
    const googlePlayIcon = new SymbolMaster({
        name: 'google_play_icon',
        frame: new Rectangle(0, 900, 512, 512),
        background: {
            color: '#FFFFFF',
            includedInExport: true
        },
        layers: (() => {
            let mask = new ShapePath({
                name: 'bg',
                frame: new Rectangle(0, 0, 512, 512),
                shapeType: ShapePath.ShapeType.Rectangle
            });
            mask.sketchObject.setHasClippingMask(true);

            let background = iconBackground.createNewInstance();
            background.frame = new Rectangle(-128, -128, 768, 768);
            console.log(background.overrides)

            let foreground = iconForeground.createNewInstance();
            foreground.frame = new Rectangle(-128, -128, 768, 768);

            return [mask, background, foreground];
        })()
    });

    // preview
    const preview = new Artboard({
        name: 'Preview',
        frame: new Rectangle(0, 0, 400, 300),
        layers: (() => {
            let legacyIconSymbol = launcherIconLegacy.createNewInstance();
            legacyIconSymbol.name = 'ic_launcher';
            legacyIconSymbol.frame = new Rectangle(0, 0, 108, 108);
            let legacyIcon = new Group({
                name: 'Legacy App Icon',
                frame: new Rectangle(18, 40, 108, 108),
                layers: [legacyIconSymbol]
            });

            let legacyIconRoundSymbol = launcherRoundIconLegacy.createNewInstance();
            legacyIconRoundSymbol.name = 'ic_launcher_round';
            legacyIconRoundSymbol.frame = new Rectangle(0, 0, 108, 108);
            let legacyIconRound = new Group({
                name: 'Legacy App Icon Round',
                frame: new Rectangle(146, 40, 108, 108),
                layers: [legacyIconRoundSymbol]
            });

            let fullBleedBackground = iconBackground.createNewInstance();
            fullBleedBackground.frame = new Rectangle(0, 0, 108, 108);
            let fullBleedForeground = iconForeground.createNewInstance();
            fullBleedForeground.frame = new Rectangle(0, 0, 108, 108);
            let fullBleed = new Group({
                name: 'Full Bleed Layers',
                frame: new Rectangle(274, 40, 108, 108),
                layers: [fullBleedBackground, fullBleedForeground]
            });

            let circleMask = new ShapePath({
                name: 'mask',
                frame: new Rectangle(0, 0, 72, 72),
                shapeType: ShapePath.ShapeType.Oval
            });
            circleMask.sketchObject.setHasClippingMask(true);
            let circleBackground = iconBackground.createNewInstance();
            circleBackground.frame = new Rectangle(-18, -18, 108, 108);
            let circleForeground = iconForeground.createNewInstance();
            circleForeground.frame = new Rectangle(-18, -18, 108, 108);
            let circle = new Group({
                name: 'Circle',
                frame: new Rectangle(26, 188, 72, 72),
                layers: [circleMask, circleBackground, circleForeground]
            });

            let squircleMask = ShapePath.fromSVGPath('M36,0 C7.2,0 0,7.2 0,36 C0,64.8 7.2,72 36,72 C64.8,72 72,64.8 72,36 C72,7.2 64.8,0 36,0 Z');
            squircleMask.name = 'mask';
            squircleMask.frame = new Rectangle(0, 0, 72, 72);
            squircleMask.sketchObject.setHasClippingMask(true);
            let squircleBackground = iconBackground.createNewInstance();
            squircleBackground.frame = new Rectangle(-18, -18, 108, 108);
            let squircleForeground = iconForeground.createNewInstance();
            squircleForeground.frame = new Rectangle(-18, -18, 108, 108);
            let squircle = new Group({
                name: 'Squircle',
                frame: new Rectangle(118, 188, 72, 72),
                layers: [squircleMask, squircleBackground, squircleForeground]
            });

            let roundedSquareMask = new ShapePath({
                name: 'mask',
                frame: new Rectangle(0, 0, 72, 72),
                shapeType: ShapePath.ShapeType.Rectangle
            });
            roundedSquareMask.points.forEach(point => {
                point.cornerRadius = 22;
            });
            roundedSquareMask.sketchObject.setHasClippingMask(true);
            let roundedSquareBackground = iconBackground.createNewInstance();
            roundedSquareBackground.frame = new Rectangle(-18, -18, 108, 108);
            let roundedSquareForeground = iconForeground.createNewInstance();
            roundedSquareForeground.frame = new Rectangle(-18, -18, 108, 108);
            let roundedSquare = new Group({
                name: 'Rounded Square',
                frame: new Rectangle(210, 188, 72, 72),
                layers: [roundedSquareMask, roundedSquareBackground, roundedSquareForeground]
            });

            let squareMask = new ShapePath({
                name: 'mask',
                frame: new Rectangle(0, 0, 72, 72),
                shapeType: ShapePath.ShapeType.Rectangle
            });
            squareMask.points.forEach(point => {
                point.cornerRadius = 8;
            });
            squareMask.sketchObject.setHasClippingMask(true);
            let squareBackground = iconBackground.createNewInstance();
            squareBackground.frame = new Rectangle(-18, -18, 108, 108);
            let squareForeground = iconForeground.createNewInstance();
            squareForeground.frame = new Rectangle(-18, -18, 108, 108);
            let square = new Group({
                name: 'Square',
                frame: new Rectangle(302, 188, 72, 72),
                layers: [squareMask, squareBackground, squareForeground]
            });

            return [legacyIcon, legacyIconRound, fullBleed, circle, squircle, roundedSquare, square]
        })()
    });

    new Page({
        name: 'App Icon',
        parent: document,
        selected: true,
        layers: [iconGrid, iconGridAndroidO, launcherIconLegacy, launcherRoundIconLegacy, iconBackground, iconForeground, googlePlayIcon, preview]
    });

    // Set override to none
    googlePlayIcon.layers[1].overrides[0].value = '';
    googlePlayIcon.layers[2].overrides[0].value = '';
    preview.layers[0].layers[0].overrides[0].value = '';
    preview.layers[1].layers[0].overrides[0].value = '';
    preview.layers[2].layers[0].overrides[0].value = '';
    preview.layers[2].layers[1].overrides[0].value = '';
    preview.layers[3].layers[1].overrides[0].value = '';
    preview.layers[3].layers[2].overrides[0].value = '';
    preview.layers[4].layers[1].overrides[0].value = '';
    preview.layers[4].layers[2].overrides[0].value = '';
    preview.layers[5].layers[1].overrides[0].value = '';
    preview.layers[5].layers[2].overrides[0].value = '';
    preview.layers[6].layers[1].overrides[0].value = '';
    preview.layers[6].layers[2].overrides[0].value = '';
}