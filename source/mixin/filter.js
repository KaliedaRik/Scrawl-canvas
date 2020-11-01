// # Filter mixin
// The filter mixin adds functionality to Cell, Group and all entity factories which allows those objects to use Scrawl-canvas [Filter objects](../factory/filter.html) in their output.


// #### Demos:
// + [Canvas-007](../../demo/canvas-007.html) - Apply filters at the entity, group and cell level
// + [Component-004](../../demo/component-004.html) - Scrawl-canvas packets; save and load a range of different entitys


// #### Imports
import { filter } from '../core/library.js';
import { mergeOver, pushUnique, removeItem } from '../core/utilities.js';


// #### Export function
export default function (P = {}) {


// #### Filter-related attributes
// All factories using the filter mixin will add these attributes to their objects
    let defaultAttributes = {


// __filters__ - An array of filter object String names. If only one filter is to be applied, then it is enough to use the String name of that filter object - Scrawl-canvas will make sure it gets added to the Array.
// + To add/remove new filters to the filters array, use the `addFilters` and `removeFilters` functions. Note that the `set` function will replace all the existing filters in the array with the new filters. To remove all existing filters from the array, use the `clearFilters` function
// + Multiple filters can be batch-applied to an entity, group of entitys, or an entire cell in one operation. Filters are applied in the order that they appear in in the filters array.
        filters: null,


// __isStencil__ - Use the entity as a stencil.
        isStencil: false,
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// #### Get, Set, deltaSet
    let S = P.setters;


// `filters` - Replaces the existing filters array with a new filters array. If a string name is supplied, will add that name to the existing filters array
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
        }
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

        if (!this.filters) this.filters = [];

        let myfilters = this.filters,
            floor = Math.floor,
            buckets = [],
            myobj, order;

        myfilters.forEach(name => {

            myobj = filter[name];
            order = floor(myobj.order) || 0;

            if (!buckets[order]) buckets[order] = [];

            buckets[order].push(myobj);
        });

        this.currentFilters = buckets.reduce((a, v) => a.concat(v), []);
    };


// `addFilters` - Add one or more filter name strings to the filters array. Filter name strings can be supplied as comma-separated arguments to the function
    P.addFilters = function (...args) {

        if (!Array.isArray(this.filters)) this.filters = [];

        args.forEach(item => {

            if (this.name, 'addFilters', item) {

                if (item.substring) pushUnique(this.filters, item);
                else if (item.type === 'Filter') pushUnique(this.filters, item.name);
            }
        }, this);

        this.dirtyFilters = true;
        this.dirtyImageSubscribers = true;

        return this;
    };


// `removeFilters` - Remove one or more filter name strings from the filters array. Filter name strings can be supplied as comma-separated arguments to the function
    P.removeFilters = function (...args) {

        if (!Array.isArray(this.filters)) this.filters = [];

        args.forEach(item => {

            if (item) {

                if (item.substring) removeItem(this.filters, item);
                else if (item.type === 'Filter') removeItem(this.filters, item.name);
            }
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

// Return the prototype
    return P;
};
