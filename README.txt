/***********************************************************************************
* SCRAWL.JS Library 
*
*	version 3.0.0 - 5 April 2014
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

the library is modular - only load the JavaScript that is needed, nothing more. Scrawl core
is 60kb, much less when gzipped. Modules can be loaded asynchronously, saving load time.

Scrawl uses the ’2d’ context with each canvas element.

On initialization, Scrawl investigates the HTML DOM and automatically creates controller 
and wrapper objects for each <canvas> element it finds.

It can also generate visible canvas elements programatically, and add them to the DOM.

Users create sprite and gradient objects using scrawl factory functions, set their 
styling and position, and render them onto the canvas element. Creation, positioning 
and styling can all be handled by a single call to the factory function.

Sprites include: basic rectangles (Block), advanced rectangles capable of displaying 
images and sprite animations (Picture), circles (Wheel), single-line text (Phrase), 
and complex designs composed of lines, arcs and curves (Outline, Shape).

Factory functions can be used to easily create lines, curves and regular shapes 
(triangles, stars, etc).

JPG, PNG and SVG images (and videos – experimental) can be imported and used by 
Picture sprites.

Animations can be achieved by manipulating a sprite/gradient’s attributes within 
a user-coded animation loop. Scrawl also supports animation tweens, and easing.

All sprites, gradients and cells – can be given drag-and-drop and attach-to-mouse 
functionality.

Scrawl sprites can be gathered into groups for easier manipulation.

Sprites can also be linked together directly (using their pivot attribute) so that 
positioning/moving one sprite will position/move all other sprites associated with it.

All sprites - including text - can be animated along paths.

Scrawl.js has good support for collision detection between, and within, sprites 
gathered into groups. Collision fields can be generated for canvas elements to 
constrain sprite movements.

A visible canvas can be linked to additional (non-DOM/invisible) canvases to create 
complex, multi-layered displays; these additional canvases can also be manipulated 
for animation purposes.

Canvas rendering can be simple, or it can be broken down into clear, compile and show 
operations for more complex compositions.

Scrawl.js includes functionality to manipulate multiple visible canvas elements in 
3 dimensions using CSS 3d transforms – where supported by the browser.

Other DOM elements – including SVG images – can be included in Scrawl stacks, and 
manipulated via Scrawl.js functionality.

Canvases and elements in a Scrawl.js stack (including other stacks) can be moved and 
scaled very easily.

(Does not add canvas functionality to those browsers that do not support 
the HTML5 <canvas> element. Tested in: IE9 and 10, and modern versions of 
Firefox, Chrome, Opera, Safari for Windows.)

http://scrawl.rikweb.org.uk/


B. DEVELOPMENT
------------------------------------------------------------------------------------
VERSION 3.0.0 released 5 April 2014

    - the zip file includes:
		
		Production:
		- scrawlCore-min.js (60kb)
		- scrawlAnimation-min.js (14kb)
		- scrawlBlock-min.js (3kb)
		- scrawlCollisions-min.js (11kb)
		- scrawlColor-min.js (5kb)
		- scrawlFilters-min.js (9kb)
		- scrawlImages-min.js (17kb)
		- scrawlPath-min.js (22kb)
		- scrawlPathFactories-min.js (7kb)
		- scrawlPhrase-min.js (12kb)
		- scrawlPhysics-min.js (9kb)
		- scrawlSaveLoad-min.js (8kb)
		- scrawlShape-min.js (8kb)
		- scrawlStacks-min.js (22kb)
		- scrawlWheel-min.js (5kb)

		Development:
		- scrawlCore.js (188kb)
		- scrawlAnimation.js (40kb)
		- scrawlBlock.js (9kb)
		- scrawlCollisions.js (24kb)
		- scrawlColor.js (13kb)
		- scrawlFilters.js (32kb)
		- scrawlImages.js (56kb)
		- scrawlPath.js (60kb)
		- scrawlPathFactories.js (17kb)
		- scrawlPhrase.js (33kb)
		- scrawlPhysics.js (22kb)
		- scrawlSaveLoad.js (16kb)
		- scrawlShape.js (20kb)
		- scrawlStacks.js (50kb)
		- scrawlWheel.js (14kb)

		Documentation:
		- changelog.txt
		- README.txt (this file)

The latest versions of scrawl.js can be found on their SourceForge page: 
https://sourceforge.net/projects/scrawljs/

scrawl.js is also available for forking from GitHub: 
https://github.com/KaliedaRik/Scrawl.js

There's discussion pages for Scrawl.js on both the SourceForge and GitHub websites. 
Please post all questions, suggestions and critiques of Scrawl.js to those pages:
https://sourceforge.net/p/scrawljs/discussion/
https://github.com/KaliedaRik/Scrawl.js/pulls

If I don't answer, nudge me by email: rik.roots@gmail.com

C. VERSIONS
------------------------------------------------------------------------------------
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
