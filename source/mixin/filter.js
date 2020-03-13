
// # Filter mixin

// TODO - documentation


// ## Imports
import { filter } from '../core/library.js';
import { mergeOver, pushUnique, removeItem } from '../core/utilities.js';

export default function (P = {}) {


// ## Define attributes

// All factories using the filter mixin will add these to their prototype objects
    let defaultAttributes = {


// An array of filter object String names. If only one filter is to be applied, then it is enough to use the String name of that filter object - Scrawl-canvas will make sure it gets added to the Array.

// To add/remove new filters to the filters array, use the addFilters() and removeFilters() functions. Note that the set() function will replace all the existing filters in the array with the new filters. To remove all existing filters from the array, use the clearFilters() function

// Multiple filters can be batch-applied to an entity, group of entitys, or an entire cell in one operation. Filters will be applied in the order defined by each filter object's __order__ value; filter objects with the same order value will be applied in the order in which they were added to the filters array.

// NOTE: currently, user-defined filters are applied after the application of all Scrawl-canvas-defined filters has completed. 
        filters: null,


// Use the entity as a stencil.
        isStencil: false,


// To make the filter transparent, so that some of the original colour shows through
        filterAlpha: 1,


// Change how the filter will be applied to the scene
        filterComposite: 'source-over',
    };
    P.defs = mergeOver(P.defs, defaultAttributes);


// ## Define getter, setter and deltaSetter functions
    let S = P.setters;


// Replaces the existing filters array with a new filters array. If a string name is supplied, will add that name to the existing filters array
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


// ## Define functions to be added to the factory prototype



// TODO - documentation

// Internal housekeeping
    P.cleanFilters = function () {

        this.dirtyFilters = false;

        if (!this.filters) this.filters = [];

        let myfilters = this.filters,
            floor = Math.floor,
            buckets = [];

        myfilters.forEach(name => {

            let myobj = filter[name],
                order = floor(myobj.order) || 0;

            if (!buckets[order]) buckets[order] = [];

            buckets[order].push(myobj);
        });

        this.currentFilters = buckets.reduce((a, v) => a.concat(v), []);
    };


// Add one or more filter name strings to the filters array. Filter name strings can be supplied as comma-separated arguments to the function
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


// Remove one or more filter name strings from the filters array. Filter name strings can be supplied as comma-separated arguments to the function
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


// Clears the filters array
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
