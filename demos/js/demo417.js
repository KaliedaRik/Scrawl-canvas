var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var filter,
		currentCorners = {
			tlx: 20,
			tly: 20,
			trx: 380,
			try: 20,
			brx: 380,
			bry: 380,
			blx: 20,
			bly: 380
		},
		currentOther = {
			interferenceLoops: 2,
			interferenceFactor: 1.03,
			alpha: 1
		},
		events,
		stopE;

	//set the initial imput values
	document.getElementById('tlx_abs').value = '20';
	document.getElementById('tly_abs').value = '20';
	document.getElementById('tlx_rel').value = '5';
	document.getElementById('tly_rel').value = '5';
	document.getElementById('trx_abs').value = '380';
	document.getElementById('try_abs').value = '20';
	document.getElementById('trx_rel').value = '95';
	document.getElementById('try_rel').value = '5';
	document.getElementById('blx_abs').value = '20';
	document.getElementById('bly_abs').value = '380';
	document.getElementById('blx_rel').value = '5';
	document.getElementById('bly_rel').value = '95';
	document.getElementById('brx_abs').value = '380';
	document.getElementById('bry_abs').value = '380';
	document.getElementById('brx_rel').value = '95';
	document.getElementById('bry_rel').value = '95';
	document.getElementById('i_loop').value = '2';
	document.getElementById('i_factor').value = '1.03';
	document.getElementById('alpha').value = '1';

	//define filter
	filter = scrawl.makePerspectiveCornersFilter({
		name: 'myfilter',
		cornersData: currentCorners,
		interferenceLoops: 2,
		interferenceFactor: 1.03,
		alpha: 1
	});

	//define entity
	scrawl.makePicture({
		name: 'parrot',
		copyWidth: 360,
		copyHeight: 360,
		pasteWidth: 360,
		pasteHeight: 360,
		copyX: 50,
		pasteX: 20,
		pasteY: 20,
		filters: ['myfilter'],
		// url: 'http://scrawl.rikweb.org.uk/img/carousel/cagedparrot.png',
		url: 'img/carousel/cagedparrot.png',
		//method: 'none'
	});

	//event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	events = function(e) {
		stopE(e);
		switch (e.target.id) {
			case 'tlx_abs':
				currentCorners.tlx = Math.round(e.target.value);
				break;
			case 'tly_abs':
				currentCorners.tly = Math.round(e.target.value);
				break;
			case 'tlx_rel':
				currentCorners.tlx = e.target.value + '%';
				break;
			case 'tly_rel':
				currentCorners.tly = e.target.value + '%';
				break;
			case 'trx_abs':
				currentCorners.trx = Math.round(e.target.value);
				break;
			case 'try_abs':
				currentCorners.try = Math.round(e.target.value);
				break;
			case 'trx_rel':
				currentCorners.trx = e.target.value + '%';
				break;
			case 'try_rel':
				currentCorners.try = e.target.value + '%';
				break;
			case 'blx_abs':
				currentCorners.blx = Math.round(e.target.value);
				break;
			case 'bly_abs':
				currentCorners.bly = Math.round(e.target.value);
				break;
			case 'blx_rel':
				currentCorners.blx = e.target.value + '%';
				break;
			case 'bly_rel':
				currentCorners.bly = e.target.value + '%';
				break;
			case 'brx_abs':
				currentCorners.brx = Math.round(e.target.value);
				break;
			case 'bry_abs':
				currentCorners.bry = Math.round(e.target.value);
				break;
			case 'brx_rel':
				currentCorners.brx = e.target.value + '%';
				break;
			case 'bry_rel':
				currentCorners.bry = e.target.value + '%';
				break;
			case 'i_loop':
				currentOther.interferenceLoops = parseFloat(e.target.value);
				break;
			case 'i_factor':
				currentOther.interferenceFactor = parseFloat(e.target.value);
				break;
			case 'alpha':
				currentOther.alpha = parseFloat(e.target.value);
				break;
		}
		filter.set({
			cornersData: currentCorners,
			interferenceLoops: 2,
			interferenceFactor: 1.03,
			alpha: 1
		});
	};
	scrawl.addNativeListener(['input', 'change'], events, '.controlItem');

	//animation object
	scrawl.makeAnimation({
		fn: function() {

			scrawl.render();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});

};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['images', 'filters', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
