/***********************************************************************************
* SCRAWL.JS Library 
*
*	version 1.03 - 28 November 2013
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

It uses the ’2d’ context with each canvas element.

On starting, Scrawl.js investigates the HTML DOM and automatically creates controller 
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
a user-coded animation loop.

Scrawl.js supports all canvas 2d matrix transforms (translate, rotate, etc), though 
moving and rotating sprites is handled directly by the sprite object itself.

All sprites – and even gradients – can be given drag-and-drop and attach-to-mouse 
functionality.

Scrawl sprites can be gathered into groups for easier manipulation.

Sprites can also be linked together directly (using their pivot attribute) so that 
positioning/moving one sprite will position/move all other sprites associated with it.

Sprites can also be animated along paths.

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
VERSION 1.03 released 28 November 2013

    - the zip file includes:
	
		- scrawl.js (279kb)
			- will gzip to ~45kb
		- scrawl-min.js (172kb)
			- will gzip to ~37kb
		
		- documentation.txt
		- changelog.txt
		- README.txt (this file)

Documentation can be found in a text file (imaginatively) called 'documentation.txt'. 
There's also a fair amount of documentation in the tutorial page on the website:
http://scrawl.rikweb.org.uk/tutorial.html

Proper inline documentation (for developers) coming soon ...

I'm currently keeping track of daily changes, bug fixes and additions to the libraries in a text 
file called 'changelog.txt'

All versions of scrawl.js can be found on their SourceForge page: 
https://sourceforge.net/projects/scrawljs/

scrawl.js is also available for forking from GitHub: 
https://github.com/KaliedaRik/Scrawl.js

There's discussion pages for Scrawl.js on both the SourceForge and GitHub websites. 
Please post all questions, suggestions and critiques of Scrawl.js to those pages:
https://sourceforge.net/p/scrawljs/discussion/
https://github.com/KaliedaRik/Scrawl.js/pulls


C. VERSIONS
------------------------------------------------------------------------------------
Version 1.03 uploaded 28 November 2013
	- added ability for multiple cells to be zoomed simultaneously
	- added more group collision detection functionality
	- added ability for Patterns to use canvas elements as their image sources
	- some minor bug fixes
Version 1.02 uploaded 24 November 2013
	- added ability to delete gradient, pattern and color objects
	- added Cell.zoom method, together with associated Cell object attributes
	- some minor bug fixes
Version 1.01 uploaded 6 November 2013
	- added ability for Picture sprites to upload their images asynchronously
VERSION 1.00 uploaded 30 October 2013

Previous versions are NOT compatible with version 1.00+
	version 0.300 uploaded 20 August 2013
	version 0.200(beta) uploaded 21 May 2013
	version 0.02(beta) uploaded 27 April 2013
	version 0.01(beta) uploaded 30 March 2013
	version 0.002(alpha) uploaded 5 March 2013
