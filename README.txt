/***********************************************************************************
* SCRAWL.JS Library 
* SCRAWL+STACK.JS Library 
*
*	version 0.302 - 31 August 2013
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
A JavaScript library which adds an API for handling and manipulating 
HTML5 <canvas> elements in the DOM.

Uses the '2d' context with each canvas element.

On starting, Scrawl.js investigates the HTML DOM and automatically 
creates controller and wrapper objects for each <canvas> element it finds.

Can also generate visible canvas elements programatically, and add them 
to the DOM.

Users create sprite and gradient objects using scrawl factory functions, 
set their styling and position, and render them onto the canvas element. 
Creation, positioning and styling can all be handled by a single call to 
the factory function.

Sprites include: basic rectangles (Block), advanced rectangles capable of 
displaying images and sprite animations (Picture), circles (Wheel), 
single-line text (Phrase), and complex designs composed of lines, arcs 
and curves (Shape).

Factory functions can be used to easily create lines, curves and regular 
shapes (triangles, stars, etc).

JPG, PNG and SVG images (and videos - experimental) can be imported and 
used by Picture sprites.

Animations can be achieved by manipulating a sprite/gradient's attributes 
within a user-coded animation loop.

Scrawl.js supports all canvas 2d matrix transforms (translate, rotate, 
etc), though moving and rotating sprites is handled directly by the 
sprite object itself.

All sprites - and even gradients - can be given drag-and-drop and 
attach-to-mouse functionality.

Scrawl sprites can be grouped together for easier manipulation.

Sprites can also be linked together directly (using their pivot 
attribute) so that positioning/moving one sprite will position/move all 
other sprites associated with it.

Full support for collision detection between, and within, sprites 
gathered into groups. Collision fields can be generated for canvas 
elements to constrain sprite movements.

A visible canvas can be linked to additional (non-DOM/invisible) canvases 
to create complex, multi-layered displays; these additional canvases can 
also be manipulated for animation purposes.

Canvas rendering can be simple, or it can be broken down into clear, 
compile and show operations for more complex compositions.

Includes functionality (using scrawl+stack.js) to manipulate 
multiple visible canvas elements in 3 dimensions using CSS 3d transforms 
- where supported by the browser.

Other DOM elements - including SVG images - can be included in Scrawl 
stacks, and manipulated via Scrawl.js functionality. 

Canvases and elements in a Scrawl.js stack (including other stacks) can 
be moved and scaled very easily.

(Does not add canvas functionality to those browsers that do not support 
the HTML5 <canvas> element. Tested in: IE9 and 10, and modern versions of 
Firefox, Chrome, Opera, Safari for Windows.)

http://scrawl.rikweb.org.uk/


B. DEVELOPMENT
------------------------------------------------------------------------------------
VERSION 0.302 released 31 August 2013

    - the zip file includes:
	
		- scrawl.js (172kb)
		- scrawl-min.js (140kb)
		
		- scrawl+stack.js (198kb)
		- scrawl+stack-min.js (162kb)
		
		- documentation.txt
		- changelog.txt
		- README.txt (this file)

Documentation can be found in a text file (imaginatively) called 'documentation.txt'. 
There's also a fair amount of documentation in the tutorial page on the website:
http://scrawl.rikweb.org.uk/tutorial.html

I'm keeping track of daily changes, bug fixes and additions to the libraries in a text 
file called 'changelog.txt'

All versions of scrawl.js and scrawl+stack.js can be found on their SourceForge page: 
https://sourceforge.net/projects/scrawljs/

There's also a discussion page for Scrawl.js on the SourceForge website. Please post all
questions, suggestions and critiques of Scrawl.js to that page:
https://sourceforge.net/p/scrawljs/discussion/


C. VERSIONS
------------------------------------------------------------------------------------

Version 0.302 uploaded 31 August 2013
Version 0.301 uploaded 28 August 2013
VERSION 0.300 uploaded 20 August 2013

Version 0.208(beta) uploaded 1 August 2013
Version 0.207(beta) uploaded 31 July 2013
Version 0.206(beta) uploaded 31 July 2013
Version 0.205(beta) uploaded 12 July 2013
Version 0.204(beta) uploaded 10 June 2013
Version 0.203(beta) uploaded 3 June 2013
Version 0.202(beta) uploaded 28 May 2013
Version 0.201(beta) uploaded 26 May 2013
VERSION 0.200(beta) uploaded 21 May 2013

Version 0.021(beta) uploaded 8 May 2013
Version 0.0203(beta) uploaded 5 May 2013
Version 0.0202(beta) uploaded 2 May 2013
Version 0.0201(beta) uploaded 29 April 2013
VERSION 0.02(beta) uploaded 27 April 2013

Version 0.013(beta) uploaded 23 April 2013
Version 0.0123(beta) uploaded 19 April 2013
Version 0.0122(beta) uploaded 17 April 2013
Version 0.0121(beta) uploaded 16 April 2013
Version 0.012(beta) uploaded 14 April 2013
Version 0.011(beta) uploaded 12 April 2013
Version 0.0105(beta) uploaded 9 April 2013
Version 0.0104(beta) uploaded 8 April 2013
Version 0.0103(beta) uploaded 6 April 2013
Version 0.0102(beta) uploaded 5 April 2013
Version 0.0101(beta) uploaded 4 April 2013
VERSION 0.01(beta) uploaded 30 March 2013

Version 0.0051(alpha) uploaded 28 March 2013
Version 0.005(alpha) uploaded 25 March 2013
Version 0.0044(alpha) uploaded 22 March 2013
Version 0.0043(alpha) uploaded 21 March 2013
Version 0.0042(alpha) uploaded 20 March 2013
Version 0.0041(alpha) uploaded 18 March 2013
Version 0.004(alpha) uploaded 16 March 2013
Version 0.0031(alpha) uploaded 9 March 2013
Version 0.003(alpha) uploaded 7 March 2013
Version 0.002(alpha) uploaded 5 March 2013
