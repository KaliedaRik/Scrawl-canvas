var mycode = function() {
	'use strict';

	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	scrawl.getImagesByClass('demo120');

	var state = 'default',
		pad = scrawl.pad.myCanvas,
		canvas = scrawl.canvas.myCanvas,
		here, target,
		targets, guides,
		topLeftPath, topRightPath, bottomLeftPath, bottomRightPath,
		buildPaths, checkClick,
		show, hide, showAction, hideAction,
		defaultCorners = {
			zoo01: ['0%', '0%', '20%', '0%', '20%', '50%', '0%', '50%'],
			zoo02: ['20%', '0%', '40%', '0%', '40%', '50%', '20%', '50%'],
			zoo03: ['40%', '0%', '60%', '0%', '60%', '50%', '40%', '50%'],
			zoo04: ['60%', '0%', '80%', '0%', '80%', '50%', '60%', '50%'],
			zoo05: ['80%', '0%', '100%', '0%', '100%', '50%', '80%', '50%'],
			zoo06: ['0%', '50%', '20%', '50%', '20%', '100%', '0%', '100%'],
			zoo07: ['20%', '50%', '40%', '50%', '40%', '100%', '20%', '100%'],
			zoo08: ['40%', '50%', '60%', '50%', '60%', '100%', '40%', '100%'],
			zoo09: ['60%', '50%', '80%', '50%', '80%', '100%', '60%', '100%'],
			zoo10: ['80%', '50%', '100%', '50%', '100%', '100%', '80%', '100%']
		},
		frameKeys = Object.keys(defaultCorners),
		i, iz, anim;

	targets = scrawl.makeGroup({
		name: 'targets',
		cell: pad.base
	});
	guides = targets.clone({
		name: 'guides',
	});

	pad.set({
		backgroundColor: 'black'
	}).render();

	for (i = 0, iz = frameKeys.length; i < iz; i++) {
		scrawl.makeFrame({
			name: frameKeys[i],
			cornersData: defaultCorners[frameKeys[i]],
			source: frameKeys[i],
			order: 0,
			globalAlpha: 0.7,
			group: 'targets'
		});
	}

	buildPaths = function(item) {
		var data = defaultCorners[item],
			defaults = {
				method: 'none',
				precision: 25,
				pathSpeedConstant: false,
			};

		scrawl.deleteEntity('topLeftTrack');
		topLeftPath = scrawl.makeQuadratic({
			name: 'topLeftTrack',
			group: 'guides',
			startX: data[0],
			startY: data[1],
			endX: '25%',
			endY: '0%',
			controlX: '50%',
			controlY: '80%',
		}).set(defaults);
		scrawl.deleteEntity('topRightTrack');
		topRightPath = scrawl.makeQuadratic({
			name: 'topRightTrack',
			group: 'guides',
			startX: data[2],
			startY: data[3],
			endX: '75%',
			endY: '0%',
			controlX: '50%',
			controlY: '80%',
		}).set(defaults);
		scrawl.deleteEntity('bottomRightTrack');
		bottomRightPath = scrawl.makeQuadratic({
			name: 'bottomRightTrack',
			group: 'guides',
			startX: data[4],
			startY: data[5],
			endX: '75%',
			endY: '100%',
			controlX: '50%',
			controlY: '20%',
		}).set(defaults);
		scrawl.deleteEntity('bottomLeftTrack');
		bottomLeftPath = scrawl.makeQuadratic({
			name: 'bottomLeftTrack',
			group: 'guides',
			startX: data[6],
			startY: data[7],
			endX: '25%',
			endY: '100%',
			controlX: '50%',
			controlY: '20%',
		}).set(defaults);
	};

	show = scrawl.makeTween({
		name: 'show',
		duration: 1500,
		definitions: [{
			attribute: 'topLeftPathPlace',
			start: 0,
			end: 1,
			engine: 'linear'
		}, {
			attribute: 'topRightPathPlace',
			start: 0,
			end: 1,
			engine: 'easeOut3'
		}, {
			attribute: 'bottomRightPathPlace',
			start: 0,
			end: 1,
			engine: 'easeIn3'
		}, {
			attribute: 'globalAlpha',
			start: 0.7,
			end: 1,
		}, {
			attribute: 'bottomLeftPathPlace',
			start: 0,
			end: 1,
			engine: 'easeOutIn3'
		}]
	});
	showAction = scrawl.makeAction({
		name: 'showEndAction',
		ticker: 'show_ticker',
		time: '100%',
		action: function() {
			state = 'display';
		}
	});
	hide = scrawl.makeTween({
		name: 'hide',
		duration: 1500,
		definitions: [{
			attribute: 'topLeftPathPlace',
			start: 1,
			end: 0,
			engine: 'easeOut3'
		}, {
			attribute: 'topRightPathPlace',
			start: 1,
			end: 0,
			engine: 'easeIn3'
		}, {
			attribute: 'bottomRightPathPlace',
			start: 1,
			end: 0,
			engine: 'easeOutIn3'
		}, {
			attribute: 'globalAlpha',
			start: 1,
			end: 0.7,
			engine: 'easeOut3'
		}, {
			attribute: 'bottomLeftPathPlace',
			start: 1,
			end: 0,
			engine: 'linear'
		}]
	});
	hideAction = scrawl.makeAction({
		name: 'hideEndAction',
		ticker: 'hide_ticker',
		time: '100%',
		action: function() {
			var t = this.targets[0];
			t.set({
				cornersData: defaultCorners[t.name],
				order: 0
			});
			state = 'default';
		}
	});

	/*
	possible states
	- default - when image clicked, it needs to be setup and show tween started
	- show - show tween currently running; ignore any mouse clicks
	- display - show tween completed; mouse click anywhere should trigger hide tween
	- hide - hide tween currently running; ignore any mouse clicks
	*/
	checkClick = function(e) {
		var name;
		switch (state) {
			case 'default':
				here = pad.getMouse();
				target = targets.getEntityAt(here);
				if (target) {
					state = 'show';
					name = target.name;
					buildPaths(name);
					target.set({
						topLeftPath: topLeftPath.name,
						topRightPath: topRightPath.name,
						bottomRightPath: bottomRightPath.name,
						bottomLeftPath: bottomLeftPath.name,
						cornersData: false,
						globalAlpha: 1,
						order: 2
					});
					showAction.set({
						targets: target
					});
					hide.set({
						targets: target
					});
					hideAction.set({
						targets: target
					});
					show.set({
						targets: target
					}).run();
				}
				break;
			case 'display':
				state = 'hide';
				hide.run();
				break;
		}
	};
	scrawl.addListener('up', checkClick, canvas);

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
	extensions: ['animation', 'images', 'frame', 'path', 'factories'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
