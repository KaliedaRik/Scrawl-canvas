/*
# Filter mixin
*/
import { filter } from '../core/library.js';
import { mergeOver, pushUnique, removeItem } from '../core/utilities.js';

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

		this.dirtyFilters = false;

		let myfilters = this.filters,
			floor = Math.floor,
			buckets = [];

		myfilters.forEach(name => {

			let obj = filter[name],
				order = floor(obj.order) || 0;

			if (!buckets[order]) buckets[order] = [];

			buckets[order].push(obj);
		});

		this.currentFilters = buckets.reduce((a, v) => a.concat(v), []);
	};

/*

*/
	obj.addFilters = function (...args) {

		args.forEach(item => {

			if (item) {

				if (item.substring) pushUnique(this.filters, item);
				else if (item.type === 'Filter') pushUnique(this.filters, item.name);
			}
		}, this);

		this.dirtyFilters = true;
		return this;
	};

/*

*/
	obj.removeFilters = function (...args) {

		args.forEach(item => {

			if (item) {

				if (item.substring) removeItem(this.filters, item);
				else if (item.type === 'Filter') removeItem(this.filters, item.name);
			}
		}, this);

		this.dirtyFilters = true;
		return this;
	};

	return obj;
};
