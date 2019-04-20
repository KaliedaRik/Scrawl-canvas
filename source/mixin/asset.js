/*
# Asset mixin
*/
import { mergeOver, defaultNonReturnFunction } from '../core/utilities.js';

export default function (obj = {}) {

/*
## Define attributes

All factories using the asset mixin will add these to their prototype objects
*/
	let defaultAttributes = {

/*

*/
		sourceLoaded: false,

/*

*/
		source: null,

/*

*/
		subscribers: null,
	};
	obj.defs = mergeOver(obj.defs, defaultAttributes);

/*
## Define getter, setter and deltaSetter functions
*/
	let G = obj.getters, 
		S = obj.setters, 
		D = obj.deltaSetters;

/*
imageAsset.js and videoAsset.js overwrite this function, thus only put here so cell.js also gains the function - which I don't think it will ever need as cells ARE their own source
*/
	S.source = function (item = {}) {

		if (item) {

			// No action required for Canvas objects as they don't have a source; they ARE the source!
			if (this.sourceLoaded) this.notifySubscribers();
		}
	};

/*

*/
	S.subscribers = defaultNonReturnFunction;

/*
## Define functions to be added to the factory prototype
*/

/*

*/
	obj.assetConstructor = function (items = {}) {

		this.makeName(items.name);
		this.register();
		this.subscribers = [];
		this.set(this.defs);
		this.set(items);

		if (items.subscribe) this.subscribers.push(items.subscribe);

		return this;
	};

/*

*/
	obj.notifySubscribers = function () {

		this.subscribers.forEach(sub => this.notifySubscriber(sub), this);
	};

/*

*/
	obj.notifySubscriber = function (sub) {

		sub.sourceNaturalWidth = this.sourceNaturalWidth;
		sub.sourceNaturalHeight = this.sourceNaturalHeight;
		sub.sourceLoaded = this.sourceLoaded;
		sub.dirtyImage = true;
		sub.dirtyCopyStart = true;
		sub.dirtyCopyDimensions = true;
	};

/*

*/
	obj.subscribe = function (sub = {}) {

		if (sub && sub.name) {

			let name = sub.name;

			if (this.subscribers.every(item => item.name !== name)) this.subscribeAction(sub);
		}
	};

/*
Separated out because cells handle things differently (they ARE the source)
*/
	obj.subscribeAction = function (sub = {}) {

		this.subscribers.push(sub);
		sub.asset = this;
		sub.source = this.source;
		this.notifySubscriber(sub);
	};

/*

*/
	obj.unsubscribe = function (sub = {}) {

		if (sub.name) {

			let name = sub.name,
				index = this.subscribers.findIndex(item => item.name === name);

			if (index >= 0) {

				sub.source = null;
				sub.asset = null;
				sub.sourceNaturalHeight = 0;
				sub.sourceNaturalWidth = 0;
				sub.sourceLoaded = false;
				this.subscribers.splice(index, 1)
			}
		}
	};

	return obj;
};
