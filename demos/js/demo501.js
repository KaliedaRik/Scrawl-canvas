var mycode = function() {
	'use strict';
	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

	//define variables
	var entitys = [
        '{"type":"Group","classname":"groupnames","name":"myentitys","cell":"mycanvas_base","order":1}',
        '{"type":"Color","classname":"designnames","name":"myRed","r":255}',
        '{"type":"Color","classname":"designnames","name":"myBlue","r":11,"g":174,"b":73,"a":0.40710728640709926,"aShift":0.002,"aBounce":true,"autoUpdate":true}',
        '{"type":"Gradient","classname":"designnames","name":"gradient","color":[{"color":"#333333","stop":0},{"color":"orange","stop":0.2},{"color":"gold","stop":0.4},{"color":"green","stop":0.6},{"color":"#cccccc","stop":0.8},{"color":"#333333","stop":1}],"lockTo":true,"shift":0.002}',
        '{"type":"Path","classname":"entitynames","name":"myregularshape","isLine":false,"method":"fillDraw","data":"m50.0000,0.0000l-90.4508,29.3893 55.9017,-76.9421 0.0000,95.1057 -55.9017,-76.9421 90.4508,29.3893 z","radius":50,"fillStyle":"myRed","winding":"evenodd","group":"myentitys","start":{"x":100,"y":100},"handle":{"x":0,"y":0},"width":90.4508,"height":95.1057}',
        '{"type":"Path","classname":"entitynames","name":"mylineshape","closed":false,"data":"m0,0 90,0","strokeStyle":"blue","lineWidth":4,"lineCap":"round","group":"myentitys","start":{"x":300,"y":100},"handle":{"x":"left","y":"top"},"width":90}',
        '{"type":"Path","classname":"entitynames","name":"myquadshape","closed":false,"data":"m0,0q45,-90 90,0","strokeStyle":"blue","lineWidth":4,"lineCap":"round","group":"myentitys","start":{"x":500,"y":100},"handle":{"x":"left","y":"top"},"width":90}',
        '{"type":"Path","classname":"entitynames","name":"myrectshape","isLine":false,"method":"fillDraw","data":"m37,20l-74,0c-4.4,0 -8,-3.6 -8,-8l0,-24c0,-4.4 3.6,-8 8,-8l74,0c4.4,0 8,3.6 8,8l0,24c0,4.4 -3.6,8 -8,8z","radius":8,"fillStyle":"lightblue","lineWidth":2,"lineJoin":"round","group":"myentitys","start":{"x":700,"y":100},"handle":{"x":0,"y":0},"width":90,"height":40}',
        '{"type":"Shape","classname":"entitynames","name":"myregularoutline","isLine":false,"method":"fillDraw","data":"m50.0000,0.0000l-90.4508,29.3893 55.9017,-76.9421 0.0000,95.1057 -55.9017,-76.9421 90.4508,29.3893 z","radius":50,"fillStyle":"myRed","winding":"evenodd","group":"myentitys","start":{"x":100,"y":300},"handle":{"x":0,"y":0},"width":90.45,"height":95.1}',
        '{"type":"Shape","classname":"entitynames","name":"mylineoutline","data":"m0,0 90,0","strokeStyle":"blue","lineWidth":4,"lineCap":"round","group":"myentitys","start":{"x":300,"y":300},"handle":{"x":"left","y":"top"},"width":90}',
        '{"type":"Shape","classname":"entitynames","name":"myquadoutline","data":"m0,0q45,-90 90,0","strokeStyle":"blue","lineWidth":4,"lineCap":"round","group":"myentitys","start":{"x":500,"y":300},"handle":{"x":"left","y":"top"},"width":90}',
        '{"type":"Shape","classname":"entitynames","name":"myrectoutline","isLine":false,"method":"fillDraw","data":"m37,20l-74,0c-4.4,0 -8,-3.6 -8,-8l0,-24c0,-4.4 3.6,-8 8,-8l74,0c4.4,0 8,3.6 8,8l0,24c0,4.4 -3.6,8 -8,8z","radius":8,"fillStyle":"lightblue","lineWidth":2,"lineJoin":"round","group":"myentitys","start":{"x":700,"y":300},"handle":{"x":0,"y":0},"width":90,"height":40}',
        '{"type":"Picture","classname":"entitynames","name":"mypicture","source":"angelfish","imageData":false,"imageType":"img","copy":{"x":0,"y":0},"copyWidth":540,"copyHeight":360,"method":"fillDraw","strokeStyle":"Gold","lineWidth":3,"shadowBlur":4,"shadowColor":"Black","group":"myentitys","start":{"x":100,"y":500},"handle":{"x":0,"y":0},"width":100,"height":67}',
        '{"type":"Block","classname":"entitynames","name":"myblock","method":"fillDraw","fillStyle":"myBlue","strokeStyle":"Orange","lineWidth":6,"lineDash":[20,5],"group":"myentitys","start":{"x":300,"y":500},"handle":{"x":0,"y":0},"width":100,"height":100}',
        '{"type":"Wheel","classname":"entitynames","name":"mywheel","method":"fillDraw","radius":40,"fillStyle":"gradient","strokeStyle":"#800","lineWidth":6,"lineDash":[20,5,5,5],"group":"myentitys","start":{"x":500,"y":500},"handle":{"x":0,"y":0},"width":80,"height":80}',
        '{"type":"Phrase","classname":"entitynames","name":"myphrase","text":"Hello Scrawl,\\nHello World","font":"16pt Arial, Helvetica ","group":"myentitys","start":{"x":700,"y":500},"handle":{"x":0,"y":0},"width":124.46666717529297,"height":48}'
      ];

	scrawl.getImagesByClass('demo501');
	scrawl.load(entitys);

	//animation object
	scrawl.newAnimation({
		fn: function() {
			scrawl.group.myentitys.updateEntitysBy({
				roll: 1,
			});
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
	modules: ['saveload', 'animation', 'block', 'wheel', 'phrase', 'path', 'shape', 'images', 'color'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
