import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Scene setup
let canvas = scrawl.library.artefact.mycanvas;


// Get image from DOM
scrawl.importDomVideo('.myvideo');


// Create Picture entity
let viddyOne = scrawl.makePicture({

	name: 'first-video',
	asset: 'waves',

	width: 200,
	height: 200,

	startX: 300,
	startY: 200,
	handleX: 100,
	handleY: 100,

	copyWidth: 200,
	copyHeight: 200,
	copyStartX: 100,
	copyStartY: 100,

	lineWidth: 10,
	strokeStyle: 'lightgreen',

	order: 1,
	method: 'drawFill',

});

let viddyTwo = scrawl.makePicture({

	name: 'second-video',
	videoSource: 'img/Motion - 18249.mp4',

	width: '100%',
	height: '100%',

	copyWidth: '100%',
	copyHeight: '100%',

	order: 0,
	method: 'fill',
});


// Function to display frames-per-second data, and other information relevant to the demo
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


// Create the Animation loop which will run the Display cycle
scrawl.makeRender({

	name: 'demo-animation',
	target: canvas,
	afterShow: report,
});


// User interaction - setup form observer functionality
scrawl.observeAndUpdate({

	event: ['input', 'change'],
	origin: '.controlItem',

	target: viddyOne,

	useNativeListener: true,
	preventDefault: true,

	updates: {

		copy_start_xPercent: ['copyStartX', '%'],
		copy_start_xAbsolute: ['copyStartX', 'round'],

		copy_start_yPercent: ['copyStartY', '%'],
		copy_start_yAbsolute: ['copyStartY', 'round'],

		copy_dims_widthPercent: ['copyWidth', '%'],
		copy_dims_widthAbsolute: ['copyWidth', 'round'],

		copy_dims_heightPercent: ['copyHeight', '%'],
		copy_dims_heightAbsolute: ['copyHeight', 'round'],

		paste_dims_widthPercent: ['width', '%'],
		paste_dims_widthAbsolute: ['width', 'round'],

		paste_dims_heightPercent: ['height', '%'],
		paste_dims_heightAbsolute: ['height', 'round'],

		paste_start_xPercent: ['startX', '%'],
		paste_start_xAbsolute: ['startX', 'round'],
		paste_start_xString: ['startX', 'raw'],

		paste_start_yPercent: ['startY', '%'],
		paste_start_yAbsolute: ['startY', 'round'],
		paste_start_yString: ['startY', 'raw'],

		paste_handle_xPercent: ['handleX', '%'],
		paste_handle_xAbsolute: ['handleX', 'round'],
		paste_handle_xString: ['handleX', 'raw'],

		paste_handle_yPercent: ['handleY', '%'],
		paste_handle_yAbsolute: ['handleY', 'round'],
		paste_handle_yString: ['handleY', 'raw'],

		roll: ['roll', 'float'],
		scale: ['scale', 'float'],

		upend: ['flipUpend', 'boolean'],
		reverse: ['flipReverse', 'boolean'],
	},
});


// because many browsers/devices will not allow video to be played
// - until a user interacts with it in some way
scrawl.addListener('up', function () {

	viddyOne.set({
		video_muted: true,
		video_loop: true,
	}).videoPlay();

	viddyTwo.set({
		video_muted: true,
		video_loop: true,
	}).videoPlay();

}, canvas.domElement);


// Setup form
document.querySelector('#copy_start_xPercent').value = 25;
document.querySelector('#copy_start_yPercent').value = 25;
document.querySelector('#copy_dims_widthPercent').value = 50;
document.querySelector('#copy_dims_widthAbsolute').value = 200;
document.querySelector('#copy_start_xAbsolute').value = 100;
document.querySelector('#copy_start_yAbsolute').value = 100;
document.querySelector('#copy_dims_heightPercent').value = 50;
document.querySelector('#copy_dims_heightAbsolute').value = 200;
document.querySelector('#paste_dims_widthPercent').value = 33;
document.querySelector('#paste_dims_widthAbsolute').value = 200;
document.querySelector('#paste_dims_heightPercent').value = 50;
document.querySelector('#paste_dims_heightAbsolute').value = 200;
document.querySelector('#paste_start_xPercent').value = 50;
document.querySelector('#paste_start_yPercent').value = 50;
document.querySelector('#paste_handle_xPercent').value = 50;
document.querySelector('#paste_handle_yPercent').value = 50;
document.querySelector('#paste_start_xAbsolute').value = 300;
document.querySelector('#paste_start_yAbsolute').value = 200;
document.querySelector('#paste_handle_xAbsolute').value = 100;
document.querySelector('#paste_handle_yAbsolute').value = 100;
document.querySelector('#paste_start_xString').options.selectedIndex = 1;
document.querySelector('#paste_start_yString').options.selectedIndex = 1;
document.querySelector('#paste_handle_xString').options.selectedIndex = 1;
document.querySelector('#paste_handle_yString').options.selectedIndex = 1;
document.querySelector('#roll').value = 0;
document.querySelector('#scale').value = 1;
document.querySelector('#upend').options.selectedIndex = 0;
document.querySelector('#reverse').options.selectedIndex = 0;
