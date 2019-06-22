/*
# Block factory
*/
import { constructors } from '../core/library.js';
import { mergeOver } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import positionMix from '../mixin/position.js';
import entityMix from '../mixin/entity.js';
import filterMix from '../mixin/filter.js';


/*
## Block constructor
*/
const Block = function (items = {}) {

	this.entityInit(items);

	if (!items.dimensions) {

		if (!items.width) this.currentDimensions[0] = this.dimensions[0] = 10;
		if (!items.height) this.currentDimensions[1] = this.dimensions[1] = 10;
	}

	return this;
};


/*
## Block object prototype setup
*/
let P = Block.prototype = Object.create(Object.prototype);
P.type = 'Block';
P.lib = 'entity';
P.isArtefact = true;
P.isAsset = false;


/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = positionMix(P);
P = entityMix(P);
P = filterMix(P);


/*
## Define prototype functions
*/

/*
Internal - used for entity stamping (Display cycle), and collision detection (eg: drag-and-drop)
*/
P.cleanPathObject = function () {

	this.dirtyPathObject = false;

	let p = this.pathObject = new Path2D();
	
	let handle = this.currentStampHandlePosition,
		scale = this.currentScale,
		dims = this.currentDimensions;

	let x = -handle[0] * scale,
		y = -handle[1] * scale,
		w = dims[0] * scale,
		h = dims[1] * scale;

	p.rect(x, y, w, h);
};


/*
## Exported factory function

The factory takes a single object argument which includes the following attributes - __all optional__:

* __name__ - String - default: random UUID String generated at time of object construction
* __group__ - group name String/group Object - default: currently focussed canvas's base cell's group object

* __order__ - Number - default: 0
* __visibility__ - Boolean - default: true

* __width__ - Number/String% - default: 10
* __height__ - Number/String% - default: 10

* __startX__ - Number/String%/String ('left', 'center', 'right') - default: 0
* __startY__ - Number/String%/String ('top', 'center', 'bottom') - default: 0

* __handleX__ - Number/String%/String ('left', 'center', 'right') - default: 0
* __handleY__ - Number/String%/String ('top', 'center', 'bottom') - default: 0

* __offsetX__ - Number/String% - default: 0
* __offsetY__ - Number/String% - default: 0

* __scale__ - Number - default: 1
* __scaleOutline__ - Boolean - default: true

* __roll__ - Number - default: 0
* __flipReverse__ - Boolean - default: false
* __flipUpend__ - Boolean - default: false

* __delta__ - Javascript Object with deltaSettable key:value attributes - default: {}

* __method__ - String ('fill', 'draw', 'fillDraw', 'drawFill', 'floatOver', 'sinkInto', 'clear', 'none') - default: 'fill'

* __fastStamp__ - Boolean - default: false

* __fillStyle__ - various (see factory/state.js) - default: 'rgba(0,0,0,1)',
* __strokeStyle__ - various (see factory/state.js) - default: 'rgba(0,0,0,1)',

* __globalAlpha__ - float Number (0-1) (see factory/state.js) - default: 1,
* __globalCompositeOperation__ - String (see factory/state.js) - default: 'source-over',

* __lineWidth__ - Number (see factory/state.js) - default: 1,
* __lineCap__ - String (see factory/state.js) - default: 'butt',
* __lineJoin__ - String (see factory/state.js) - default: 'miter',
* __lineDash__ - Array (see factory/state.js) - default: [],
* __lineDashOffset__ - Number (see factory/state.js) - default: 0,
* __miterLimit__ - Number (see factory/state.js) - default: 10,

* __shadowOffsetX__ - Number (see factory/state.js) - default: 0,
* __shadowOffsetY__ - Number (see factory/state.js) - default: 0,
* __shadowBlur__ - Number (see factory/state.js) - default: 0,
* __shadowColor__ - String (see factory/state.js) - default: 'rgba(0,0,0,0)',

* __font__ (irrelevant) - String (see factory/state.js) - default: '12px sans-serif',
* __textAlign__ (irrelevant) - String (see factory/state.js) - default: 'start',
* __textBaseline__ (irrelevant) - String (see factory/state.js) - default: 'alphabetic',

* __winding__ (irrelevant) - String ('nonzero', 'evenodd') - default: 'nonzero'
* __lockFillStyleToEntity__ - Boolean - default: false
* __lockStrokeStyleToEntity__ - Boolean - default: false

* __lockTo__ - [String, String] Array - default: ['start', 'start']
* __lockXTo__ - String ('start', 'pivot', 'path', 'mimic', 'mouse') - default: n/a
* __lockYTo__ - String ('start', 'pivot', 'path', 'mimic', 'mouse') - default: n/a

* __pivot__ - artefact name String/artefact Object - default: ''
* __addPivotHandle__ - Boolean - default: false
* __addPivotOffset__ - Boolean - default: true
* __addPivotRotation__ - Boolean - default: false

* __path__ - artefact name String/artefact Object - default: '',
* __pathPosition__ - float Number (0-1) - default: 0
* __addPathHandle__ - Boolean - default: false
* __addPathOffset__ - Boolean - default: true
* __addPathRotation__ - Boolean - default: false

* __mimic__ - artefact name String/artefact Object - default: ''
* __useMimicDimensions__ - Boolean - default: false
* __useMimicScale__ - Boolean - default: false
* __useMimicStart__ - Boolean - default: false
* __useMimicHandle__ - Boolean - default: false
* __useMimicOffset__ - Boolean - default: false
* __useMimicRotation__ - Boolean - default: false
* __useMimicFlip__ - Boolean - default: false
* __addOwnDimensionsToMimic__ - Boolean - default: false
* __addOwnScaleToMimic__ - Boolean - default: false
* __addOwnStartToMimic__ - Boolean - default: false
* __addOwnHandleToMimic__ - Boolean - default: false
* __addOwnOffsetToMimic__ - Boolean - default: false
* __addOwnRotationToMimic__ - Boolean - default: false

* __filters__ - filtername String / Array [filtername String, filtername String] - default: [],
* __isStencil__ - Boolean - default: false,
* __filterAlpha__ float Number (0-1) (see factory/state.js) - default: 1,
* __filterComposite__ - String (see factory/state.js) - default: 'source-over',

*/
const makeBlock = function (items) {
	return new Block(items);
};

constructors.Block = Block;

export {
	makeBlock,
};
