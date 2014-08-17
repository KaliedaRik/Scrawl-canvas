var mycode = function() {
	'use strict';
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var check,
		choke = 0,
		chokeTime = Date.now() + choke,
		bombChoke = 0,
		bombChokeTime = Date.now() + bombChoke,
		gunBlown = false,
		animFlag = false,
		bunkersChanged = false,
		finished = false,
		alienSweep,
		alienDescent,
		gunSpeed,
		gunRate,
		level = 1,
		score = 0,
		lives = 3,
		myScore = '',
		myLevel = '',
		myLives = '',
		myGunGroup,
		myGunBulletGroup,
		myAlienBulletGroup,
		myAliens,
		myBunkers,
		myGun,
		hole,
		holeRadius,
		buildScene,
		moveAliens,
		moveGun,
		moveBullets,
		markForDelete,
		checkCollisions,
		bunkerHits,
		blowGun,
		blowBunker,
		myHitBunker,
		makeBombs,
		setGunMove,
		myMove,
		fireGun,
		checkKeyDown,
		levelStart,
		gameOver,
		levelEnd;

	buildScene = function() {
		//get sprite sheet
		scrawl.getImagesByClass('demo701');

		//cells
		scrawl.addNewCell({
			name: 'bunkerLeft',
			height: 60,
			width: 120,
		});
		scrawl.addNewCell({
			name: 'bunkerCenter',
			height: 60,
			width: 120,
		});
		scrawl.addNewCell({
			name: 'bunkerRight',
			height: 60,
			width: 120,
		});
		scrawl.addNewCell({
			name: 'main',
			height: 600,
			width: 800,
			backgroundColor: 'black',
		});
		scrawl.addNewCell({
			name: 'texts',
			height: 40,
			width: 800,
			backgroundColor: 'black',
			targetY: 600,
		});
		scrawl.setDrawOrder(['main', 'texts']);

		//field
		scrawl.newBlock({
			name: 'myField',
			startX: 35,
			startY: 5,
			width: 730,
			height: 590,
			visibility: false,
			field: true,
			group: 'main',
		});
		scrawl.buildFields('main');

		//bomb damage holes
		hole = scrawl.newWheel({
			radius: holeRadius,
			method: 'clear',
		});

		//Phrase sprites - score, level, lives
		myScore = scrawl.newPhrase({
			handleX: 'center',
			handleY: 'center',
			startX: 400,
			startY: 20,
			text: 'Score: 0',
			method: 'fill',
			fillStyle: 'gold',
			font: '24pt Arial, sans-serif',
			group: 'texts',
		});
		myLevel = myScore.clone({
			handleX: 'left',
			startX: 10,
			text: 'Level: 1',
		});
		myLives = myScore.clone({
			handleX: 'right',
			startX: 790,
			text: 'Lives: 3',
		});

		//define animations
		scrawl.newAnimSheet({
			name: 'alien1',
			sheet: 'imagesheet',
			running: 'forward',
			loop: 'loop',
			speed: 1,
			frames: [{
				x: 0,
				y: 0,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 60,
				y: 0,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 120,
				y: 0,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 180,
				y: 0,
				w: 60,
				h: 60,
				d: 400
          }],
		}).clone({
			name: 'alien2',
			frames: [{
				x: 0,
				y: 60,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 60,
				y: 60,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 120,
				y: 60,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 180,
				y: 60,
				w: 60,
				h: 60,
				d: 400
          }],
		}).clone({
			name: 'alien3',
			frames: [{
				x: 0,
				y: 120,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 60,
				y: 120,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 120,
				y: 120,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 180,
				y: 120,
				w: 60,
				h: 60,
				d: 400
          }],
		}).clone({
			name: 'alien4',
			frames: [{
				x: 0,
				y: 180,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 60,
				y: 180,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 120,
				y: 180,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 180,
				y: 180,
				w: 60,
				h: 60,
				d: 400
          }],
		}).clone({
			name: 'alien5',
			frames: [{
				x: 0,
				y: 240,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 60,
				y: 240,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 120,
				y: 240,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 180,
				y: 240,
				w: 60,
				h: 60,
				d: 400
          }],
		}).clone({
			name: 'alien6',
			frames: [{
				x: 0,
				y: 300,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 60,
				y: 300,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 120,
				y: 300,
				w: 60,
				h: 60,
				d: 400
          }, {
				x: 180,
				y: 300,
				w: 60,
				h: 60,
				d: 400
          }],
		}).clone({
			name: 'alien1kill',
			loop: 'end',
			frames: [{
				x: 240,
				y: 0,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 300,
				y: 0,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 360,
				y: 0,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 420,
				y: 0,
				w: 60,
				h: 60,
				d: 250
          }],
		}).clone({
			name: 'alien2kill',
			frames: [{
				x: 240,
				y: 60,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 300,
				y: 60,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 360,
				y: 60,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 420,
				y: 60,
				w: 60,
				h: 60,
				d: 250
          }],
		}).clone({
			name: 'alien3kill',
			frames: [{
				x: 240,
				y: 120,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 300,
				y: 120,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 360,
				y: 120,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 420,
				y: 120,
				w: 60,
				h: 60,
				d: 250
          }],
		}).clone({
			name: 'alien4kill',
			frames: [{
				x: 240,
				y: 180,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 300,
				y: 180,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 360,
				y: 180,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 420,
				y: 180,
				w: 60,
				h: 60,
				d: 250
          }],
		}).clone({
			name: 'alien5kill',
			frames: [{
				x: 240,
				y: 240,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 300,
				y: 240,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 360,
				y: 240,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 420,
				y: 240,
				w: 60,
				h: 60,
				d: 250
          }],
		}).clone({
			name: 'alien6kill',
			frames: [{
				x: 240,
				y: 300,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 300,
				y: 300,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 360,
				y: 300,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 420,
				y: 300,
				w: 60,
				h: 60,
				d: 250
          }],
		}).clone({
			name: 'bang',
			frames: [{
				x: 240,
				y: 360,
				w: 60,
				h: 60,
				d: 250
          }, {
				x: 300,
				y: 360,
				w: 60,
				h: 60,
				d: 300
          }, {
				x: 240,
				y: 360,
				w: 60,
				h: 60,
				d: 200
          }, {
				x: 300,
				y: 360,
				w: 60,
				h: 60,
				d: 200
          }, {
				x: 240,
				y: 360,
				w: 60,
				h: 60,
				d: 200
          }, {
				x: 300,
				y: 360,
				w: 60,
				h: 60,
				d: 200
          }, {
				x: 360,
				y: 360,
				w: 60,
				h: 60,
				d: 300
          }, {
				x: 300,
				y: 360,
				w: 60,
				h: 60,
				d: 200
          }, {
				x: 360,
				y: 360,
				w: 60,
				h: 60,
				d: 200
          }, {
				x: 300,
				y: 360,
				w: 60,
				h: 60,
				d: 200
          }, {
				x: 360,
				y: 360,
				w: 60,
				h: 60,
				d: 200
          }, {
				x: 420,
				y: 360,
				w: 60,
				h: 60,
				d: 100
          }, {
				x: 360,
				y: 360,
				w: 60,
				h: 60,
				d: 100
          }, {
				x: 420,
				y: 360,
				w: 60,
				h: 60,
				d: 100
          }, {
				x: 360,
				y: 360,
				w: 60,
				h: 60,
				d: 100
          }, {
				x: 300,
				y: 360,
				w: 60,
				h: 60,
				d: 100
          }, {
				x: 420,
				y: 360,
				w: 60,
				h: 60,
				d: 100
          }, {
				x: 240,
				y: 360,
				w: 60,
				h: 60,
				d: 100
          }, {
				x: 420,
				y: 360,
				w: 60,
				h: 60,
				d: 10
          }, {
				x: 0,
				y: 0,
				w: 1,
				h: 1,
				d: 1
          }],
		}).clone({
			name: 'bunkerBang',
			frames: [{
				x: 240,
				y: 360,
				w: 60,
				h: 60,
				d: 300
          }, {
				x: 300,
				y: 360,
				w: 60,
				h: 60,
				d: 200
          }, {
				x: 360,
				y: 360,
				w: 60,
				h: 60,
				d: 100
          }, {
				x: 420,
				y: 360,
				w: 60,
				h: 60,
				d: 100
          }, {
				x: 0,
				y: 0,
				w: 1,
				h: 1,
				d: 1
          }],
		});

		//define groups
		myGunGroup = scrawl.newGroup({
			name: 'gunGroup',
			cell: 'main',
			order: 0,
		});
		myGunBulletGroup = scrawl.newGroup({
			name: 'gunBullets',
			cell: 'main',
			order: 2,
		});
		myAlienBulletGroup = scrawl.newGroup({
			name: 'alienBullets',
			cell: 'main',
			order: 4,
		});
		myAliens = scrawl.newGroup({
			name: 'aliens',
			cell: 'main',
			order: 3,
		});
		myBunkers = scrawl.newGroup({
			name: 'bunkers',
			cell: 'main',
			order: 1,
		});

		//build gun
		myGun = scrawl.newPicture({
			name: 'gun',
			startX: 400,
			startY: 534,
			handleX: 30,
			width: 60,
			height: 60,
			copyX: 120,
			copyY: 360,
			copyWidth: 60,
			copyHeight: 60,
			source: 'imagesheet',
			group: 'gunGroup',
			order: 1,
			collisionPoints: 'center',
			checkHitUsingImageData: true,
		}).getImageData();

		//build aliens
		var tempAlien = scrawl.newPicture({
			name: 'alien',
			source: 'imagesheet',
			animSheet: 'alien1',
			checkHitUsingImageData: true,
			handleX: 'center',
			handleY: '80%',
			width: 60,
			height: 60,
			visibility: false,
			collisionPoints: 'center',
		}).getImageData();
		for (var i = 0; i < 10; i++) {
			tempAlien.clone({
				name: 'alien1' + i,
				startX: 130 + (i * 60),
				startY: 60,
				deltaX: alienSweep,
				deltaY: alienDescent,
				animSheet: 'alien1',
				visibility: true,
				group: 'aliens',
			}).clone({
				name: 'alien2' + i,
				startY: 120,
				animSheet: 'alien2',
			}).clone({
				name: 'alien3' + i,
				startY: 180,
				animSheet: 'alien3',
			}).clone({
				name: 'alien4' + i,
				startY: 240,
				animSheet: 'alien4',
			}).clone({
				name: 'alien5' + i,
				startY: 300,
				animSheet: 'alien5',
			}).clone({
				name: 'alien6' + i,
				startY: 360,
				animSheet: 'alien6',
			});
		}

		//build bunkers
		scrawl.newPicture({
			name: 'bunker1',
			width: 120,
			height: 60,
			copyX: 0,
			copyY: 360,
			copyWidth: 120,
			copyHeight: 60,
			source: 'imagesheet',
			group: 'bunkerLeft',
		}).clone({
			name: 'bunker2',
			group: 'bunkerCenter',
			keepCopyDimensions: true,
		}).clone({
			name: 'bunker3',
			group: 'bunkerRight',
			keepCopyDimensions: true,
		});
		scrawl.newPicture({
			name: 'mybunker1',
			startX: 100,
			startY: 480,
			width: 120,
			height: 60,
			source: 'bunkerLeft',
			group: 'bunkers',
			checkHitUsingImageData: true,
			collisionPoints: [],
		}).clone({
			name: 'mybunker2',
			startX: 340,
			source: 'bunkerCenter',
		}).clone({
			name: 'mybunker3',
			startX: 580,
			source: 'bunkerRight',
		});
		bunkersChanged = true;

		//animation object
		scrawl.newAnimation({
			fn: function() {
				if (animFlag) {
					if (finished) {
						myScore.set({
							text: 'Score: ' + score
						});
						myLevel.set({
							text: 'GAME'
						});
						myLives.set({
							text: 'OVER'
						});
						scrawl.render();
						animFlag = false;
					}
					else {
						moveGun();
						makeBombs();
						moveBullets();
						checkCollisions();
						myScore.set({
							text: 'Score: ' + score
						});
						myLevel.set({
							text: 'Level: ' + level
						});
						myLives.set({
							text: 'Lives: ' + lives
						});
						if (!gunBlown && Date.now() > chokeTime) {
							moveAliens();
							choke = myAliens.sprites.length * 3;
							chokeTime = Date.now() + choke;
						}
						scrawl.render();
						if (bunkersChanged) {
							bunkersChanged = false;
							scrawl.sprite.mybunker1.getImageData();
							scrawl.sprite.mybunker2.getImageData();
							scrawl.sprite.mybunker3.getImageData();
						}
						if (myAliens.sprites.length === 0) {
							levelEnd(false);
						}
					}
				}

				testNow = Date.now();
				testTime = testNow - testTicker;
				testTicker = testNow;
				testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
			},
		});
	};

	//display cycle
	moveAliens = function() {
		if (myAliens.sprites.length > 0) {
			check = myAliens.getFieldSpriteHits('main');
			if (check.length > 0) {
				myAliens.updateStart('y').reverse('deltaX');
			}
			myAliens.updateStart('x');
		}
		else {
			levelEnd(true);
		}
	};
	moveGun = function() {
		if (!gunBlown) {
			myGun.updateStart('x');
			check = myGunGroup.getFieldSpriteHits('main');
			if (check.length > 0) {
				myGun.revertStart('x');
			}
			myGun.set({
				deltaX: 0,
			});
		}
	};
	moveBullets = function() {
		var i, iz;
		markForDelete = [];
		for (i = 0, iz = myGunBulletGroup.sprites.length; i < iz; i++) {
			scrawl.sprite[myGunBulletGroup.sprites[i]].updateStart('y');
		}
		for (i = 0, iz = myAlienBulletGroup.sprites.length; i < iz; i++) {
			scrawl.sprite[myAlienBulletGroup.sprites[i]].updateStart('y');
		}
		check = myAlienBulletGroup.getFieldSpriteHits('main');
		for (i = 0, iz = check.length; i < iz; i++) {
			scrawl.pushUnique(markForDelete, check[i][0]);
		}
		check = myGunBulletGroup.getFieldSpriteHits('main');
		for (i = 0, iz = check.length; i < iz; i++) {
			score -= 10;
			scrawl.pushUnique(markForDelete, check[i][0]);
		}
		scrawl.deleteSprite(markForDelete);
	};

	//collisions
	checkCollisions = function() {
		var i, iz, myAnim;
		markForDelete = [];
		bunkerHits = [];
		//gun bullets vs aliens
		check = myGunBulletGroup.getBetweenGroupSpriteHits(myAliens);
		for (i = 0, iz = check.length; i < iz; i++) {
			scrawl.pushUnique(markForDelete, check[i][0]);
			try {
				myAnim = scrawl.anim[scrawl.sprite[check[i][1]].animSheet + 'kill'].clone();
				scrawl.sprite[check[i][1]].set({
					animSheet: myAnim.name
				});
				score += 100;
			}
			catch (e) {}
		}
		for (i = 0, iz = myAliens.sprites.length; i < iz; i++) {
			if (scrawl.sprite[myAliens.sprites[i]].get('running') === 'complete') {
				scrawl.pushUnique(markForDelete, myAliens.sprites[i]);
			}
		}
		//alien bullets vs gun
		check = myAlienBulletGroup.getBetweenGroupSpriteHits(myGunGroup);
		if (check.length > 0) {
			blowGun(check[0]);
			scrawl.pushUnique(markForDelete, check[0][0]);
		}
		//alien vs gun
		check = myAliens.getBetweenGroupSpriteHits(myGunGroup);
		if (check.length > 0) {
			blowGun(check[0]);
			scrawl.pushUnique(markForDelete, check[0][0]);
		}
		//alien bullets vs bunker
		check = myAlienBulletGroup.getBetweenGroupSpriteHits(myBunkers);
		for (i = 0, iz = check.length; i < iz; i++) {
			scrawl.pushUnique(markForDelete, check[i][0]);
			bunkerHits.push(check[i]);
		}
		//gun bullets vs bunker
		check = myGunBulletGroup.getBetweenGroupSpriteHits(myBunkers);
		for (i = 0, iz = check.length; i < iz; i++) {
			scrawl.pushUnique(markForDelete, check[i][0]);
			bunkerHits.push(check[i]);
		}
		for (i = 0, iz = scrawl.group.main.sprites.length; i < iz; i++) {
			if (scrawl.sprite[scrawl.group.main.sprites[i]].imageType === 'animation') {
				if (scrawl.sprite[scrawl.group.main.sprites[i]].get('running') === 'complete') {
					scrawl.pushUnique(markForDelete, scrawl.group.main.sprites[i]);
				}
			}
		}
		//alien vs bunker
		check = myAliens.getBetweenGroupSpriteHits(myBunkers);
		for (i = 0, iz = check.length; i < iz; i++) {
			try {
				myAnim = scrawl.anim[scrawl.sprite[check[i][0]].animSheet + 'kill'].clone();
				scrawl.sprite[check[i][0]].set({
					animSheet: myAnim.name
				});
				score -= 100;
			}
			catch (e) {}
			bunkerHits.push(check[i]);
		}
		//update bunker showing damage
		if (bunkerHits.length > 0) {
			blowBunker(bunkerHits);
			bunkersChanged = true;
		}
		//when explosion finishes on gun
		for (i = 0, iz = myGunGroup.sprites.length; i < iz; i++) {
			if (scrawl.sprite[myGunGroup.sprites[i]].imageType === 'animation') {
				if (scrawl.sprite[myGunGroup.sprites[i]].get('running') === 'complete') {
					scrawl.deleteSprite(myGunGroup.sprites);
					levelEnd(false);
				}
			}
		}
		//aliens have landed?
		for (i = 0, iz = myAliens.sprites.length; i < iz; i++) {
			if (scrawl.sprite[myAliens.sprites[i]].start.y > 600) {
				score -= (myAliens.sprites.length * 100);
				levelEnd(false);
			}
		}
		//clear out spent sprites
		if (markForDelete.length > 0) {
			scrawl.deleteSprite(markForDelete);
		}
	};

	blowGun = function(check) {
		scrawl.sprite[check[0]].delta.y = 0;
		scrawl.newPicture({
			startX: scrawl.sprite[check[0]].start.x - 30,
			startY: scrawl.sprite[check[0]].start.y - 30,
			width: 60,
			height: 60,
			animSheet: 'bang',
			source: 'imagesheet',
			group: 'gunGroup',
			order: 2,
		});
		gunBlown = true;
	};

	blowBunker = function(hits) {
		for (var i = 0, z = hits.length; i < z; i++) {
			myHitBunker = false;
			if (scrawl.contains(myAliens.sprites, hits[i][0])) {
				switch (scrawl.sprite[hits[i][1]].name) {
					case 'mybunker1':
						myHitBunker = 'bunkerLeft';
						break;
					case 'mybunker2':
						myHitBunker = 'bunkerCenter';
						break;
					case 'mybunker3':
						myHitBunker = 'bunkerRight';
						break;
				}
				if (myHitBunker) {
					hole.clone({
						startX: scrawl.sprite[hits[i][0]].start.x - scrawl.sprite[hits[i][1]].start.x,
						startY: scrawl.sprite[hits[i][0]].start.y - scrawl.sprite[hits[i][1]].start.y,
						radius: 60,
						group: myHitBunker,
					});
				}
			}
			else {
				scrawl.sprite[hits[i][0]].deltaY = 0;
				var myAnim = scrawl.anim.bunkerBang.clone();
				scrawl.newPicture({
					startX: scrawl.sprite[hits[i][0]].start.x - 30,
					startY: scrawl.sprite[hits[i][0]].start.y - 30,
					width: 60,
					height: 60,
					animSheet: myAnim.name,
					source: 'imagesheet',
					group: 'main',
					order: 2,
				});
				switch (scrawl.sprite[hits[i][1]].name) {
					case 'mybunker1':
						myHitBunker = 'bunkerLeft';
						break;
					case 'mybunker2':
						myHitBunker = 'bunkerCenter';
						break;
					case 'mybunker3':
						myHitBunker = 'bunkerRight';
						break;
				}
				if (myHitBunker) {
					hole.clone({
						startX: scrawl.sprite[hits[i][0]].start.x - scrawl.sprite[hits[i][1]].start.x,
						startY: scrawl.sprite[hits[i][0]].start.y - scrawl.sprite[hits[i][1]].start.y,
						group: myHitBunker,
					});
				}
			}
		}
	};

	makeBombs = function() {
		if (Date.now() > bombChokeTime && myAliens.sprites.length > 0) {
			bombChokeTime = Date.now() + bombChoke;
			var myAl = Math.floor(Math.random() * myAliens.sprites.length);
			scrawl.newPicture({
				name: 'bomb',
				startX: scrawl.sprite[myAliens.sprites[myAl]].start.x,
				startY: scrawl.sprite[myAliens.sprites[myAl]].start.y,
				handleX: 2,
				handleY: 14,
				deltaY: 2,
				width: 3,
				height: 14,
				copyX: 210,
				copyY: 370,
				copyWidth: 3,
				copyHeight: 14,
				source: 'imagesheet',
				group: 'alienBullets',
				order: 0,
				collisionPoints: 'S',
				checkHitUsingImageData: true,
			}).getImageData();
		}
	};

	//key input event listener
	setGunMove = function(d) {
		myMove = 0;
		switch (d) {
			case 'left':
				myMove = -gunSpeed;
				break;
			case 'right':
				myMove = gunSpeed;
				break;
		}
		myGun.set({
			deltaX: myMove
		});
	};
	fireGun = function() {
		if (!gunBlown && myGunBulletGroup.sprites.length < gunRate) {
			scrawl.newPicture({
				name: 'missile',
				startX: myGun.start.x,
				startY: myGun.start.y,
				handleX: 2,
				deltaY: -4,
				width: 3,
				height: 14,
				copyX: 180,
				copyY: 370,
				copyWidth: 3,
				copyHeight: 14,
				source: 'imagesheet',
				group: 'gunBullets',
				order: 0,
				collisionPoints: 'N',
				checkHitUsingImageData: true,
			}).getImageData();
			score -= 5;
		}
	};
	checkKeyDown = function(e) {
		switch (e.keyCode) {
			case 37:
				setGunMove('left');
				break;
			case 39:
				setGunMove('right');
				break;
			case 32:
				fireGun();
				break;
		}
	};
	window.addEventListener('keydown', checkKeyDown);

	//level controller
	levelStart = function() {
		alienSweep = (2 + (level / 10) < 6) ? Math.floor(2 + (level / 10)) : 6;
		alienDescent = (10 + (level / 5) < 30) ? Math.floor(10 + (level / 5)) : 30;
		bombChoke = (2000 - (level * 10) > 200) ? Math.floor(2000 - (level * 10)) : 200;
		gunSpeed = (4 - Math.floor(level / 10) > 1) ? Math.floor(4 - (level / 10)) : 1;
		gunRate = (4 - Math.floor(level / 20) > 1) ? Math.floor(4 - (level / 20)) : 1;
		holeRadius = (4 + (level / 2) < 30) ? Math.floor(4 + (level / 2)) : 30;

		scrawl.init();
		buildScene();
		animFlag = true;
	};

	gameOver = function() {
		finished = true;
		animFlag = true;
	};

	levelEnd = function(completed) {
		if (completed) {
			score += 1000;
			level++;
			levelStart();
		}
		else {
			lives--;
			if (lives === 0) {
				animFlag = false;
				gameOver();
			}
			else {
				gunBlown = false;
				levelStart();
			}
		}
	};

	//initialize game
	levelStart();
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['animation', 'collisions', 'images', 'wheel', 'block', 'phrase'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
