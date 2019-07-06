# SCRAWL-CANVAS Library 

Version 8.0.0 (alpha) - 5 July 2019

Scrawl-canvas is  JavaScript library which adds an API for handling and manipulating HTML5 &lt;canvas> elements in the DOM.

Developed by Rik Roots: rik.roots@rikworks.co.uk

Scrawl-canvas website: http://scrawl.rikweb.org.uk (currently running on Scrawl-canvas v6)


## NOTES for V8-alpha: 

Recoded from scratch! Modular code pattern with import/export - no need to worry about loading js files anymore

No longer supports IE browsers. Edge support will hopefully come back online later in 2019 once MS releases the new blink/v8 build


### ROADMAP - Summer 2019:

1. Tabbing through portions of the canvas display (DONE)
* Using the tab key on demo Canvas-009 - the anchor links show up (in Chrome on MacOS) and, when then pressing the return button, the relevant link opens in a new browser tab/window.
* I don't think I need to do more than this at the moment. Tabbing should be restricted to things users can do like filling in a form or clicking a button.
* Creating canvas-based forms - we don't need to do this because we can use regular HTML form elements in a Scrawl-canvas stack which, as part of the DOM, should be tabbable in the normal way. We should be able to add canvas-based decoration to form elements by creating entitys and telling them to mimic the form elements ... may be worth creating a form-based demo for testing some subtle canvas animation effects? For example tying onfocus/onblur event listeners to the form elements, which will in turn trigger Scrawl-canvas tweens eg moving an arrow to point to the currently focussed element?

2. Analytics (DONE)
* Adapted demo Canvas-009 to use (development version of) Google Analytics; created a named tracker (to see if I could); and sent GA hits as part of the existing onAction hook functions to measure when mouse cursor starts/ends hovering over a block entity, and when user clicks on the block to open a Wikipedia web page.
* Also added functionality so we can capture canvas-related link clicks performed via assistive technology eg tab/return keystrokes.
* Adapted demo DOM-006 to use (development version of) Google Analytics - extended reporting functionality to tweens and tickers, both directly and via tween actions.

3. Canvas text manipulation (NOT DOING) and accessibility (DONE)
* Adapted demo Canvas-016 to expose the text held in a Phrase entity to the wider DOM, to make it easier to access for people not able to view the canvas element (for whatever reason).
* I dont think there is a need for users to be able to directly copy/paste text from/to Phrase entitys, or to edit text in-place - so I won't consider such interactive text manipulation any further, unless someone can come up with a compelling use case for such functionality to be added to the library.

4. Canvas dynamic generation (adding to page and/or stack), canvas cloning (DONE)
* Canvas generation and takedown done - demo DOM-012 written to test
* Decided against implementing canvas cloning - too much of an edge case.

5. Review processes for dismantling/deleting everything (ONGOING)
* Stack, Canvas, Cell, Group, Element, Tween, Ticker - all seem to dismantle themselves without damaging the Scrawl-canvas environment
* Still need to check entity, asset, styling and various other objects
* Need to review objects (such as Tickers/Tweens) to make sure they don't choke when their target gets removed from Scrawl-canvas

6. Enhance Image/Video functionalities - Picture entity (INITIAL [MVP] WORK DONE)
* Added a scrawl.importMediaStream() function to make adding mediastream input - for example from a webcam or device camera - (relatively) simple. The mediaStream gets routed to a (non-DOM) video element that can then be used as a Picture entity's 'asset' attribute. Includes rudimentary functionality to request various mediadtream resolutions, whether to use front or back camera on a device, and whether to include audio in the mediastream output. Demo canvas-010 updated to test the new functionality.
* TODO: extend mediastream functionality so user can control the mediastream dynamically via a Picture entity using it as its asset.
* Added functionality to 'stash' entity, group and cell visual output (on a once-per-request basis) on the affected Scrawl-canvas object. Demo canvas-020 created to test functionality.
* At the same time (and optionally), the code will generate an &lt;img> element and add it to the DOM, alongside an imageAsset object which can then be used by Picture entitys and Pattern styles.
* TODO: the current code is not perfect: entitys require a slight delay (eg setTimeout) between making a change - such as adding/removing filters and generating the stash capture; also cell behaviour is erratic and needs to be properly debugged. 

7. Touch functionality (INITIAL [MVP] WORK DONE)
* Scrawl-canvas will now track (single finger) touch events, for instance as part of a drag-and-drop action across a stack or canvas element. Tested on all demos with drag-and-drop, or mouse tracking, functionality
* TODO: consider if we need to go further, for example identifying and acting on multiple touch and/or gestures. My current view is that Scrawl-canvas does not need to worry about these, and that they would be much better handled by other JS libraries dedicated to touch functionality - but that does leave the question of how to integrate a 'pinch' gesture into an action to zoom in on a canvas element's contents.

