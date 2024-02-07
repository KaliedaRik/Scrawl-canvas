// # Core library
// Scrawl-canvas stores most of the objects it creates in a centralized space, so that they can be referenced from other places in the code base, and from user-written code.
//
// While some sections are dedicated to a single type of object, other sections are aggregations - this may lead to name conflicts if coders are not rigorous in their naming conventions when creating objects (through the __make__ factory functions).
//
// `Exported object` (to modules and scrawl object). Scrawl-canvas exposes the library, and its sections, for import into other script files

// No imports required


// Current version
export const version = '8.12.0';


// Objects created using the __makeAnchor__ factory
export const anchor = {};
export const anchornames = [];


// Objects created using the __makeAnimation__ and __makeRender__ factories
export const animation = {};
export const animationnames = [];


// Objects - specifically tickers - created using the __makeTicker__ and __makeTween__ factories
export const animationtickers = {};
export const animationtickersnames = [];


// An aggregate of all contents in the canvas, element, entity and stack sections of the library.
export const artefact = {};
export const artefactnames = [];


// Scrawl-canvas wrappers for visual media (images, videos, sprites). Anything that a Picture entity or Pattern style can use as their asset source needs to be included in this section of the library
export const asset = {};
export const assetnames = [];


// Canvas element wrappers created during Scrawl-canvas initialization, and the __makeCanvas__, __getCanvas__ and __addCanvas__ factories
export const canvas = {};
export const canvasnames = [];


// Objects created using the __makeCell__ and __canvas.buildCell__ factories
export const cell = {};
export const cellnames = [];


// DOM element wrappers created during Scrawl-canvas initialization, and created using the __makeElement__, __Stack.addExistingDomElement__ and __Stack.addNewElement__ factories
export const element = {};
export const elementnames = [];


// All canvas-related artefacts (Blocks, Wheels, etc) get stored in the __entity__ section of the library.
export const entity = {};
export const entitynames = [];


// Objects created using the __makeFilter__ factory
export const filter = {};
export const filternames = [];


// Used internally by Phrase artefacts
export const fontattribute = {};
export const fontattributenames = [];


// collects metadata of various requested fonts
export const fontfamilymetadata = {};
export const fontfamilymetadatanames = [];


// Objects created using the __makeGroup__ factory, and generated as part of the process of creating Stack and Canvas artefacts, and Cell assets.
export const group = {};
export const groupnames = [];


// Used internally by Gradient and RadialGradient styles
export const palette = {};
export const palettenames = [];


// Physics-related objects
export const particle = {};
export const particlenames = [];

export const force = {};
export const forcenames = [];

export const spring = {};
export const springnames = [];

export const world = {};
export const worldnames = [];

// Stack element wrappers created during Scrawl-canvas initialization, and created using the __makeStack__ and __addStack__ factories
export const stack = {};
export const stacknames = [];


// Objects created using the __makeTween__ and __makeAction__ factories
export const tween = {};
export const tweennames = [];


// Objects created using the __makeGradient__, __makeRadialGradient__, __makePattern__ and __makeColor__ factories
export const styles = {};
export const stylesnames = [];


// For use with Label and EnhancedLabel entitys
export const textstyle = {};
export const textstylenames = [];


// DOM unstackedElement wrappers created using the __makeUnstackedElement__ and __makeSnippet__ factories
export const unstackedelement = {};
export const unstackedelementnames = [];


// Given a `namespace` string, kill all objects created with that namespace
// + Function assumes that the namespace string appears as the first part of the object's `name` attribute
export function purge (namespace = '') {

    const remove = function (candidates, target, flag = false) {

        candidates.forEach(c => {

            const obj = target[c];

            if (obj && obj.kill) obj.kill(flag);
        });
    };

    if (namespace) {

        const candidateArtefacts = artefactnames.filter(c => c.indexOf(namespace) === 0);
        remove(candidateArtefacts, artefact);

        const candidateAssets = assetnames.filter(c => c.indexOf(namespace) === 0);
        remove(candidateAssets, asset);

        const candidateGroups = groupnames.filter(c => c.indexOf(namespace) === 0);
        remove(candidateGroups, group, true);

        const candidateStyles = stylesnames.filter(c => c.indexOf(namespace) === 0);
        remove(candidateStyles, styles);

        const candidateTweens = tweennames.filter(c => c.indexOf(namespace) === 0);
        remove(candidateTweens, tween);

        const candidateAnimations = animationnames.filter(c => c.indexOf(namespace) === 0);
        remove(candidateAnimations, animation);

        const candidateAnimationTickers = animationtickersnames.filter(c => c.indexOf(namespace) === 0);
        remove(candidateAnimationTickers, animationtickers);

        const candidateFilters = filternames.filter(c => c.indexOf(namespace) === 0);
        remove(candidateFilters, filter);

        const candidateTextStyles = textstylenames.filter(c => c.indexOf(namespace) === 0);
        remove(candidateTextStyles, filter);

        const candidateAnchors = anchornames.filter(c => c.indexOf(namespace) === 0);
        remove(candidateAnchors, anchor);

        const candidateForces = forcenames.filter(c => c.indexOf(namespace) === 0);
        remove(candidateForces, force);

        const candidateSprings = springnames.filter(c => c.indexOf(namespace) === 0);
        remove(candidateSprings, spring);

        const candidateWorlds = worldnames.filter(c => c.indexOf(namespace) === 0);
        remove(candidateWorlds, world);
    }
}


// Section classes are used with Phrase entitys - we store the class definitions in the library so that they can be easily shared between Phrases
export const sectionClasses = {
    'DEFAULTS': { defaults: true },

    'b': { weight: 'bold' },
    '/b': { weight: 'normal' },
    'strong': { weight: 'bold' },
    '/strong': { weight: 'normal' },
    'BOLD': { weight: 'bold' },
    '/BOLD': { weight: 'normal' },

    'i': { style: 'italic' },
    '/i': { style: 'normal' },
    'em': { style: 'italic' },
    '/em': { style: 'normal' },
    'ITALIC': { style: 'italic' },
    '/ITALIC': { style: 'normal' },

    'u': { underline: true },
    '/u': { underline: false },
    'UNDERLINE': { underline: true },
    '/UNDERLINE': { underline: false },

    'OVERLINE': { overline: true },
    '/OVERLINE': { overline: false },

    // Warning: font-variant functionality has been deprecated in SC and should be avoided!
    'SMALL-CAPS': { variant: 'small-caps' },
    '/SMALL-CAPS': { variant: 'normal' },

    'HIGHLIGHT': { highlight: true },
    '/HIGHLIGHT': { highlight: false },
};

// All __makeXXX__ factory functions get added as references to the __constructors__ section of the library - used mainly as part of Scrawl-canvas cloning functionality.
export const constructors = {};
