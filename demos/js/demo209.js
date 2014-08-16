var mycode = function() {
	'use strict';
	//define variables
	var grid,
		line,
		yOffsetStep = 75,
		xOffsetStep = 60,
		yAxisLabels = ['100%', '75%', '50%', '25%', '0%'],
		yLabel = 'Percentage',
		xAxisLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		updateLine,
		i, iz;

	//event listener function
	updateLine = function(e) {
		//get new data
		var target = e.target.id,
			value = e.target.value,
			index = xAxisLabels.indexOf(target) + 1;
		//calculate point's new position
		scrawl.point['line_p' + index].set({
			startY: -(300 * value),
		});
		//update chart view
		scrawl.render();
		e.preventDefault();
		e.returnValue = false;
	};

	//define the grid object - all other objects will pivot from this
	grid = scrawl.newShape({
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
		scrawl.newPhrase({ //y-axis percent labels
			pivot: 'grid',
			family: 'monospace',
			handleX: 45 - ((4 - yAxisLabels[i].length) * 10),
			handleY: (-yOffsetStep * i) + 10,
			text: yAxisLabels[i],
		});
	}
	scrawl.newPhrase({ //y-axis title
		pivot: 'grid',
		size: 20,
		text: 'Percentage',
		handleX: '160%',
		handleY: '270%',
		roll: -90,
	});
	for (i = 0, iz = xAxisLabels.length; i < iz; i++) {
		scrawl.newPhrase({ //x-axis day labels
			name: xAxisLabels[i],
			pivot: 'grid',
			family: 'monospace',
			handleX: (-xOffsetStep * i) - xOffsetStep + 9,
			handleY: -310,
			text: xAxisLabels[i],
		});
		//Position the selector boxes at the same time ...
		scrawl.element[xAxisLabels[i]].set({
			pivot: 'grid',
			handleX: (-xOffsetStep * i) - xOffsetStep + 23,
			handleY: -330,
		});
		//... then set their initial values, and add event listeners to them
		scrawl.elm[xAxisLabels[i]].value = 0;
		scrawl.elm[xAxisLabels[i]].addEventListener('change', updateLine, false);
	}

	//define and position the graph line ...
	line = scrawl.makePath({
		name: 'line',
		data: 'M60,0 120,0 180,0 240,0 300,0,360,0 420,0',
		mark: 'circle',
		pivot: 'grid',
		handleX: -5,
		handleY: -300,
		lineWidth: 4,
	});
	//... and the line marks
	scrawl.newWheel({
		name: 'circle',
		radius: 10,
		fillStyle: 'red',
		visibility: false,
		method: 'fillDraw',
	});

	//display initial scene
	scrawl.render();
	scrawl.renderElements();
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['shape', 'phrase', 'path', 'wheel', 'stacks'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
