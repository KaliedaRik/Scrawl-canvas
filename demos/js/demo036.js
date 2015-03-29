var mycode = function() {
	'use strict';

	//define variables
	var myPad = scrawl.pad.mycanvas;

	//define entitys
	scrawl.makePath({
		name: 'arrow',
		startX: 300,
		startY: 200,
		lineWidth: 6,
		strokeStyle: '#ff6666',
		method: 'draw',
		lineJoin: 'round',
		lineCap: 'round',
		line: true,
		shadowOffsetX: 2,
		shadowOffsetY: 2,
		shadowBlur: 2,
		shadowColor: 'black',
		data: 'm0,0 -50-40 m0,80 50-40 0,0'
	});
	scrawl.point.arrow_p5.setToFixed({
		x: 200,
		y: 200,
	});

	for (var i = 1; i < 6; i++) {
		scrawl.makePhrase({
			name: 'aPoint' + i,
			text: ' p' + i + ' ',
			pivot: 'arrow_p' + i,
			font: '18pt bold Arial, sans-serif',
			handleX: 'center',
			handleY: 'center'
		});
	}
	scrawl.entity.aPoint1.set({
		handleX: 'right'
	});
	scrawl.entity.aPoint4.set({
		handleX: 'left'
	});

	//display initial canvas
	scrawl.render();
	scrawl.entity.arrow.pivot = 'mouse';

	//do animation via an event listener rather than an animation object
	scrawl.addListener(['down', 'move'], function(e) {
		var here;
		if (e) {
			e.stopPropagation();
			e.preventDefault();
			here = myPad.getMouse();
			if (here.active) {
				scrawl.entity.arrow.set({
					roll: Math.atan2(here.y - 200, here.x - 200) / scrawl.radian,
					mouseIndex: myPad.getMouseIdFromEvent(e)
				});
				scrawl.render();
			}
		}
	}, scrawl.canvas.mycanvas);

};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['path', 'phrase'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
