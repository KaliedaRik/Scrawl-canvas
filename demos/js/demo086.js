var mycode = function() {
	'use strict';
	//There's many different ways to build/display data graphs - this is just one possibility
	var testTicker = Date.now(),
		testTime = testTicker,
		testNow,
		testMessage = document.getElementById('testmessage');

	//define variables
	var Crimes,
		addCommas,
		rawData,
		myCanvas = scrawl.canvas.mycanvas,
		myPad = scrawl.pad.mycanvas,
		here,
		hoverLabel = false,
		hoverPin = false,
		currentCategory = 'all',
		crimeYear = [],
		graphX = 120,
		graphY = 80,
		years,
		yearLabels,
		categories,
		categoryLabels,
		myMax,
		myMin,
		myExp,
		gridMax,
		titles,
		myLine,
		myPins,
		myGraphs,
		myDetails,
		background,
		yLabel = [],
		myTitle,
		details,
		detailsYear,
		detailsCrimes,
		checkGraphLabels,
		checkPins,
		changeGraph,
		i, iz, j, jz;

	//load images into scrawl library
	scrawl.getImagesByClass('demo086');

	//define a JavaScript annual crime data object for manipulating the raw data
	Crimes = function(items) {
		this.year = items[0];
		this.all = items[1];
		this.violence = items[2];
		this.sexual = items[3];
		this.robbery = items[4];
		this.burglary = items[5];
		this.theft = items[6];
		this.fraud = items[7];
		this.damage = items[8];
		this.drugs = items[9];
		this.other = items[10];
		this.population = items[11];
		this.pin = null;
		return this;
	};
	Crimes.prototype.getPerThousand = function(item) {
		return this[item];
	};
	Crimes.prototype.getPercentage = function(item) {
		return (this[item] * 100) / this.all;
	};
	Crimes.prototype.getNumber = function(item) {
		return Math.floor(this[item] * (this.population / 1000));
	};
	Crimes.prototype.getYScale = function(category, max, grid) {
		var myGrid = grid || 400;
		var myVal = Math.floor(this[category] * (this.population / 1000));
		var myPercent = (myVal * 100) / max;
		return myGrid - (myPercent * (myGrid / 100));
	};

	//every graph needs data ... crime stats for London Borough of Hackney - reported crimes per 1,000 population
	rawData = [
        //Year  All     Violence  Sexual  Robbery  Burglary  Theft  Fraud  Damage  Drugs  Other  Population
        [1999, 195.9, 33.4, 1.9, 12.2, 24.1, 76.4, 14.7, 25.9, 5, 2.3, 199100],
        [2000, 188, 31.1, 1.8, 11.2, 21.1, 80.7, 11.9, 23.7, 4.7, 1.8, 203400],
        [2001, 191.9, 32.3, 1.8, 14.5, 20.7, 81.2, 11.4, 23.6, 4.7, 1.7, 207200],
        [2002, 186.1, 32.3, 1.8, 11.7, 22.8, 78.9, 8.7, 22.4, 6, 1.8, 211000],
        [2003, 183.8, 33.6, 2, 11.5, 20.4, 78.6, 8, 20, 7.8, 1.9, 212400],
        [2004, 170.8, 34.1, 2.1, 9, 18.2, 69.1, 7.8, 19.1, 9.9, 1.5, 213600],
        [2005, 160, 34.5, 2.1, 8.6, 16.4, 67, 4.7, 15.2, 9.8, 1.6, 216500],
        [2006, 141.5, 32.5, 1.7, 7.7, 12.2, 56.9, 3.6, 14.3, 11.2, 1.5, 220200],
        [2007, 143.6, 31.4, 1.7, 5.8, 12.3, 52.8, 4, 13.6, 20.1, 1.8, 224500],
        [2008, 128.6, 28, 1.8, 4.8, 11.9, 46, 3.6, 10.4, 20.2, 1.8, 231000],
        [2009, 121.4, 28.1, 1.9, 4.6, 10.8, 45.3, 3.9, 10.1, 14.9, 1.7, 236600],
        [2010, 115.9, 24.6, 1.7, 4.5, 10.4, 50.3, 3.4, 9.1, 10.5, 1.4, 241700],
        [2011, 112.9, 21.8, 1.5, 4.9, 8.9, 52.4, 3.3, 8.5, 10.3, 1.3, 247200]
      ];

	//additional variables
	years = [
        'y1999', 'y2000', 'y2001', 'y2002', 'y2003', 'y2004',
        'y2005', 'y2006', 'y2007', 'y2008', 'y2009', 'y2010', 'y2011'
      ];
	yearLabels = {
		y1999: '1999/2000',
		y2000: '2000/01',
		y2001: '2001/02',
		y2002: '2002/03',
		y2003: '2003/04',
		y2004: '2004/05',
		y2005: '2005/06',
		y2006: '2006/07',
		y2007: '2007/08',
		y2008: '2008/09',
		y2009: '2009/10',
		y2010: '2010/11',
		y2011: '2011/12'
	};
	categories = [
        'all', 'burglary', 'damage', 'drugs', 'fraud',
        'other', 'robbery', 'sexual', 'theft', 'violence'
      ];
	categoryLabels = {
		all: 'All crimes',
		burglary: 'Burglaries',
		damage: 'Criminal damage',
		drugs: 'Drug offences',
		fraud: 'Fraud',
		other: 'Other crimes',
		robbery: 'Robbery',
		sexual: 'Sex crimes',
		theft: 'Theft',
		violence: 'Violence'
	};
	//scale variables for the graph y axis
	myMax = {
		'all': 0,
		'burglary': 0,
		'damage': 0,
		'drugs': 0,
		'fraud': 0,
		'other': 0,
		'robbery': 0,
		'sexual': 0,
		'theft': 0,
		'violence': 0
	};
	myMin = {
		'all': 999999,
		'burglary': 999999,
		'damage': 999999,
		'drugs': 999999,
		'fraud': 999999,
		'other': 999999,
		'robbery': 999999,
		'sexual': 999999,
		'theft': 999999,
		'violence': 999999
	};
	gridMax = {
		'all': 0,
		'burglary': 0,
		'damage': 0,
		'drugs': 0,
		'fraud': 0,
		'other': 0,
		'robbery': 0,
		'sexual': 0,
		'theft': 0,
		'violence': 0
	};
	titles = {
		all: 'All crimes reported in Hackney 1999-2011',
		burglary: 'Burglaries reported in Hackney 1999-2011',
		damage: 'Criminal damage reported in Hackney 1999-2011',
		drugs: 'Drug crimes reported in Hackney 1999-2011',
		fraud: 'Fraud crimes reported in Hackney 1999-2011',
		other: 'Other crimes reported in Hackney 1999-2011',
		robbery: 'Robberies reported in Hackney 1999-2011',
		sexual: 'Sexual crimes reported in Hackney 1999-2011',
		theft: 'Thefts reported in Hackney 1999-2011',
		violence: 'Violence reported in Hackney 1999-2011'
	};

	//build annual data objects from raw data
	for (i = 0, iz = rawData.length; i < iz; i++) {
		crimeYear[years[i]] = new Crimes(rawData[i]);
		for (j = 0, jz = categories.length; j < jz; j++) {
			if (crimeYear[years[i]].getNumber(categories[j]) > myMax[categories[j]]) {
				myMax[categories[j]] = crimeYear[years[i]].getNumber(categories[j]);
			}
			if (crimeYear[years[i]].getNumber(categories[j]) < myMin[categories[j]]) {
				myMin[categories[j]] = crimeYear[years[i]].getNumber(categories[j]);
			}
		}
	}
	//calculate scales for each crime category
	for (i = 0, iz = categories.length; i < iz; i++) {
		myExp = 1 + 'e+' + (('' + myMax[categories[i]]).length - 1);
		for (j = 0; j < 10; j++) {
			if (myExp * j > myMax[categories[i]]) {
				gridMax[categories[i]] = myExp * j;
				break;
			}
		}
	}

	//define display functions
	addCommas = function(i) {
		return (i + '').replace(/(\d)(?=(\d{3})+$)/g, '$1,');
	};

	//setup groups
	myPins = scrawl.newGroup({
		name: 'myPins',
		order: 2,
	});
	myGraphs = scrawl.newGroup({
		name: 'myGraphs',
		order: 3,
	});
	myDetails = scrawl.newGroup({
		name: 'detailsBox',
		order: 4,
		visibility: false,
	});

	//define sprites
	background = scrawl.newPicture({
		name: 'background',
		width: 400,
		height: 400,
		source: currentCategory,
		method: 'drawFill',
		startX: graphX,
		startY: graphY,
		order: 1,
	});
	scrawl.newShape({
		lineWidth: 3,
		order: 2,
		startX: graphX,
		startY: graphY,
		data: 'v400h400',
	}).clone({
		lineWidth: 1,
		startX: graphX - 10,
		data: 'h410m0,100h-410m0,100h410m0,100h-410',
	});
	scrawl.newPhrase({
		handleX: 'center',
		handleY: 'top',
		startX: graphX + 20,
		startY: graphY + 405,
		font: '12pt bold arial, sans-serif',
		text: '1999',
	}).clone({
		startX: graphX + 140,
		text: '2003',
	}).clone({
		startX: graphX + 260,
		text: '2007',
	}).clone({
		startX: graphX + 380,
		text: '2011',
	});
	yLabel[0] = scrawl.newPhrase({
		handleX: 'right',
		handleY: 'center',
		startX: graphX - 15,
		startY: graphY + 400,
		font: '12pt bold arial, sans-serif',
		text: '0',
	});
	yLabel[1] = yLabel[0].clone({
		startY: graphY + 300,
		text: addCommas(Math.floor(gridMax[currentCategory] * 0.25)),
	});
	yLabel[2] = yLabel[0].clone({
		startY: graphY + 200,
		text: addCommas(Math.floor(gridMax[currentCategory] * 0.5)),
	});
	yLabel[3] = yLabel[0].clone({
		startY: graphY + 100,
		text: addCommas(Math.floor(gridMax[currentCategory] * 0.75)),
	});
	yLabel[4] = yLabel[0].clone({
		startY: graphY,
		text: addCommas(gridMax[currentCategory]),
	});
	scrawl.newPhrase({
		handleX: 'right',
		handleY: 'top',
		startX: 15,
		startY: 150,
		font: '16pt Arial, sans-serif',
		text: 'Total annual crimes reported',
		roll: -90,
	});
	scrawl.newPhrase({
		handleX: 'center',
		handleY: 'top',
		font: '16pt Arial, sans-serif',
		text: 'Reporting year',
		startX: graphX + 200,
		startY: graphY + 430,
	}).clone({
		//Graph selector title
		font: '16pt bold Arial, sans-serif',
		handleX: 'left',
		text: 'Crime types',
		startX: graphX + 420,
		startY: graphY - 5,
	});

	//Graph title
	myTitle = scrawl.newPhrase({
		handleX: 'center',
		handleY: 'top',
		startX: 350,
		startY: 10,
		font: '20pt bold arial, sans-serif',
		text: titles[currentCategory],
	});

	//clickable graph labels
	for (i = 0, iz = categories.length; i < iz; i++) {
		scrawl.newPhrase({
			name: categories[i],
			font: '14pt Arial, sans-serif',
			handleX: 'left',
			handleY: 'center',
			text: categoryLabels[categories[i]],
			startX: graphX + 420,
			startY: graphY + (30 * (i + 1)) + 10,
			group: 'myGraphs',
		});
	}

	//graph data line shape, data point wheels
	myLine = scrawl.makePath({
		name: 'crimeline',
		line: true,
		startX: 0,
		startY: 0,
		lineWidth: 3,
		strokeStyle: 'red',
		method: 'draw',
		order: 3,
		data: 'm' + (20 + graphX) + ',' + graphY + ' 30,0 30,0 30,0 30,0 30,0 30,0 30,0 30,0 30,0 30,0 30,0 30,0',
	});
	for (i = 0, iz = years.length; i < iz; i++) {
		scrawl.newWheel({
			name: 'y' + (1999 + i),
			radius: 5,
			fillStyle: 'blue',
			pivot: 'crimeline_p' + (i + 1),
			method: 'fillDraw',
			group: 'myPins',
			checkHitRadius: 20,
		});
	}

	//pin details box
	details = scrawl.newBlock({
		name: 'details',
		pivot: 'y1999',
		width: 91,
		height: 42,
		handleY: -20.5,
		handleX: 45.5,
		method: 'fillDraw',
		strokeStyle: 'red',
		fillStyle: 'white',
		order: 6,
		group: 'detailsBox',
	});
	detailsYear = scrawl.newPhrase({
		font: '10pt bold Arial, sans-serif',
		handleX: 'center',
		text: '',
		pivot: 'details',
		order: 7,
		handleY: -24,
		group: 'detailsBox',
	});
	detailsCrimes = detailsYear.clone({
		font: '10pt Arial, sans-serif',
		handleY: -42,
	});

	//initialise pin positions
	for (i = 0, iz = years.length; i < iz; i++) {
		crimeYear[years[i]].pin = scrawl.point['crimeline_p' + (i + 1)];
		crimeYear[years[i]].pin.set({
			startY: crimeYear[years[i]].getYScale(currentCategory, gridMax[currentCategory]) + graphY,
		});
	}

	//hover effect over graph selector labels
	checkGraphLabels = function() {
		var tempLabel = myGraphs.getSpriteAt(here);
		if (tempLabel && tempLabel.name !== hoverLabel.name) {
			tempLabel.set({
				fillStyle: 'red',
			});
			if (hoverLabel) {
				hoverLabel.set({
					fillStyle: 'black',
				});
			}
			hoverLabel = tempLabel;
		}
		else if (!tempLabel && hoverLabel) {
			hoverLabel.set({
				fillStyle: 'black',
			});
			hoverLabel = false;
		}
	};

	//hover effect over pins
	checkPins = function() {
		var tempPin = myPins.getSpriteAt(here);
		if (tempPin && tempPin.name !== hoverPin.name) {
			tempPin.set({
				strokeStyle: 'red',
				lineWidth: 2
			});
			if (hoverPin) {
				hoverPin.set({
					strokeStyle: 'black',
					lineWidth: 1
				});
			}
			hoverPin = tempPin;
			details.pivot = hoverPin.name;
			detailsYear.set({
				text: yearLabels[hoverPin.name],
			});
			detailsCrimes.set({
				text: addCommas(crimeYear[hoverPin.name].getNumber(currentCategory)) + ' crimes',
			});
			myDetails.visibility = true;
		}
		else if (!tempPin && hoverPin) {
			hoverPin.set({
				strokeStyle: 'black',
				lineWidth: 1,
			});
			hoverPin = false;
			myDetails.visibility = false;
		}
	};

	//event listener - changing graphs
	changeGraph = function(e) {
		var tempLabel = myGraphs.getSpriteAt(here),
			k, kz;
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}
		if (tempLabel) {
			currentCategory = tempLabel.name;
			background.source = currentCategory;
			myTitle.set({
				text: titles[currentCategory],
			});
			for (k = 1; k < 5; k++) {
				yLabel[k].set({
					text: addCommas(Math.floor(gridMax[currentCategory] * (k * 0.25))),
				});
			}
			for (k = 0, kz = years.length; k < kz; k++) {
				crimeYear[years[k]].pin.set({
					currentY: crimeYear[years[k]].getYScale(currentCategory, gridMax[currentCategory]) + graphY,
				});
			}
		}
	};
	myCanvas.addEventListener('mouseup', changeGraph, false);

	//animation object
	scrawl.newAnimation({
		fn: function() {
			here = myPad.getMouse();
			checkGraphLabels();
			checkPins();
			if (hoverLabel) {
				myCanvas.style.cursor = 'pointer';
			}
			else if (hoverPin) {
				myCanvas.style.cursor = 'help';
			}
			else {
				myCanvas.style.cursor = 'default';
			}
			scrawl.render();

			testNow = Date.now();
			testTime = testNow - testTicker;
			testTicker = testNow;
			testMessage.innerHTML = 'Milliseconds per screen refresh: ' + Math.ceil(testTime) + '; fps: ' + Math.floor(1000 / testTime);
		},
	});
};

scrawl.loadModules({
	path: '../source/',
	minified: false,
	modules: ['phrase', 'block', 'images', 'shape', 'path', 'wheel', 'animation'],
	callback: function() {
		window.addEventListener('load', function() {
			scrawl.init();
			mycode();
		}, false);
	},
});