8. Animated sprites (IN PROGRESS)
* to replicate and improve on existing functionality in v7
* maybe see if we can make using sprites similar to using videos?
* consider usefulness of running sprites using existing tween/ticker/action stuff?
* great if we can find a way to easily import and use various spritesheet+manifest bundles generated by 3rd parties

9. Save/Restore functionality 
* in a way that will allow 3rd parties to develop and share stuff easily
* CRITICAL to get this right - can become a USP for the library
* also start thinking about how best to export stuff in a way that makes importing it into React/Vue/etc dead easy
* also an opportunity to think about making an npm repository, and how the library code can be included in toolchains eg WebPack?

10. I want to add in some simple-to-use zoom and (parallax) scrolling capability
* because v7 can do this and I don't want to lose it

11. Develop Frame artefact
* this is the four-corners approach used in v7 Frames
* but this time make it even better!

12. Develop Loom artefact
* using 2 Shape objects as left/right or top/bottom paths to allow for more interesting/malleable Frame-like visual fx

13. Develop Net artefact
* effectively grouping a bunch of Frames together, sharing a single asset, batch-processing the output
* this is gonna be a helluva lot quicker when we can finally use Canvas elements in web workers - thus can delay this work until later 2019 or after

14. Think about developing a Grid artefact (eg for demos DOM-013, Canvas-019)
* because the current solution is painfully slow once we get a lot of entity tiles onto the canvas

15. Physics engine
* because it's in v7 and I don't wanna lose it
* though tbh it isn't that important
* one (different) approach might be to add to the 'delta animation' functionality already built in?
* having particles and springs would make the Net artefact a lot more interesting eg v7 physics net demo 

16. Displacement map filter-like functionality
* just for the challenge of it

17. SVG as an asset (NOT TAKING FORWARD)
* Coded up functionality to transform DOM SVG markup into an SvgAsset, which could then be used by Picture entity. While we can do this ok for static SVG, any mistakes in the SVG markup breaks the system. Also, no way to show SVG animations in the canvas in real time
* This is too much of an edge case to be worth any more effort. SVG elements can already be used in Scrawl-canvas stacks, and we should be able to position and manipulate them in the same ways as any other Element artefact. Demo DOM-003 updated to test importing SVG elements into stacks.


### Roadmap - further ahead:

* Look at using HTMLImageElement.decode() method - promise-based! - https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode

* Want to make use of Offscreen Canvases where possible - https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas (currently only Chrome/Opera)


## DEVELOPMENT

To get the library running locally (for development), just clone it into a project folder somewhere on your local

No development toolchain. Code needs to be legible and well formatted. Function names, arguments, attributes etc need to be given meaningful names, etc.

Testing is via the demos. To run the demos, cd into the project folder and run __http-server__, then navigate to (eg) http://localhost:8080/demo/index.html - note that caching should be switched off in the browsers developer console; everything gets loaded as modules and browsers will do whatever they can to download modules just once.


### Current and previous versions

VERSION 8.0.0 alpha (in development)
* GitHub branch: v8-alpha


VERSION 7.0.0 released 26 June 2017
* GitHub branches: v7, develop
* Breaking changes to the scrawl filters and color systems
* Improvements and speed enhancements to core functionality


VERSION 6.0.1 released 14 January 2017
* GitHub branches: v6, master
* Breaking changes to the scrawl tweening system

Older versions
* v6.0.0 uploaded 4 January 2017

* v5.0.5 uploaded 17 December 2016
* v5.0.4 uploaded 14 February 2016
* v5.0.3 uploaded 2 December 2015
* v5.0.2 uploaded 30 November 2015
* v5.0.1 uploaded 28 November 2015
* v5.0.0 uploaded 26 November 2015

* v4.3.0 uploaded 19 July 2015
* v4.2.2 uploaded 28 June 2015
* v4.2.1 uploaded 4 May 2015
* v4.2.0 uploaded 29 March 2015
* v4.1.0 uploaded 25 January 2015
* v4.0.0 uploaded 7 January 2015

* v3.1.7 uploaded 5 August 2014
* v3.1.6 uploaded 3 August 2014
* v3.1.5 uploaded 30 July 2014
* v3.1.4 uploaded 7 July 2014
* v3.1.3 uploaded 9 May 2014
* v3.1.2 uploaded 9 May 2014
* v3.1.1 uploaded 30 April 2014
* v3.1.0 uploaded 22 April 2014
* v3.0.0 uploaded 5 April 2014

* v2.02 uploaded 18 March 2014
* v2.01 uploaded 17 March 2014
* v2.00 uploaded 2 March 2014

* v1.04 uploaded 29 November 2013
* v1.03 uploaded 28 November 2013
* v1.02 uploaded 24 November 2013
* v1.01 uploaded 6 November 2013
* v1.00 uploaded 30 October 2013

* v0.300 uploaded 20 August 2013
* v0.200(beta) uploaded 21 May 2013
* v0.02(beta) uploaded 27 April 2013
* v0.01(beta) uploaded 30 March 2013
* v0.002(alpha) uploaded 5 March 2013

