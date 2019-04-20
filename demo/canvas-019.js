import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


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

// Event listeners
let stopE = (e) => {

	e.preventDefault();
	e.returnValue = false;
};

let events = (e) => {

	let items = {};

	stopE(e);

	switch (e.target.id) {

		case 'copy_start_xPercent':
			items.copyStartX = e.target.value + '%';
			break;

		case 'copy_start_yPercent':
			items.copyStartY = e.target.value + '%';
			break;

		case 'copy_dims_widthPercent':
			items.copyWidth = e.target.value + '%';
			break;

		case 'copy_dims_widthAbsolute':
			items.copyWidth = Math.round(e.target.value);
			break;

		case 'copy_start_xAbsolute':
			items.copyStartX = Math.round(e.target.value);
			break;

		case 'copy_start_yAbsolute':
			items.copyStartY = Math.round(e.target.value);
			break;

		case 'copy_dims_heightPercent':
			items.copyHeight = e.target.value + '%';
			break;

		case 'copy_dims_heightAbsolute':
			items.copyHeight = Math.round(e.target.value);
			break;

		case 'paste_dims_widthPercent':
			items.width = e.target.value + '%';
			break;

		case 'paste_dims_widthAbsolute':
			items.width = Math.round(e.target.value);
			break;

		case 'paste_dims_heightPercent':
			items.height = e.target.value + '%';
			break;

		case 'paste_dims_heightAbsolute':
			items.height = Math.round(e.target.value);
			break;

		case 'paste_start_xPercent':
			items.startX = e.target.value + '%';
			break;

		case 'paste_start_yPercent':
			items.startY = e.target.value + '%';
			break;

		case 'paste_handle_xPercent':
			items.handleX = e.target.value + '%';
			break;

		case 'paste_handle_yPercent':
			items.handleY = e.target.value + '%';
			break;

		case 'paste_start_xAbsolute':
			items.startX = Math.round(e.target.value);
			break;

		case 'paste_start_yAbsolute':
			items.startY = Math.round(e.target.value);
			break;

		case 'paste_handle_xAbsolute':
			items.handleX = Math.round(e.target.value);
			break;

		case 'paste_handle_yAbsolute':
			items.handleY = Math.round(e.target.value);
			break;

		case 'paste_start_xString':
			items.startX = e.target.value;
			break;

		case 'paste_start_yString':
			items.startY = e.target.value;
			break;

		case 'paste_handle_xString':
			items.handleX = e.target.value;
			break;

		case 'paste_handle_yString':
			items.handleY = e.target.value;
			break;

		case 'roll':
			items.roll = parseFloat(e.target.value);
			break;

		case 'scale':
			items.scale = parseFloat(e.target.value);
			break;

		case 'upend':
			items.flipUpend = (e.target.value === '1') ? true : false;
			break;

		case 'reverse':
			items.flipReverse = (e.target.value === '1') ? true : false;
			break;
	}

	viddyOne.set(items);
};

scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

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


// // Setup form
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


// Animation 
scrawl.makeAnimation({

	name: 'testC019Display',
	
	fn: function(){
		
		return new Promise((resolve) => {

			scrawl.render()
			.then(() => {

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

				testMessage.innerHTML = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}
				assets: ${scrawl.library.assetnames.length}; artefacts: ${scrawl.library.artefactnames.length}`;

				resolve(true);
			})
			.catch((err) => {

				testTicker = Date.now();
				testMessage.innerHTML = (err.substring) ? err : JSON.stringify(err);

				resolve(false);
			});
		});
	}
});
