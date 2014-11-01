var mycode = function() {
	'use strict';
	//define variables
	var canvas = scrawl.canvas.mycanvas,
		head = document.getElementsByTagName('head')[0],
		icon,
		link,
		newlink;

	//no need for the canvas generating the icon to be visible ...
	scrawl.pad.mycanvas.set({
		backgroundColor: 'lightblue',
	});

	//generate DOM link element for icon image
	link = document.createElement('link');
	link.type = 'image/png';
	link.rel = 'shortcut icon';
	head.appendChild(link);

	//define entity(s)
	icon = scrawl.newGroup({
		name: 'myentitys',
	});
	scrawl.newBlock({
		name: 'blocky',
		width: '80%',
		height: '20%',
		fillStyle: 'purple',
		handleX: 'center',
		handleY: 'center',
		startX: '50%',
		startY: '50%',
		group: 'myentitys',
	});
	scrawl.newWheel({
		name: 'wheely',
		radius: 15,
		startAngle: 30,
		endAngle: 325,
		includeCenter: true,
		fillStyle: 'red',
		method: 'fill',
		group: 'myentitys',
		pivot: 'blocky',
		handleX: -10,
		handleY: 18,
	}).clone({
		handleY: -18,
		flipReverse: true,
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {
			//animate entity
			icon.updateEntitysBy({
				roll: 2,
			});
			//render canvas
			scrawl.render();
			//regenerate link element
			newlink = document.createElement('link');
			newlink.type = 'image/png';
			newlink.rel = 'shortcut icon';
			newlink.href = canvas.toDataURL();
			head.replaceChild(newlink, link);
			//prepare for next iteration
			link = newlink;
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['block', 'wheel', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
