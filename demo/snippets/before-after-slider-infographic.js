// # Demo Snippets 005
// Create a responsive, interactive and accessible before/after slider infographic
//
// Related files:
// + [Slider infographic snippet - main module](../snippets-005.html)

// ### 'Before-after slider infographic' snippet
// __Purpose:__ Turn a pair of images, alongside associated data, into a fully responsive, interactive and accessible before-after slider infographic
//
// Note that this is a highly complex snippet, which relies on recieving an element to process in a very specific format containing a number of required child elements. All elements are expected to have various specified data- attributes which are used to build the infographic.
//
// __Function input:__ 
// ```
// <div 
//   id="infographic-unique name"
//   class="some-class-name"
//   data-label="Infographic title - required for accessibility"
//   data-description="Infographic description - required for accessibility">
//   
//   <div 
//     id="left-panel-unique-name"
//       data-date="date of image"
//     data-frame="left">
//
//     <img 
//       id="left-panel-image-unique-name"
//       alt="Alternative text for image - required for accessibility" 
//       src="path/to/image/url" />
// 
//     <!--
//       Each &lt;p> element needs an id value together with some data- attributes
//
//         - data-type="pin" - required (no default value)
//           - for proof of concept we're only handling spot pins, not area pins
//
//         - data-position - required (no default value)
//           - a string of two percentage values, separated by a comma 
//           - these are the 'x%, y%' coords where the pin will appear on image
//
//         - data-fill - pin fill color - default is "red"
//         - data-stroke - pin stroke color - default is "yellow"
//         - data-labelwidth - percentage label width value - default is "20%"
//         - data-labelbackground - default is "rgb(0 0 0 / 0.2)"
//
//         - data-labelposition - default is "below"
//           - where we want the text to appear relative to the pin's location 
//           - acceptable values: "left", "right", "above", "below"
//
//         - data-shared - default is not included
//           - if included, we create the pin on both panels
//
//       The text in the <p> element is the text that will be used for the pin's 
//       label. Note that the snippet has been set up to interpret and display 
//       the following inline markup: 
//         - <b></b>, <strong></strong>, <i></i>, <em></em>
//         - <span class="sc-red"></span>, etc
//     -->
//
//     <p 
//       id="pin-unique-id" 
//       data-type="pin" 
//       data-position="59%, 21%" 
//       data-fill="blue",
//       data-stroke="yellow",
//       data-labelwidth="30%"
//       data-labelposition="left"
//       data-labelbackground="azure"
//       data-shared>Text <span class="sc-red">appears</span> when user <strong>hovers</strong> over pin</p>
//
//   </div>
//
//   <div 
//     id="right-panel-unique-name"
//       data-date="date of image"
//     data-frame="right">
//
//     <img 
//       id="right-panel-image-unique-name"
//       alt="Alternative text for image - required for accessibility" 
//       src="path/to/image/url" />
//
//     <p>...Pin definitions</p>
//
//   </div>
//
//   <!--
//     If we also want to include any clickable links in the infographic, 
//     we can include them in a &lt;nav> element
//       - data-position - required (no default value)
//         - a string of two percentage values, separated by a comma 
//         - these are the 'x%, y%' coords where the link will appear over image
//
//       - data-justify - one of: "left", "right", "center" (default)
//       - data-width - defaults to "20%"
//       - data-background - defaults to "rgb(0 0 0 / 0.2)" 
//   -->
//
//   <nav>
//     <a 
//       id="link-unique-id" 
//       href="https://absolute/link/url" 
//       data-position="1%, 95%" 
//       data-width="45%"
//       data-justify="left">Text to include in the link</a>
//
//     <a 
//       id="another-link-unique-id" 
//       href="relative/link/url" 
//       data-position="99%, 95%" 
//       data-width="45%"
//       data-background="darkblue"
//       data-justify="right">Different text for different link</a>
//   </nav>
//
// </div>
// ```

