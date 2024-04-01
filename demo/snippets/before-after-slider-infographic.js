// # Demo Snippets 005
// Create a responsive, interactive and accessible before/after slider infographic
//
// Related files:
// + [Slider infographic snippet - main module](../snippets-005.html)

// ##### The exported function
export default function (scrawl, el) {

    // Namespacing boilerplate
    const namespace = el.id;
    const name = (val) => `${namespace}-${val}`;


    // Only progress if the supplied element has an `id` attribute
    if (namespace) {


        // Apply the snippet to the DOM element
        const snippet = scrawl.makeSnippet({
            domElement: el,
        });

        if (snippet) {

            // Convenience handle variables
            const canvas = snippet.canvas,
                animation = snippet.animation,
                element = snippet.element;


            // We want the canvas on top of its element
            element.set({
                canvasOnTop: true,
            });


            // This makes the canvas element's base cell the default group for everything we create
            canvas.setAsCurrentCanvas();


            // Create a data structure to hold the data we're about to gather
            const data = {
                left: {
                    caption: '',
                    date: '',
                    image: '',
                },
                right: {
                    caption: '',
                    date: '',
                    image: '',
                },
            };


            // Import before/after images from element
            // + We can do this on the element, rather than individually import for each child &lt;figure> element
            scrawl.importDomImage(`#${el.id} img`);


            // Import data from the &lt;figure> elements
            el.querySelectorAll('figure').forEach(figure => {

                const frame = figure.dataset.frame;

                if (frame) {

                    const caption = figure.querySelector('figcaption');
                    if (caption) data[frame].caption = caption.textContent;

                    const time = figure.querySelector('time');
                    if (time) data[frame].date = time.textContent;

                    const img = figure.querySelector('img');
                    if (img) data[frame].image = img.id;
                }

                // Once we've harvested the data, we can remove the &lt;figure> element from the DOM
                figure.remove();
            });


            // Make an object to hold functions we'll use for UI
            const setCursorTo = {

                auto: () => {
                    canvas.set({
                        css: {
                            cursor: 'auto',
                        },
                    });
                },
                pointer: () => {
                    canvas.set({
                        css: {
                            cursor: 'grab',
                        },
                    });
                },
                grabbing: () => {
                    canvas.set({
                        css: {
                            cursor: 'grabbing',
                        },
                    });
                },
            };


            // Create the drag-and-drop functionality
            const dragGroup = scrawl.makeGroup({
                name: name('drag-group'),
                checkForEntityHover: true,
                onEntityHover: setCursorTo.pointer,
                onEntityNoHover: setCursorTo.auto,
            });

            scrawl.makeDragZone({
                zone: canvas,
                collisionGroup: name('drag-group'),
                endOn: ['up', 'leave'],
                preventTouchDefaultWhenDragging: true,
                updateOnStart: setCursorTo.grabbing,
                updateOnEnd: setCursorTo.pointer,
            });

            animation.updateHook('commence', () => dragGroup.getAllArtefactsAt(canvas.here));


            // Build out the slider
            const mySlider = scrawl.makeBlock({
                name: name('slider'),
                dimensions: [80, '100%'],
                start: ['center', 'center'],
                handle: ['center', 'center'],
                method: 'none',
                ignoreDragForY: true,
            });

            dragGroup.addArtefacts(mySlider);

            scrawl.makeBlock({
                name: name('left-block'),
                dimensions: ['100%', '100%'],
                handle: ['right', 'center'],
                pivot: name('slider'),
                lockTo: 'pivot',
            });

            scrawl.makePicture({
                name: name(`${data.left.image}-picture`),
                asset: data.left.image,
                dimensions: ['100%', '100%'],
                copyDimensions: ['100%', '100%'],
                globalCompositeOperation: 'source-atop',

            }).clone({

                name: name(`${data.right.image}-picture`),
                asset: data.right.image,
                globalCompositeOperation: 'destination-over',
            });

            scrawl.makeLabel({
                name: name('left-date'),
                text: data.left.date,
                fontString: '18px sans-serif',
                fillStyle: 'white',
                shadowColor: 'black',
                shadowBlur: 4,
                start: ['2%', '2%'],

            }).clone({

                name: name('right-date'),
                text: data.right.date,
                startX: '98%',
                handleX: 'right',

            }).clone({

                name: name('left-caption'),
                text: data.left.caption,
                fontString: '14px sans-serif',
                start: [0, 'center'],
                handle: ['center', 'top'],
                roll: -90,

            }).clone({

                name: name('right-caption'),
                text: data.right.caption,
                startX: '100%',
                roll: 90,
            });

            scrawl.makeLabel({
                name: name('arrows'),
                text: '&larr; &rarr;',
                fontString: 'bold 20px sans-serif',
                fillStyle: 'yellow',
                handle: ['center', 'center'],
                pivot: name('slider'),
                lockTo: 'pivot',
                wordSpacing: '10px',
                exposeText: false,
            });

            scrawl.makeOval({
                name: name('arrows-button'),
                radiusX: 40,
                radiusY: 20,
                lineWidth: 1,
                handle: ['center', 'center'],
                pivot: name('slider'),
                lockTo: 'pivot',
                strokeStyle: 'yellow',
                method: 'draw',
            });

            scrawl.makeBlock({
                name: name('divider'),
                dimensions: [2, '100%'],
                handle: ['center', 'center'],
                fillStyle: 'yellow',
                pivot: name('slider'),
                lockTo: 'pivot',
            });


            // Keyboard accessibility
            canvas.set({
                includeInTabNavigation: true,
            });

            const moveSlider = (direction) => {

                const xPos = mySlider.get('position')[0],
                    width = canvas.get('width');

                let test = 0;

                switch (direction) {

                    case 'to-left' :
                        test = xPos - 10;
                        if (test > 0) mySlider.set({ startX: test });
                        else mySlider.set({ startX: 0 });
                        break;

                    case 'full-left' :
                        mySlider.set({ startX: 0 });
                        break;

                    case 'to-right' :
                        test = xPos + 10;
                        if (test < width) mySlider.set({ startX: test });
                        else mySlider.set({ startX: width });
                        break;

                    case 'full-right' :
                        mySlider.set({ startX: width });
                        break;
                }
            };

            scrawl.makeKeyboardZone({

                zone: canvas,

                shiftOnly: {
                    ArrowLeft: () => moveSlider('full-left'),
                    ArrowRight: () => moveSlider('full-right'),
                },

                none: {
                    ArrowLeft: () => moveSlider('to-left'),
                    ArrowRight: () => moveSlider('to-right'),
                },
            });
        }


        // Return the snippet output
        return snippet;
    }
}
