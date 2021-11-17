// # Demo Canvas 057 
// Seeded random number generator; point on path

// [Run code](../../demo/canvas-057.html)
import scrawl from '../source/scrawl.js'

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
const fc = scrawl.library.canvas['fixed-canvas'],

    rc1 = scrawl.library.canvas['responsive-canvas-1'],
    rc2 = scrawl.library.canvas['responsive-canvas-2'],
    rc3 = scrawl.library.canvas['responsive-canvas-3'],

    bc1 = scrawl.library.canvas['banner-canvas-1'],
    // bs1 = scrawl.library.stack['banner-stack-1'],

    bc2 = scrawl.library.canvas['banner-canvas-2'],
    bs2 = scrawl.library.stack['banner-stack-2'];

const canvasSet = {
    fit: 'cover',
    checkForResize: true,
    ignoreCanvasCssDimensions: true,
    baseMatchesCanvasDimensions: true,
};

fc.set(canvasSet);
rc1.set(canvasSet);
rc2.set(canvasSet);
rc3.set(canvasSet);
bc1.set(canvasSet);
bc2.set(canvasSet);


// #### Fixed canvas
// Update the text values of three Phrase entitys based on the positions of the top, center and base of the canvas element in the viewport
let fixedCanvasIsDisplaying = '';

const fcAnimation = scrawl.makeRender({

    name: 'fc-animation',
    target: fc,
});


// #### Responsive canvas 1
// Update the text values of three Phrase entitys based on the positions of the top, center and base of the canvas element in the viewport
const rc1PhraseTop = scrawl.makePhrase({

    name: 'rc1-pos-top',
    group: rc1.base.name,
    start: ['center', '5%'],
    handle: ['center', 'center'],
    font: '20px Arial, sans-serif',
    lineHeight: 1,
});

const rc1PhraseCenter = rc1PhraseTop.clone({

    name: 'rc1-pos-center',
    startY: 'center',
});

const rc1PhraseBase = rc1PhraseTop.clone({

    name: 'rc1-pos-base',
    startY: '95%',
});

const updateRc1 = () => {

    const {here} = rc1;
    const { inViewportTop, inViewportCenter, inViewportBase } = here;

    rc1PhraseTop.set({ text: `Canvas top: ${(here.inViewportTop * 100).toFixed(2)}%` });
    rc1PhraseCenter.set({ text: `Canvas center: ${(here.inViewportCenter * 100).toFixed(2)}%` });
    rc1PhraseBase.set({ text: `Canvas base: ${(here.inViewportBase * 100).toFixed(2)}%` });
};

const rc1Animation = scrawl.makeRender({

    name: "rc1-animation",
    target: rc1,
    observer: true,
    commence: updateRc1,
});


// #### Responsive canvas 2
// Update the start and end points of a gradient based on the positions of the top and base of the canvas element in the viewport
const rc2Color1 = scrawl.makeColor({

    name: 'rc2-color-factory-1',
    maximumColor: 'red',
    minimumColor: 'blue',
});

const rc2Color2 = scrawl.makeColor({

    name: 'rc2-color-factory-2',
    maximumColor: 'green',
    minimumColor: 'yellow',
});

const rc2Gradient = scrawl.makeGradient({

    name: 'rc2-gradient',
    endX: '100%',
});

scrawl.makeBlock({

    name: 'rc2-block',
    group: rc2.base.name,
    dimensions: ['100%', '100%'],
    fillStyle: 'rc2-gradient',
});

const updateRc2 = () => {

    const {here} = rc2;
    let { inViewportTop, inViewportBase } = here;

    if (inViewportTop < 0) inViewportTop = 0;
    else if (inViewportTop > 1) inViewportTop = 1;

    if (inViewportBase < 0) inViewportBase = 0;
    else if (inViewportBase > 1) inViewportBase = 1;

    rc2Gradient.updateColor(0, rc2Color1.getRangeColor(inViewportTop));
    rc2Gradient.updateColor(999, rc2Color2.getRangeColor(inViewportBase));
};

