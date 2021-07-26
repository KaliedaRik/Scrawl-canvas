// # Demo Snippets 004
// Snippets included in the Scrawl-canvas demo/snippets folder
//
// Related files:
// + [Snippets included in the Scrawl-canvas demo/snippets folder](../snippets-004.html)
// + [Animated hover gradient snippet](./animated-hover-gradient-snippet.html)
// + [Animated word gradient snippet](./animated-word-gradient-snippet.html)
// + [Green box snippet](./green-box-snippet.html)
// + [Jazzy button snippet](./jazzy-button-snippet.html)
// + [Page performance snippet](./page-performance-snippet.html)
// + [Pan image snippet](./pan-image-snippet.html)
// + [Placeholder effect snippet](./placeholder-effect-snippet.html)
// + [Ripple effect snippet](./ripple-effect-snippet.html)
// + [Spotlight text snippet](./spotlight-text-snippet.html)
// + [Word highlighter snippet](./word-highlighter-snippet.html)


// ### 'Pan image' snippet
//
// __Purpose:__ Displays a pan effect on an image, where users can click and drag the image to explore it
//
// __Function input:__ 
// + the DOM element - a block element - usually a &lt;div> element - containing one or more &lt;img> elements
//
// __Function output:__ a Javascript object will be returned, containing the following attributes
// ```
// {
//     element     // the Scrawl-canvas wrapper for the DOM element supplied to the function
//     canvas      // the Scrawl-canvas wrapper for the snippet's canvas
//     animation   // the Scrawl-canvas animation object
//     demolish    // remove the snippet from the Scrawl-canvas library
// }
// ```
// ##### Usage example:
// ```
// import panImage from './relative/or/absolute/path/to/this/file.js';
//
// let myElements = document.querySelectorAll('.some-class');
//
// myElements.forEach(el => panImage(el));
// ```


// Import the Scrawl-canvas object 
// + there's various ways to do this. See [Demo DOM-001](../dom-001.html) for more details
import scrawl from '../../source/scrawl.js';

// Get Scrawl-canvas to recognise and act on device pixel ratios greater than 1
scrawl.setIgnorePixelRatio(false);


// __Effects on the element:__ 
// + Sets the element background to `transparent`
// + Imports any &lt;img> elements it finds in the element, switching their display styling to 'none'
export default function (el) {

    // Apply the snippet to the DOM element
    let snippet = scrawl.makeSnippet({
        domElement: el,
    });

    if (snippet) {

        // Set some convenience variables
        let canvas = snippet.canvas,
            animation = snippet.animation,
            group = canvas.base.name,
            name = snippet.element.name;

        // Set the DOM element's background color to transparent so we can see the new canvas
        el.style.backgroundColor = 'transparent';

        // Grab all the child &lt;img> elements 
        let images = el.querySelectorAll('img'),
            imgName = `${name}-image`;

        // If the coder gave the DOM element a sane id attribute value then all our names will be sensible names. If not, then Scrawl-canvas will have computer-generated an id for the element. These generated names often include characters that do not sit well with the CSS/JS querySelector string requirements. So we have to make the name safe to be used as a search string
        imgName = imgName.replace('.', '');

        // Update all the &lt;img> elements we found. In particular:
        // + add the name to the element's class
        // + set the indexed name as the element's id value
        // + set the element's display styling attrinute to 'none' - we don't weant it displaying in the DOM, we need it to display in the new canvas
        images.forEach((img, index) => {

            let classes = img.getAttribute('class')

            if (!classes) classes = '';
            classes += ` ${imgName}`;

            img.setAttribute('class', classes);
            img.id = `${imgName}-${index}`;

            img.style.display = 'none';
        });

        // Import all the images we found into Scrawl-canvas
        scrawl.importDomImage(`.${imgName}`);

        // Configuration - coders can set 'data-x' and 'data-y' attributes on the DOM element to indicate which area of the image should be displayed in the new canvas when the page first loads
        let copyStartX = el.dataset.x || 0,
            copyStartY = el.dataset.y || 0;

        // We will display the first image we found in a Picture entity
        let [w, h] = canvas.get('dimensions');

        const asset = scrawl.library.asset[`${imgName}-0`];

        const panImage = scrawl.makePicture({

            name: `${imgName}-panimage`,
            group,
            asset,
            width: w,
            height: h,

            copyWidth: w,
            copyHeight: h,
            copyStartX,
            copyStartY,
        });

        let cursor = 'grab',
            lastX = 0,
            lastY = 0,
            aspectWidth = 1,
            aspectHeight = 1;

        // The pan effect, where the user can click and drag the image within its container to explore large images in small areas. To achieve the effect we split the functionality across three separate event listeners, which capture the three key actions associated with the effect: starting a drag; continuing a drag; and ending a drag.
        scrawl.addListener('down', (e) => {

            let here = canvas.here;

            if (here.active && 'grab' === cursor) {

                cursor = 'grabbing';
                el.style.cursor = cursor;

                let {x, y} = here;

                lastX = x;
                lastY = y;
            }
        }, el);

        scrawl.addListener('move', (e) => {

            if ('grabbing' === cursor) {

                let {x, y} = canvas.here;

                let dx = lastX - x,
                    dy = lastY - y;

                panImage.setDelta({
                    copyStartX: dx * aspectWidth,
                    copyStartY: dy * aspectHeight,
                });

                lastX = x;
                lastY = y;
             }
        }, el);

        scrawl.addListener(['up', 'leave'], (e) => {

            if ('grabbing' === cursor) {

                cursor = 'grab';
                el.style.cursor = cursor;

                let {x, y} = canvas.here;

                let dx = lastX - x,
                    dy = lastY - y;

                panImage.setDelta({
                    copyStartX: dx * aspectWidth,
                    copyStartY: dy * aspectHeight,
                });

                lastX = 0;
                lastY = 0;
            }
        }, el);

        // We're checking dimensions here partly because images load asynchronously and during the early part of that process their &lt;img> elements will supply incorrect information to the script which is trying to set up the canvas element which will (eventually) host their image data. But we also need to check because the script has no way of knowing what sort of image it is dealing with - for instance an &lt;img> element with a "srcset" attribute will load new images if the user decides to expand their browser's window - which would have an impact on the assumptions we make in our scaling and dragging calculations.
        const checkDimensions = function () {

            let [canvasWidth, canvasHeight] = canvas.get('dimensions');
            let [imageWidth, imageHeight] = panImage.get('dimensions');

            // check to see if there's been any resize browser resize or CSS layout change that affects our DOM element
            if (canvasWidth !== imageWidth || canvasHeight !== imageHeight) {

                let [sourceWidth, sourceHeight] = panImage.get('sourceDimensions');
    
                // We want the image we paint in our canvas to keep its asset's original aspect ratio
                aspectWidth = canvasWidth / sourceWidth;
                aspectHeight = canvasHeight / sourceHeight;

                // We want the zoom level to be x3 (along the width) with respect to the DOM element's dimensions
                let setToHalfWidth = 50 / (aspectWidth * 100);

                let ratioWidth = aspectWidth * setToHalfWidth * 100,
                    ratioHeight = aspectHeight * setToHalfWidth * 100;

                panImage.set({
                    width: canvasWidth,
                    height: canvasHeight,
                    copyWidth: ratioWidth + '%',
                    copyHeight: ratioHeight + '%',
                });
            }
        };

        // Invoke our 'checkDimensions' function at the start of every Display cycle
        animation.set({
            commence: checkDimensions,
        });
    }

    // Return the snippet, so coders can access the snippet's parts - in case they need to tweak the output to meet the web page's specific requirements
    return snippet;
};
