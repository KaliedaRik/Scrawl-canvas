// # Demo Canvas 027 
// Video control and manipulation; chroma-based hit zone

// [Run code](../../demo/canvas-027.html)
import scrawl from '../source/scrawl.js'

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// #### Scene setup
let canvas = scrawl.library.canvas.mycanvas;


canvas.set({

    checkForResize: true,

    // The __base-matches-display__ approach
    // + TODO: the swan hit detection is flaky
    // + TODO: issues with Phrase positioning picking up on canvas dimensions changes
    // + On the positive side, text doesn't distort

    // baseMatchesCanvasDimensions: true,

    // The __fit-base-into-display__ approach
    // + Positives - collision detection is a lot better
    // + 'fill' - distorts display
    // + 'cover', 'none' - leads to situations where controls disappear from view
    // + 'contain' - at more extreme letterbox/chimney displays the text gets too small to be useful

    fit: 'fill',

// Comment setBase out for base-matches-display approach
}).setBase({

    width: 640,
    height: 360

}).setAsCurrentCanvas();


// Importing the video file programmatically
let myvideo = scrawl.makePicture({

    name: 'test-video',

    videoSource: 'img/swans.mp4',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',
});

let initialVideoStart = scrawl.addListener('up', () => {

    myvideo.set({

        video_muted: true,
        video_loop: true,
    });

    // Get rid of the event listener after invocation - it's a one-time-only action
    initialVideoStart();

}, canvas.domElement);


// canvas-based buttons
scrawl.makePhrase({

    name: 'test-button-play-pause',
    order: 2,

    text: 'PLAY',

    family: 'sans-serif',
    size: '2rem',

    startX: '75%',
    handleX: 'center',
    startY: '90%',

    letterSpacing: 2,
    underlinePosition: 0.75,

    fillStyle: 'yellow',

    underlineStyle: 'yellow',

    onEnter: function () {

        canvas.set({
            css: {
                cursor: 'pointer',
            }
        });

        // '§UNDERLINE§' is a section class marker which makes subsequent letters underlined
        this.set({
            text: `§UNDERLINE§${this.text}`,
        });
    },

    onLeave: function () {

        canvas.set({
            css: {
                cursor: 'auto',
            }
        });

        this.set({
            text: this.text.replace('§UNDERLINE§', ''),
        });
    },

    onUp: function () {

        if (myvideo.get('video_paused')) {

            this.set({
                text: 'PAUSE',
            });

            myvideo.videoPlay();
        }
        else {

            this.set({
                text: 'PLAY',
            });

            myvideo.videoPause();
        }
    },

}).clone({

    name: 'test-button-listen-mute',

    text: 'LISTEN',

    startX: '25%',

    onUp: function () {

        if (myvideo.get('video_muted')) {

            this.set({
                text: 'MUTE',
            });

            myvideo.set({
                video_muted: false,
            });
        }
        else {

            this.set({
                text: 'LISTEN',
            });

            myvideo.set({
                video_muted: true,
            });
        }
    },
});

// Turn the swans pink
scrawl.makeFilter({

    name: 'swan-mask',

    actions: [
        {
            action: 'threshold',
            level: 200,
            low: [0, 0, 0],
            high: [255, 0, 0],
        },
        {
            action: 'channels-to-alpha',
            includeGreen: false,
            includeBlue: false,
        },
    ],
});

scrawl.makePicture({

    name: 'test-swan-image',

    asset: 'swans',

    width: '100%',
    height: '55%',

    startY: '25%',

    copyWidth: '100%',
    copyHeight: '55%',

    copyStartY: '25%',

    filters: ['swan-mask'],

    globalAlpha: 0.01,

    onEnter: function () {

        this.set({
            globalAlpha: 0.1,
        });

        canvas.set({
            css: {
                cursor: 'pointer',
            }
        });
    },

    onLeave: function () {

        this.set({
            globalAlpha: 0.01,
        });

        canvas.set({
            css: {
                cursor: 'auto',
            }
        });
    },

    onUp: function () {

        this.clickAnchor();
    },

    anchor: {
        name: 'wikipedia-swan-link',
        href: 'https://en.wikipedia.org/wiki/Swan',
        description: 'Link to the Wikipedia article on swans',

        focusAction: true,
        blurAction: true,
    },

    checkHitIgnoreTransparency: true,
});


// Ticker
let myticker = scrawl.makeTicker({

    name: 'test-video-ticker',
    duration: '22.55s',
    cycles: 0,
});