const rc2Animation = scrawl.makeRender({

    name: "rc2-animation",
    target: rc2,
    observer: true,
    commence: updateRc2,
});


// #### Banner canvas 1
// Tie an animation to scrolling; animation remains in viewport while it runs. Effect is reversible.
const bc1Cell = bc1.buildCell({

    name: 'bc1-visual-cell',
    width: '100%',
    height: `${100 / 3}%`,
    backgroundColor: 'darkslategray',
});

const bc1BalancePoint = 2500;

const bc1Arrow = scrawl.makeShape({

    name: 'bc1-arrow',
    group: 'bc1-visual-cell',

    pathDefinition: 'M266.2,703.1 h-178 L375.1,990 l287-286.9 H481.9 C507.4,365,683.4,91.9,911.8,25.5 877,15.4,840.9,10,803.9,10 525.1,10,295.5,313.4,266.2,703.1 z',

    start: ['center', 'center'],
    handle: ['center', 'center'],

    strokeStyle: 'red',
    fillStyle: 'lavender',
    lineWidth: 20,
    lineJoin: 'round',
    lineCap: 'round',

    scale: 0.7,
    scaleOutline: false,
    roll: -90,

    // We create this effect using a dashed line with very large dash/nodash values
    // + We can then set the offset to the point where the displayed dash ends, so it looks like the arrow doesn't have a stroke
    lineDash: [bc1BalancePoint, bc1BalancePoint],
    lineDashOffset: bc1BalancePoint,

    // To retrieve the Shape's length, we need to tell it that it is being used as a path
    useAsPath: true,
    precision: 1,

    method: 'fillThenDraw',
});

const bc1ArrowProgress = scrawl.makeWorld({

    name: 'bc1-world',

    userAttributes: [

        {
            key: 'progress', 
            defaultValue: 0,
            setter: function (item) {

                this.progress = item;

                if (bc1Arrow.length != null) {

                    bc1Arrow.set({ lineDashOffset: bc1BalancePoint - Math.round(bc1Arrow.length * item) });
                }
            },
        }
    ],
});

const bc1Phrase = scrawl.makePhrase({

    name: 'bc1-phrase',
    group: 'bc1-visual-cell',
    start: ['65%', '63%'],
    handle: ['center', 'center'],
    font: '20px Arial, sans-serif',
    lineHeight: 1,
});

const bc1Display = scrawl.makePicture({

    name: 'bc1-display',
    group: fc.base.name,
    asset: 'bc1-visual-cell',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
    visibility: false,
});

const updateBc1 = () => {

    const { here } = bc1;
    const { inViewportTop } = here;

    bc1Phrase.set({ text: `Canvas top position: ${inViewportTop.toFixed(4)}` });

    // Gives the effect of the canvas being sticky only when 100% covering the viewport
    if (inViewportTop > 0 || inViewportTop < -2) {

        // fc.domElement.style.transform = `translateY(${inViewportTop * 100}%)`;
        fc.domElement.style.transform = 'translateY(200%)';

        if (fixedCanvasIsDisplaying) {

            fixedCanvasIsDisplaying = '';

            bc1Cell.set({ 
                startY: (inViewportTop > 0) ? '0%' : `${ 200 / 3 }%`,
                shown: true, 
            });
        };
    }
    else {

        fc.domElement.style.transform = 'translateY(0%)';

        if (!fixedCanvasIsDisplaying) {

            fixedCanvasIsDisplaying = 'bc1-visual-cell';

            bc1Cell.set({ shown: false });
        };
        bc1ArrowProgress.set({ progress: inViewportTop * (-1 / 2) });
    }
};

const bc1Animation = scrawl.makeRender({

    name: "bc1-animation",
    target: bc1,
    observer: true,
    commence: updateBc1,

    onRun: () => {
        bc1Display.set({ visibility: true });
    },
    onHalt: () => {
        bc1Display.set({ visibility: false });
    },
});


