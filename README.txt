/***********************************************************************************
* SCRAWL-CANVAS Library 
*
*	version 8.0.0 - ????? 2019
*	Developed by Rik Roots - rik.roots@gmail.com, rik@rikweb.org.uk
*
*   Scrawl demo website: http://scrawl.rikweb.org.uk
*
***********************************************************************************/

NOTES for V8-alpha: 

- No longer supports IE browsers

- Modular code pattern with import/export - no need to worry about loading js files anymore
- Using Promises throughout the codebase!
- Using String templates (`backticks`)
- Using Javascript Sets (but not yet convinced it's necessary)

- using web workers where it makes sense (goes with the Promises stuff)
	- specifically for filters work
	- need to figure out where else they can offer speed gains to the code
	- worker code is modular - should be able to use import statements

- Look at using HTMLImageElement.decode() method - promise-based! - https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode
- Need to be a little less haphazard about DOM <picture> elements
- Code around DOM <video> elements needs to be more robust

- Using Path2D API where possible - though means having to deal with Edge incompatibilities
- Want to make use of Offscreen Canvases where possible - https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas (currently only Chrome/Opera)

- For canvasRenderingContext2D - https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D - make sure:
	- use getLineDash and setLineDash functions for strokes
	- fills - most browsers support winding now - note additional use with Path2D - https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fill
	- canvas text now has a 'direction' attribute - barely supported, so ignore
	- GCO (may) support more options - removed tests for all things GCO as it's a Stairway to Hell
	- CSS filters are supported by Chrome - probably best to ignore for now as won't be as good as Scrawl existing filter stuff

- the TextMetrics API doesn't look like it'll land anytime soon - so ignore

- Ignoring the ImageBitmap API - Edge and Safari lack it - https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap

/***********************************************************************************/

A. Purpose
B. Development
C. Versions


A. PURPOSE AND FEATURES
------------------------------------------------------------------------------------
Scrawl-canvas is  JavaScript library which adds an API for handling and manipulating 
HTML5 <canvas> elements in the DOM.

[TODO: rewrite the 'Boasts' section]

http://scrawl.rikweb.org.uk/


B. DEVELOPMENT
------------------------------------------------------------------------------------
VERSION 8.0.0 - in development: uploaded to GitHub only as an alpha


VERSION 7.0.0 released 26 June 2017

    - the v7.0.0 zip file includes:
		
		Production:
		- scrawlCore-min.js (82kb)
		- scrawlAnimation-min.js (29kb)
		- scrawlBlock-min.js (4kb)
		- scrawlCollisions-min.js (11kb)
		- scrawlColor-min.js (7kb)
		- scrawlFrame-min.js (20kb)
		- scrawlImageLoad-min.js (9kb)
		- scrawlImages-min.js (40kb)
		- scrawlMultiFilters-min.js (12kb)
		- scrawlPath-min.js (24kb)
		- scrawlPathFactories-min.js (8kb)
		- scrawlPhrase-min.js (13kb)
		- scrawlPhysics-min.js (10kb)
		- scrawlQuaternion-min.js (6kb)
		- scrawlSaveLoad-min.js (9kb)
		- scrawlShape-min.js (9kb)
		- scrawlStacks-min.js (50kb)
		- scrawlWheel-min.js (7kb)

		Development:
		- scrawlCore.js (238kb)
		- scrawlAnimation.js (79kb)
		- scrawlBlock.js (11kb)
		- scrawlCollisions.js (29kb)
		- scrawlColor.js (18kb)
		- scrawlFrame (65kb)
		- scrawlImageLoad.js (30kb)
		- scrawlImages.js (68kb)
		- scrawlMultiFilters.js (31kb)
		- scrawlPath.js (67kb)
		- scrawlPathFactories.js (24kb)
		- scrawlPhrase.js (39kb)
		- scrawlPhysics.js (26kb)
		- scrawlQuaternion.js (18kb)
		- scrawlSaveLoad.js (18kb)
		- scrawlShape.js (25kb)
		- scrawlStacks.js (116kb)
		- scrawlWheel.js (19kb)

		Documentation:
		- changelog.txt
		- README.txt (this file)

scrawl-canvas is also available for forking from GitHub: 
https://github.com/KaliedaRik/Scrawl-canvas

There's discussion pages for Scrawl-canvas on the GitHub website. 
Please post all questions, suggestions and critiques of Scrawl-canvas to 
those pages:
https://github.com/KaliedaRik/Scrawl-canvas/pulls

(I no longer update the version of scrawl on SourceForge - too much work)

If I don't answer, nudge me by email: rik.roots@gmail.com

C. VERSIONS
------------------------------------------------------------------------------------
VERSION 8.0.0 first uploaded (to GitHub v8-alpha branch) 28 March 2019
	- v8 will be a complete rewrite of the Scrawl-canvas library
		- to bring it into line with 2019 coding patterns and standards

VERSION 7.0.0 uploaded (to GitHub develop branch) 26 June 2017
	- breaking changes to the scrawl filters and color systems
	- improvements and speed enhancements to core functionality

Version 6.0.1 uploaded (to GitHub master branch) 14 January 2017
	- scrawl stacks (and frames) efficiency refactor
	- minor bugfix
VERSION 6.0.0 uploaded 4 January 2017
	- breaking changes to the scrawl tweening system
		- Timeline object deprecated and deleted
		- new Ticker object for handling time sequences
		- Tween object rewritten
		- Action object rewritten
		- All tween convenience functions deprecated and deleted
		- tween-related demos rewritten

Version 5.0.5 uploaded 17 December 2016
	- enhanced tween and timeline functionality
	- minor bugfix
	- updated documentation
Version 5.0.4 uploaded 14 February 2016
	- minor bugfix
	- updated documentation
Version 5.0.3 uploaded 2 December 2015
	- minor bugfix
Version 5.0.2 uploaded 30 November 2015
	- minor bugfix
Version 5.0.1 uploaded 28 November 2015
	- minor bugfix
VERSION 5.0.0 uploaded 26 November 2015
	- major overhaul of library
	- major new functionality including: 
		- emulate 3d perspectives in 2d canvases
		- root-and-branch code efficiency drive
	- this version may break functionality of existing Scrawl-based code

Version 4.3.0 uploaded 19 July 2015
	- updated video loading functionality
	- revamped Timeline and Tween functionality
	- added functionality tests for canvas and video support
	- added 'viewport' functionality to emulate CSS 'position:fixed' in stacks
	- various bugfixes 
Version 4.2.2 uploaded 28 June 2015
	- minor bugfixes
Version 4.2.1 uploaded 4 May 2015
	- nomenclature change: 'module' becomes 'extension'
	- scrawl.loadModules() deprecated in favour of scrawl.loadExtensions()
	- minor bugfixes
Version 4.2.0 uploaded 29 March 2015
	- work to further integrate stacks, canvases, entitys and elements
		- new elementGroup object
	- overhaul events
		- new scrawl functions: 
			- addListener(), removeListener() 
			- addNativeListener(), removeNativeListener()
		- mouse, touch and pointer events now combined
			- demos reweritten to take account of touch/pointer events
Version 4.1.0 uploaded 25 January 2015
	- added timeline functionality
	- numerous small bugfixes following release of version 4
VERSION 4.0.0 uploaded 7 January 2015
	- major overhaul of library
	- major new functionality including: 
		- ability to position anything using % strings
		- tweens now accept numeric strings of percent and other units
		- new filters
	- this version breaks functionality of previous versions in many different ways
		- complete rethink of scrawl nomenclature and object attributes

Version 3.1.7 uploaded 5 August 2014
	- all sourcefiles linted and beautified
Version 3.1.6 uploaded 3 August 2014
	- (released in error - learning to use github via command line)
Version 3.1.5 uploaded 30 July 2014
	- bugfixes for element positioning within a scrawl stack
	- added ability to order animations
Version 3.1.4 uploaded 7 July 2014
	- included MIT licence text in all source files
	- added a bower.json file to the distribution
Version 3.1.3 uploaded 9 May 2014
	- minor bug fix - using Phrase entitys in tween animations
Version 3.1.2 uploaded 9 May 2014
	- improvements to check hitting and mouse position functions
Version 3.1.1 uploaded 30 April 2014
	- added callback functionality to animation tweens
	- minor bug fix: wheel checkHit()
Version 3.1.0 uploaded 22 April 2014
	- extended filters to include entitys
	- improved stack handling
	- improved memory management
VERSION 3.0.0 uploaded 5 April 2014
	- modularized the entire library
	- added functionality to allow for asynchronous loading of modules
	- added tween animations

Version 2.02 uploaded 18 March 2014
	- added CORS functionality to Picture and ScrawlImage objects
Version 2.01 uploaded 17 March 2014
	- added filters
	- fixed some minor bugs
VERSION 2.00 uploaded 2 March 2014

Previous versions are NOT compatible with version 2.00+
	Version 1.04 uploaded 29 November 2013
	Version 1.03 uploaded 28 November 2013
	Version 1.02 uploaded 24 November 2013
	Version 1.01 uploaded 6 November 2013
	VERSION 1.00 uploaded 30 October 2013

	version 0.300 uploaded 20 August 2013
	version 0.200(beta) uploaded 21 May 2013
	version 0.02(beta) uploaded 27 April 2013
	version 0.01(beta) uploaded 30 March 2013
	version 0.002(alpha) uploaded 5 March 2013

