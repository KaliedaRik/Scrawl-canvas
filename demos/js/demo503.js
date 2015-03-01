var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var objects = [
        '{"type":"Pad","classname":"padnames","name":"mycanvas","parentElement":"canvasholder","cells":["mycanvas","mycanvas_base"],"display":"mycanvas","base":"mycanvas_base","current":"mycanvas_base","width":750,"height":375,"position":""}',
        '{"type":"Cell","classname":"cellnames","name":"mycanvas","pad":"mycanvas","copy":{"x":0,"y":0},"copyWidth":750,"copyHeight":375,"pasteWidth":750,"pasteHeight":375,"context":"mycanvas","groups":["mycanvas"],"compiled":false,"shown":false,"start":{"x":0,"y":0},"handle":{"x":0,"y":0},"width":750,"height":375}',
        '{"type":"Cell","classname":"cellnames","name":"mycanvas_base","pad":"mycanvas","copy":{"x":0,"y":0},"copyWidth":750,"copyHeight":375,"pasteWidth":750,"pasteHeight":375,"context":"mycanvas_base","groups":["mycanvas_base"],"shown":false,"compileOrder":9999,"start":{"x":0,"y":0},"handle":{"x":0,"y":0},"width":750,"height":375}',
        '{"type":"Group","classname":"groupnames","name":"mycanvas","cell":"mycanvas"}',
        '{"type":"Group","classname":"groupnames","name":"mycanvas_base","cell":"mycanvas_base"}',
        '{"type":"Pattern","classname":"designnames","name":"leaves","source":"leaves"}',
        '{"type":"Pattern","classname":"designnames","name":"marble","source":"marble"}',
        '{"type":"Pattern","classname":"designnames","name":"water","source":"water"}',
        '{"type":"Pattern","classname":"designnames","name":"parque","source":"parque"}',
        '{"type":"Block","classname":"entitynames","name":"b1","method":"sinkInto","fillStyle":"leaves","strokeStyle":"marble","lineWidth":12,"lineJoin":"round","shadowOffsetX":8,"shadowOffsetY":8,"shadowBlur":5,"shadowColor":"Black","group":"mycanvas_base","start":{"x":35,"y":10},"handle":{"x":0,"y":0},"width":300,"height":150}',
        '{"type":"Block","classname":"entitynames","name":"b2","method":"sinkInto","fillStyle":"marble","strokeStyle":"water","lineWidth":12,"lineJoin":"round","shadowOffsetX":8,"shadowOffsetY":8,"shadowBlur":5,"shadowColor":"Black","group":"mycanvas_base","start":{"x":375,"y":10},"handle":{"x":0,"y":0},"width":300,"height":150}',
        '{"type":"Block","classname":"entitynames","name":"b3","method":"sinkInto","fillStyle":"water","strokeStyle":"parque","lineWidth":12,"lineJoin":"round","shadowOffsetX":8,"shadowOffsetY":8,"shadowBlur":5,"shadowColor":"Black","group":"mycanvas_base","start":{"x":375,"y":200},"handle":{"x":0,"y":0},"width":300,"height":150}',
        '{"type":"Block","classname":"entitynames","name":"b4","method":"sinkInto","fillStyle":"parque","strokeStyle":"leaves","lineWidth":12,"lineJoin":"round","shadowOffsetX":8,"shadowOffsetY":8,"shadowBlur":5,"shadowColor":"Black","group":"mycanvas_base","start":{"x":35,"y":200},"handle":{"x":0,"y":0},"width":300,"height":150}'
      ];

	scrawl.getImagesByClass('demo503');
	scrawl.load(objects);

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

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['saveload', 'animation', 'block', 'images'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
