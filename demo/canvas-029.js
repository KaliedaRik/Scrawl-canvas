import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


// Create Shape entity
let lorem = scrawl.makePhrase({

	name: 'myPhrase',

	startX: 300,
	startY: 200,
	handleX: '50%',
	handleY: '50%',
	width: '50%',

	text: 'Lorem ipsum har varit standard ända sedan 1500-talet, när-en-okänd-boksättare-tog att antal bokstäver och blandade dem för att göra ett provexemplar av en bok.',
	font: "16px 'Open Sans', 'Fira Sans', 'Lucida Sans', 'Lucida Sans Unicode', 'Trebuchet MS', 'Liberation Sans', 'Nimbus Sans L', sans-serif",

	fillStyle: 'darkgreen',

	method: 'fill',
	showBoundingBox: true,

});

scrawl.makeWheel({

	fillStyle: 'red',
	radius: 5,
	pivot: 'myPhrase',
	lockTo: 'pivot',


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

		case 'start_xPercent':
			items.startX = e.target.value + '%';
			break;

		case 'start_yPercent':
			items.startY = e.target.value + '%';
			break;

		case 'handle_xPercent':
			items.handleX = e.target.value + '%';
			break;

		case 'handle_yPercent':
			items.handleY = e.target.value + '%';
			break;

		case 'start_xAbsolute':
			items.startX = Math.round(e.target.value);
			break;

		case 'start_yAbsolute':
			items.startY = Math.round(e.target.value);
			break;

		case 'handle_xAbsolute':
			items.handleX = Math.round(e.target.value);
			break;

		case 'handle_yAbsolute':
			items.handleY = Math.round(e.target.value);
			break;

		case 'start_xString':
			items.startX = e.target.value;
			break;

		case 'start_yString':
			items.startY = e.target.value;
			break;

		case 'handle_xString':
			items.handleX = e.target.value;
			break;

		case 'handle_yString':
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

		case 'relativeWidth':
			items.width = e.target.value + '%';
			break;

		case 'absoluteWidth':
			items.width = Math.round(e.target.value);
			break;

		case 'weight':
			items.fontWeight = e.target.value;
			break;

		case 'style':
			items.fontStyle = e.target.value;
			break;

		case 'variant':
			items.fontVariant = e.target.value;
			break;

		case 'family':
			items.fontFamily = e.target.value;
			break;

		case 'size_px':
			items.fontSize = `${e.target.value}px`;
			break;

		case 'size_string':
			items.fontSize = e.target.value;
			break;
	}

	lorem.set(items);
};

scrawl.addNativeListener(['input', 'change'], events, '.controlItem');


// Setup form
document.querySelector('#start_xPercent').value = 50;
document.querySelector('#start_yPercent').value = 50;
document.querySelector('#handle_xPercent').value = 50;
document.querySelector('#handle_yPercent').value = 50;
document.querySelector('#start_xAbsolute').value = 300;
document.querySelector('#start_yAbsolute').value = 200;
document.querySelector('#handle_xAbsolute').value = 100;
document.querySelector('#handle_yAbsolute').value = 100;
document.querySelector('#start_xString').options.selectedIndex = 1;
document.querySelector('#start_yString').options.selectedIndex = 1;
document.querySelector('#handle_xString').options.selectedIndex = 1;
document.querySelector('#handle_yString').options.selectedIndex = 1;
document.querySelector('#roll').value = 0;
document.querySelector('#scale').value = 1;
document.querySelector('#upend').options.selectedIndex = 0;
document.querySelector('#reverse').options.selectedIndex = 0;
document.querySelector('#relativeWidth').value = 50;
document.querySelector('#absoluteWidth').value = 300;
document.querySelector('#weight').options.selectedIndex = 0;
document.querySelector('#style').options.selectedIndex = 0;
document.querySelector('#variant').options.selectedIndex = 0;
document.querySelector('#family').options.selectedIndex = 0;
document.querySelector('#size_px').value = 16;
document.querySelector('#size_string').options.selectedIndex = 4;


// Animation 
scrawl.makeAnimation({

	name: 'testC029Display',
	
	fn: function(){
		
		return new Promise((resolve) => {

			scrawl.render()
			.then(() => {

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;

				testMessage.innerHTML = `Screen refresh: ${Math.ceil(testTime)}ms; fps: ${Math.floor(1000 / testTime)}`;

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
