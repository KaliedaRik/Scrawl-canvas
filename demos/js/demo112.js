mycode = function(){
	'use strict';

	var pad = scrawl.pad.mycanvas,
		video,
		videoLoaded = false,
		startVideo,
		createVideoEntitys;

	pad.makeCurrent();
	scrawl.getVideoById('myvideo');

	pad.addNewCell({
		name: 'wheel',
		height: 400,
		width: 400,
		startX: 230,
		startY: 230,
		handleX: 'center',
		handleY: 'center'
	});
	scrawl.newWheel({
		name: 'videoWheel0',
		startX: 'center',
		startY: 'center',
		radius: 198,
		method: 'fill',
		globalCompositeOperation: 'source-over',
		group: 'wheel',
		order: 0
	});
	scrawl.newWheel({
		name: 'videoWheel1',
		pivot: 'videoWheel0',
		radius: 200,
		strokeStyle: 'black',
		lineWidth: 3,
		method: 'draw',
		globalCompositeOperation: 'source-over',
		group: 'wheel',
		order: 2
	});

	scrawl.newRadialGradient({
		name: 'gradient',
		endX: 500,
		endY: 250,
		endRadius: 1200,
		startX: -160,
		startY: -160,
		startRadius: 0.001,
		shift: 0.0012,
		autoUpdate: true,
		color: [{
			color: 'black',
			stop: 0
        }, {
			color: 'green',
			stop: 0.05
        }, {
			color: 'black',
			stop: 0.1
        }, {
			color: 'blue',
			stop: 0.15
        }, {
			color: 'black',
			stop: 0.2
        }, {
			color: 'purple',
			stop: 0.25
        }, {
			color: 'black',
			stop: 0.3
        }, {
			color: 'red',
			stop: 0.35
        }, {
			color: 'black',
			stop: 0.4
        }, {
			color: 'pink',
			stop: 0.45
        }, {
			color: 'black',
			stop: 0.5
        }, {
			color: 'white',
			stop: 0.55
        }, {
			color: 'black',
			stop: 0.6
        }, {
			color: 'silver',
			stop: 0.65
        }, {
			color: 'black',
			stop: 0.7
        }, {
			color: 'orange',
			stop: 0.75
        }, {
			color: 'black',
			stop: 0.8
        }, {
			color: 'gold',
			stop: 0.85
        }, {
			color: 'black',
			stop: 0.9
        }, {
			color: 'yellow',
			stop: 0.95
        }, {
			color: 'black',
			stop: 1
        }, ],
	});

	scrawl.newBlock({
		name: 'videoBlock0',
		width: '100%',
		height: '100%',
		method: 'fill',
		fillStyle: 'gradient',
		globalCompositeOperation: 'destination-atop',
		order: 1
	});

	scrawl.newLeachFilter({
		name: 'filter',
		exclude: [[120, 120, 120, 255, 255, 255]]
	});

	createVideoEntitys = function(){
		scrawl.newPicture({
			name: 'videoPicture1',
			width: 600,
			height: 400,
			handleX: 'center',
			handleY: 'center',
			pivot: 'videoWheel0',
			source: 'myvideo',
			method: 'fill',
			globalCompositeOperation: 'source-in',
			group: 'wheel',
			order: 1,
		});
		scrawl.newPicture({
			name: 'videoPicture2',
			width: 400,
			height: 300,
			startX: 550,
			startY: 150,
			source: 'myvideo',
			method: 'fillDraw',
			strokeStyle: 'black',
			lineWidth: 2,
			globalCompositeOperation: 'source-over',
			order: 0,
			filters: ['filter']
		});
	}

	startVideo = function(){
		video = scrawl.video.myvideo;
		videoLoaded = true;
		if (video.api.readyState > 1) {
			video.api.loop = true;
			video.api.muted = true;
			video.api.play();
			createVideoEntitys();
		}
		else {
			video.api.addEventListener('canplay', function() {
				video.api.loop = true;
				video.api.muted = true;
				video.api.play();
				createVideoEntitys();
			}, false);
		}
	};

	//animation object
	scrawl.newAnimation({
		name: 'videoAnimation',
		fn: function() {
			if(!videoLoaded && scrawl.xt(scrawl.video.myvideo)){
				startVideo();
			}
			scrawl.cell.wheel.setDelta({
				roll: 0.6
			});
			pad.render();
		}
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['wheel', 'images', 'animation', 'block', 'filters'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
