var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define sprite ...
	scrawl.newPhrase({
		startX: 200,
		startY: 100,
		handleX: 'center',
		handleY: 'center',
		size: 80,
		metrics: 'px',
		family: '"KaiTi", "楷体", STKaiti, "华文楷体", "Microsoft YaHei New", "Microsoft Yahei", "微软雅黑", STXihei, "华文细黑", SimSun, 宋体, Georgia, "Times New Roman", serif',
		text: '你好',
	});

	//... and display it
	scrawl.render();

	testNow = Date.now();
	testTime = testNow - testTicker;
	testMessage.innerHTML = 'Render time: ' + Math.ceil(testTime) + 'ms';
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: 'phrase',
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
