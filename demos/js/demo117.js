var mycode = function() {
	'use strict';

	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	scrawl.getImageById('flower');

	scrawl.makeGroup({
		name: 'allDots',
		cell: scrawl.pad.myCanvas.base,
		order: 2,
	});
	for (var y = 0; y < 5; y++) {
		for (var x = 0; x < 5; x++) {
			/* We'll create our dots large, transparent and invisible (note that 'transparent' and 'invisible' are not the same thing) ... */
			scrawl.makeWheel({
				name: 'dot_' + y + x,
				radius: '10%',
				scale: 0,
				startX: ((x * 20) + 10) + '%',
				startY: ((y * 20) + 10) + '%',
				visibility: false,
				globalAlpha: 0,
				globalCompositeOperation: 'source-over',
				group: 'allDots'
			});
		}
	}
	var allTheDots = [].concat(scrawl.group.allDots.entitys);
	var middleDot = ['dot_22'];
	var innerDots = ['dot_12', 'dot_21', 'dot_23', 'dot_32'];
	var outerDots = ['dot_02', 'dot_11', 'dot_13', 'dot_20', 'dot_24', 'dot_31', 'dot_33', 'dot_42'];
	var edgeDots = ['dot_01', 'dot_03', 'dot_10', 'dot_14', 'dot_30', 'dot_34', 'dot_41', 'dot_43'];
	var cornerDots = ['dot_00', 'dot_04', 'dot_40', 'dot_44'];

	scrawl.makeGroup({
		name: 'myFlower',
		cell: scrawl.pad.myCanvas.base,
		order: 1,
	});
	scrawl.makePicture({
		name: 'iris',
		source: 'flower',
		startX: 0,
		startY: 0,
		handleX: 'center',
		handleY: 'center',
		globalCompositeOperation: 'source-over',
		scale: 0,
		group: 'myFlower'
	});

	var myTimeline = scrawl.makeTicker({
		name: 'disappear',
		eventChoke: 16,
	});

	scrawl.makeTween({
		name: 'enterIris',
		targets: 'iris',
		duration: 2000,
		time: 0,
		ticker: 'disappear',
		definitions: [{
			attribute: 'scale',
			start: 0,
			end: 1,
			engine: 'easeIn'
		}, {
			attribute: 'startX',
			start: '0%',
			end: '50%',
			engine: 'easeIn3'
		}, {
			attribute: 'startY',
			start: '0%',
			end: '50%',
			engine: 'easeIn3'
		}]
	});

	scrawl.makeAction({
		name: 'makeDotsVisible',
		targets: allTheDots,
		ticker: 'disappear',
		time: 1800,
		action: function(){
			this.updateTargets({ visibility: true });
		},
		revert: function(){
			this.updateTargets({ visibility: false });
		}
	});

	scrawl.makeTween({
		duration: 600,
		definitions: [{
			attribute: 'scale',
			start: 0,
			end: 1
		}, {
			attribute: 'globalAlpha',
			start: 0,
			end: 1
		}],
		ticker: 'disappear',
		name: 'dotTween1',
		targets: middleDot,
		time: 2000
	}).clone({
		name: 'dotTween2',
		targets: innerDots,
		time: 2300
	}).clone({
		name: 'dotTween3',
		targets: outerDots,
		time: 2600
	}).clone({
		name: 'dotTween4',
		targets: edgeDots,
		time: 2900,
	}).clone({
		name: 'dotTween5',
		targets: cornerDots,
		time: 3200,
	});

	scrawl.makeTween({
		duration: 600,
		definitions: [{
			attribute: 'scale',
			start: 1,
			end: 2
		}, {
			attribute: 'globalAlpha',
			start: 1,
			end: 0
		}],
		ticker: 'disappear',
		name: 'dotTween6',
		targets: middleDot,
		time: 2600
	}).clone({
		name: 'dotTween7',
		targets: innerDots,
		time: 2900
	}).clone({
		name: 'dotTween8',
		targets: outerDots,
		time: 3200
	}).clone({
		name: 'dotTween9',
		targets: edgeDots,
		time: 3500
	}).clone({
		name: 'dotTween10',
		targets: cornerDots,
		time: 3800
	});


	scrawl.makeAction({
		name: 'changeDotsOrder',
		targets: scrawl.group.allDots,
		ticker: 'disappear',
		time: 4410,
		action: function(){
			this.updateTargets({ order: 0 });
		},
		revert: function(){
			this.updateTargets({ order: 2 });
		}
	});

	scrawl.makeAction({
		name: 'changeDotsVisibility',
		targets: allTheDots,
		ticker: 'disappear',
		time: 4420,
		action: function(){
			this.updateTargets({ globalAlpha: 1 });
		},
		revert: function(){
			this.updateTargets({ globalAlpha: 0 });
		}
	});

	scrawl.makeAction({
		name: 'changeFlowerComposition',
		targets: 'iris',
		ticker: 'disappear',
		time: 4430,
		action: function(){
			this.updateTargets({ globalCompositeOperation: 'source-in' });
		},
		revert: function(){
			this.updateTargets({ globalCompositeOperation: 'source-over' });
		}
	});

	scrawl.makeTween({
		duration: 3000,
		definitions: [{
			attribute: 'scale',
			start: 2,
			end: 0,
			engine: 'easeOutIn4'
		}],
		ticker: 'disappear',
		name: 'dotTween11',
		targets: cornerDots,
		time: 4500
	}).clone({
		name: 'dotTween12',
		targets: edgeDots,
		time: 6000
	}).clone({
		name: 'dotTween13',
		targets: outerDots,
		time: 7500
	}).clone({
		name: 'dotTween14',
		targets: innerDots,
		time: 9000
	}).clone({
		name: 'dotTween15',
		targets: middleDot,
		time: 10500
	});

	//event listeners
	var mySlider = document.getElementById('seeker');
	mySlider.value = '0';
	var currentSeeker = '0';
	var stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};
	var events = function(e) {
		var temp;
		stopE(e);
		switch (e.target.id) {
			case 'run':
				myTimeline.run();
				break;
			case 'halt':
				myTimeline.halt();
				break;
			case 'resume':
				myTimeline.resume();
				break;
			case 'seeker':
				temp = e.target.value.toString()
				if(currentSeeker !== temp){
					myTimeline.seekTo(e.target.value);
					currentSeeker = temp;
				}
				break;
		}
	};
	scrawl.addNativeListener(['input', 'change', 'click'], events, '.controls');

	scrawl.addNativeListener('tickerupdate', function(e){
		mySlider.value = e.detail.tick;
	}, window);

	scrawl.makeAnimation({
		name: 'drawScene',
		order: 2,
		fn: function() {
			scrawl.render();
			// mySlider.value = myTimeline.tick.toString();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});

	myTimeline.run();
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['animation', 'wheel', 'images'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
