/***********************************************************************************
* SCRAWL-CANVAS Library 
*
*	version 8.0.0 - ????? 2019
*	Developed by Rik Roots - rik.roots@gmail.com, rik@rikweb.org.uk
*
*   Scrawl demo website: http://scrawl.rikweb.org.uk
*
***********************************************************************************/

NOTES: 
- No longer supporting IE browsers

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


