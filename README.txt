/***********************************************************************************
* SCRAWL.JS Library 
*
*	version 5.0.0 - 24 November 2015
*	Developed by Rik Roots - rik.roots@gmail.com, rik@rikweb.org.uk
*
*   Scrawl demo website: http://scrawl.rikweb.org.uk
*
***********************************************************************************/

A. Purpose
B. Development
C. Versions


A. PURPOSE AND FEATURES
------------------------------------------------------------------------------------
Scrawl.js is  JavaScript library which adds an API for handling and manipulating 
HTML5 <canvas> elements in the DOM.

The library is extendable - only load the JavaScript that is needed, nothing more. Scrawl core
is 78kb, much less when gzipped. Extensions can be loaded asynchronously, saving load time.

Scrawl uses the ’2d’ context with each canvas element.

On initialization, Scrawl investigates the HTML DOM and automatically creates controller 
and wrapper objects for each <canvas> element it finds.

It can also generate visible canvas elements programatically, and add them to the DOM.

Users create entity and gradient objects using scrawl factory functions, set their 
styling and position, and render them onto the canvas element. Creation, positioning 
and styling can all be handled by a single call to the factory function.

Entitys include: basic rectangles (Block), advanced rectangles capable of displaying 
images and entity animations (Picture), circles (Wheel), multi-line text (Phrase), 
and complex designs composed of lines, arcs and curves (Path, Shape).

Factory functions can be used to easily create lines, curves and regular shapes 
(triangles, stars, etc).

JPG, PNG and SVG images (and videos – experimental) can be imported and used by 
Picture entitys and Patterns

Animations can be achieved by manipulating a entity/gradient’s attributes within 
a user-coded animation loop. Scrawl also supports animation timelines, tweens, and 
easing.

All entitys, gradients and cells can be given drag-and-drop and attach-to-mouse 
functionality.

Scrawl entitys can be gathered into groups for easier manipulation.

Entitys can also be linked together directly (using their pivot attribute) so that 
positioning/moving one entity will position/move all other entitys associated with it.

All entitys - including text - can be animated along paths.

Scrawl-canvas has good support for collision detection between, and within, entitys 
gathered into groups. Collision fields can be generated for canvas elements to 
constrain entity movements.

A visible canvas can be linked to additional (non-DOM/invisible) canvases to create 
complex, multi-layered displays; these additional canvases can also be manipulated 
for animation purposes.

Canvas rendering can be simple, or it can be broken down into clear, compile and show 
operations for more complex compositions.

Scrawl-canvas includes functionality to manipulate multiple visible canvas elements in 
3 dimensions using CSS 3d transforms – where supported by the browser.

Other DOM elements – including SVG images – can be included in Scrawl stacks, and 
manipulated via Scrawl.js functionality.

Canvases and elements in a Scrawl.js stack (including other stacks) can be moved and 
scaled very easily. DOM elements can be pivoted to each other and to canvas cells and
entitys - and vice-versa.

Does not add canvas functionality to those browsers that do not support 
the HTML5 <canvas> element. Tested in: IE11, and modern versions of 
Firefox, Chrome, Opera.

http://scrawl.rikweb.org.uk/


B. DEVELOPMENT
------------------------------------------------------------------------------------
VERSION 5.0.0 released 24 November 2015

    - the zip file includes:
		
		Production:
		- scrawlCore-min.js (77kb)
		- scrawlAnimation-min.js (25kb)
		- scrawlBlock-min.js (5kb)
		- scrawlCollisions-min.js (11kb)
		- scrawlColor-min.js (5kb)
		- scrawlFilters-min.js (25kb)
		- scrawlFrame-min.js (19kb)
		- scrawlImageLoad-min.js (9kb)
		- scrawlImages-min.js (39kb)
		- scrawlPath-min.js (24kb)
		- scrawlPathFactories-min.js (9kb)
		- scrawlPhrase-min.js (13kb)
		- scrawlPhysics-min.js (9kb)
		- scrawlQuaternion-min.js (6kb)
		- scrawlSaveLoad-min.js (9kb)
		- scrawlShape-min.js (9kb)
		- scrawlStacks-min.js (48kb)
		- scrawlWheel-min.js (6kb)

		Development:
		- scrawlCore.js (229kb)
		- scrawlAnimation.js (70kb)
		- scrawlBlock.js (15kb)
		- scrawlCollisions.js (30kb)
		- scrawlColor.js (16kb)
		- scrawlFilters.js (69kb)
		- scrawlFrame (39kb)
		- scrawlImageLoad.js (26kb)
		- scrawlImages.js (68kb)
		- scrawlPath.js (69kb)
		- scrawlPathFactories.js (25kb)
		- scrawlPhrase.js (40kb)
		- scrawlPhysics.js (26kb)
		- scrawlQuaternion.js (18kb)
		- scrawlSaveLoad.js (18kb)
		- scrawlShape.js (27kb)
		- scrawlStacks.js (115kb)
		- scrawlWheel.js (19kb)

		Documentation:
		- changelog.txt
		- README.txt (this file)

scrawl-canvas is also available for forking from GitHub: 
https://github.com/KaliedaRik/Scrawl-canvas

There's discussion pages for Scrawl.js on the GitHub website. 
Please post all questions, suggestions and critiques of Scrawl.js to those pages:
https://github.com/KaliedaRik/Scrawl-canvas/pulls

(I no longer update the version of scrawl on SourceForge - too much work)

If I don't answer, nudge me by email: rik.roots@gmail.com

C. VERSIONS
------------------------------------------------------------------------------------
VERSION 5.0.0 uploaded 24 November 2015
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
