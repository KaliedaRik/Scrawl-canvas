// # Demo Canvas 027
// Video control and manipulation; chroma-based hit zone

// [Run code](../../demo/canvas-027.html)
import * as scrawl from '../source/scrawl.js'

import { reportSpeed } from './utilities.js';


// #### Scene setup
// Get a handle to the Canvas wrapper
const canvas = scrawl.library.canvas.mycanvas;


// Namespacing boilerplate
const namespace = 'demo';
const name = (n) => `${namespace}-${n}`;


// Importing the video file programmatically
const myvideo = scrawl.makePicture({

    name: name('test-video'),

    videoSource: 'img/swans.mp4',

    width: '100%',
    height: '100%',

    copyWidth: '100%',
    copyHeight: '100%',
});

const initialVideoStart = scrawl.addNativeListener(['mouseup', 'touchend', 'keyup'], () => {

    myvideo.set({

        video_muted: true,
        video_loop: true,
    });

    // Get rid of the event listener after invocation - it's a one-time-only action
    initialVideoStart();

}, canvas.domElement);


// canvas-based buttons
const playPauseAction = function () {

    if (myvideo.get('video_paused')) {

        playPause.set({ text: 'PAUSE' });
        myvideo.videoPlay();
    }
    else {

        playPause.set({ text: 'PLAY' });
        myvideo.videoPause();
    }
};

const playPause = scrawl.makePhrase({

    name: name('play-pause-button'),
    order: 2,

    text: 'PLAY',

    fontFamily: 'sans-serif',
    fontSize: '2rem',

    startX: '75%',
    handleX: 'center',
    startY: 'bottom',
    handleY: 'bottom',

    letterSpacing: 2,
    underlinePosition: 0.75,
    lineHeight: 1,

    fillStyle: 'yellow',

    underlineStyle: 'yellow',
    underlineWidth: 4,

    onEnter: function () {

        canvas.set({
            css: {
                cursor: 'pointer',
            }
        });

        // '§UNDERLINE§' is a section class marker which makes subsequent letters underlined
        // ___Note:___ - dynamic underlining is currently not triggering in Firefox browser
// @ts-expect-error
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

// @ts-expect-error
        this.set({
            text: this.text.replace('§UNDERLINE§', ''),
        });
    },

    button: {

        name: name('play-pause-el'),
        description: 'Play | Pause',
        clickAction: playPauseAction,
        tabOrder: 0,
    },

    onUp: playPauseAction,
});

const listenMuteAction = function () {

    if (myvideo.get('video_muted')) {

        listenMute.set({ text: 'MUTE' });
        myvideo.set({ video_muted: false });
    }
    else {

        listenMute.set({ text: 'LISTEN' });
        myvideo.set({ video_muted: true });
    }
};

const listenMute = playPause.clone({

    name: name('listen-mute-button'),

    text: 'LISTEN',

    startX: '25%',

    button: {

        name: name('listen-mute-el'),
        description: 'Listen | Mute',
        clickAction: listenMuteAction,
        tabOrder: 1,
    },

    onUp: listenMuteAction,
});

// Turn the swans pink
scrawl.makeFilter({

    name: name('swan-mask'),

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

    name: name('test-swan-image'),

    asset: 'swans',

    width: '100%',
    height: '55%',

    startY: '25%',

    copyWidth: '100%',
    copyHeight: '55%',

    copyStartY: '25%',

    filters: [name('swan-mask')],

    globalAlpha: 0.01,

    onEnter: function () {

// @ts-expect-error
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

// @ts-expect-error
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

// @ts-expect-error
        this.clickAnchor();
    },

    anchor: {
        name: name('wikipedia-swan-link'),
        href: 'https://en.wikipedia.org/wiki/Swan',
        description: 'Link to the Wikipedia article on swans',
        tabOrder: 2,
    },

    checkHitIgnoreTransparency: true,
});


// Ticker
const myticker = scrawl.makeTicker({

    name: name('test-video-ticker'),
    duration: '22.55s',
    cycles: 0,
});

