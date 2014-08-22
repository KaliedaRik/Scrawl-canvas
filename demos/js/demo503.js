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
        '{"type":"Pad","classname":"padnames","name":"mycanvas","parentElement":"canvasholder","drawOrder":[],"cells":["mycanvas","mycanvas_base"],"display":"mycanvas","base":"mycanvas_base","current":"mycanvas_base","stack":false,"width":750,"height":375}',
        '{"type":"Cell","classname":"cellnames","name":"mycanvas","pad":"mycanvas","actualWidth":750,"actualHeight":375,"context":"mycanvas","groups":["mycanvas","mycanvas_field","mycanvas_fence"],"usePadDimensions":true}',
        '{"type":"Cell","classname":"cellnames","name":"mycanvas_base","pad":"mycanvas","actualWidth":750,"actualHeight":375,"context":"mycanvas_base","groups":["mycanvas_base","mycanvas_base_field","mycanvas_base_fence"],"usePadDimensions":true}',
        '{"type":"Group","classname":"groupnames","name":"mycanvas","cell":"mycanvas"}',
        '{"type":"Group","classname":"groupnames","name":"mycanvas_field","cell":"mycanvas","visibility":false}',
        '{"type":"Group","classname":"groupnames","name":"mycanvas_fence","cell":"mycanvas","visibility":false}',
        '{"type":"Group","classname":"groupnames","name":"mycanvas_base","cell":"mycanvas_base"}',
        '{"type":"Group","classname":"groupnames","name":"mycanvas_base_field","cell":"mycanvas_base","visibility":false}',
        '{"type":"Group","classname":"groupnames","name":"mycanvas_base_fence","cell":"mycanvas_base","visibility":false}',
        '{"type":"Pattern","classname":"designnames","name":"leaves","cell":"mycanvas_base","image":"leaves","source":"img/leaves.png"}',
        '{"type":"Pattern","classname":"designnames","name":"marble","cell":"mycanvas_base","image":"marble","source":"img/marble.png"}',
        '{"type":"Pattern","classname":"designnames","name":"water","cell":"mycanvas_base","image":"water","source":"img/water.png"}',
        '{"type":"Pattern","classname":"designnames","name":"parque","cell":"mycanvas_base","image":"parque","source":"img/parque.png"}',
        '{"type":"Block","classname":"spritenames","name":"b1","width":300,"height":150,"method":"sinkInto","fillStyle":"leaves","strokeStyle":"marble","lineWidth":12,"lineJoin":"round","shadowOffsetX":8,"shadowOffsetY":8,"shadowBlur":5,"shadowColor":"Black","group":"mycanvas_base","start":{"x":35,"y":10,"z":0}}',
        '{"type":"Block","classname":"spritenames","name":"b2","width":300,"height":150,"method":"sinkInto","fillStyle":"marble","strokeStyle":"water","lineWidth":12,"lineJoin":"round","shadowOffsetX":8,"shadowOffsetY":8,"shadowBlur":5,"shadowColor":"Black","group":"mycanvas_base","start":{"x":375,"y":10,"z":0}}',
        '{"type":"Block","classname":"spritenames","name":"b3","width":300,"height":150,"method":"sinkInto","fillStyle":"water","strokeStyle":"parque","lineWidth":12,"lineJoin":"round","shadowOffsetX":8,"shadowOffsetY":8,"shadowBlur":5,"shadowColor":"Black","group":"mycanvas_base","start":{"x":375,"y":200,"z":0}}',
        '{"type":"Block","classname":"spritenames","name":"b4","width":300,"height":150,"method":"sinkInto","fillStyle":"parque","strokeStyle":"leaves","lineWidth":12,"lineJoin":"round","shadowOffsetX":8,"shadowOffsetY":8,"shadowBlur":5,"shadowColor":"Black","group":"mycanvas_base","start":{"x":35,"y":200,"z":0}}'
      ];

	scrawl.load(objects);

	//animation object
	scrawl.newAnimation({
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