let myLocalTweenFactory = function (name, ticker, target, data) {

    for (let i = 0, iz = data.length; i < iz; i++) {

        let [start, duration, x0, y0, x1, y1] = data[i];

        scrawl.makeTween({

            name: `${name}-${i}`,

            ticker: ticker,

            targets: [target],

            time: start,
            duration: duration,

            definitions: [
                {
                    attribute: 'startX',
                    start: x0,
                    end: x1,
                },
                {
                    attribute: 'startY',
                    start: y0,
                    end: y1,
                },
            ],
        });
    }
};

// Goose 1
let mygoose = scrawl.makeBlock({

    name: 'test-goose1-hitzone',
    order: 1,

    width: '15%',
    height: '15%',

    handleX: 'center',
    handleY: 'center',

    lineWidth: 2,
    strokeStyle: 'yellow',

    method: 'none',

    onEnter: function () {

        canvas.set({
            css: {
                cursor: 'pointer',
            }
        });

        this.set({
            method: 'draw',
        });
    },

    onLeave: function () {

        canvas.set({
            css: {
                cursor: 'auto',
            }
        });

        this.set({
            method: 'none',
        });
    },

    onUp: function () {

        this.clickAnchor();
    },

    anchor: {
        name: 'wikipedia-goose-link',
        href: 'https://en.wikipedia.org/wiki/Goose',
        description: 'Link to the Wikipedia article on geese',

        focusAction: true,
        blurAction: true,
    },
});

myLocalTweenFactory('test-goose1-tween', 'test-video-ticker', 'test-goose1-hitzone', [

    [0, '3s', '27%', '73%', '12%', '66%'],
    ['3s', '3s', '12%', '66%', '-3%', '68%']
]);

scrawl.makeAction({

    name: 'test-goose1-action-show',

    ticker: 'test-video-ticker',

    time: 0,

    targets: ['test-goose1-hitzone'],

    action: function () { 

        this.targets[0].set({

            visibility: true,
        });
    },

}).clone({

    name: 'test-goose1-action-hide',
    time: '6s',

    action: function () { 

        this.targets[0].set({

            visibility: false,
        });
    },
});

// Goose 2
mygoose.clone({

    name: 'test-goose2-hitzone',

    width: '22%',
    height: '16%',

    onUp: function () {

        mygoose.clickAnchor();
    },

    anchor: null,
});

myLocalTweenFactory('test-goose2-tween', 'test-video-ticker', 'test-goose2-hitzone', [

    [0,       '4s',   '89%', '89%', '77%', '80%'],
    ['4s',    '4s',   '77%', '80%', '65%', '80%'],
    ['8s',    '2.5s', '65%', '80%', '63%', '74%'],
    ['10.5s', '6s',   '63%', '74%', '43%', '68%'],
    ['16.5s', '3s',   '43%', '68%', '33%', '66%'],
    ['19.5s', '3s',   '33%', '66%', '31%', '64%']
]);

scrawl.addListener('move', () => canvas.cascadeEventAction('move'), canvas.domElement);
scrawl.addNativeListener('click', () => canvas.cascadeEventAction('up'), canvas.domElement);


// Video time bar
let vtBackground = scrawl.makeBlock({

    name: 'test-video-time-background',

    width: '100%',
    height: 10,

    fillStyle: 'white',
});

let vtTime = vtBackground.clone({

    name: 'test-video-time-bar',

    width: 0,
    fillStyle: 'red',
})

let vtPhrase = scrawl.makePhrase({

    name: 'test-video-time-phrase',

    family: 'monospace',
    size: '1em',
    weight: '700',

    startX: '1%',
    startY: '4%',
    width: '40%',

    fillStyle: 'yellow',
});

let videoTimeBar = function () {

    let currentVideoTime,
        videoDuration;

    return function () {

        currentVideoTime = myvideo.get('video_currentTime');

        if (!videoDuration) videoDuration = myvideo.get('video_duration');

        if (videoDuration) {

            vtTime.set({

                width: `${(currentVideoTime * 100) / videoDuration}%`,
            });

            vtPhrase.set({

                text: ` ${currentVideoTime.toFixed(2)} / ${videoDuration.toFixed(2)}`,
            });

            myticker.seekTo(currentVideoTime * 1000, true);
        }
    };
}();


let report = function () {

    let testTicker = Date.now(),
        testTime, testNow,
        testMessage = document.querySelector('#reportmessage');

    return function () {

        testNow = Date.now();
        testTime = testNow - testTicker;
        testTicker = testNow;

        testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
    };
}();

scrawl.makeRender({
    name: 'test-animation',
    target: canvas,

    commence: videoTimeBar,
    afterShow: report,
});

console.log(scrawl.library);
