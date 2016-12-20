var mycode = function() {
	'use strict';

	//hide-start
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');
	//hide-end

  /* Tweens and timelines can get quite long very quickly, particularly for more complex animation scenes.
  
  Let's investigate some of the shortcut's that Scrawl offers for manipulating timelines. We'll start by recreating the scene from the previous lesson: */
  scrawl.getImageById('flower');
  scrawl.makeGroup({
    name: 'allDots',
    cell: scrawl.pad.myCanvas.base,
    order: 2,
  });
  for(var y = 0; y < 5; y++){
    for(var x = 0; x < 5; x++){
      /* We'll create our dots transparent and invisible (note that 'transparent' and 'invisible' are not the same thing) ... */
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
  
  /* ... and assign their names to a set of simple Arrays, for later use: */
  var allTheDots = [].concat(scrawl.group.allDots.entitys);
  var middleDot = ['dot_22'];
  var innerDots = ['dot_12', 'dot_21', 'dot_23', 'dot_32'];
  var outerDots = ['dot_02', 'dot_11', 'dot_13', 'dot_20', 'dot_24', 'dot_31', 'dot_33', 'dot_42'];
  var edgeDots = ['dot_01', 'dot_03', 'dot_10', 'dot_14', 'dot_30', 'dot_34', 'dot_41', 'dot_43'];
  var cornerDots = ['dot_00', 'dot_04', 'dot_40', 'dot_44'];
  
  /* Our Picture entity starts shrunken in the top-left corner. To help with animating the scene we'll place the picture in its own group, and assign it a lower order value than the dots group to make sure it is drawn first: */
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

  /* We'll also create the timeline here. We can add tweens to it later */
  var myTimeline = scrawl.makeTimeline({
    name: 'disappearTimeline'
  });

  /* The basic animation object should be familiar to us now ... */
  scrawl.makeAnimation({
    name: 'drawScene',
    order: 2,
    fn: function(){
      scrawl.render();
    }
  });

  /* The first tween will bring the image into view, sliding it in from the top left corner: */
  var task_15_step_1 = function(){
    myTimeline.addTween({
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
    });
    // myTimeline.run();
  };
  
  // UNCOMMENT the function call to see the timeline run
  task_15_step_1();

  /* Next, we can hide our flower behind our dots, and reveal it again: */
  var task_15_step_2 = function(){
    // myTimeline.halt().seekTo(0);
    
    /* We can use a timeline convenience function to make all the dots 'visible' (though still transparent) */
    myTimeline.doShow({
      name: 'makeDotsVisible',
      targets: allTheDots,
      time: 1800,
    });
    
    /* As we'll be creating several tweens here, we might as well template-and-clone them: */
    var dotRingShowTemplate = scrawl.makeTween({
      start: {
        scale: 0,
        globalAlpha: 1
      },
      end: {
        scale: 2,
        globalAlpha: 0
      },
      engines: {
        scale: 'easeIn3'
      },
      duration: 1200,
    });
    // var dotRingHideTemplate = scrawl.makeTween({
    //   start: {
    //     scale: 1,
    //     globalAlpha: 1
    //   },
    //   end: {
    //     scale: 2,
    //     globalAlpha: 0
    //   },
    //   duration: 600,
    // });
    
    /* Most of the following is copy-paste, and changing a few values here-and-there ... also, because most timeline (and tween) functions are chainable, we'll save some typing by chaining them */
    myTimeline.addTween(dotRingShowTemplate.clone({
      name: 'dotTween01',
      targets: middleDot,
      time: 2000
    // })).addTween(dotRingHideTemplate.clone({
    //   name: 'dotTween02',
    //   targets: middleDot,
    //   time: 2600
    })).addTween(dotRingShowTemplate.clone({
      name: 'dotTween03',
      targets: innerDots,
      time: 2300
    // })).addTween(dotRingHideTemplate.clone({
    //   name: 'dotTween04',
    //   targets: innerDots,
    //   time: 2900
    })).addTween(dotRingShowTemplate.clone({
      name: 'dotTween05',
      targets: outerDots,
      time: 2600
    // })).addTween(dotRingHideTemplate.clone({
    //   name: 'dotTween06',
    //   targets: outerDots,
    //   time: 3200
    })).addTween(dotRingShowTemplate.clone({
      name: 'dotTween07',
      targets: edgeDots,
      time: 2900
    // })).addTween(dotRingHideTemplate.clone({
    //   name: 'dotTween08',
    //   targets: edgeDots,
    //   time: 3500
    })).addTween(dotRingShowTemplate.clone({
      name: 'dotTween09',
      targets: cornerDots,
      time: 3200
    // })).addTween(dotRingHideTemplate.clone({
    //   name: 'dotTween10',
    //   targets: cornerDots,
    //   time: 3800
    // })).run();
    }));
  };
  
  // UNCOMMENT the function call to see the timeline run
  task_15_step_2();
  
  /* We're about to reach the 4.5 second mark in our scene. After 4.5 seconds, we want the image to slowly disappear as our dots shrink. 
  
  Unfortunately we've given our wheel entitys group a higher order value (2) than our picture entity group (1). This ordering needs to be reversed, and we also need to change the composite operation of our picture so that it only appears on our dots, not the entire canvas.
  
  We'll use some more timeline convenience functions to make this all happen: */
  var task_15_step_3 = function(){
    // myTimeline.halt().seekTo(0).doOrder({
    myTimeline.doOrder({
      name: 'changeDotsOrder',
      targets: 'allDots',
      from: 2,
      to: 0,
      time: 4410
    }).fadeIn({
      name: 'opaqueDots',
      targets: allTheDots,
      duration: 10,
      time: 4420
    }).doComposition({
      name: 'changeFlowerComposition',
      targets: 'iris',
      from: 'source-over',
      to: 'source-in',
      time: 4480
    // }).run();
    });
  };

  // UNCOMMENT the function call to see the timeline run
  task_15_step_3();

  /* The scene looks no different - but we are now in a position where we can make the flower dissolve in an interesting way: */
  var task_15_step_4 = function(){
    // myTimeline.halt().seekTo(0);

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

    myTimeline.addTween(dotDissolveTemplate.clone({
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
    // })).run();
    }));
  };

  // UNCOMMENT the function call to see the timeline run
  task_15_step_4();
  
  /* For our final task, we shall add in some video-like controls. This time, we'll build the controls in regular html and add vanillaJS event listeners to them which we can use to control the progress of our animation. */
  
  // GO TO THE HTML TAB to build the controls, then return here to continue.
  
  /* We have added a range input as part of our controls. Let's set it up so that the input automatically updates as the timeline runs: */
  var slider, slideValue, myControls;
  var task_15_controls_1 = function(){
    /* Get handles to our slider elements */
    slider = document.getElementById('seeker');
    slideValue = document.getElementById('slideValue');
    
    /* Scrawl timelines will emit events - by default around 10 a second as the timeline runs. We'll change this to a more frequent value, then add an event listener to the document: */
    myTimeline.set({
      event: 20,
    });
    scrawl.addNativeListener('timeline-updated', function(e){
      if (e.detail.name === 'disappearTimeline') {
        slider.value = e.detail.currentTime;
        slideValue.innerHTML = e.detail.currentTime;
      }
    }, document);
  };

  // UNCOMMENT the function call to see the timeline run
  task_15_controls_1();

  /* Capture and act on user input: */
  var task_15_controls_2 = function(){
    /* One function to rule them all ... */
    myControls = function(e){
      if(e){
        e.preventDefault();
		    e.returnValue = false;
        switch (e.target.id) {
          case 'run-button' :
            myTimeline.halt().seekTo(0).run();
            break;
          case 'halt-button' :
            myTimeline.halt();
            break;
          case 'resume-button' :
            myTimeline.resume();
            break;
          case 'seeker' :
            // Note: newly discovered bug 18 Dec 2016 - resuming a timeline after performing a seekTo leads to unexpected result - under active investigation!
            var val = e.target.value;
            if(myTimeline.active){
              myTimeline.halt();
            }
            myTimeline.seekTo(val);
            slideValue.innerHTML = val;
            break;
          default :
            // do nothing
        }
      }
    };
    scrawl.addNativeListener(['input', 'change', 'click'], myControls, '.control');
  };

  // UNCOMMENT the function call to see the timeline run
  task_15_controls_2();

	scrawl.makeAnimation({
		fn: function() {
			// scrawl.render();
			//hide-start
			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			//hide-end
		},
	});

  console.log('DO RUN');
  myTimeline.run();
  console.log('DO HALT');
  myTimeline.halt();
  console.log('DO SEEKTO');
  myTimeline.seekTo(300);
  console.log('DO RESUME');
  myTimeline.resume();
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
