import scrawl from '../source/scrawl.js'


// Scene setup
let canvas = scrawl.library.artefact.mycanvas;

canvas.set({
	backgroundColor: 'aliceblue',
});


let myblock = scrawl.makeBlock({

	name: 'block-tester',
	collides: true,

	width: 120,
	height: 40,

	startX: 60,
	startY: 60,

	fillStyle: 'rgba(0,140,50,0.7)',
	method: 'fill',
});

let myblockPacket = myblock.saveAsPacket();
console.log('Block packet saveAsPacket: ', myblockPacket);

myblock.kill();
console.log('Block packet kill: ', Object.keys(scrawl.library.entity));

canvas.importPacket(myblockPacket)
.then(res => {
	myblock = res;
	console.log('Block packet importPacket: ', Object.keys(scrawl.library.entity), myblock);
})
.catch(err => console.log(err));

/*
RESULTS

Block packet saveAsPacket:  
[
	"block-tester",
	"Block",
	"entity",
	{
		"name":"block-tester",
		"dimensions":[120,40],
		"start":[60,60],
		"delta":{},
		"group":"mycanvas_base",
		"fillStyle":"rgba(0,140,50,0.7)"
	}
]

Block packet kill:  []

Block packet importPacket:  ["block-tester"]
*/

let mypicture = scrawl.makePicture({

	name: 'picture-tester',

	imageSource: 'img/iris.png',

	width: 150,
	height: 100,

	startX: 420,
	startY: 70,

	copyWidth: 150,
	copyHeight: 100,
	copyStartX: 100,
	copyStartY: 150,

	method: 'fill',
	globalAlpha: 0.8,
});

let mypicturePacket = mypicture.saveAsPacket();
console.log('Picture packet saveAsPacket: ', mypicturePacket);

let myPictureAssetPacket = mypicture.asset.saveAsPacket();
console.log('Picture asset packet saveAsPacket: ', myPictureAssetPacket);

mypicture.kill();
console.log('Picture packet kill: ', Object.keys(scrawl.library.entity));

canvas.importPacket(mypicturePacket)
.then(res => {
	mypicture = res;
	console.log('Picture packet importPacket: ', Object.keys(scrawl.library.entity), mypicture);
})
.catch(err => console.log(err));

/*
RESULTS

Picture packet saveAsPacket:  
[
	"picture-tester",
	"Picture",
	"entity",
	{
		"copyStart":[100,150],
		"copyDimensions":[150,100],
		"name":"picture-tester",
		"dimensions":[150,100],
		"start":[420,70],
		"delta":{},
		"asset":"iris",
		"group":"mycanvas_base",
		"globalAlpha":0.8
	}
]

Picture asset packet saveAsPacket:  
[
	"iris",
	"Image",
	"asset",
	{
		"name":"iris",
		"subscribers":["picture-tester"]
	}
]

Picture packet kill:  
["block-tester"]

Picture packet importPacket:  (2) 
["block-tester", "picture-tester"]
*/

let myphrase = scrawl.makePhrase({

	name: 'phrase-tester',

	text: 'H&epsilon;lj&ouml;!',
	font: '40px Garamond, serif',

	width: 120,
	startX: 250,
	startY: 150,

	justify: 'center',
	lineHeight: 1,

	fillStyle: 'rgb(50,0,0)',
	method: 'fill',
	globalAlpha: 0.6,
}).setGlyphStyles({

	weight: 'bold'
}, 1).setGlyphStyles({

	weight: 'normal'
}, 3);

let myphrasePacket = myphrase.saveAsPacket();
console.log('Phrase packet saveAsPacket: ', myphrasePacket);

myphrase.kill();
console.log('Phrase packet kill: ', Object.keys(scrawl.library.entity));

canvas.importPacket(myphrasePacket)
.then(res => {
	myphrase = res;
	console.log('Phrase packet importPacket: ', Object.keys(scrawl.library.entity), myphrase);
})
.catch(err => console.log(err));

/*
RESULTS

Phrase packet saveAsPacket:  
[
	"phrase-tester",
	"Phrase",
	"entity",
	{
		"name":"phrase-tester",
		"dimensions":[120,0],
		"start":[250,150],
		"delta":{},
		"text":"H&epsilon;lj&ouml;!",
		"glyphStyles":[
			null,
			{"weight":"bold"},
			null,
			{"weight":"normal"}
		],
		"justify":"center",
		"lineHeight":1,
		"group":"mycanvas_base",
		"fillStyle":"rgb(50,0,0)",
		"globalAlpha":0.6,
		"sizeValue":40,
		"family":"Garamond, serif"
	}
]

Phrase packet kill:  (2) 
["block-tester", "picture-tester"]

Phrase packet importPacket:  (3) 
["block-tester", "picture-tester", "phrase-tester"]
*/

let mypie = scrawl.makeWheel({

	name: 'wheel-pie-tester',

	radius: 50,

	startAngle: 50,
	endAngle: -50,
	includeCenter: true,

	startX: 320,
	startY: 280,

	fillStyle: 'rgba(20, 100, 250, 0.7)',
	method: 'fill',
});

let mypiePacket = mypie.saveAsPacket();
console.log('Wheel packet saveAsPacket: ', mypiePacket);

mypie.kill();
console.log('Wheel packet kill: ', Object.keys(scrawl.library.entity));

canvas.importPacket(mypiePacket)
.then(res => {
	mypie = res;
	console.log('Wheel packet importPacket: ', Object.keys(scrawl.library.entity), mypie);
})
.catch(err => console.log(err));