// #### Responsive canvas 3
// Update the rotations of a group of artefacts based on the position of the center of the canvas element in the viewport; rotation only happens when the center of the canvas element appears in the viewport
rc3.set({ fit: 'contain' });

scrawl.makeGradient({

    name: 'rc3-gradient',
    end: ['100%', '100%'],
});

scrawl.makeLine({

    name: 'rc3-line',
    group: rc3.base.name,
    start: ['center', 'center'],
    end: ['center', '10%'],
    handleY: '-50%',
    method: 'draw',
    lineWidth: 5,
    lineCap: 'round',
});

scrawl.makeBlock({

    name: 'rc3-block-1',
    group: rc3.base.name,
    start: ['25%', '25%'],
    handle: ['center', 'center'],
    dimensions: ['40%', '10%'],
    method: 'fillThenDraw',
    fillStyle: 'rc3-gradient',
    lockFillStyleToEntity: true,
    lineWidth: 5,
    lineCap: 'round',

}).clone({

    name: 'rc3-block-2',
    start: ['75%', '75%'],
    flipReverse: true,
});

scrawl.makeWheel({

    name: 'rc3-wheel-1',
    group: rc3.base.name,
    start: ['25%', '75%'],
    handle: ['center', 'center'],
    radius: '20%',
    startAngle: 20,
    endAngle: -20,
    includeCenter: true,
    method: 'fillThenDraw',
    fillStyle: 'rc3-gradient',
    lockFillStyleToEntity: true,
    lineWidth: 5,
    lineCap: 'round',

}).clone({

    name: 'rc3-wheel-2',
    start: ['75%', '25%'],
    flipReverse: true,
});

const updateRc3 = () => {

    const {here} = rc3;
    let { inViewportCenter } = here;

    const group = scrawl.library.group[rc3.base.name];

    if (inViewportCenter < 0) inViewportCenter = 0;
    else if (inViewportCenter > 1) inViewportCenter = 1;

    group.setArtefacts({ roll: inViewportCenter * -360 });
};

const rc3Animation = scrawl.makeRender({

    name: "rc3-animation",
    target: rc3,
    observer: true,
    commence: updateRc3,
});


// #### Banner canvas 2
// Play a video only while the canvas is fully visible in the viewport (and after deliberate user interaction with the canvas).
const bc2Cell = bc2.buildCell({

    name: 'bc2-visual-cell',
    width: '100%',
    height: `${100 / 4}%`,
    backgroundColor: 'green',
});

scrawl.makeFilter({

    name: 'bc2-gaussian-blur',
    method: 'gaussianBlur',
    radius: 30,
});

const bc2Video1 = scrawl.makePicture({

    name: 'bc2-video-1',
    group: 'bc2-visual-cell',

    videoSource: 'img/swans.mp4',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',

    filters: ['bc2-gaussian-blur'],
});

const bc2Video2 = bc2Video1.clone({

    name: 'bc2-video-2',
    start: ['center', '60%'],
    handle: ['center', 'top'],
    dimensions: [320, 180],
    filters: [],
    strokeStyle: 'red',
    lineWidth: 2,
    method: 'fillThenDraw',
});

let bc2UsertInteractionConfirmed = false;
const bc2InitialVideoStart = scrawl.addListener('up', () => {

    bc2Video2.set({ 
        video_loop: true, 
    });

    bc2UsertInteractionConfirmed = true;

    // Get rid of the event listener after invocation - it's a one-time-only action
    bc2InitialVideoStart();

}, bc2.domElement);

const bc2Phrase = scrawl.makePhrase({

    name: 'bc2-phrase',
    group: 'bc2-visual-cell',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    font: '20px Arial, sans-serif',
    lineHeight: 1,
});

const bc2DialWheel = scrawl.makeWheel({

    name: 'bc2-dial-wheel',
    group: 'bc2-visual-cell',
    start: ['25%', '25%'],
    handle: ['center', 'center'],
    radius: '15%',
    lineWidth: 8,
    includeCenter: true,
    lineJoin: 'round',
    lineCap: 'round',
    flipReverse: true,
    fillStyle: 'green',
    strokeStyle: 'white',
    method: 'fillThenDraw',
});