const myLocalTweenFactory = function (name, ticker, target, data) {

    for (let i = 0, iz = data.length; i < iz; i++) {

        const [start, duration, x0, y0, x1, y1] = data[i];

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
const mygoose = scrawl.makeBlock({

    name: name('test-goose1-hitzone'),
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

// @ts-expect-error
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

// @ts-expect-error
        this.set({
            method: 'none',
        });
    },

    onUp: function () {

// @ts-expect-error
        this.clickAnchor();
    },

    anchor: {
        name: name('wikipedia-goose-link-1'),
        href: 'https://en.wikipedia.org/wiki/Goose',
        description: 'First link to the Wikipedia article on geese',
        tabOrder: 3,
    },
});

myLocalTweenFactory(
    name('test-goose1-tween'),
    name('test-video-ticker'),
    name('test-goose1-hitzone'),
    [
        [0, '3s', '27%', '73%', '12%', '66%'],
        ['3s', '3s', '12%', '66%', '-3%', '68%']
    ],
);

scrawl.makeAction({

    name: name('test-goose1-action-show'),

    ticker: name('test-video-ticker'),

    time: 0,

    targets: [name('test-goose1-hitzone')],

    action: function () {

        this.targets[0].set({

            visibility: true,
            anchorDisabled: false,
        });
    },

}).clone({

    name: name('test-goose1-action-hide'),
    time: '6s',

    action: function () {

        this.targets[0].set({

            visibility: false,
            anchorDisabled: true,
        });
    },
});

// Goose 2
mygoose.clone({

    name: name('test-goose2-hitzone'),

    width: '22%',
    height: '16%',

    // It's generally not a good idea to share &lt;a> anchor link elements between interactive artefacts. However, be aware that repeating a link may not be the best user experience for those users accessing the web page with assistive technologies.
    anchor: {
        name: name('wikipedia-goose-link-2'),
        href: 'https://en.wikipedia.org/wiki/Goose',
        description: 'Second link to the Wikipedia article on geese',
        tabOrder: 4,
    },
});

myLocalTweenFactory(
    name('test-goose2-tween'),
    name('test-video-ticker'),
    name('test-goose2-hitzone'),
    [
        [0,       '4s',   '89%', '89%', '77%', '80%'],
        ['4s',    '4s',   '77%', '80%', '65%', '80%'],
        ['8s',    '2.5s', '65%', '80%', '63%', '74%'],
        ['10.5s', '6s',   '63%', '74%', '43%', '68%'],
        ['16.5s', '3s',   '43%', '68%', '33%', '66%'],
        ['19.5s', '3s',   '33%', '66%', '31%', '64%'],
    ],
);

scrawl.addListener('move', () => canvas.cascadeEventAction('move'), canvas.domElement);
scrawl.addNativeListener(['touchstart', 'touchmove'], () => canvas.cascadeEventAction('move'), canvas.domElement);
scrawl.addNativeListener(['click', 'touchend'], () => canvas.cascadeEventAction('up'), canvas.domElement);


// Video time bar
const vtBackground = scrawl.makeBlock({

    name: name('test-video-time-background'),

    width: '100%',
    height: 10,

    fillStyle: 'white',
});

const vtTime = vtBackground.clone({

    name: name('test-video-time-bar'),

    width: 0,
    fillStyle: 'red',
})

const vtPhrase = scrawl.makePhrase({

    name: name('test-video-time-phrase'),

    fontFamily: 'monospace',
    fontSize: '1em',
    fontWeight: 700,

    startX: '1%',
    startY: '4%',
    width: '40%',

    fillStyle: 'yellow',
});

const videoTimeBar = function () {

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


// #### Scene animation
// Function to display frames-per-second data, and other information relevant to the demo
const report = reportSpeed('#reportmessage');


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({
    name: name('animation'),
    target: canvas,

    commence: videoTimeBar,
    afterShow: report,
});


// #### Development and testing
console.log(scrawl.library);
