/*
# Asset mixin

TODO - documentation
*/
import { mergeOver, pushUnique, defaultNonReturnFunction } from '../core/utilities.js';

export default function (P = {}) {

/*
## Define attributes

All factories using the asset mixin will add these to their prototype objects
*/
	let defaultAttributes = {

/*
TODO - documentation
*/
		sourceLoaded: false,

/*
TODO - documentation
*/
		source: null,

/*
TODO - documentation
*/
		subscribers: null,
	};
	P.defs = mergeOver(P.defs, defaultAttributes);

/*
## Packet management

Currently nothing to do here beyond excluding some defs

TODO: work out how we're going to handle assets in packages
	- currently assume asset already exists on the destination device browser
	- we could include the &lt;img> element's src attribute in the packet??
	- then when it comes to unpacking, check if it really does exist
		- if not exist, do the load thing

	- same work required across imageAsset, spriteAsset, videoAsset
*/
	P.packetExclusions = pushUnique(P.packetExclusions, ['sourceLoaded', 'source', 'subscribers']);
	P.packetExclusionsByRegex = pushUnique(P.packetExclusionsByRegex, []);
	P.packetCoordinates = pushUnique(P.packetCoordinates, []);
    P.packetObjects = pushUnique(P.packetObjects, []);
    P.packetFunctions = pushUnique(P.packetFunctions, []);

    P.finalizePacketOut = function (copy, items) {

    	if (this.subscribers && this.subscribers.length) {

			copy.subscribers = this.subscribers.map(sub => sub.name);
    	}
        return copy;
    };

/*
## Define getter, setter and deltaSetter functions
*/
	let G = P.getters, 
		S = P.setters, 
		D = P.deltaSetters;

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
TODO - documentation
*/
	P.assetConstructor = function (items = {}) {

		this.makeName(items.name);
		this.register();
		this.subscribers = [];
		this.set(this.defs);
		this.set(items);

		if (items.subscribe) this.subscribers.push(items.subscribe);

		return this;
	};

/*
TODO - documentation
*/
	// P.kill = function () {

	// 	this.deregister();

	// 	return this;
	// };

/*
TODO - documentation
*/
	P.notifySubscribers = function () {

		this.subscribers.forEach(sub => this.notifySubscriber(sub), this);
	};

	P.notifySubscriber = function (sub) {

		sub.sourceNaturalWidth = this.sourceNaturalWidth;
		sub.sourceNaturalHeight = this.sourceNaturalHeight;
		sub.sourceLoaded = this.sourceLoaded;
		sub.source = this.source;
		sub.dirtyImage = true;
		sub.dirtyCopyStart = true;
		sub.dirtyCopyDimensions = true;
		sub.dirtyImageSubscribers = true;
	};

/*
TODO - documentation
*/
	P.subscribe = function (sub = {}) {

		if (sub && sub.name) {

			let name = sub.name;

			if (this.subscribers.every(item => item.name !== name)) this.subscribeAction(sub);
		}
	};

/*
Separated out because cells handle things differently (they ARE the source)
*/
	P.subscribeAction = function (sub = {}) {

		this.subscribers.push(sub);
		sub.asset = this;
		sub.source = this.source;
		this.notifySubscriber(sub);
	};

	P.unsubscribe = function (sub = {}) {

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

	return P;
};
