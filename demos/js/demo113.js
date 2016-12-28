var mycode = function() {
	'use strict';

	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//code here
	var stopE,
		events,
		myTicker,
		mySlider,
		myColor,
		timesArray, rollDefinition,
		allCols, col3Tweens,
		pad = scrawl.pad.mycanvas,
		r, c, t;

	// color object
	myColor = scrawl.makeColor({
		name: 'mycolor'
	});

	// column groups
	scrawl.makeGroup({
		name: 'col1Group',
		order: 1,
		cell: pad.base
	}).clone({
		name: 'col2Group'
	}).clone({
		name: 'col3Group'
	}).clone({
		name: 'col4Group'
	});

	// ticker
	myTicker = scrawl.makeTicker({
		name: 'timeline',
		duration: 10000
	});

	// entitys, tweens and actions
	timesArray = ['0', '2017.5', '0ms', '4033.975ms', '0s', '1s', '1.0s', '14s', '0%', '40.5%', '80.50%', '100%'];

	rollDefinition = {
		attribute: 'roll',
		start: 0,
		end: 720,
		engine: 'easeOutIn'
	};

	for(r = 0; r < 3; r++){
		for(c = 0; c < 4; c++){

			t = (r * 4) + c;

			scrawl.makePhrase({
				name: 'p_' + t,
				font: '18pt Arial, sans-serif',
				text: timesArray[t],
				fillStyle: 'mycolor',
				handleX: 'center',
				handleY: 'center',
				startX: (c * 20) + 20 + '%',
				startY: (r * 25) + 25 + '%',
				group: 'col' + (c + 1) + 'Group'
			});

			scrawl.makeTween({
				name: 't_' + t,
				ticker: 'timeline',
				duration: '10%',
				time: timesArray[t],
				targets: 'p_' + t,
				definitions: [rollDefinition]
			});
		}
	}
	allCols = [].concat(
		scrawl.group.col1Group.entitys, 
		scrawl.group.col2Group.entitys, 
		scrawl.group.col3Group.entitys, 
		scrawl.group.col4Group.entitys
	);
	col3Tweens = ['t_2', 't_6', 't_10'];

	scrawl.makeAction({
		name: 'resize',
		ticker: 'timeline',
		time: '50%',
		targets: scrawl.group.col4Group.entitys,
		action: function(){
			this.updateTargets({scale: 1.4});
		},
		revert: function(){
			this.updateTargets({scale: 1});
		}
	});

	scrawl.makeAction({
		name: 'toRed',
		ticker: 'timeline',
		time: '35%',
		action: function(){
			myColor.set({color: 'red'});
		},
		revert: function(){
			myColor.set({color: 'black'});
		}
	}).clone({
		name: 'toBlack',
		time: '85%',
		action: function(){
			myColor.set({color: 'black'});
		},
		revert: function(){
			myColor.set({color: 'red'});
		}
	});

	scrawl.makeBlock({
		name: 'myblock',
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center',
		width: '80%',
		height: '80%',
		lineWidth: 30,
		fillStyle: 'blue',
		strokeStyle: 'yellow',
		globalAlpha: 0,
		method: 'drawFill',
		visibility: false
	});
	scrawl.makeAction({
		name: 'showBlock',
		ticker: 'timeline',
		time: '20%',
		action: function(){
			scrawl.entity.myblock.set({visibility: true});
		},
		revert: function(){
			scrawl.entity.myblock.set({visibility: false});
		}
	}).clone({
		name: 'hideBlock',
		time: '90%',
		action: function(){
			scrawl.entity.myblock.set({visibility: false});
		},
		revert: function(){
			scrawl.entity.myblock.set({visibility: true});
		}
	});
	scrawl.makeTween({
		name: 'blockTween1',
		ticker: 'timeline',
		duration: '35%',
		time: '20%',
		targets: 'myblock',
		definitions: [
			{
				attribute: 'globalAlpha',
				start: 0,
				end: 0.6,
			},
			{
				attribute: 'roll',
				start: 0,
				end: -30,
			}
		]
	}).clone({
		name: 'blockTween2',
		time: '55.001%',
		definitions: [
			{
				attribute: 'globalAlpha',
				start: 0.6,
				end: 0,
			},
			{
				attribute: 'roll',
				start: -30,
				end: 0,
			}
		]
	});

	//event listeners
	document.getElementById('duration').value = '10000';
	var mySlider = document.getElementById('seeker');
	mySlider.value = '0';
	// need a choke to prevent the listeners firing multiple times - each element has multiple listeners on it
	// also, e.target.value may often return a number, not a string
	var currentDuration = '10000', 
		currentSeeker = '0';
	var stopE = function(e) {
		e.preventDefault();
		e.returnValue = false;
	};
	var events = function(e) {
		var temp;
		stopE(e);
		switch (e.target.id) {
			case 'run':
				myTicker.run();
				break;
			case 'reset':
				myTicker.reset();
				break;
			case 'halt':
				myTicker.halt();
				break;
			case 'resume':
				myTicker.resume();
				break;
			case 'duration':
				temp = e.target.value.toString();
				if(currentDuration !== temp){
					myTicker.set({
						duration: e.target.value
					});
					currentDuration = temp;
				}
				break;
			case 'removeitems':
				myTicker.unsubscribe(col3Tweens);
				break;
			case 'additems':
				myTicker.subscribe(col3Tweens);
				break;
			case 'seeker':
				temp = e.target.value.toString()
				if(currentSeeker !== temp){
					myTicker.seekTo(e.target.value);
					currentSeeker = temp;
				}
				break;
		}
	};
	scrawl.addNativeListener(['input', 'change', 'click'], events, '.controls');


	//animation object
	scrawl.makeAnimation({
		fn: function() {

			scrawl.render();
			mySlider.value = myTicker.tick.toString();

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
	extensions: ['phrase', 'animation', 'color', 'block'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
