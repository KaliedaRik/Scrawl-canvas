var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	// define variables
	var filter,
		events,
		stopE,
		current = {
			globalAlpha: 1,
			globalCompositeOperation: 'source-over',
		},
		currentFilter = 'default';

	//set the initial imput values
	document.getElementById('globalAlpha').value = '1';
	document.getElementById('gco').value = 'source-over';

	// define multifilter
	filter = scrawl.makeFilter({
		multiFilter: 'myFilter', 
		species: 'default',
		cacheAction: function(){
			var cache = this.cache,
				rows, cols, multi, get, temp,
				rowChecker, i;

			if(!cache){
				multi = scrawl.multifilter[this.multiFilter];
				if(multi){
					rows = multi.currentHeight - 1;
					cols = multi.currentWidth - 1;
					get = multi.getIndexes;
					cache = [];

					for(i = 0; i < rows; i++){
						rowChecker = i % 10;
						if(rowChecker > 4){
							temp = get.call(multi, 0, i, cols, i + 1);
							cache = cache.concat(temp);
						}
					}
					this.cache = cache;
				}
			}
		},
		action: function(data){
			var counter, len, posA,
				cache = this.cache;
			for(counter = 0, len = cache.length; counter < len; counter++){
				posA = cache[counter];
				if(data[posA]){
					data[posA] = 0;
				}
			}
		},
	})

	scrawl.makeMultiFilter({
		name: 'myFilter',
		filters: filter
	});

	// define entitys
	scrawl.makeWheel({
		radius: '50%',
		startX: 'center',
		startY: 'center',
		order: 0,
	});
	scrawl.makePicture({
		name: 'parrot',
		copyWidth: 360,
		copyHeight: 360,
		pasteWidth: 360,
		pasteHeight: 360,
		copyX: 50,
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center',
		globalAlpha: 1,
		globalCompositeOperation: 'source-over',
		order: 1,
		multiFilter: 'myFilter',
		url: 'img/carousel/cagedparrot.png',
	});

	// define event listeners
	stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};

	events = function(e) {
		stopE(e);
		switch (e.target.id) {
			case 'globalAlpha':
				current.globalAlpha = e.target.value;
				scrawl.entity.parrot.set(current);
				break;
			case 'gco':
				current.globalCompositeOperation = e.target.value;
				scrawl.entity.parrot.set(current);
				break;
		}
	};
	scrawl.addNativeListener(['input', 'change'], events, '.controls');

	// define animation object
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
	extensions: ['images', 'multifilters', 'wheel', 'block'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