// ##### Usage example:
// ```
// import slider from './relative/or/absolute/path/to/this/file.js';
//
// let myElements = document.querySelectorAll('.some-class-name');
//
// myElements.forEach(el => slider(scrawl, el));
// ```
//
// Note that this snippet has a profound effect on the element it processes, moving images inside a canvas element and deleting most of the child elements (to prevent copy repetition for screen readers)
//
// __Function output:__ 
// ```
// {
//     element           // wrapper
//     canvas            // wrapper
//     animation         // object
//     demolish          // function
// }
// ```
//
// ### Snippet code
// Internal function to scrape data from the supplied element 
const getPanelData = function (el, store, canvas) {

    if (!el) return false;

    const img = el.querySelector('img');

    store.element = el;
    store.name = el.id;
    store.date = el.dataset.date;
    store.imageElement = img;
    store.pinElements = el.querySelectorAll('p');
    store.pins = [];

    store.pinElements.forEach(p => {

        store.pins.push({
            name: p.id,
            groupname: store.name,
            type: p.dataset.type,
            position: p.dataset.position,
            fill: p.dataset.fill || 'red',
            stroke: p.dataset.stroke || 'yellow',
            labelposition: p.dataset.labelposition,
            labelwidth: p.dataset.labelwidth || '25%',
            labelbackground: p.dataset.labelbackground || 'rgb(0 0 0 / 0.2)',
            labeltext: p.innerHTML,
            shared: (p.dataset.shared != null) ? true : false,
        });
    });

    canvas.domElement.appendChild(img);

    return store;
};

// Internal function to scrape data from the supplied element 
const getNavigationData = function (el, store) {

    if (!el) return false;

    store.element = el;
    store.links = [];

    const linkElements = el.querySelectorAll('a');

    linkElements.forEach(a => {
        store.links.push({
            name: a.id,
            href: a.href,
            width: a.dataset.width || '20%',
            position: a.dataset.position,
            background: a.dataset.background || 'rgb(0 0 0 / 0.2)',
            justify: a.dataset.justify || 'center',
            text: a.innerHTML,
        });
    });

    return store;
};

// The pin factory takes all the data about pins that we scraped from the element and builds a set of interactive Scrawl-canvas entitys for each pin
const pinFactory = function (scrawl, items, canvas, pinTextGroup, pinTextBackgroundGroup, colors) {

/* eslint-disable-next-line */
    let { name, groupname, position, fill, stroke, labeltext, labelposition, labelwidth, labelbackground, shared, suppressAccessibleText } = items;

    const coords = position.split(',');

    // TODO: We don't want to display a label if its associated pin is not currently visible to the user
/* eslint-disable-next-line */
    const checkVisibility = function (entity) {

        return true;
    }

    // Generate the visible pin
    const pin = scrawl.makeWheel({

        name: `${name}-pin`,
        group: `${groupname}-cell`,

        start: coords,
        handle: ['center', 'center'],

        radius: 10,
        fillStyle: fill,
        strokeStyle: stroke,
        lineWidth: 2,
        method: 'fillThenDraw',

    });

    // The hit zone for the pin is assigned to the canvas element's base cell, to make the user interaction (eg collision detection with the mouse cursor) code as simple as posssible
    pin.clone({

        name: `${name}-hitzone`,
        group: canvas.base.name,
        radius: 25,
        method: 'none',

        onEnter: function () {

            if (checkVisibility(pin)) {

                // Increase the visible pin's size
                pin.set({ 
                    radius: 15,
                    lineWidth: 4,
                });

                // Display the pin's associated label
                if (pinText) {

                    pinText.set({ visibility: true });
                    pinBackground.set({ visibility: true });
                }
            }
        },

        onLeave: function () {

            if (checkVisibility(pin)) {
                
                // Decrease the visible pin's size
                pin.set({ 
                    radius: 10,
                    lineWidth: 2,
                });

                // Hide the pin's associated label
                if (pinText) {

                    pinText.set({ visibility: false });
                    pinBackground.set({ visibility: false });
                }
            }
        },
    });

    // Generate the label associated with each pin (assuming it's been defined in the data)
    let pinText, pinBackground;

    if (labeltext) {

        // Labels can be positioned above, below, or to the right or left of the pin.
        if (!labelposition) labelposition = 'below';

        let handle = ['center', '-20%'];

        if ('above' === labelposition) handle = ['center', '120%'];
        if ('left' === labelposition) handle = ['110%', 'center'];
        if ('right' === labelposition) handle = ['-10%', 'center'];

        pinText = scrawl.makePhrase({

            name: `${name}-label`,
            group: `${groupname}-cell`,
            order: 1,

            text: labeltext,
            justify: 'center',
            lineHeight: 1.15,

            width: labelwidth,
            handle,

            pivot: `${name}-pin`,
            lockTo: 'pivot',

            font: '28px Arial, sans-serif',
            fillStyle: colors.default,

            exposeText: (suppressAccessibleText) ? false : true,

            visibility: false,
        });

        pinTextGroup.addArtefacts(`${name}-label`);

        pinBackground = scrawl.makeBlock({
            name: `${name}-background`,
            group: `${groupname}-cell`,
            order: 0,
            fillStyle: labelbackground,
            width: 20,
            height: 20,
            handleY: 10,

            mimic: `${name}-label`,
            lockTo: 'mimic',
            useMimicDimensions: true,
            useMimicStart: true,
            useMimicHandle: true,

            addOwnDimensionsToMimic: true,
            addOwnHandleToMimic: true,
            visibility: false,
        });

        pinTextBackgroundGroup.addArtefacts(`${name}-background`);
    }
};

