var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var myGroup;

	//define groups
	myGroup = scrawl.newGroup({
		name: 'phrases',
	});

	//define entitys
	scrawl.makeEllipse({
		name: 'track',
		startX: 300,
		startY: 200,
		radiusX: 250,
		radiusY: 150,
		strokeStyle: '#dddddd',
		precision: 100,
	});

	scrawl.newPhrase({
		textAlign: 'center',
		name: 'chinese',
		font: '36pt "KaiTi", "楷体", STKaiti, "华文楷体", "Microsoft YaHei New", "Microsoft Yahei", "微软雅黑", STXihei, "华文细黑", SimSun, 宋体, Georgia, "Times New Roman", serif',
		text: '你好世界',
		textBaseline: 'middle',
		fillStyle: 'red',
		path: 'track',
		pathPlace: 0,
		deltaPathPlace: 0.001,
		addPathRoll: true,
		group: 'phrases',
		method: 'drawFill',
		textAlongPath: true,
		shadowColor: 'black',
		shadowOffsetX: 2,
		shadowOffsetY: 2,
		shadowBlur: 3,
	}).clone({
		name: 'english',
		font: '26pt monospace',
		fixedWidth: true,
		text: 'Hello world',
		textBaseline: 'alphabetic',
		fillStyle: 'blue',
		pathPlace: 0.25,
	}).clone({
		name: 'spanish',
		font: '32pt "Times New Roman", Times, serif',
		fixedWidth: false,
		fillStyle: 'gold',
		text: 'Olá mundo',
		pathPlace: 0.75,
	}).clone({
		name: 'russian',
		font: '30pt Helvetica, Arial, san-serif',
		fillStyle: 'lightblue',
		text: 'Привет мир',
		pathPlace: 0.5,
	});

	//animation object
	scrawl.newAnimation({
		fn: function() {
			myGroup.updateStart();
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

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['path', 'factories', 'phrase', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
