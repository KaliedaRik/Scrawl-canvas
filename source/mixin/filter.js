/*
# Filter mixin
*/
import { filter } from '../core/library.js';
import { bucketSort, mergeOver, pushUnique, removeItem } from '../core/utilities.js';

export default function (obj = {}) {

/*
## Define attributes

All factories using the filter mixin will add these to their prototype objects
*/
	let defaultAttributes = {

/*

*/
		filters: null,

/*

*/
		isStencil: false,

/*

*/
		filterResort: true,

/*

*/
		filterAlpha: 1,

/*

*/
		filterComposite: 'source-over',
	};
	obj.defs = mergeOver(obj.defs, defaultAttributes);

/*
## Define getter, setter and deltaSetter functions
*/
	let S = obj.setters;

/*

*/
	S.filters = function (item) {

		if (!Array.isArray(this.filters)) this.filters = [];

		if (item) {

			if (Array.isArray(item)) {

				this.filters = item;
				this.dirtyFilters = true;
			}
			else if (item.substring) {
				
				pushUnique(this.filters, item);	
				this.dirtyFilters = true;
			}
		}
	};

/*
## Define functions to be added to the factory prototype
*/

/*

*/
	obj.cleanFilters = function () {

		let i, iz, item, filt;

		// 1. bucket sort the filters array (made up of filter.name strings), on order attribute
		if (this.filters.length > 1) bucketSort('filter', 'order', this.filters);

		// 2. create/reset the currentFilters array, which holds the filters objects (in order)
		if (!Array.isArray(this.currentFilters)) this.currentFilters = [];
		else this.currentFilters.length = 0;

		// 3. populate the currentFilters array
		for (i = 0, iz = this.filters.length; i < iz; i++) {

			item = this.filters[i];

			if (item) {

				filt = filter[item];

				if (filt) this.currentFilters.push(filt);
			}
		}

		// 4. unset the flag
		this.dirtyFilters = false;
	};

/*

*/
	obj.addFilters = function (...args) {

		let i, iz, item;

		for (i = 0, iz = args.length; i < iz; i++) {

			item = args[i];

			if (item) {

				if (item.substring) pushUnique(this.filters, item);
				else if (item.type === 'Filter') pushUnique(this.filters, item.name);
			}
		}

		this.dirtyFilters = true;
		return this;
	};

/*

*/
	obj.removeFilters = function (...args) {

		let i, iz, item;

		for (i = 0, iz = args.length; i < iz; i++) {

			item = args[i];
			
			if (item) {

				if (item.substring) removeItem(this.filters, item);
				else if (item.type === 'Filter') removeItem(this.filters, item.name);
			}
		}

		this.dirtyFilters = true;
		return this;
	};

	return obj;
};
