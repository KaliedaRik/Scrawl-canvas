// # Filter mixin
// The filter mixin adds functionality to Cell, Group and all entity factories which allows those objects to use Scrawl-canvas [Filter objects](../factory/filter.html) in their output.


// #### Imports
import { asset, filter, styles } from '../core/library.js';

import { generateUuid, mergeOver, removeItem, Ωempty } from '../helper/utilities.js';

import { checkForWorkstoreItem, setWorkstoreItem } from '../helper/workstore.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

// Shared constants
import { _abs, _floor, _isArray, _max, _min, BLANK, BOTTOM, CENTER, LEFT, NONE, PROCESS_IMAGE, RIGHT, SOURCE_OVER, T_FILTER, T_IMAGE, TOP, ZERO_STR } from '../helper/shared-vars.js';

// Local constants
const CONTAIN = 'contain',
    COVER = 'cover',
    STRETCH = 'stretch',
    CHECK_POS_X = [LEFT, CENTER, RIGHT],
    CHECK_POS_Y = [TOP, CENTER, BOTTOM];


// #### Export function
export default function (P = Ωempty) {


// #### Filter-related attributes
// All factories using the filter mixin will add these attributes to their objects
    const defaultAttributes = {

// __filters__ - An array of filter object String names. If only one filter is to be applied, then it is enough to use the String name of that filter object - Scrawl-canvas will make sure it gets added to the Array.
// + To add/remove new filters to the filters array, use the `addFilters` and `removeFilters` functions. Note that the `set` function will replace all the existing filters in the array with the new filters. To remove all existing filters from the array, use the `clearFilters` function
// + Multiple filters will be batch-applied to an entity, group of entitys, or an entire cell in one operation. Filters are applied in the order that they appear in in the filters array.
// + ___Be aware that the "filters" (plural) attribute is different to the CSS/SVG "filter" (singular) attribute___ - details about how Scrawl-canvas uses CSS/SVG filter Strings to produce filtering effects (at the entity and Cell levels only) are investigated in the Filter Demos 501 to 505. CSS/SVG filter Strings can be applied in addition to Scrawl-canvas filters Array objects, and will be applied after them.
        filters: null,

// __isStencil__ - Use the entity as a stencil. When this flag is set filter effects will be applied to the background imagery covered by the entity (or Group of entitys, or Cell), the results of which will replace the entity/Group/Cell in the final display.
        isStencil: false,

// __memoizeFilterOutput__ - SC uses memoization as a means to enhance the speed of filter application. When an entity has filters sety on it, and the `memoizeFilterOutput` flag is set to `true`, the filter engine will cache the generated output after its first run and, for subsequent Display cycles, serve up the cached result rather than perform the filter calculations again. Things to note:
// + Entitys will automatically request their filters to recalculate and re-memoize after any start, handle, offset, scale, rotation or flip change. They also request re-memoization when other attributes change, for instance: dimensions, fill or stroke styles, line parameters, font or text updates, etc.
// + Re-memoization is also triggered by any changes to the entity's `filters` array, or when the attributes of a filter in the array update.
// + Memoization is limited to entitys (not Groups or Cells). If the `isStencil` flag is set to `true` the `memoizeFilterOutput` flag is ignored.
// + Memoization is also ignored for Picture entitys using a spritesheet or video asset for their source.
        memoizeFilterOutput: false,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Get, Set, deltaSet
    const S = P.setters;


// `filters` - ___Dangerous action!__ - replaces the existing filters Array with a new filters Array. If a string name is supplied, will add that name to the existing filters array
    S.filters = function (item) {

        if (item) {

            this.filters.length = 0;

            if (!_isArray(item)) item = [item];

            item.forEach(f => {

                if (f.substring) this.filters.push(f);
                else if (f.type === T_FILTER) this.filters.push(f.name);
            }, this);

            this.dirtyFilters = true;
            this.dirtyImageSubscribers = true;
            this.dirtyFilterIdentifier = true;
        }
    };

// `memoizeFilterOutput`
    S.memoizeFilterOutput = function (item) {

        this.memoizeFilterOutput = item;
        this.updateFilterIdentifier(!!item);
    };

// `updateFilterIdentifier` - manually trigger re-memoization. The function's (optional) argument is a boolean.
    P.updateFilterIdentifier = function (item) {

        this.dirtyFilterIdentifier = false;
        if (this.state) this.state.dirtyFilterIdentifier = false;

        if (this.memoizeFilterOutput && item) this.filterIdentifier = generateUuid();
        else this.filterIdentifier = ZERO_STR;

    };


// #### Packet management
// No additional packet functionality defined here


// #### Clone management
// No additional clone functionality defined here


// #### Kill management
// No additional kill functionality defined here


// #### Get, Set, deltaSet
// No additional functionality defined here


// #### Prototype functions
// `cleanFilters` - Internal housekeeping
// + Filter objects do not have an `order` attribute. They will be processed in the order in which they appear in the `filters` Array.
    P.cleanFilters = function () {

        this.dirtyFilters = false;
        this.dirtyFiltersCache = true;

        const {filters, currentFilters} = this;

        currentFilters.length = 0;

        filters.forEach(f => {

            if (f.substring) {

                const obj = filter[f];

                if (obj) currentFilters.push(obj);
            }
            else if (f && f.type && f.type === T_FILTER) currentFilters.push(f);
        });
    };


// `addFilters`, `removeFilters` - Add or remove one or more filter name strings to/from the filters array. Filter name strings, or the filter objects themselves, can be supplied as comma-separated arguments to the function.
// + Filters are added to the end of the `filters` array. If the filters need to be reordered, use the `set` functionality instead to replace the array with an array containing the desired filter order
    P.addFilters = function (...args) {

        args.forEach(f => {

            if (f && f.type === T_FILTER) f = f.name;
            this.filters.push(f);

        }, this);

        this.dirtyFilters = true;
        this.dirtyImageSubscribers = true;
        this.dirtyFilterIdentifier = true;

        return this;
    };

    P.removeFilters = function (...args) {

        args.forEach(f => {

            if (f && f.type === T_FILTER) f = f.name;
            removeItem(this.filters, f);

        }, this);

        this.dirtyFilters = true;
        this.dirtyImageSubscribers = true;
        this.dirtyFilterIdentifier = true;

        return this;
    };

// `clearFilters` - Clears the filters array
    P.clearFilters = function () {

        this.filters.length = 0;

        this.dirtyFilters = true;
        this.dirtyImageSubscribers = true;
        this.dirtyFilterIdentifier = true;

        return this;
    };

// `hasFilters` - A quick check to see if any filters have been assigned to this artefact
    P.hasFilters = function () {

        return !!this.filters.length;
    };

// `preprocessFilters` - internal function called as part of the Display cycle.
    P.preprocessFilters = function (filters, hostWidth, hostHeight) {

        for (let i = 0, iz = filters.length, filter; i < iz; i++) {

            filter = filters[i];

            for (let j = 0, jz = filter.actions.length, obj; j < jz; j++) {

                obj = filter.actions[j];

                // Currently only the `process-image` filter action requires pre-processing
                // - This filter action loads a Scrawl-canvas asset into the SC Workstore, where it can be used as a lineIn or lineMix argument for other filter actions.
                if (obj.action === PROCESS_IMAGE) {

                    const img = asset[obj.asset];

                    // Only continue if the image already exists as an asset
                    if (img) {

                        let width, height, snd, cnd,
                            copyStartX, copyStartY, copyWidth, copyHeight,
                            fit, scale, smoothing, backgroundColor,
                            positionX, positionY, offsetX, offsetY,
                            drawWidth, drawHeight, dx, dy;

                        // Any asset can be used as an "image", but given assets can be animated we do a check.
                        // - Video, Cell etc assets get a unique identifier on each iteration, to break Workstore caching
                        if (T_IMAGE !== img.type) {

                            img.checkSource();
                            obj.identifier = `user-image-${obj.asset}-${generateUuid()}`;
                            this.dirtyFilterIdentifier = true;
                        }

                        const specifiedIdentifier = `${obj.identifier}_${hostWidth}_${hostHeight}`;

                        // We pre-process when the image doesn't already exist in the Workstore. The `identifier` attribute is set by the `process-image` filter action
                        // - This happens when `process-image` has been set up as a legacy `method` filter, not the modern `actions` filter
                        // - When using the `actions` approach, the `identifier` attribute needs to be created and updated (to break cache) manually, un user code.
                        if (!checkForWorkstoreItem(specifiedIdentifier)) {

                            width = img.sourceNaturalWidth;
                            height = img.sourceNaturalHeight;
                            snd = img.sourceNaturalDimensions;
                            cnd = img.currentDimensions;

                            // Dimensions values:
                            // - `hostWidth`, `hostHeight` - received by the function as arguments, representing the area within which the ingested image will sit
                            // - local `width`, `height` - calculated from image attributes 
                            if (!width || !height) {

                                if (snd && snd[0] && snd[1]) {

                                    width = width || snd[0];
                                    height = height || snd[1];
                                }
                                else if (cnd && cnd[0] && cnd[1]) {

                                    width = width || cnd[0];
                                    height = height || cnd[1];
                                }
                            }

                            // Proceed if we have the image dimensions, otherwise do nothing
                            // - If the image asset creation processes have not yet completed, width and height should be either `0` or undefined.
                            // - Thus no point writing anything in the Workstore
                            // - Thus pre-processing will run again in future iterations of the Display cycle, until the asset creation process completes and the functionality below can run
                            if (width && height) {

                                // `copyX` and `copyY` are deprecated names for the `copyStartX` and `copyStartY` attributes. Check for them here
                                // - This check will be removed in a future release of the SC library
                                copyStartX = (obj.copyStartX != null) ? obj.copyStartX : obj.copyX;
                                copyStartY = (obj.copyStartY != null) ? obj.copyStartY : obj.copyY;

                                // Don't assume the copy attributes have been set. Defaults are to use the entire image in the following functionality
                                copyStartX = (copyStartX != null) ? copyStartX : 0;
                                copyStartY = (copyStartY != null) ? copyStartY : 0;
                                copyWidth = (obj.copyWidth != null) ? obj.copyWidth : '100%';
                                copyHeight = (obj.copyHeight != null) ? obj.copyHeight : '100%';

                                // De-stringify start attributes
                                // - number values represent pixel values
                                // - string values represent a proportion of the image dimension
                                if (copyStartX.substring) copyStartX = (parseFloat(copyStartX) / 100) * width;
                                if (copyStartY.substring) copyStartY = (parseFloat(copyStartY) / 100) * height;

                                // Work with integers
                                copyStartX = _floor(copyStartX);
                                copyStartY = _floor(copyStartY);

                                // Correct start positions, which must be within the image dimensions
                                if (copyStartX < 0) copyStartX = 0;
                                else if (copyStartX >= width) copyStartX = width - 1;

                                if (copyStartY < 0) copyStartY = 0;
                                else if (copyStartY >= height) copyStartY = height - 1;

                                // Correct copy dimensions
                                if (copyWidth.substring) copyWidth = (parseFloat(copyWidth) / 100) * width;
                                if (copyHeight.substring) copyHeight = (parseFloat(copyHeight) / 100) * height;

                                // Work with integers
                                copyWidth = _floor(copyWidth);
                                copyHeight = _floor(copyHeight);

                                // Correct copy dimensions
                                // - They must be a minimum of 1px
                                // - They must be equal to, or less than, the image dimensions
                                if (copyWidth < 1) copyWidth = 1;
                                if (copyHeight < 1) copyHeight = 1;

                                if (copyWidth > width) copyWidth = width;
                                if (copyHeight > height) copyHeight = height;

                                // If start + copy dimension is greater than the image dimension, then we correct the start value (to prevent unexpected stretching of the copy output)
                                if (copyStartX + copyWidth > width) copyStartX = width - copyWidth;
                                if (copyStartY + copyHeight > height) copyStartY = height - copyHeight;

                                // Collect the `process-image` filter action's other attributes:
                                // - `fit`: string - values 'contain', 'cover', 'stretch', 'none'
                                // - `smoothing`: boolean
                                fit = (obj.fit != null) ? obj.fit : NONE;
                                smoothing = (obj.smoothing != null) ? obj.smoothing : false;

                                // When the desired image copy is smaller than the host, we fill in the background with a color
                                // - Use transparent (`rgb(0 0 0 / 0)`) for images that will be used with the `composite` filter action
                                // - Use gray (`rgb(127 127 127 / 0.5)`) for images to be used with the `displace` filter action - half-transparent gray values should prevent pixels from moving unexpectedly
                                // - For images to be used with the `blend` filter action, be aware that the background color can have an effect on the blended results; transparent pixels are ignored but if other filter actions modify the image data prior to it reaching the `blend` action then the color of the pixel may have an effect
                                backgroundColor = (obj.backgroundColor != null) ? obj.backgroundColor : BLANK;

                                // Prep the Cell
                                // - We don't go ahead unless we have a source for the image
                                const src = img.source || img.element;

                                if (src) {

                                    const mycell = requestCell(),
                                        engine = mycell.engine,
                                        canvas = mycell.element;

                                    canvas.width = hostWidth;
                                    canvas.height = hostHeight;

                                    engine.resetTransform();
                                    engine.globalCompositeOperation = SOURCE_OVER;
                                    engine.globalAlpha = 1;
                                    engine.imageSmoothingEnabled = smoothing;

                                    engine.clearRect(0, 0, hostWidth, hostHeight);

                                    if (backgroundColor && backgroundColor !== BLANK) {

                                        engine.fillStyle = backgroundColor;
                                        engine.fillRect(0, 0, hostWidth, hostHeight);
                                    }

                                    // Copy the image into the Cell
                                    switch (fit) {

                                        case CONTAIN: {
                                            scale = _min(hostWidth / copyWidth, hostHeight / copyHeight);
                                            drawWidth = copyWidth * scale;
                                            drawHeight = copyHeight * scale;

                                            drawWidth = _max(1, _floor(drawWidth));
                                            drawHeight = _max(1, _floor(drawHeight));

                                            dx = ((hostWidth - drawWidth) / 2) | 0;
                                            dy = ((hostHeight - drawHeight) / 2) | 0;

                                            engine.drawImage(
                                                src,
                                                copyStartX, copyStartY, copyWidth, copyHeight,
                                                dx, dy, drawWidth, drawHeight,
                                            );
                                            break;
                                        }

                                        case COVER: {
                                            scale = _max(hostWidth / copyWidth, hostHeight / copyHeight);
                                            drawWidth = copyWidth * scale;
                                            drawHeight = copyHeight * scale;

                                            drawWidth = _max(1, _floor(drawWidth));
                                            drawHeight = _max(1, _floor(drawHeight));

                                            dx = ((hostWidth - drawWidth) / 2) | 0;
                                            dy = ((hostHeight - drawHeight) / 2) | 0;

                                            engine.drawImage(
                                                src,
                                                copyStartX, copyStartY, copyWidth, copyHeight,
                                                dx, dy, drawWidth, drawHeight,
                                            );
                                            break;
                                        }

                                        case STRETCH: {
                                            drawWidth = hostWidth;
                                            drawHeight = hostHeight;

                                            drawWidth = _max(1, _floor(drawWidth));
                                            drawHeight = _max(1, _floor(drawHeight));

                                            dx = ((hostWidth - drawWidth) / 2) | 0;
                                            dy = ((hostHeight - drawHeight) / 2) | 0;

                                            engine.drawImage(
                                                src,
                                                copyStartX, copyStartY, copyWidth, copyHeight,
                                                dx, dy, drawWidth, drawHeight,
                                            );
                                            break;
                                        }

                                        default: {

                                            // When the image is not being fitted to the output ('contain', 'cover', 'stretch'), it can be positioned and scaled within the output instead
                                            //
                                            // `positionX` can have values 'left', 'center' (default), 'right'
                                            positionX = (obj.positionX != null) ? obj.positionX : CENTER;
                                            if (!CHECK_POS_X.includes(positionX)) positionX = CENTER;

                                            // `positionY` can have values 'top', 'center' (default), 'bottom'
                                            positionY = (obj.positionY != null) ? obj.positionY : CENTER;
                                            if (!CHECK_POS_Y.includes(positionY)) positionY = CENTER;

                                            // `offsetX`, `offsetY` - either pixel numbers or string % values relative to the host dimensions
                                            offsetX = (obj.offsetX != null) ? obj.offsetX : 0;
                                            offsetY = (obj.offsetY != null) ? obj.offsetY : 0;

                                            if (offsetX.substring) offsetX = (parseFloat(offsetX) / 100) * hostWidth;
                                            if (offsetY.substring) offsetY = (parseFloat(offsetY) / 100) * hostHeight;

                                            // `scale`
                                            scale = (obj.scale != null) ? obj.scale : 1;
                                            if (scale < 0.01) scale = 0.01;
                                            drawWidth = copyWidth * scale;
                                            drawHeight = copyHeight * scale;

                                            // Calculate the start positions
                                            if (positionX === LEFT) dx = 0;
                                            else if (positionX === RIGHT) dx = hostWidth - drawWidth;
                                            else dx = _floor((hostWidth / 2) - (drawWidth / 2));
                                            dx += offsetX;

                                            if (positionY === TOP) dy = 0;
                                            else if (positionY === BOTTOM) dy = hostHeight - drawHeight;
                                            else dy = _floor((hostHeight / 2) - (drawHeight / 2));
                                            dy += offsetY;

                                            engine.drawImage(
                                                src,
                                                copyStartX, copyStartY, copyWidth, copyHeight,
                                                dx, dy, drawWidth, drawHeight,
                                            );
                                        }
                                    }

                                    setWorkstoreItem(specifiedIdentifier, engine.getImageData(0, 0, hostWidth, hostHeight));

                                    releaseCell(mycell);
                                }
                            }
                        }
                    }
                }
            }
            if (filter.dirtyFilterIdentifier) this.dirtyFilterIdentifier = true;
        }

        const state = this.state;

        if (state) {

            if (state.dirtyFilterIdentifier) this.dirtyFilterIdentifier = true;
            else {

                const {fillStyle, strokeStyle} = state;

                if (styles[fillStyle] && styles[fillStyle].dirtyFilterIdentifier) this.dirtyFilterIdentifier = true;
                else if (styles[strokeStyle] && styles[strokeStyle].dirtyFilterIdentifier) this.dirtyFilterIdentifier = true;
            }
        }

        if (this.dirtyFilterIdentifier || (this.state && this.state.dirtyFilterIdentifier)) this.updateFilterIdentifier(true);
    };
};