bc2DialWheel.clone({
    
    name: 'bc2-dial-wheel-pin',
    pivot: 'bc2-dial-wheel',
    lockTo: 'pivot',
    fillStyle: 'white',
    includeCenter: false,
    scale: 0.2,
    method: 'fill',
});

bc2DialWheel.clone({

    name: 'bc2-dial-wheel-bottom',
    pivot: 'bc2-dial-wheel',
    lockTo: 'pivot',
    fillStyle: 'white',
    includeCenter: false,
    flipReverse: false,
    startAngle: 0,
    endAngle: 180,
    method: 'fill',
});

const bc2DialProgress = scrawl.makePhrase({

    name: 'bc2-dial-wheel',
    group: 'bc2-visual-cell',
    font: '40px Arial, sans-serif',
    pivot: 'bc2-dial-wheel',
    lockTo: 'pivot',
    handle: ['center', '-40%'],
});

const bc2Color = scrawl.makeColor({

    name: 'bc2-color-factory',
    maximumColor: 'red',
    minimumColor: 'green',
    easing: 'easeOutCubic',
});

const bc2Display = scrawl.makePicture({

    name: 'bc2-display',
    group: fc.base.name,
    asset: 'bc2-visual-cell',
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
    visibility: false,
});

const updateBc2 = () => {

    const { here } = bc2;
    const { inViewportTop } = here;

    if (inViewportTop > 0 || inViewportTop < -3) {

        // fc.domElement.style.transform = `translateY(${inViewportTop * 100}%)`;
        fc.domElement.style.transform = 'translateY(200%)';

        if (fixedCanvasIsDisplaying) {

            fixedCanvasIsDisplaying = '';

            bc2Cell.set({ 
                startY: (inViewportTop > 0) ? '0%' : '75%',
                shown: true, 
            });
        };
    }
    else {

        fc.domElement.style.transform = 'translateY(0%)';

        if (!fixedCanvasIsDisplaying) {

            fixedCanvasIsDisplaying = 'bc2-visual-cell';

            bc2Cell.set({ shown: false });
        };

        bc2DialWheel.set({ 

            fillStyle: bc2Color.getRangeColor(-inViewportTop / 3),
            roll: (-inViewportTop / 3) * 180,
        });

        bc2DialProgress.set({ text: `${((-inViewportTop / 3) * 100).toFixed(0)}%`});
    }

    if (bc2UsertInteractionConfirmed) {

        const currentVideoTime = bc2Video2.get('video_currentTime');

        if (inViewportTop <= 0 && inViewportTop >= -3) {

            if (bc2Video2.get('video_paused')) bc2Video2.videoPlay();

            bc2Phrase.set({ 
                text: `Video is currently playing - ${currentVideoTime.toFixed(1)}s`,
            });
        }
        else {

            if (!bc2Video2.get('video_paused')) bc2Video2.videoPause();

            bc2Phrase.set({ 
                text: `Video is currently paused at ${currentVideoTime.toFixed(1)}s`,
            });
        }
    }
    else bc2Phrase.set({ text: 'Click to play video' });
};

const bc2Animation = scrawl.makeRender({

    name: "bc2-animation",
    target: bc2,
    observer: true,
    commence: updateBc2,

    onRun: () => bc2Display.set({ visibility: true }),
    onHalt: () => bc2Display.set({ visibility: false }),
});



// #### Scene animation reporter
// Function to display whether each canvas wrapper's associated animation object is currently running
const report = document.querySelector('#report');

scrawl.makeAnimation({

    name: 'reporter',
    fn: () => {
        report.textContent = `Running animations - RC1: ${rc1Animation.isRunning()}, RC2: ${rc2Animation.isRunning()}, BC1: ${bc1Animation.isRunning()}, RC3: ${rc3Animation.isRunning()}, BC2: ${bc2Animation.isRunning()}`;
    },
});


console.log(scrawl.library);
