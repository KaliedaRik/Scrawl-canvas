// # Filter mixin
// The filter mixin adds functionality to Cell, Group and all entity factories which allows those objects to use Scrawl-canvas [Filter objects](../factory/filter.html) in their output.


// #### Imports
import { asset, filter, styles } from '../core/library.js';

import { generateUuid, mergeOver, removeItem, Ωempty } from '../helper/utilities.js';

import { checkForWorkstoreItem, setWorkstoreItem } from '../helper/workstore.js';

import { releaseCell, requestCell } from '../untracked-factory/cell-fragment.js';

// Shared constants
import { _abs, _floor, _isArray, _max, _min, BLANK, NONE, PROCESS_IMAGE, SOURCE_OVER, T_FILTER, T_IMAGE, ZERO_STR } from '../helper/shared-vars.js';

// Local constants
const CONTAIN = 'contain',
    COVER = 'cover',
    STRETCH = 'stretch';


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

// `preprocessFilters` - internal function called as part of the Display cycle. The __process-image__ filter action loads a Scrawl-canvas asset into the SC Workstore, where it can be used as a lineIn or lineMix argument for other filter actions.
    P.preprocessFilters = function (filters, hostWidth, hostHeight) {

        for (let i = 0, iz = filters.length, filter; i < iz; i++) {

            filter = filters[i];

            for (let j = 0, jz = filter.actions.length, obj; j < jz; j++) {

                obj = filter.actions[j];

                if (obj.action === PROCESS_IMAGE) {

                    const img = asset[obj.asset];

                    if (img) {

                        let width, height, snd, cnd,
                            copyStartX, copyStartY, copyWidth, copyHeight,
                            fit, scale, smoothing, backgroundColor,
                            drawWidth, drawHeight, dx, dy;

                        if (T_IMAGE !== img.type) {

                            img.checkSource();
                            obj.identifier = `user-image-${obj.asset}-${generateUuid()}`;
                            this.dirtyFilterIdentifier = true;
                        }

                        if (!checkForWorkstoreItem(obj.identifier)) {

                            width = img.sourceNaturalWidth;
                            height = img.sourceNaturalHeight;
                            snd = img.sourceNaturalDimensions;
                            cnd = img.currentDimensions;

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

                            if (width && height) {

                                copyStartX = (obj.copyStartX != null) ? obj.copyStartX : obj.copyX;
                                copyStartY = (obj.copyStartY != null) ? obj.copyStartY : obj.copyY;

                                copyStartX = (copyStartX != null) ? copyStartX : 0;
                                copyStartY = (copyStartY != null) ? copyStartY : 0;
                                copyWidth = obj.copyWidth;
                                copyHeight = obj.copyHeight;

                                if (copyStartX.substring) copyStartX = (parseFloat(copyStartX) / 100) * width;
                                if (copyStartY.substring) copyStartY = (parseFloat(copyStartY) / 100) * height;

                                copyStartX = _floor(copyStartX);
                                copyStartY = _floor(copyStartY);

                                if (copyStartX < 0) copyStartX = 0;
                                else if (copyStartX >= width) copyStartX = width - 1;

                                if (copyStartY < 0) copyStartY = 0;
                                else if (copyStartY >= height) copyStartY = height - 1;

                                if (copyWidth == null) copyWidth = width - copyStartX;
                                else if (copyWidth.substring) copyWidth = (parseFloat(copyWidth) / 100) * width;

                                if (copyHeight == null) copyHeight = height - copyStartY;
                                else if (copyHeight.substring) copyHeight = (parseFloat(copyHeight) / 100) * height;

                                copyWidth = _floor(copyWidth);
                                copyHeight = _floor(copyHeight);

                                if (copyWidth < 1) copyWidth = 1;
                                if (copyHeight < 1) copyHeight = 1;

                                if (copyWidth > width) copyWidth = width;
                                if (copyHeight > height) copyHeight = height;

                                if (copyStartX + copyWidth > width) copyStartX = width - copyWidth;
                                if (copyStartY + copyHeight > height) copyStartY = height - copyHeight;

                                fit = (obj.fit != null) ? obj.fit : NONE;
                                scale = (obj.scale != null) ? obj.scale : 1;
                                smoothing = (obj.smoothing != null) ? obj.smoothing : false;
                                backgroundColor = (obj.backgroundColor != null) ? obj.backgroundColor : BLANK;

                                drawWidth = copyWidth;
                                drawHeight = copyHeight;

                                if (fit === CONTAIN) {

                                    scale = _min(hostWidth / copyWidth, hostHeight / copyHeight);
                                    drawWidth = copyWidth * scale;
                                    drawHeight = copyHeight * scale;
                                }
                                else if (fit === COVER) {

                                    scale = _max(hostWidth / copyWidth, hostHeight / copyHeight);
                                    drawWidth = copyWidth * scale;
                                    drawHeight = copyHeight * scale;
                                }
                                else if (fit === STRETCH) {

                                    drawWidth = hostWidth;
                                    drawHeight = hostHeight;
                                }
                                else {

                                    drawWidth = copyWidth * scale;
                                    drawHeight = copyHeight * scale;
                                }

                                drawWidth = _max(1, _floor(drawWidth));
                                drawHeight = _max(1, _floor(drawHeight));

                                dx = ((hostWidth - drawWidth) / 2) | 0;
                                dy = ((hostHeight - drawHeight) / 2) | 0;

                                const mycell = requestCell(),
                                    engine = mycell.engine,
                                    canvas = mycell.element,
                                    src = img.source || img.element;

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

                                engine.drawImage(
                                    src,
                                    copyStartX, copyStartY, copyWidth, copyHeight,
                                    dx, dy, drawWidth, drawHeight,
                                );

                                setWorkstoreItem(obj.identifier, engine.getImageData(0, 0, hostWidth, hostHeight));

                                releaseCell(mycell);
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
