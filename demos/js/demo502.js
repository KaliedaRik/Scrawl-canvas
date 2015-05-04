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
        '{"type":"Pad","classname":"padnames","name":"mycanvas","parentElement":"canvasholder","cells":["mycanvas","mycanvas_base"],"display":"mycanvas","base":"mycanvas_base","current":"mycanvas_base","width":800,"height":600,"position":""}',
        '{"type":"Cell","classname":"cellnames","name":"mycanvas","pad":"mycanvas","copy":{"x":0,"y":0},"copyWidth":800,"copyHeight":600,"pasteWidth":800,"pasteHeight":600,"context":"mycanvas","groups":["mycanvas"],"compiled":false,"shown":false,"start":{"x":0,"y":0},"handle":{"x":0,"y":0},"width":800,"height":600,"copyDelta":{"x":0,"y":0}}',
        '{"type":"Cell","classname":"cellnames","name":"mycanvas_base","pad":"mycanvas","copy":{"x":0,"y":0},"copyWidth":800,"copyHeight":600,"pasteWidth":800,"pasteHeight":600,"context":"mycanvas_base","groups":["mycanvas_base","mylabels","myentitys","mypins"],"shown":false,"compileOrder":9999,"start":{"x":0,"y":0},"handle":{"x":0,"y":0},"width":800,"height":600,"copyDelta":{"x":0,"y":0}}',
        '{"type":"Group","classname":"groupnames","name":"mycanvas","cell":"mycanvas"}',
        '{"type":"Group","classname":"groupnames","name":"mycanvas_base","cell":"mycanvas_base"}',
        '{"type":"Group","classname":"groupnames","name":"mylabels","cell":"mycanvas_base"}',
        '{"type":"Group","classname":"groupnames","name":"myentitys","cell":"mycanvas_base","order":1}',
        '{"type":"Group","classname":"groupnames","name":"mypins","cell":"mycanvas_base","order":2}',
        '{"type":"Color","classname":"designnames","name":"myRed","r":255}',
        '{"type":"Color","classname":"designnames","name":"myBlue","r":222,"g":211,"b":119,"a":0.9375554616371939,"aShift":0.002,"aBounce":true,"autoUpdate":true}',
        '{"type":"Gradient","classname":"designnames","name":"gradient","color":[{"color":"#333333","stop":0},{"color":"orange","stop":0.2},{"color":"gold","stop":0.4},{"color":"green","stop":0.6},{"color":"#cccccc","stop":0.8},{"color":"#333333","stop":1}],"lockTo":true,"shift":0.002}',
        '{"type":"Phrase","classname":"entitynames","name":"Phrase","text":"Path entitys","globalAlpha":0.3,"font":"40pt Arial, sans-serif ","group":"mylabels","start":{"x":400,"y":100},"handle":{"x":"center","y":"center"},"width":278.6833190917969,"height":60}',
        '{"type":"Phrase","classname":"entitynames","name":"Phrase~~~20252541","text":"Shape entitys","globalAlpha":0.3,"font":"40pt Arial, sans-serif ","group":"mylabels","start":{"x":400,"y":300},"handle":{"x":"center","y":"center"},"width":323.20001220703125,"height":60}',
        '{"type":"Phrase","classname":"entitynames","name":"Phrase~~~51601855","text":"Other entitys","globalAlpha":0.3,"font":"40pt Arial, sans-serif ","group":"mylabels","start":{"x":400,"y":500},"handle":{"x":"center","y":"center"},"width":302.3666687011719,"height":60}',
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
        '{"type":"Phrase","classname":"entitynames","name":"myphrase","text":"Hello Scrawl,\\nHello World","font":"16pt Arial, Helvetica ","group":"myentitys","start":{"x":700,"y":500},"handle":{"x":0,"y":0},"width":124.46666717529297,"height":48}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel","visibility":false,"method":"fillDraw","radius":3,"fillStyle":"#880000","group":"mypins","start":{"x":0,"y":0},"handle":{"x":0,"y":0},"width":6,"height":6}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~~~67864086","visibility":"true","method":"fillDraw","radius":3,"fillStyle":"#880000","group":"mypins","start":{"x":0,"y":0},"handle":{"x":0,"y":0},"pivot":"myregularshape","width":6,"height":6}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~~~53153905","visibility":"true","method":"fillDraw","radius":3,"fillStyle":"#880000","group":"mypins","start":{"x":0,"y":0},"handle":{"x":0,"y":0},"pivot":"mylineshape","width":6,"height":6}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~~~68982560","visibility":"true","method":"fillDraw","radius":3,"fillStyle":"#880000","group":"mypins","start":{"x":0,"y":0},"handle":{"x":0,"y":0},"pivot":"myquadshape","width":6,"height":6}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~~~15311921","visibility":"true","method":"fillDraw","radius":3,"fillStyle":"#880000","group":"mypins","start":{"x":0,"y":0},"handle":{"x":0,"y":0},"pivot":"myrectshape","width":6,"height":6}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~~~65153306","visibility":"true","method":"fillDraw","radius":3,"fillStyle":"#880000","group":"mypins","start":{"x":0,"y":0},"handle":{"x":0,"y":0},"pivot":"myregularoutline","width":6,"height":6}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~~~35119493","visibility":"true","method":"fillDraw","radius":3,"fillStyle":"#880000","group":"mypins","start":{"x":0,"y":0},"handle":{"x":0,"y":0},"pivot":"mylineoutline","width":6,"height":6}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~~~96528941","visibility":"true","method":"fillDraw","radius":3,"fillStyle":"#880000","group":"mypins","start":{"x":0,"y":0},"handle":{"x":0,"y":0},"pivot":"myquadoutline","width":6,"height":6}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~~~21917308","visibility":"true","method":"fillDraw","radius":3,"fillStyle":"#880000","group":"mypins","start":{"x":0,"y":0},"handle":{"x":0,"y":0},"pivot":"myrectoutline","width":6,"height":6}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~~~25288425","visibility":"true","method":"fillDraw","radius":3,"fillStyle":"#880000","group":"mypins","start":{"x":0,"y":0},"handle":{"x":0,"y":0},"pivot":"mypicture","width":6,"height":6}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~~~92822133","visibility":"true","method":"fillDraw","radius":3,"fillStyle":"#880000","group":"mypins","start":{"x":0,"y":0},"handle":{"x":0,"y":0},"pivot":"myblock","width":6,"height":6}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~~~86022997","visibility":"true","method":"fillDraw","radius":3,"fillStyle":"#880000","group":"mypins","start":{"x":0,"y":0},"handle":{"x":0,"y":0},"pivot":"mywheel","width":6,"height":6}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~~~25576845","visibility":"true","method":"fillDraw","radius":3,"fillStyle":"#880000","group":"mypins","start":{"x":0,"y":0},"handle":{"x":0,"y":0},"pivot":"myphrase","width":6,"height":6}'
      ];

	scrawl.getImagesByClass('demo502');
	scrawl.load(objects);

	//animation object
	scrawl.makeAnimation({
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

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['saveload', 'animation', 'block', 'wheel', 'phrase', 'path', 'shape', 'images', 'color'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