/*
RESULTS

Wheel packet saveAsPacket:  
[
	"wheel-pie-tester",
	"Wheel",
	"entity",
	{
		"name":"wheel-pie-tester",
		"dimensions":[100,100],
		"start":[320,280],
		"delta":{},
		"radius":50,
		"startAngle":50,
		"endAngle":-50,
		"includeCenter":true,
		"group":"mycanvas_base",
		"fillStyle":"rgba(20, 100, 250, 0.7)"
	}
]

Wheel packet kill:  (3) 
["block-tester", "picture-tester", "phrase-tester"]

Wheel packet importPacket:  (4) 
["block-tester", "picture-tester", "phrase-tester", "wheel-pie-tester"]
*/

let myoval = scrawl.makeOval({

	name: 'shape-oval-tester',

	startX: 30,
	startY: 160,

	radiusX: 40,
	radiusY: 55,
	intersectY: 0.6,

	fillStyle: 'rgba(20, 50, 180, 0.7)',
	method: 'fill',
});

let myovalPacket = myoval.saveAsPacket();
console.log('Oval Shape packet saveAsPacket: ', myovalPacket);

myoval.kill();
console.log('Oval Shape packet kill: ', Object.keys(scrawl.library.entity));

canvas.importPacket(myovalPacket)
.then(res => {
	myoval = res;
	console.log('Oval Shape packet importPacket: ', Object.keys(scrawl.library.entity), myoval);
})
.catch(err => console.log(err));

/*
RESULTS

Oval Shape packet saveAsPacket:  
[
	"shape-oval-tester",
	"Shape",
	"entity",
	{
		"name":"shape-oval-tester",
		"start":[30,160],
		"delta":{},
		"species":"oval",
		"radiusX":40,
		"radiusY":55,
		"intersectY":0.6,
		"group":"mycanvas_base",
		"fillStyle":"rgba(20, 50, 180, 0.7)"
	}
]

Oval Shape packet kill:  (4) 
["block-tester", "picture-tester", "phrase-tester", "wheel-pie-tester"]
*/

let mybezier = scrawl.makeBezier({

	name: 'shape-bezier-tester',

	startX: 200,
	startY: 210,
	startControlX: 260,
	startControlY: 180,
	endControlX: 320,
	endControlY: 300,
	endX: 380,
	endY: 240,

	lineWidth: 3,
	lineCap: 'round',
	strokeStyle: 'orange',
	method: 'draw',

	boundingBoxColor: 'lightgray',
	showBoundingBox: true,
});

let mybezierPacket = mybezier.saveAsPacket();
console.log('Bezier Shape packet saveAsPacket: ', mybezierPacket);

mybezier.kill();
console.log('Bezier Shape packet kill: ', Object.keys(scrawl.library.entity));

canvas.importPacket(mybezierPacket)
.then(res => {
	mybezier = res;
	console.log('Bezier Shape packet importPacket: ', Object.keys(scrawl.library.entity), mybezier);
})
.catch(err => console.log(err));

/*
RESULTS

Bezier Shape packet saveAsPacket:  
[
	"shape-bezier-tester",
	"Shape",
	"entity",
	{
		"startControl":[260,180],
		"endControl":[320,300],
		"end":[380,240],
		"name":"shape-bezier-tester",
		"start":[200,210],
		"delta":{},
		"method":"draw",
		"species":"bezier",
		"showBoundingBox":true,
		"boundingBoxColor":"lightgray",
		"group":"mycanvas_base",
		"strokeStyle":"orange",
		"lineWidth":3,
		"lineCap":"round"
	}
]

Bezier Shape packet kill:  (5) 
["block-tester", "picture-tester", "phrase-tester", "wheel-pie-tester", "shape-oval-tester"]*/

let mygrid = scrawl.makeGrid({

	name: 'test-grid',

	width: 120,
	height: 80,

	columns: 6,
	rows: 4,

	columnGutterWidth: 2,
	rowGutterWidth: 2,

	roll: 10,

	tileFill: [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],

	tileSources: [
		{
			type: 'color',
			source: 'blue',
		}, {
			type: 'color',
			source: 'red',
		}
	],

	startX: 450,
	startY: 250,
});

let mygridPacket = mygrid.saveAsPacket();
console.log('Grid packet saveAsPacket: ', mygridPacket);

mygrid.kill();
console.log('Grid packet kill: ', Object.keys(scrawl.library.entity));

canvas.importPacket(mygridPacket)
.then(res => {
	mygrid = res;
	console.log('Grid packet importPacket: ', Object.keys(scrawl.library.entity), mygrid);
})
.catch(err => console.log(err));

/*
RESULTS

Grid packet saveAsPacket:  
[
	"test-grid",
	"Grid",
	"entity",
	{
		"tileFill":[0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		"tileSources":[
			{"type":"color","source":"blue"},
			{"type":"color","source":"red"}
		],
		"name":"test-grid",
		"dimensions":[120,80],
		"start":[450,250],
		"delta":{},
		"roll":10,
		"columns":6,
		"rows":4,
		"columnGutterWidth":2,
		"rowGutterWidth":2,
		"group":"mycanvas_base"
	}
]

Grid packet kill:  (6) 
["block-tester", "picture-tester", "phrase-tester", "wheel-pie-tester", "shape-oval-tester", "shape-bezier-tester"]
*/


// Function to display frames-per-second data, and other information relevant to the demo
let report = function () {

	let testTicker = Date.now(),
		testTime, testNow, dragging,
		testMessage = document.querySelector('#reportmessage');

	return function () {

		testNow = Date.now();
		testTime = testNow - testTicker;
		testTicker = testNow;

		testMessage.textContent = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;
	};
}();


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

	name: 'demo-animation',
	target: canvas,
	afterShow: report,
});

console.log(scrawl.library);