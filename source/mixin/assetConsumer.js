/*
# Asset consumer mixin
*/
import { mergeOver } from '../core/utilities.js';
import { assetnames, asset } from '../core/library.js';

import { importImage } from '../factory/imageAsset.js';
import { importVideo } from '../factory/videoAsset.js';

export default function (P = {}) {

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
	P.defs = mergeOver(P.defs, defaultAttributes);

/*
## Define getter, setter and deltaSetter functions
*/
	let S = P.setters;

/*

*/
	S.asset = function (item) {

		let oldAsset = this.asset,
			newAsset = (item && item.name) ? item.name : item;

		if (oldAsset && !oldAsset.substring) {

			if (oldAsset.name !== newAsset) oldAsset.unsubscribe(this);
		}

		this.asset = newAsset;
		this.dirtyAsset = true;
	};

/*

*/
	P.cleanAsset = function () {

		let ast = this.asset;

		if (ast && ast.substring) {

			let myAsset = asset[ast];

			if (myAsset) {

				this.dirtyAsset = false;
				myAsset.subscribe(this);
			}
		}
	};

/*

*/
	S.imageSource = function (item) {

		let results = importImage(item);

		if (results) {

			let myAsset = asset[results[0]];

			if (myAsset) {

				let oldAsset = this.asset;

				if (oldAsset && oldAsset.unsubscribe) oldAsset.unsubscribe(this);
			
				myAsset.subscribe(this);
			}
		}
	};

/*

*/
	S.videoSource = function (item) {

		let result = importVideo(item);

		if (result) {

			let myAsset = asset[result];

			if (myAsset) {

				let oldAsset = this.asset;

				if (oldAsset && oldAsset.unsubscribe) oldAsset.unsubscribe(this);
			
				myAsset.subscribe(this);
			}
		}
	};

	return P;
};
