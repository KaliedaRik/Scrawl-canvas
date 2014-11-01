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
		labels,
		instructions = scrawl.element.instructions,
		widthReduction = 35,
		heightReduction = 120,
		myWidth = window.innerWidth - widthReduction,
		myHeight = window.innerHeight - heightReduction,
		setSize,
		resize,
		cube = scrawl.makeQuaternion(),
		deltaCube = scrawl.makeQuaternion({
			pitch: 1,
			yaw: -0.8,
			roll: 0.3,
		}),
		here,
		words,
		i, iz;
	scrawl.getImagesByClass('demo208');
	//initialize DOM 3d effects - stack
	myWidth = (myWidth > 100) ? myWidth : 100;
	myHeight = (myHeight > 100) ? myHeight : 100;
	mystack.set({
		width: myWidth,
		height: myHeight,
		perspectiveZ: 800,
		overflow: 'hidden',
	});
	instructions.set({
		startX: '50%',
		startY: '20%',
		handleX: 'center',
		handleY: 'center',
		width: instructions.width * 1.5,
		pointerEvents: 'none',
	});
	for (i = 0, iz = sides.length; i < iz; i++) {
		pads[sides[i]].set({
			startX: myWidth / 2,
			startY: myHeight / 2,
			handleX: 'center',
			handleY: 'center',
			mouse: false,
			pointerEvents: 'none',
		});
	}
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
	words = scrawl.newGroup({
		name: 'words',
		visibility: false,
	});
	for (i = 0, iz = sides.length; i < iz; i++) {
		scrawl.newPicture({
			name: pics[i],
			pivot: sides[i] + 'Text',
			handleX: 'center',
			handleY: 'center',
			width: 200,
			height: 200,
			source: pics[i],
			order: 0,
			group: pads[sides[i]].base,
		});
		scrawl.newPhrase({
			name: sides[i] + 'Text',
			startX: 100,
			startY: 100,
			handleX: 'center',
			handleY: 'center',
			font: '36pt Arial, sans-serif',
			text: sides[i],
			order: 1,
			group: pads[sides[i]].base,
		});
		words.entitys.push(sides[i] + 'Text');
	}
	setSize = function() {
		var widthRatio = (window.innerWidth - widthReduction) / myWidth,
			heightRatio = (window.innerHeight - heightReduction) / myHeight,
			ratio = (widthRatio < heightRatio) ? widthRatio : heightRatio;
		document.body.style.fontSize = Math.ceil(ratio * 100) + '%';
		mystack.scaleStack(ratio);
	};
	resize = function(e) {
		setSize();
	};
	window.addEventListener('resize', resize);
	scrawl.newAnimation({
		fn: function() {
			var j, jz;
			//rotate the cube
			cube.quaternionMultiply(deltaCube);
			scrawl.update3d({
				action: 'pads',
				quaternion: cube,
				distance: 100,
			});
			scrawl.renderElements();
			//animate the canvas entitys
			words.updateEntitysBy({
				roll: 0.5,
			});
			scrawl.render();
			//cube and mouse stuff
			here = mystack.getMouse();
			for (j = 0, jz = sides.length; j < jz; j++) {
				if (here.active) {
					pads[sides[j]].set({
						pivot: 'mouse',
					});
				}
				else {
					pads[sides[j]].set({
						pivot: false,
						startX: myWidth / 2,
						startY: myHeight / 2,
						handleX: 'center',
						handleY: 'center',
					});
				}
			}
			scrawl.render();
			scrawl.renderElements();
		},
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
