import scrawl from '../source/scrawl.js'
scrawl.setScrawlPath('/source');


// Time display variables
let testTicker = Date.now(),
	testTime, testNow, 
	testMessage = document.querySelector('#reportmessage');


// Get image from DOM
scrawl.importDomImage('.mypatterns');

// Create Pattern styles
scrawl.makePattern({

	name: 'brick-pattern',
	asset: 'brick',

}).clone({

	name: 'leaves-pattern',
	asset: 'leaves',

}).clone({

	name: 'water-pattern',
	imageSource: 'img/water.png',

}).clone({

	name: 'marble-pattern',
	imageSource: 'img/marble.png',

});


// scrawl.makePattern({

// 	name: 'brick-pattern',
// 	asset: 'brick',

// });
// scrawl.makePattern({

// 	name: 'leaves-pattern',
// 	asset: 'leaves',

// });
// scrawl.makePattern({

// 	name: 'water-pattern',
// 	imageSource: 'img/water.png',

// });
// scrawl.makePattern({

// 	name: 'marble-pattern',
// 	imageSource: 'img/marble.png',

// });


// Create Block entitys
scrawl.makeBlock({

	name: 'water-in-leaves',

	width: 240,
	height: 140,

	startX: 40,
	startY: 40,

	lineWidth: 20,
	lineJoin: 'round',

	method: 'sinkInto',

	fillStyle: 'water-pattern',
	strokeStyle: 'leaves-pattern',

	shadowOffsetX: 5,
	shadowOffsetY: 5,
	shadowBlur: 3,
	shadowColor: 'black',

}).clone({

	name: 'leaves-in-brick',

	startX: 340,

	fillStyle: 'leaves-pattern',
	strokeStyle: 'brick-pattern',

}).clone({
	
	name: 'brick-in-marble',

	startY: 240,

	fillStyle: 'brick-pattern',
	strokeStyle: 'marble-pattern',

}).clone({
	
	name: 'marble-in-water',

	startX: 40,

	fillStyle: 'marble-pattern',
	strokeStyle: 'water-pattern',

});

// Animation 
scrawl.makeAnimation({

	name: 'testC018Display',
	
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