// The link factory takes all the data about links that we scraped from the element and builds a set of interactive Scrawl-canvas entitys for each link
const linkFactory = function (scrawl, items, canvas, linkTextGroup, colors) {

    const {name, position, href, justify, text, width, background} = items;

    const start = position.split(',');

    scrawl.makePhrase({

        name: `${name}-link`,
        group: canvas.base.name,
        order: 1,
        text,
        start,

        width,

        handleX: justify,
        handleY: justify,
        justify,

        font: '16px Arial, sans-serif',
        lineHeight: 1,
        fillStyle: colors.link,

        underlinePosition: 0.8,
        underlineStyle: colors.linkunderline,

        onEnter: function () {

            canvas.set({
                css: {
                    cursor: 'pointer',
                }
            });

            this.set({
                text: `§UNDERLINE§${this.text}`,
            });
        },

        onLeave: function () {

            canvas.set({
                css: {
                    cursor: 'auto',
                }
            });

            this.set({
                text: this.text.replace('§UNDERLINE§', ''),
            });
        },

        onUp: function () {

            this.clickAnchor();
        },

        // Suppress accessible text here because we're also including an anchor, which will also add its description text to the canvas shadow DOM (as part of the navigation)
        exposeText: false,

        anchor: {
            name,
            href,
            description: text,

            focusAction: true,
            blurAction: true,
        },

    });

    linkTextGroup.addArtefacts(`${name}-link`);

    scrawl.makeBlock({
        name: `${name}-background`,
        group: canvas.base.name,
        order: 0,
        fillStyle: background,
        width: 20,
        height: 10,
        handleY: 10,

        mimic: `${name}-link`,
        lockTo: 'mimic',
        useMimicDimensions: true,
        useMimicStart: true,
        useMimicHandle: true,

        addOwnDimensionsToMimic: true,
        addOwnHandleToMimic: true,
    })
};


