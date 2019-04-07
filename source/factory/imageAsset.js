/*
# ImageAsset factory
*/
import { constructors } from '../core/library.js';
import { mergeOver, pushUnique, isa_obj } from '../core/utilities.js';

import baseMix from '../mixin/base.js';
import assetMix from '../mixin/asset.js';

/*
## ImageAsset constructor
*/
const ImageAsset = function (items = {}) {

	this.makeName(items.name);
	this.register();
	this.subscribers = [];
	this.set(this.defs);
	this.set(items);

	if (items.subscribe) this.subscribers.push(items.subscribe);

	return this;
};

/*
## ImageAsset object prototype setup
*/
let P = ImageAsset.prototype = Object.create(Object.prototype);
P.type = 'Image';
P.lib = 'asset';
P.isArtefact = false;
P.isAsset = true;

/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = assetMix(P);

/*
## Define default attributes
*/
let defaultAttributes = {

};
P.defs = mergeOver(P.defs, defaultAttributes);

let G = P.getters,
	S = P.setters,
	D = P.deltaSetters;

/*

*/


/*
## Define prototype functions
*/

/*
Import images from wherever

Arguments can be either string urls - 'http://www.example.com/path/to/image/flower.jpg' - in which case Scrawl-canvas:

* will attempt to give the new imageAsset object, and img element, a name/id value of eg 'flower' (but not guaranteed)
* will not add the new img element to the DOM

... or the argument can be an object with the following attributes:

* __name__ string
* __src__ url string
* __parent__ CSS search string - if set, Scrawl-canvas will attempt to append the new img element to the corresponding DOM element
* __isVisible__ boolean - if true, and new img element has been added to DOM, make that image visible; default is false
* __className__ string - list of classes to be added to the new img element
*/
const importImage = function (...args) {

	let i, iz,
		reg = /.*\/(.*?)\./;

	for (i = 0, iz = args.length; i < iz; i++) {

		let item, match, name, url, flag, className, visibility, parent, img, image,
			results = [];

		item = args[i];
		flag = false;

		if (item.substring) {

			match = reg.exec(item);
			name = (match && match[1]) ? match[1] : '';

			url = item;
			className = '';
			visibility = false;
			parent = null;

			flag = true;
		}
		else {

			item = (isa_obj(item)) ? item : false;

			if (item && item.src) {

				name = item.name || '';

				url = item.src;
				className = item.className || '';
				visibility = item.visibility || false;
				parent = document.querySelector(parent);

				flag = true;
			}
		}	

		if (flag) {

			image = makeImageAsset({
				name: name,
			});

			img = document.createElement('img');

			img.name = name;
			img.className = className;
			img.crossorigin = 'anonymous';

			img.style.display = (visibility) ? 'block' : 'none';

			img.onload = () => {

				image.set({
					source: img,
				});

				if (parent) parent.appendChild(img);
			};
			
			img.src = url;

			results.push(name);
		}
		else results.push(false);
	}
	return results;
};

/*
Import images from the DOM

Required argument is a query string used to search the dom for matching elements

Note: unlike in Scrawl-canvas v7, img elements imported from the DOM will always remain in the DOM. If those img elements should not appear on the web page or scene, then coders will need to hide them in some way - either by: positioning them (or their parent element) absolutely to the top or left of the display; or giving their parent element zero width/height; or by setting the img or parent element's style.display attribute to 'none', or their style.opacity attribute's value to 0 ... or some other clever way to hide them.
*/
const importDomImage = function (query) {

	let items, i, iz,
		reg = /.*\/(.*?)\./;

	items = document.querySelectorAll(query);

	for (i = 0, iz = items.length; i < iz; i++) {

		let item = items[i],
			image, name, match;

		if (['IMG', 'PICTURE'].indexOf(item.tagName.toUpperCase()) >= 0) {

			if (item.id || item.name) name = item.id || item.name;
			else {

				match = reg.exec(item.src);
				name = (match && match[1]) ? match[1] : '';
			}

			image = makeImageAsset({
				name: name,
				source: item,
			});

			if (!item.complete) {

				item.onload = () => {

					image.set({
						source: item,
					});
				};
			}
		}
	}
};

/*
TODO: code up this functionality - function should be available to users
*/
const createImageFromCell = function (items) {

	return false;
};

/*
TODO: code up this functionality - function should be available to users
*/
const createImageFromGroup = function (items) {

	return false;
};

/*
TODO: code up this functionality - function should be available to users
*/
const createImageFromEntity = function (items) {

	return false;
};


/*
## Exported factory function
*/
const makeImageAsset = function (items) {
	return new ImageAsset(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.ImageAsset = ImageAsset;

export {
	makeImageAsset,

	importImage,
	importDomImage,

	createImageFromCell,
	createImageFromGroup,
	createImageFromEntity,
};
