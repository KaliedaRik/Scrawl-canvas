var mycode = function() {
	'use strict';
	//define variables
	var stack,
		elementGroup,
		grid,
		line,
		yOffsetStep = 75,
		xOffsetStep = 60,
		yAxisLabels = ['100%', '75%', '50%', '25%', '0%'],
		yLabel = 'Percentage',
		xAxisLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		updateLine,
		i, iz;

	//stack (and canvas) dimensions
	stack = scrawl.stack.mystack;
	elementGroup = scrawl.group.mystack;
	stack.set({
		width: 600,
		height: 400,
	});

	//event listener function
	updateLine = function(e) {
		//get new data
		var target = e.target.id,
			value = e.target.value,
			index = xAxisLabels.indexOf(target) + 1;
		//calculate point's new position
		scrawl.point['line_p' + index].set({
			startY: (1 - value) * 300,
		});
		//update chart view
		scrawl.render();
		e.preventDefault();
		e.returnValue = false;
	};

	//define the grid object - all other objects will pivot from this
	grid = scrawl.makeShape({
		name: 'grid',
		//draw axes and ticks
		data: 'L0,0 0,300 480,300 M0,0 -5,0 M0,75 -5,75 M0,150 -5,150 M0,225 -5,225 M0,300 -5,300 M60,300 60,305 M120,300 120,305 M180,300 180,305 M240,300 240,305 M300,300 300,305 M360,300 360,305 M420,300 420,305',
		lineWidth: 2,
		//position the grid absolutely on the canvas
		startX: 100,
		startY: 20,
	});

	//Labels for the grid axes
	for (i = 0, iz = yAxisLabels.length; i < iz; i++) {
		scrawl.makePhrase({ //y-axis percent labels
			pivot: 'grid',
			family: 'monospace',
			handleX: 45 - ((4 - yAxisLabels[i].length) * 10),
			handleY: (-yOffsetStep * i) + 10,
			text: yAxisLabels[i],
		});
	}
	scrawl.makePhrase({ //y-axis title
		pivot: 'grid',
		size: 20,
		text: 'Percentage',
		handleX: '160%',
		handleY: '270%',
		roll: -90,
	});

	//define and position the graph line ...
	line = scrawl.makePath({
		name: 'line',
		data: 'm65,300 60,0 60,0 60,0 60,0 60,0 60,0',
		mark: 'circle',
		pivot: 'grid',
		lineWidth: 4,
	});
	//... and the line marks
	scrawl.makeWheel({
		name: 'circle',
		radius: 10,
		fillStyle: 'red',
		visibility: false,
		method: 'fillDraw',
	});

	for (i = 0, iz = xAxisLabels.length; i < iz; i++) {
		scrawl.makePhrase({ //x-axis day labels
			name: xAxisLabels[i],
			pivot: 'line_p' + (i + 1),
			family: 'monospace',
			handleX: 'center',
			startY: 330,
			lockY: true,
			text: xAxisLabels[i],
		});
		//Position the selector boxes at the same time ...
		scrawl.element[xAxisLabels[i]].set({
			startY: 355,
			lockY: true,
			pivot: 'line_p' + (i + 1),
			handleX: 'center',
			width: 56,
			translateZ: 1,
		});
		scrawl.render();
		scrawl.elm[xAxisLabels[i]].value = 0;
	}
	scrawl.addNativeListener('change', updateLine, '.mySelector');

	//display initial scene
	scrawl.render();
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['shape', 'phrase', 'path', 'wheel', 'stacks'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