// ##### The exported function
export default function (scrawl, el) {

    // Apply the snippet to the DOM element
    let snippet = scrawl.makeSnippet({
        domElement: el,
    });

    if (snippet) {

        // __0. Convenience handle variables__; basic followup housekeeping
        let canvas = snippet.canvas,
            animation = snippet.animation,
            wrapper = snippet.element,
            element = wrapper.domElement,
            name = wrapper.name;

        canvas.set({
            backgroundColor: 'white',
        }).render();

        wrapper.set({
            canvasOnTop: true,
        });

        // __1. Get all information required from the wrapper's panel &lt;div> child elements__
        const leftPanel = getPanelData(element.querySelector('[data-frame="left"]'), {}, canvas);

        const rightPanel = getPanelData(element.querySelector('[data-frame="right"]'), {}, canvas);

        // Snippet will fail if we don't have both panels to build
        if (leftPanel && rightPanel) {

            // __2. Get all information about links from the wrapper's &lt;nav> child element__
            const navItems = getNavigationData(element.querySelector(':scope > nav'));

            // __3. Get all information required from the wrapper element__
            const aria_label = element.dataset.label,
                aria_description = element.dataset.description;

            // __4. Clean up DOM - we don't need to keep elements, text or links that we'll be recreating in the &lt;canvas> element__
            leftPanel.element.remove();
            rightPanel.element.remove();

            if (navItems && navItems.element) navItems.element.remove();

            delete element.dataset.label;
            delete element.dataset.description;

            // __5. Import image assets__
            scrawl.importDomImage(`#${name} img`);

            // __6. Create some Groups for handling User Interaction functionality__
            const pinTextGroup = scrawl.makeGroup({
                name: `${name}-pin-texts-group`,
            });

            const pinTextBackgroundGroup = scrawl.makeGroup({
                name: `${name}-pin-texts-background-group`,
            });

            const linkTextGroup = scrawl.makeGroup({
                name: `${name}-link-texts-group`,
            });

            // __7. Setup the canvas element__
            canvas.set({

                // Accessibility first!
                label: aria_label,
                description: aria_description,
                includeInTabNavigation: true,

                // Responsive text - we need to make sure text updates to an appropriate, readable size when the user changes the dimensions of their browser's window, or alters the orientation of their device.
                breakToSmallest: 200000,
                breakToSmaller: 400000,
                breakToLarger: 600000,
                breakToLargest: 800000,

                actionSmallestArea: function () {
                    pinTextGroup.setArtefacts({ size: '28px'});
                    linkTextGroup.setArtefacts({ size: '14px'});
                },
                actionSmallerArea: function () {
                    pinTextGroup.setArtefacts({ size: '26px'});
                    linkTextGroup.setArtefacts({ size: '17px'});
                },
                actionRegularArea: function () {
                    pinTextGroup.setArtefacts({ size: '24px'});
                    linkTextGroup.setArtefacts({ size: '20px'});
                },
                actionLargerArea: function () {
                    pinTextGroup.setArtefacts({ size: '22px'});
                    linkTextGroup.setArtefacts({ size: '23px'});
                },
                actionLargestArea: function () {
                    pinTextGroup.setArtefacts({ size: '20px'});
                    linkTextGroup.setArtefacts({ size: '26px'});
                },

            }).setBase({
                compileOrder: 1,
            });

            // Infographic keyboard navigation
            let displayAllLabels = false;

            const toggleLabels = () => {

                displayAllLabels = !displayAllLabels;

                pinTextGroup.setArtefacts({
                    visibility: displayAllLabels,
                });

                pinTextBackgroundGroup.setArtefacts({
                    visibility: displayAllLabels,
                });
            }

            const moveBar = (pos, width) => {

                dragBar.set({
                    startX: pos,
                });

                rightImage.set({
                    copyStartX: pos,
                    copyWidth: width,
                    width,
                });
            };

            const showMore = (moveLeft = true) => {

                const canvasWidth = canvas.get('width');
                const currentPos = dragBar.get('position');
                const [x] = currentPos;

                const dir = (moveLeft) ? -1 : 1;

                let distance = ((x * 100) / canvasWidth) + dir;
                if (distance < 0) distance = 0;
                else if (distance > 100) distance = 100;

                const pos = `${distance.toFixed(2)}%`;
                const width = `${(100 - distance).toFixed(2)}%`;

                return [pos, width];
            };

            const showAllBefore = () => moveBar('100%', '0%');
            const showAllAfter = () => moveBar('0%', '100%');
            const showMoreBefore = () => moveBar(...showMore(false));
            const showMoreAfter = () => moveBar(...showMore(true));

            const canvasKeys = (e) => {

                const { keyCode, shiftKey, isComposing } = e;

                // Ignore when user is composing a glyph
                if (isComposing || 229 === keyCode) return;

                // Tab, Enter/Return, Esc
                if (9 === keyCode || 13 === keyCode || 27 === keyCode) {
                    canvas.domElement.blur();
                    return;
                }

                e.preventDefault();

                // Left/right arrow keys (with and without shift)
                if (shiftKey) {
                    if (39 === keyCode) showAllBefore();
                    else if (37 === keyCode) showAllAfter();
                }
                else {
                    if (39 === keyCode) showMoreBefore();
                    else if (37 === keyCode) showMoreAfter();
                    else if (32 === keyCode) toggleLabels();
                }
            }
            scrawl.addNativeListener('keydown', canvasKeys, canvas.domElement);

            // Grab colors from CSS
            const colors = {},
                cssColors = getComputedStyle(document.documentElement);

            colors.default = cssColors.getPropertyValue('--sc-default');
            colors.shadow = cssColors.getPropertyValue('--sc-shadow');
            colors.link = cssColors.getPropertyValue('--sc-link');
            colors.linkshadow = cssColors.getPropertyValue('--sc-linkshadow');
            colors.linkunderline = cssColors.getPropertyValue('--sc-linkunderline');
            colors.red = cssColors.getPropertyValue('--sc-red');
            colors.green = cssColors.getPropertyValue('--sc-green');
            colors.blue = cssColors.getPropertyValue('--sc-blue');
            colors.black = cssColors.getPropertyValue('--sc-black');
            colors.white = cssColors.getPropertyValue('--sc-white');
            colors.gray = cssColors.getPropertyValue('--sc-gray');

            // Add additional section classes to the library
            const sect = scrawl.library.sectionClasses;

            sect['span class="sc-red"'] = { fill: colors.red };
            sect['span class="sc-blue"'] = { fill: colors.blue };
            sect['span class="sc-green"'] = { fill: colors.green };
            sect['span class="sc-white"'] = { fill: colors.white };
            sect['span class="sc-black"'] = { fill: colors.black };
            sect['span class="sc-gray"'] = { fill: colors.gray };
            sect['/span'] = { fill: 'default' };


            // __8. Build the left-hand panel__
            const leftPanelName = leftPanel.name;

            canvas.buildCell({
                name: `${leftPanelName}-cell`,
                // Does height need to be hardcoded? We should really pro-rata it in line with container/canvas dimensions?
                dimensions: [1000, 500],
                shown: false,
            });

            scrawl.makePicture({
                name: `${leftPanelName}-image`,
                group: `${leftPanelName}-cell`,
                asset: leftPanel.imageElement.id,
                dimensions: ['100%', '100%'],
                copyDimensions: ['100%', '100%'],
            });

            scrawl.makePhrase({
                name: `${leftPanelName}-image-date`,
                group: `${leftPanelName}-cell`,
                order: 1,
                start: ['1%', '1%'],
                handle: ['left', 'top'],
                text: leftPanel.date,
                font: '20px Arial, sans-serif',
                lineHeight: 0.7,
                fillStyle: colors.white,
            });

            scrawl.makeBlock({
                name: `${leftPanelName}-image-date-background`,
                group: `${leftPanelName}-cell`,
                order: 0,
                fillStyle: colors.black,
                width: 20,
                height: 20,
                handle: [10, 10],
                mimic: `${leftPanelName}-image-date`,
                lockTo: 'mimic',
                useMimicDimensions: true,
                useMimicStart: true,
                useMimicHandle: true,
                addOwnDimensionsToMimic: true,
                addOwnHandleToMimic: true,
            });

            scrawl.makePicture({
                name: `${leftPanelName}-image-display`,
                group: canvas.base.name,
                asset: `${leftPanelName}-cell`,
                dimensions: ['100%', '100%'],
                copyDimensions: ['100%', '100%'],
            });

            // __9. Build the right-hand panel__
            const rightPanelName = rightPanel.name;

            canvas.buildCell({
                name: `${rightPanelName}-cell`,
                // Again, does height need to be hardcoded?
                dimensions: [1000, 500],
                shown: false,
            });

            scrawl.makePicture({
                name: `${rightPanelName}-image`,
                group: `${rightPanelName}-cell`,
                asset: rightPanel.imageElement.id,
                dimensions: ['100%', '100%'],
                copyDimensions: ['100%', '100%'],
            });

            scrawl.makePhrase({
                name: `${rightPanelName}-image-date`,
                group: `${rightPanelName}-cell`,
                order: 1,
                start: ['99%', '1%'],
                handle: ['right', 'top'],
                text: rightPanel.date,
                font: '20px Arial, sans-serif',
                lineHeight: 0.7,
                fillStyle: colors.white,
            });

            scrawl.makeBlock({
                name: `${rightPanelName}-image-date-background`,
                group: `${rightPanelName}-cell`,
                order: 0,
                fillStyle: colors.black,
                width: 20,
                height: 20,
                handle: [10, 10],
                mimic: `${rightPanelName}-image-date`,
                lockTo: 'mimic',
                useMimicDimensions: true,
                useMimicStart: true,
                useMimicHandle: true,
                addOwnDimensionsToMimic: true,
                addOwnHandleToMimic: true,
            });

            // We only need to manipulate the attributes of the right hand panel to execute the slider functionality
            const rightImage = scrawl.makePicture({
                name: `${rightPanelName}-image-display`,
                group: canvas.base.name,
                asset: `${rightPanelName}-cell`,
                dimensions: ['50%', '100%'],
                copyDimensions: ['50%', '100%'],
                copyStartX: '50%',
                start: ['right', 'top'],
                handle: ['right', 'top'],
            });

            // __10. Generate pins and their associated labels__
            leftPanel.pins.forEach(p => {

                if (p.shared) {

                    const n = p.name;

                    p.name = `${n}-left`
                    p.groupname = leftPanelName;
                    
                    pinFactory(scrawl, p, canvas, pinTextGroup, pinTextBackgroundGroup, colors);

                    p.name = `${n}-right`
                    p.groupname = rightPanelName;
                    p.suppressAccessibleText = true;
                }
                pinFactory(scrawl, p, canvas, pinTextGroup, pinTextBackgroundGroup, colors);
            });

            rightPanel.pins.forEach(p => {

                if (p.shared) {

                    const n = p.name;

                    p.name = `${n}-left`
                    p.groupname = leftPanelName;
                    
                    pinFactory(scrawl, p, canvas, pinTextGroup, pinTextBackgroundGroup, colors);

                    p.name = `${n}-right`
                    p.groupname = rightPanelName;
                    p.suppressAccessibleText = true;
                }
                pinFactory(scrawl, p, canvas, pinTextGroup, pinTextBackgroundGroup, colors);
            });


            // __11. Build the drag bar entitys__
            const dragBar = scrawl.makeBlock({

                name: `${name}-drag-bar`,
                group: canvas.base.name,
                start: ['center', 'center'],
                handle: ['center', 'center'],
                dimensions: [80, '110%'],

                method: 'none',

                onEnter: function () {

                    canvas.set({
                        css: {
                            cursor: 'col-resize',
                        }
                    });
                },

                onLeave: function () {

                    canvas.set({
                        css: {
                            cursor: 'auto',
                        }
                    });
                },
            });

            scrawl.makeBlock({

                name: `${name}-drag-line`,
                group: canvas.base.name,
                dimensions: [0, '110%'],
                handle: ['center', 'center'],

                pivot: `${name}-drag-bar`,
                lockTo: 'pivot',

                strokeStyle: 'white',
                lineWidth: 4,
                method: 'draw',
            });

            scrawl.makeOval({

                name: `${name}-drag-bar-button`,
                group: canvas.base.name,
                handle: ['center', 'center'],
                radiusX: 40,
                radiusY: 25,

                pivot:   `${name}-drag-bar`,
                lockTo: 'pivot',

                fillStyle: 'yellow',
                strokeStyle: 'white',
                lineWidth: 2,
                globalAlpha: 0.6,
                method: 'fillThenDraw',
            });

            // __12. Build the drag bar functionality__
            // + KNOWN BUG - the drag bar not draggable on first user mousedown, but is draggable afterwards
            scrawl.makeGroup({
                name: `${name}-drag-group`,
            }).addArtefacts(`${name}-drag-bar`,);

            let isDragging = false;

            const dragAction = function () {

                if (isDragging) {

                    const canvasWidth = canvas.get('width');
                    const currentPos = dragBar.get('position');
                    const [x] = currentPos;

                    const distance = (x * 100) / canvasWidth;
                    const pos = `${distance.toFixed(2)}%`;
                    const width = `${(100 - distance).toFixed(2)}%`;

                    rightImage.set({
                        copyStartX: pos,
                        copyWidth: width,
                        width,
                    });
                }
            };

            scrawl.makeDragZone({

                zone: canvas,
                collisionGroup: `${name}-drag-group`,
                endOn: ['up', 'leave'],

                updateOnStart: () => {

                    dragBar.isBeingDragged = false;
                    dragBar.set({
                        lockXTo: 'mouse',
                    });

                    isDragging = true;
                },

                updateOnEnd: () => {

                    let [x] = dragBar.get('position'),
                        width = canvas.get('width');

                    dragBar.set({
                        startX: `${((x * 100) / width).toFixed(2)}%`,
                        startY: 'center',
                        lockXTo: 'start',
                    });

                    isDragging = false;
                },
                preventTouchDefaultWhenDragging: true,
            });

            // __13. Build the interactive links__
            if (navItems && navItems.links) navItems.links.forEach(n => linkFactory(scrawl, n, canvas, linkTextGroup, colors));

            // __14. Hook into event listeners__
            scrawl.addListener('move', () => canvas.cascadeEventAction('move'), el);
            scrawl.addNativeListener('touchmove', () => canvas.cascadeEventAction('move'), el);
            scrawl.addNativeListener(['click', 'touchend'], () => canvas.cascadeEventAction('up'), el);

            // __15. Update the animation object to listen for drag bar activity__
            animation.set({ commence: dragAction });
        }
    }

    // We delay making the element's contents visible - this is to prevent ugly flashes of original DOM content
    el.style.visibility = 'visible';

    // #### Return the snippet output
    return snippet;
}
