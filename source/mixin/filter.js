// # Filter mixin
// The filter mixin adds functionality to Cell, Group and all entity factories which allows those objects to use Scrawl-canvas [Filter objects](../factory/filter.html) in their output.


// #### Demos:
// + [Canvas-007](../../demo/canvas-007.html) - Apply filters at the entity, group and cell level
// + [Packets-002](../../demo/packets-002.html) - Scrawl-canvas packets; save and load a range of different entitys


// #### Imports
import { filter, asset } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, Ωempty, generateUuid } from '../core/utilities.js';
import { requestCell, releaseCell } from '../factory/cell.js';


// #### Export function
export default function (P = Ωempty) {


// #### Filter-related attributes
// All factories using the filter mixin will add these attributes to their objects
    let defaultAttributes = {

// __filters__ - An array of filter object String names. If only one filter is to be applied, then it is enough to use the String name of that filter object - Scrawl-canvas will make sure it gets added to the Array.
// + To add/remove new filters to the filters array, use the `addFilters` and `removeFilters` functions. Note that the `set` function will replace all the existing filters in the array with the new filters. To remove all existing filters from the array, use the `clearFilters` function
// + Multiple filters will be batch-applied to an entity, group of entitys, or an entire cell in one operation. Filters are applied in the order that they appear in in the filters array.
// + ___Be aware that the "filters" (plural) attribute is different to the CSS/SVG "filter" (singular) attribute___ - details about how Scrawl-canvas uses CSS/SVG filter Strings to produce filtering effects (at the entity and Cell levels only) are investigated in the Filter Demos 051 to 055. CSS/SVG filter Strings can be applied in addition to Scrawl-canvas filters Array objects, and will be applied after them.
        filters: null,

// __isStencil__ - Use the entity as a stencil. When this flag is set filter effects will be applied to the background imagery covered by the entity (or Group of entitys, or Cell), the results of which will replace the entity/Group/Cell in the final display.
        isStencil: false,

// __memoizeFilterOutput__ - 
        memoizeFilterOutput: false,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Get, Set, deltaSet
    let S = P.setters;


// `filters` - ___Dangerous action!__ - replaces the existing filters Array with a new filters Array. If a string name is supplied, will add that name to the existing filters array
    S.filters = function (item) {

        if (!Array.isArray(this.filters)) this.filters = [];

        if (item) {

            if (Array.isArray(item)) {

                this.filters = item;

                this.dirtyFilters = true;
                this.dirtyImageSubscribers = true;
        
            }
            else if (item.substring) {
                
                pushUnique(this.filters, item); 

                this.dirtyFilters = true;
                this.dirtyImageSubscribers = true;
            }
            this.dirtyFilterIdentifier = true;
        }
    };

// `memoizeFilterOutput` - ___Dangerous action!__ - replaces the existing filters Array with a new filters Array. If a string name is supplied, will add that name to the existing filters array
    S.memoizeFilterOutput = function (item) {

        this.memoizeFilterOutput = item;
        this.updateFilterIdentifier(!!item);
    };
    P.updateFilterIdentifier = function (item) {

        console.log('memoizeFilterOutput', this.memoizeFilterOutput, item);

        this.dirtyFilterIdentifier = false;
        if (this.state) this.state.dirtyFilterIdentifier = false;

        if (this.memoizeFilterOutput && item) this.filterIdentifier = generateUuid();
        else this.filterIdentifier = '';
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
    P.cleanFilters = function () {

        this.dirtyFilters = false;
        this.dirtyFiltersCache = true;

        if (!this.filters) this.filters = [];

        let myfilters = this.filters,
            floor = Math.floor,
            buckets = [],
            myobj, order;

        myfilters.forEach(name => {

            myobj = filter[name];

            if (myobj) {

                order = floor(myobj.order) || 0;

                if (!buckets[order]) buckets[order] = [];

                buckets[order].push(myobj);
            }
        });

        this.currentFilters = buckets.reduce((a, v) => a.concat(v), []);
    };


// `addFilters`, `removeFilters` - Add or remove one or more filter name strings to/from the filters array. Filter name strings can be supplied as comma-separated arguments to the function
    P.addFilters = function (...args) {

        if (!Array.isArray(this.filters)) this.filters = [];

        args.forEach(item => {

            if (item && item.type === 'Filter') item = item.name;
            pushUnique(this.filters, item);

        }, this);

        this.dirtyFilters = true;
        this.dirtyImageSubscribers = true;

        return this;
    };

    P.removeFilters = function (...args) {

        if (!Array.isArray(this.filters)) this.filters = [];

        args.forEach(item => {

            if (item && item.type === 'Filter') item = item.name;
            removeItem(this.filters, item);

        }, this);

        this.dirtyFilters = true;
        this.dirtyImageSubscribers = true;
        
        return this;
    };

// `clearFilters` - Clears the filters array
    P.clearFilters = function () {

        if (!Array.isArray(this.filters)) this.filters = [];

        this.filters.length = 0;

        this.dirtyFilters = true;
        this.dirtyImageSubscribers = true;
        
        return this;
    };

// `preprocessFilters` - internal function called as part of the Display cycle. The __process-image__ filter action loads a Scrawl-canvas asset into the filters engine, where it can be used as a lineIn or lineMix argument for other filter actions.
    P.preprocessFilters = function (filters) {

        for (let i = 0, iz = filters.length, filter; i < iz; i++) {

            filter = filters[i];

            for (let j = 0, jz = filter.actions.length, obj; j < jz; j++) {

                obj = filter.actions[j];

                if (obj.action == 'process-image') {

                    let flag = true;

                    let img = asset[obj.asset];

                    if (img) {

                        if ('Image' !== img.type) {

                            img.checkSource();
                            this.dirtyFilterIdentifier = true;
                        }

                        if (img.type === 'Video' || img.type === 'Sprite' || img.type === 'Noise' || img.type === 'Cell' || img.type === 'RawAsset' || img.type === 'RdAsset') {

                            img.checkSource();
                        }

                        let width = img.sourceNaturalWidth,
                            height = img.sourceNaturalHeight,
                            snd = img.sourceNaturalDimensions,
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

                            flag = false;

                            let copyX = obj.copyX || 0,
                                copyY = obj.copyY || 0,
                                copyWidth = obj.copyWidth || 1,
                                copyHeight = obj.copyHeight || 1,
                                destWidth = obj.width || 1,
                                destHeight = obj.height || 1;

                            if (copyX.substring) copyX = (parseFloat(copyX) / 100) * width;
                            if (copyY.substring) copyY = (parseFloat(copyY) / 100) * height;
                            if (copyWidth.substring) copyWidth = (parseFloat(copyWidth) / 100) * width;
                            if (copyHeight.substring) copyHeight = (parseFloat(copyHeight) / 100) * height;

                            copyX = Math.abs(copyX);
                            copyY = Math.abs(copyY);
                            copyWidth = Math.abs(copyWidth);
                            copyHeight = Math.abs(copyHeight);

                            if (copyX > width) {
                                copyX = width - 2;
                                copyWidth = 1;
                            }

                            if (copyY > height) {
                                copyY = height - 2;
                                copyHeight = 1;
                            }

                            if (copyWidth > width) {
                                copyWidth = width - 1;
                                copyX = 0;
                            }

                            if (copyHeight > height) {
                                copyHeight = height - 1;
                                copyY = 0;
                            }


                            if (copyX + copyWidth > width) {
                                copyX = width - copyWidth - 1;
                            }

                            if (copyY + copyHeight > height) {
                                copyY = height - copyHeight - 1;
                            }

                            let cell = requestCell(),
                                engine = cell.engine,
                                canvas = cell.element;

                            canvas.width = destWidth;
                            canvas.height = destHeight;

                            engine.setTransform(1, 0, 0, 1, 0, 0);
                            engine.globalCompositeOperation = 'source-over';
                            engine.globalAlpha = 1;

                            let src = img.source || img.element;

                            engine.drawImage(src, copyX, copyY, copyWidth, copyHeight, 0, 0, destWidth, destHeight);

                            obj.assetData = engine.getImageData(0, 0, destWidth, destHeight);

                            releaseCell(cell);
                        }
                    }

                    if (flag) {

                        obj.assetData = {
                            width: 1,
                            height: 1,
                            data: new Uint8ClampedArray(4),
                        }
                    }
                }
            }
            if (filter.dirtyFilterIdentifier) this.dirtyFilterIdentifier = true;
        }
        if (this.dirtyFilterIdentifier || (this.state && this.state.dirtyFilterIdentifier)) this.updateFilterIdentifier(true);
    };

// Return the prototype
    return P;
};
