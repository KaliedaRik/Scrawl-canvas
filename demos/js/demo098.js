var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	document.getElementById('loop').value = 'loop';

	scrawl.makeBlock({
		name: 'myBlock',
		width: '50%',
		height: '65%',
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center',
		method: 'fillDraw',
		fillStyle: 'green',
		strokeStyle: 'gold',
		lineWidth: 8,
		visibility: false
	});

	scrawl.makeTicker({
		name: 'myTicker',
		cycles: 0,
		duration: '5s'
	});

	scrawl.makeAction({
		name: 'showAction',
		ticker: 'myTicker',
		targets: 'myBlock',
		reverseOnCycleEnd: false,
		time: '1s',
		action: function() {
			for (var i = 0, iz = this.targets.length; i < iz; i++) {
				this.targets[i].set({
					visibility: true
				});
			}
		},
		revert: function() {
			for (var i = 0, iz = this.targets.length; i < iz; i++) {
				this.targets[i].set({
					visibility: false
				});
			}
		}
	}).clone({
		name: 'rollAction',
		time: '2s',
		action: function() {
			for (var i = 0, iz = this.targets.length; i < iz; i++) {
				this.targets[i].set({
					roll: 30
				});
			}
		},
		revert: function() {
			for (var i = 0, iz = this.targets.length; i < iz; i++) {
				this.targets[i].set({
					roll: 0
				});
			}
		}
	}).clone({
		name: 'colorsAction',
		time: '3s',
		action: function() {
			for (var i = 0, iz = this.targets.length; i < iz; i++) {
				this.targets[i].set({
					fillStyle: 'lightblue'
				});
			}
		},
		revert: function() {
			for (var i = 0, iz = this.targets.length; i < iz; i++) {
				this.targets[i].set({
					fillStyle: 'green'
				});
			}
		}
	}).clone({
		name: 'scaleAction',
		time: '4s',
		action: function() {
			for (var i = 0, iz = this.targets.length; i < iz; i++) {
				this.targets[i].set({
					scale: 0.6
				});
			}
		},
		revert: function() {
			for (var i = 0, iz = this.targets.length; i < iz; i++) {
				this.targets[i].set({
					scale: 1
				});
			}
		}
	}).clone({
		name: 'heightAction',
		time: '4.66s',
		action: function() {
			for (var i = 0, iz = this.targets.length; i < iz; i++) {
				this.targets[i].set({
					height: '5%'
				});
			}
		},
		revert: function() {
			for (var i = 0, iz = this.targets.length; i < iz; i++) {
				this.targets[i].set({
					height: '65%'
				});
			}
		}
	});

	scrawl.animation.myTicker.run();

	scrawl.addNativeListener(['input', 'change'], function(e) {
		var temp;
		e.preventDefault();
		e.returnValue = false;
		switch (e.target.id) {
			case 'loop':
				temp = (e.target.value === 'loop') ? false : true;
				scrawl.animation.myTicker.updateSubscribers({
					reverseOnCycleEnd: temp
				});
				break;
		}
	}, '.controlItem');

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
	extensions: ['block', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
