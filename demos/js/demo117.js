var mycode = function() {
	'use strict';

	//hide-start
	var testTicker = Date.now(),
	testTime = testTicker,
	testNow,
	testMessage = document.getElementById('testmessage');
	//hide-end

	scrawl.getImageById('flower');

  scrawl.makeGroup({
    name: 'allDots',
    cell: scrawl.pad.myCanvas.base,
    order: 2,
  });
  for(var y = 0; y < 5; y++){
    for(var x = 0; x < 5; x++){
      /* We'll create our dots large, transparent and invisible (note that 'transparent' and 'invisible' are not the same thing) ... */
      scrawl.makeWheel({
        name: 'dot_' + y + x,
        radius: '10%',
        scale: 0,
        startX: ((x * 20) + 10) + '%',
        startY: ((y * 20) + 10) + '%',
        visibility: false,
        globalAlpha: 0,
        globalCompositeOperation: 'source-over',
        group: 'allDots'
      });
    }
  }
  var allTheDots = [].concat(scrawl.group.allDots.entitys);
  var middleDot = ['dot_22'];
  var innerDots = ['dot_12', 'dot_21', 'dot_23', 'dot_32'];
  var outerDots = ['dot_02', 'dot_11', 'dot_13', 'dot_20', 'dot_24', 'dot_31', 'dot_33', 'dot_42'];
  var edgeDots = ['dot_01', 'dot_03', 'dot_10', 'dot_14', 'dot_30', 'dot_34', 'dot_41', 'dot_43'];
  var cornerDots = ['dot_00', 'dot_04', 'dot_40', 'dot_44'];
  
  scrawl.makeGroup({
    name: 'myFlower',
    cell: scrawl.pad.myCanvas.base,
    order: 1,
  });
  scrawl.makePicture({
    name: 'iris',
    source: 'flower',
    startX: 0,
    startY: 0,
    handleX: 'center',
    handleY: 'center',
    globalCompositeOperation: 'source-over',
    scale: 0,
    group: 'myFlower'
  });

  var dotRingShowTemplate = scrawl.makeTween({
    start: {
      scale: 0,
      globalAlpha: 0
    },
    end: {
      scale: 1,
      globalAlpha: 1
    },
    duration: 600,
  });
  var dotRingHideTemplate = scrawl.makeTween({
    start: {
      scale: 1,
      globalAlpha: 1
    },
    end: {
      scale: 2,
      globalAlpha: 0
    },
    duration: 600,
  });
  var dotDissolveTemplate = scrawl.makeTween({
    start: {
      scale: 2
    },
    end: {
      scale: 0
    },
    engines: {
      scale: 'easeOutIn4'
    },
    duration: 3000,
  });

  var myTimeline = scrawl.makeTimeline({
    name: 'disappearTimeline'
  }).addTween({
    name: 'enterIris',
    start: {
      scale: 0,
      startX: '0%',
      startY: '0%'
    },
    end: {
      scale: 1,
      startX: '50%',
      startY: '50%'
    },
    engines: {
      scale: 'easeIn',
      startX: 'easeIn3',
      startY: 'easeIn3'
    },
    targets: 'iris',
    duration: 2000,
    time: 0
  }).doShow({
    name: 'makeDotsVisible',
    targets: allTheDots,
    time: 1800,
  }).addTween(dotRingShowTemplate.clone({
    name: 'dotTween01',
    targets: middleDot,
    time: 2000
  })).addTween(dotRingHideTemplate.clone({
    name: 'dotTween02',
    targets: middleDot,
    time: 2600
  })).addTween(dotRingShowTemplate.clone({
    name: 'dotTween03',
    targets: innerDots,
    time: 2300
  })).addTween(dotRingHideTemplate.clone({
    name: 'dotTween04',
    targets: innerDots,
    time: 2900
  })).addTween(dotRingShowTemplate.clone({
    name: 'dotTween05',
    targets: outerDots,
    time: 2600
  })).addTween(dotRingHideTemplate.clone({
    name: 'dotTween06',
    targets: outerDots,
    time: 3200
  })).addTween(dotRingShowTemplate.clone({
    name: 'dotTween07',
    targets: edgeDots,
    time: 2900
  })).addTween(dotRingHideTemplate.clone({
    name: 'dotTween08',
    targets: edgeDots,
    time: 3500
  })).addTween(dotRingShowTemplate.clone({
    name: 'dotTween09',
    targets: cornerDots,
    time: 3200
  })).addTween(dotRingHideTemplate.clone({
    name: 'dotTween10',
    targets: cornerDots,
    time: 3800
  })).doOrder({
    name: 'changeDotsOrder',
    targets: 'allDots',
    from: 2,
    to: 0,
    time: 4410
  }).fadeIn({
    name: 'opaqueDots',
    targets: allTheDots,
    duration: 0,
    time: 4420
  }).doComposition({
    name: 'changeFlowerComposition',
    targets: 'iris',
    from: 'source-over',
    to: 'source-in',
    time: 4480
  }).addTween(dotDissolveTemplate.clone({
    name: 'dotTween11',
    targets: cornerDots,
    time: 4500
  })).addTween(dotDissolveTemplate.clone({
    name: 'dotTween12',
    targets: edgeDots,
    time: 6000
  })).addTween(dotDissolveTemplate.clone({
    name: 'dotTween13',
    targets: outerDots,
    time: 7500
  })).addTween(dotDissolveTemplate.clone({
    name: 'dotTween14',
    targets: innerDots,
    time: 9000
  })).addTween(dotDissolveTemplate.clone({
    name: 'dotTween15',
    targets: middleDot,
    time: 10500
  }));

  // integrate some video-like control buttons, and a range input, for controlling the animation

	scrawl.makeAnimation({
    name: 'drawScene',
    order: 2,
    fn: function(){
      scrawl.render();
			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});

  myTimeline.run();
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
