/*
# Asset mixin
*/
import { mergeOver, defaultNonReturnFunction } from '../core/utilities.js';

export default function (obj = {}) {

/*
## Define attributes

All factories using the filter mixin will add these to their prototype objects
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

*/
	S.source = function (item = {}) {

		if (item) {

			// For &lt;img> and &lt;picture> elements
			if (['IMG', 'PICTURE'].indexOf(item.tagName.toUpperCase()) >= 0) {

				this.source = item;
				this.sourceNaturalWidth = item.naturalWidth;
				this.sourceNaturalHeight = item.naturalHeight;
				this.sourceLoaded = item.complete;
			}

			// TODO: for &lt;video> elements
			else if (item.tagName.toUpperCase() === 'VIDEO') {

			}

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
	obj.checkSource = function (width, height) {

		let el = this.source;

		if (this.sourceLoaded) {

			if (this.sourceNaturalWidth !== el.naturalWidth || 
					this.sourceNaturalHeight !== el.naturalHeight || 
					this.sourceNaturalWidth !== width ||
					this.sourceNaturalHeight !== height) {

				this.sourceNaturalWidth = el.naturalWidth;
				this.sourceNaturalHeight = el.naturalHeight;

				this.notifySubscribers();
			}
		}
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
