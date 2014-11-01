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
        '{"type":"Pad","classname":"padnames","name":"mycanvas","parentElement":"canvasholder","drawOrder":[],"cells":["mycanvas","mycanvas_base"],"display":"mycanvas","base":"mycanvas_base","current":"mycanvas_base","stack":false,"width":800,"height":600}',
        '{"type":"Cell","classname":"cellnames","name":"mycanvas","pad":"mycanvas","actualWidth":800,"actualHeight":600,"context":"mycanvas","groups":["mycanvas","mycanvas_field","mycanvas_fence"],"usePadDimensions":true}',
        '{"type":"Cell","classname":"cellnames","name":"mycanvas_base","pad":"mycanvas","actualWidth":800,"actualHeight":600,"context":"mycanvas_base","groups":["mycanvas_base","mycanvas_base_field","mycanvas_base_fence","mylabels","myentitys","mypins"],"usePadDimensions":true}',
        '{"type":"Group","classname":"groupnames","name":"mycanvas","cell":"mycanvas"}',
        '{"type":"Group","classname":"groupnames","name":"mycanvas_field","entitys":[],"cell":"mycanvas","visibility":false}',
        '{"type":"Group","classname":"groupnames","name":"mycanvas_fence","entitys":[],"cell":"mycanvas","visibility":false}',
        '{"type":"Group","classname":"groupnames","name":"mycanvas_base","cell":"mycanvas_base"}',
        '{"type":"Group","classname":"groupnames","name":"mycanvas_base_field","entitys":[],"cell":"mycanvas_base","visibility":false}',
        '{"type":"Group","classname":"groupnames","name":"mycanvas_base_fence","entitys":[],"cell":"mycanvas_base","visibility":false}',
        '{"type":"Group","classname":"groupnames","name":"mylabels","cell":"mycanvas_base"}',
        '{"type":"Group","classname":"groupnames","name":"myentitys","cell":"mycanvas_base","order":1}',
        '{"type":"Group","classname":"groupnames","name":"mypins","cell":"mycanvas_base","order":2}',
        '{"type":"Color","classname":"designnames","name":"myRed","r":255}',
        '{"type":"Color","classname":"designnames","name":"myBlue","r":161,"g":50,"b":180,"a":0.4145623867371143,"aShift":0.002,"aBounce":true,"autoUpdate":true}',
        '{"type":"Gradient","classname":"designnames","name":"gradient","color":[{"color":"#333333","stop":0},{"color":"orange","stop":0.2},{"color":"gold","stop":0.4},{"color":"green","stop":0.6},{"color":"#cccccc","stop":0.8},{"color":"#333333","stop":1}],"setToEntity":true,"shift":0.002}',
        '{"type":"Phrase","classname":"entitynames","name":"Phrase","text":"Path entitys","width":326.1499938964844,"height":60,"globalAlpha":0.3,"font":"40pt Arial, sans-serif ","group":"mylabels","start":{"x":400,"y":100,"z":0},"handle":{"x":"center","y":"center","z":0}}',
        '{"type":"Phrase","classname":"entitynames","name":"Phrase~£!69822956","text":"Shape entitys","width":340.9166564941406,"height":60,"globalAlpha":0.3,"font":"40pt Arial, sans-serif ","group":"mylabels","start":{"x":400,"y":300,"z":0},"handle":{"x":"center","y":"center","z":0}}',
        '{"type":"Phrase","classname":"entitynames","name":"Phrase~£!50205155","text":"Other entitys","width":305.3166809082031,"height":60,"globalAlpha":0.3,"font":"40pt Arial, sans-serif ","group":"mylabels","start":{"x":400,"y":500,"z":0},"handle":{"x":"center","y":"center","z":0}}',
        '{"type":"Path","classname":"entitynames","name":"myregularshape","isLine":false,"radius":50,"width":90.4508,"height":95.1057,"method":"fillDraw","data":"m50.0000,0.0000 -90.4508,29.3893 55.9017,-76.9421 0.0000,95.1057 -55.9017,-76.9421 90.4508,29.3893 z","fillStyle":"myRed","winding":"evenodd","group":"myentitys","start":{"x":100,"y":100,"z":0}}',
        '{"type":"Path","classname":"entitynames","name":"mylineshape","closed":false,"width":90,"data":"m0,0 90,0","strokeStyle":"blue","lineWidth":4,"lineCap":"round","group":"myentitys","start":{"x":300,"y":100,"z":0},"handle":{"x":"left","y":"top","z":0}}',
        '{"type":"Path","classname":"entitynames","name":"myquadshape","closed":false,"width":90,"data":"m0,0q45,-90 90,0","strokeStyle":"blue","lineWidth":4,"lineCap":"round","group":"myentitys","start":{"x":500,"y":100,"z":0},"handle":{"x":"left","y":"top","z":0}}',
        '{"type":"Path","classname":"entitynames","name":"myrectshape","isLine":false,"radius":8,"width":90,"height":40,"method":"fillDraw","data":"m37,20l-74,0c-4.399999999999977,0 -8,-3.5999999999999943 -8,-8l0,-24c0,-4.400000000000006 3.6000000000000227,-8 8,-8l74,0c4.399999999999977,0 8,3.5999999999999943 8,8l0,24c0,4.400000000000006 -3.6000000000000227,8 -8,8z","fillStyle":"lightblue","lineWidth":2,"lineJoin":"round","group":"myentitys","start":{"x":700,"y":100,"z":0}}',
        '{"type":"Shape","classname":"entitynames","name":"myregularoutline","data":"m50.0000,0.0000 -90.4508,29.3893 55.9017,-76.9421 0.0000,95.1057 -55.9017,-76.9421 90.4508,29.3893 z","isLine":false,"method":"fillDraw","radius":50,"width":90.45080000000002,"height":95.10570000000001,"fillStyle":"myRed","winding":"evenodd","group":"myentitys","start":{"x":100,"y":300,"z":0}}',
        '{"type":"Shape","classname":"entitynames","name":"mylineoutline","data":"m0,0 90,0","width":90,"strokeStyle":"blue","lineWidth":4,"lineCap":"round","group":"myentitys","start":{"x":300,"y":300,"z":0},"handle":{"x":"left","y":"top","z":0}}',
        '{"type":"Shape","classname":"entitynames","name":"myquadoutline","data":"m0,0q45,-90 90,0","width":90,"strokeStyle":"blue","lineWidth":4,"lineCap":"round","group":"myentitys","start":{"x":500,"y":300,"z":0},"handle":{"x":"left","y":"top","z":0}}',
        '{"type":"Shape","classname":"entitynames","name":"myrectoutline","data":"m37,20l-74,0c-4.399999999999977,0 -8,-3.6000000000000227 -8,-8l0,-24c0,-4.399999999999977 3.6000000000000227,-8 8,-8l74,0c4.399999999999977,0 8,3.6000000000000227 8,8l0,24c0,4.399999999999977 -3.6000000000000227,8 -8,8z","isLine":false,"method":"fillDraw","radius":8,"width":90,"height":40,"fillStyle":"lightblue","lineWidth":2,"lineJoin":"round","group":"myentitys","start":{"x":700,"y":300,"z":0}}',
        '{"type":"Picture","classname":"entitynames","name":"mypicture","source":"angelfish","imageType":"img","width":100,"height":67,"copyWidth":540,"copyHeight":360,"method":"fillDraw","strokeStyle":"Gold","lineWidth":3,"shadowBlur":4,"shadowColor":"Black","group":"myentitys","start":{"x":100,"y":500,"z":0},"url":"img/carousel/angelfish.png"}',
        '{"type":"Block","classname":"entitynames","name":"myblock","width":100,"height":100,"method":"fillDraw","fillStyle":"myBlue","strokeStyle":"Orange","lineWidth":6,"lineDash":[20,5],"group":"myentitys","start":{"x":300,"y":500,"z":0}}',
        '{"type":"Wheel","classname":"entitynames","name":"mywheel","radius":40,"width":80,"height":80,"method":"fillDraw","fillStyle":"gradient","strokeStyle":"#800","lineWidth":6,"lineDash":[20,5,5,5],"group":"myentitys","start":{"x":500,"y":500,"z":0}}',
        '{"type":"Phrase","classname":"entitynames","name":"myphrase","text":"Hello Scrawl,\\nHello World","width":124.46666717529297,"height":48,"font":"16pt Arial, Helvetica ","group":"myentitys","start":{"x":700,"y":500,"z":0}}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel","radius":3,"width":6,"height":6,"visibility":false,"method":"fillDraw","fillStyle":"#880000","group":"mypins"}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~£!33073842","radius":3,"width":6,"height":6,"visibility":"true","method":"fillDraw","fillStyle":"#880000","group":"mypins","pivot":"myregularshape"}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~£!76131133","radius":3,"width":6,"height":6,"visibility":"true","method":"fillDraw","fillStyle":"#880000","group":"mypins","pivot":"mylineshape"}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~£!30907907","radius":3,"width":6,"height":6,"visibility":"true","method":"fillDraw","fillStyle":"#880000","group":"mypins","pivot":"myquadshape"}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~£!56060122","radius":3,"width":6,"height":6,"visibility":"true","method":"fillDraw","fillStyle":"#880000","group":"mypins","pivot":"myrectshape"}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~£!99808294","radius":3,"width":6,"height":6,"visibility":"true","method":"fillDraw","fillStyle":"#880000","group":"mypins","pivot":"myregularoutline"}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~£!91274369","radius":3,"width":6,"height":6,"visibility":"true","method":"fillDraw","fillStyle":"#880000","group":"mypins","pivot":"mylineoutline"}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~£!15932221","radius":3,"width":6,"height":6,"visibility":"true","method":"fillDraw","fillStyle":"#880000","group":"mypins","pivot":"myquadoutline"}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~£!2687745","radius":3,"width":6,"height":6,"visibility":"true","method":"fillDraw","fillStyle":"#880000","group":"mypins","pivot":"myrectoutline"}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~£!98411268","radius":3,"width":6,"height":6,"visibility":"true","method":"fillDraw","fillStyle":"#880000","group":"mypins","pivot":"mypicture"}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~£!44829113","radius":3,"width":6,"height":6,"visibility":"true","method":"fillDraw","fillStyle":"#880000","group":"mypins","pivot":"myblock"}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~£!65922016","radius":3,"width":6,"height":6,"visibility":"true","method":"fillDraw","fillStyle":"#880000","group":"mypins","pivot":"mywheel"}',
        '{"type":"Wheel","classname":"entitynames","name":"Wheel~£!68780891","radius":3,"width":6,"height":6,"visibility":"true","method":"fillDraw","fillStyle":"#880000","group":"mypins","pivot":"myphrase"}'
      ];

	scrawl.load(objects);

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
