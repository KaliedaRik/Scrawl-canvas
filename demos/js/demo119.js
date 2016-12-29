var mycode = function() {
	'use strict';

	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

  var pad = scrawl.pad.myCanvas,
    tweenCounter = 0,
    buildStar, addStars,
    template;

  scrawl.cell[pad.base].set({
    backgroundColor: 'black'
  })

  template = scrawl.makeWheel({
    name: 'templateStar',
    radius: 4,
    fillStyle: 'lightGrey',
    scaleOutline: false,
    visibility: false,
    startX: 300,
    startY: 300,
    scale: 0.1,
  });

  buildStar = function(requiredTweens){
    var rand1, rand2, rand3, fast,
      x, y, scale, duration, star;

    for(var i = 0; i < requiredTweens; i++){
      rand1 = Math.random();
      rand2 = Math.round(Math.random() * 600);
      rand3 = Math.random();

      if(rand1 < 0.25){
        x = 0;
        y = rand2;
      }
      else if(rand1 < 0.5){
        x = 600;
        y = rand2;
      }
      else if(rand1 < 0.75){
        x = rand2;
        y = 0;
      }
      else{
        x = rand2;
        y = 600;
      }
      duration = Math.round((rand3 * 3000) + 1000);
      scale = 0.5 + ((1 - rand3) * 1.4);

      fast = (tweenCounter) ? true : false;

      star = template.clone({
        name: 'b' + tweenCounter,
        fastStamp: fast,
        visibility: true,
        createNewContext: false
      });

      scrawl.makeTween({
        name: star.name + '_tween',
        targets: star,
        duration: duration,
        cycles: 0,
        definitions: [{
          attribute: 'startX',
          start: 300,
          end: x
        }, {
          attribute: 'startY',
          start: 300,
          end: y
        }, {
          attribute: 'scale',
          start: 0.1,
          end: scale
        }]
      }).run();

      tweenCounter++;
    }
  }

  buildStar(1000);

  addStars = function(){
    buildStar(100);
  }
  scrawl.addListener('up', addStars, scrawl.canvas.myCanvas);

	scrawl.makeAnimation({
		fn: function() {

			scrawl.render();

			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Stars: ' + tweenCounter + '; milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});
};

scrawl.loadExtensions({
	path: '../source/',
	minified: false,
	extensions: ['animation', 'wheel', 'images'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
