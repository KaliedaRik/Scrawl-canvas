var mycode = function() {
	'use strict';
	var sides = ['top', 'bottom', 'left', 'right', 'front', 'back'],
		pics = ['robbery', 'theft', 'violence', 'fraud', 'burglary', 'damage'],
		pads = {
			top: scrawl.pad.top,
			bottom: scrawl.pad.bottom,
			left: scrawl.pad.left,
			right: scrawl.pad.right,
			front: scrawl.pad.front,
			back: scrawl.pad.back,
		},
		cells = {
			top: scrawl.cell[pads.top.base],
			bottom: scrawl.cell[pads.bottom.base],
			left: scrawl.cell[pads.left.base],
			right: scrawl.cell[pads.right.base],
			front: scrawl.cell[pads.front.base],
			back: scrawl.cell[pads.back.base],
		},
		mystack = scrawl.stack.mystack,
		elstack = scrawl.stk.mystack,
		group = scrawl.group.mystack,
		cube = scrawl.makeQuaternion(),
		deltaCube = scrawl.makeQuaternion({
			pitch: 1,
			yaw: -0.8,
			roll: 0.3,
		}),
		header = scrawl.element.stackHeader,
		subheader = scrawl.element.stackSubHeader,
		words,
		widthReduction = 35,
		heightReduction = 150,
		myWidth = window.innerWidth - widthReduction,
		myHeight = window.innerHeight - heightReduction,
		setSize,
		resize,
		here,
		i, iz;
	scrawl.getImagesByClass('demo208');
	myWidth = (myWidth > 100) ? myWidth : 100;
	myHeight = (myHeight > 100) ? myHeight : 100;
	mystack.set({
		width: myWidth,
		height: myHeight,
		perspectiveZ: 800,
		overflow: 'hidden',
	});
	scrawl.makeElementGroup({
		name: 'instructions',
		stack: 'mystack'
	});
	header.set({
		startX: '50%',
		startY: '20%',
		handleX: 'center',
		handleY: 'center',
		width: '50%',
		pointerEvents: 'none',
		group: 'instructions',
		border: '1px solid black',
		color: 'blue',
		textAlign: 'center',
		fontSize: '200%',
	});
	subheader.set({
		startX: '50%',
		startY: '75%',
		handleX: 'center',
		handleY: 'center',
		width: '40%',
		pointerEvents: 'none',
		group: 'instructions',
		border: '1px solid red',
		color: 'red',
		textAlign: 'center',
		fontSize: '120%',
	});
	group.setElementsTo({
		startX: 'center',
		startY: 'center',
		handleX: 'center',
		handleY: 'center',
		mouse: false,
		pointerEvents: 'none',
	});
	pads.top.set({
		deltaPitch: 90,
		deltaTranslateY: -100
	});
	pads.bottom.set({
		deltaPitch: -90,
		deltaTranslateY: 100
	});
	pads.left.set({
		deltaYaw: -90,
		deltaTranslateX: -100
	});
	pads.right.set({
		deltaYaw: 90,
		deltaTranslateX: 100
	});
	pads.back.set({
		deltaYaw: -180,
		deltaTranslateZ: -100
	});
	pads.front.set({
		deltaYaw: 0,
		deltaTranslateZ: 100
	});
	words = scrawl.makeGroup({
		name: 'words',
		visibility: false,
		entitys: sides,
	});
	for (i = 0, iz = sides.length; i < iz; i++) {
		scrawl.makePicture({
			name: pics[i],
			pivot: sides[i],
			handleX: 'center',
			handleY: 'center',
			width: 200,
			height: 200,
			source: pics[i],
			order: 0,
			group: pads[sides[i]].base,
		});
		scrawl.makePhrase({
			name: sides[i],
			startX: 100,
			startY: 100,
			handleX: 'center',
			handleY: 'center',
			font: '36pt Arial, sans-serif',
			text: sides[i],
			order: 1,
			group: pads[sides[i]].base,
		});
		cells[sides[i]].set({
			width: '100%',
			height: '100%',
		});
	}

	setSize = function() {
		var widthRatio = (window.innerWidth - widthReduction) / myWidth,
			heightRatio = (window.innerHeight - heightReduction) / myHeight,
			ratio = (widthRatio < heightRatio) ? widthRatio : heightRatio;
		document.body.style.fontSize = Math.ceil(ratio * 100) + '%';
		mystack.set({
			scale: ratio,
		});
		group.setElementsTo({
			scale: ratio,
		});
		scrawl.domInit();
	};
	resize = function(e) {
		setSize();
	};
	window.addEventListener('resize', resize, false);

	setSize();

	//stop touchmove dragging the page up/down
	scrawl.addListener(['move', 'down'], function(e) {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		var here = mystack.getMouse();
		if (here.active) {
			group.setElementsTo({
				pivot: 'mouse',
				mouseIndex: here.id
			});
		}
		else {
			group.setElementsTo({
				pivot: '',
				mouseIndex: '',
				startX: 'center',
				startY: 'center'
			});
		}
	}, elstack);
	scrawl.addListener('leave', function(e) {
		group.setElementsTo({
			pivot: '',
			mouseIndex: '',
			startX: 'center',
			startY: 'center'
		});
	}, elstack);

	scrawl.makeAnimation({
		fn: function() {
			cube.quaternionMultiply(deltaCube);
			group.update({
				action: 'pads',
				quaternion: cube,
			});
			words.updateEntitysBy({
				roll: 0.5,
			});

			scrawl.render();
		}
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['phrase', 'animation', 'stacks', 'images'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
