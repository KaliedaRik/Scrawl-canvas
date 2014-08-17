var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var myInput,
		updateInput,
		rr, rg, rb, gr, gg, gb, br, bg, bb,
		rrVal = 0.39,
		rgVal = 0.35,
		rbVal = 0.27,
		grVal = 0.77,
		ggVal = 0.69,
		gbVal = 0.53,
		brVal = 0.19,
		bgVal = 0.17,
		bbVal = 0.13,
		_rr, _rg, _rb, _gr, _gg, _gb, _br, _bg, _bb;

	//import image
	scrawl.getImagesByClass('demo407');

	//clone image and add filter to it
	scrawl.image.parrot.clone({
		name: 'tintparrot',
	}).filter('tint', {
		value: 1,
		useSourceData: true,
	});

	//define sprites
	scrawl.newPicture({
		name: 'parrot',
		startX: 10,
		startY: 10,
		scale: 0.5,
		source: 'parrot',
	}).clone({
		startX: 120,
		startY: 210,
		source: 'tintparrot',
	});

	//preparing the DOM input elements
	myInput = document.getElementById('myvalue');
	myInput.value = 1;
	rr = document.getElementById('rr');
	rr.value = rrVal;
	rg = document.getElementById('rg');
	rg.value = rgVal;
	rb = document.getElementById('rb');
	rb.value = rbVal;
	gr = document.getElementById('gr');
	gr.value = grVal;
	gg = document.getElementById('gg');
	gg.value = ggVal;
	gb = document.getElementById('gb');
	gb.value = gbVal;
	br = document.getElementById('br');
	br.value = brVal;
	bg = document.getElementById('bg');
	bg.value = bgVal;
	bb = document.getElementById('bb');
	bb.value = bbVal;

	//event listener
	updateInput = function(e) {
		scrawl.image.tintparrot.filter('tint', {
			value: parseFloat(myInput.value),
			useSourceData: true,
			rr: rrVal,
			rg: rgVal,
			rb: rbVal,
			gr: grVal,
			gg: ggVal,
			gb: gbVal,
			br: brVal,
			bg: bgVal,
			bb: bbVal,
		});
		if (e) {
			e.preventDefault();
			e.returnValue = false;
		}
	};
	myInput.addEventListener('input', updateInput, false); //for firefox real-time updating
	myInput.addEventListener('change', updateInput, false);
	_rr = function(e) {
		rrVal = parseFloat(rr.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	rr.addEventListener('change', _rr, false);
	_rg = function(e) {
		rgVal = parseFloat(rg.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	rg.addEventListener('change', _rg, false);
	_rb = function(e) {
		rbVal = parseFloat(rb.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	rb.addEventListener('change', _rb, false);
	_gr = function(e) {
		grVal = parseFloat(gr.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	gr.addEventListener('change', _gr, false);
	_gg = function(e) {
		ggVal = parseFloat(gg.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	gg.addEventListener('change', _gg, false);
	_gb = function(e) {
		gbVal = parseFloat(gb.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	gb.addEventListener('change', _gb, false);
	_br = function(e) {
		brVal = parseFloat(br.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	br.addEventListener('change', _br, false);
	_bg = function(e) {
		bgVal = parseFloat(bg.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	bg.addEventListener('change', _bg, false);
	_bb = function(e) {
		bbVal = parseFloat(bb.value);
		updateInput();
		e.preventDefault();
		e.returnValue = false;
	};
	bb.addEventListener('change', _bb, false);

	//to make sure everything is in place ...
	updateInput();

	//animation object
	scrawl.newAnimation({
		fn: function() {
			scrawl.render();

			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Current tint value: ' + myInput.value + '. Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime) + '<br />rr: ' + rrVal + '; rg: ' + rgVal + '; rb: ' + rbVal + '; gr: ' + grVal + '; gg: ' + ggVal + '; gb: ' + gbVal + '; br: ' + brVal + '; bg: ' + bgVal + '; bb: ' + bbVal;
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['images', 'filters', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
