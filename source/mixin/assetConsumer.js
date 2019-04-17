/*
# Asset consumer mixin
*/
import { mergeOver } from '../core/utilities.js';
import { assetnames, asset } from '../core/library.js';

import { importImage } from '../factory/imageAsset.js';

export default function (obj = {}) {

/*
## Define attributes

All factories using the position mixin will add these to their prototype objects
*/
	let defaultAttributes = {

/*

*/
		asset: null,

/*

*/
		source: null,

/*

*/
		sourceNaturalWidth: 0,

/*

*/
		sourceNaturalHeight: 0,

/*

*/
		sourceLoaded: false,
	};
	obj.defs = mergeOver(obj.defs, defaultAttributes);

/*
## Define getter, setter and deltaSetter functions
*/
	let S = obj.setters;

/*

*/
	S.asset = function (item) {

		let index;

		if (item && item.substring) {

			index = assetnames.indexOf(item);

			if (index >= 0) {

				if (this.asset) this.asset.unsubscribe(this);

				asset[assetnames[index]].subscribe(this);
			}
		}
	};

/*

*/
	S.imageSource = function (item) {

		let results, myAsset;

		if (item.substring) {

			results = importImage(item);

			if (results) {

				myAsset = asset[results[0]]

				if (myAsset) {

					if (this.asset) this.asset.unsubscribe(this);
				
					myAsset.subscribe(this);
				}
			}
		}
	};

	return obj;
};
