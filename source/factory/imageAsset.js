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

	let reg = /.*\/(.*?)\./,
		results = [];

	args.forEach(item => {

		let name, url, className, visibility, parent;

		let flag = false;

		if (item.substring) {

			let match = reg.exec(item);

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

			let image = makeImageAsset({
				name: name,
			});

			let img = document.createElement('img');

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

			image.set({
				source: img,
			});

			results.push(name);
		}
		else results.push(false);
	});
	return results;
};

/*
Import images from the DOM

Required argument is a query string used to search the dom for matching elements

Note: unlike in Scrawl-canvas v7, img elements imported from the DOM will always remain in the DOM. If those img elements should not appear on the web page or scene, then coders will need to hide them in some way - either by: positioning them (or their parent element) absolutely to the top or left of the display; or giving their parent element zero width/height; or by setting the img or parent element's style.display attribute to 'none', or their style.opacity attribute's value to 0 ... or some other clever way to hide them.
*/
const importDomImage = function (query) {

	let reg = /.*\/(.*?)\./;

	let items = document.querySelectorAll(query);

	items.forEach(item => {

		let name;

		if (['IMG', 'PICTURE'].indexOf(item.tagName.toUpperCase()) >= 0) {

			if (item.id || item.name) name = item.id || item.name;
			else {

				let match = reg.exec(item.src);
				name = (match && match[1]) ? match[1] : '';
			}

			let image = makeImageAsset({
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
	});
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

// 		/**
// A __factory__ function to convert a group of entitys into a single Picture entity

// Argument attributes can include any entity positioning and styling values, alongside the following flag:

// * __convert__ - when set to true, existing entitys in the group will be deleted; default: false

// If no name attribute is supplied in the argument object, the new Picture entity will be given the name: GROUPNAME+'_entity'
// @method Group.convertGroupToPicture
// @param {Object} items Key:value Object argument for setting attributes
// @return Picture entity object; false if no entitys contained in group
// **/
// 		my.Group.prototype.convertGroupToPicture = function(items) {
// 			var image,
// 				cell,
// 				engine;
// 			items = my.safeObject(items);
// 			if (this.entitys.length) {
// 				cell = my.cell[this.cell];
// 				engine = my.context[this.cell];
// 				image = my.prepareConvert(cell, engine, this);
// 				items.name = items.name || this.name + '_entity';
// 				items.group = items.group || this.name;
// 				if (items.convert) {
// 					my.deleteEntity(this.entitys);
// 				}
// 				return my.doConvert(image, items);
// 			}
// 			return false;
// 		};

/*
TODO: code up this functionality - function should be available to users
*/
const createImageFromEntity = function (items) {

	return false;
};

// 		/**
// A __factory__ function to convert a entity into a Picture entity

// Argument attributes can include any entity positioning and styling values, alongside the following flag:

// * __convert__ - when set to true, existing entity will be deleted; default: false

// If no name attribute is supplied in the argument object, the new Picture entity will be given the name: SPRITENAME+'_picture'
// @method Entity.convertToPicture
// @param {Object} items Key:value Object argument for setting attributes
// @return Picture entity object
// **/
// 		my.Entity.prototype.convertToPicture = function(items) {
// 			var image,
// 				cell,
// 				engine,
// 				cellname = my.group[this.group].cell;
// 			items = my.safeObject(items);
// 			cell = my.cell[cellname];
// 			engine = my.context[cellname];
// 			image = my.prepareConvert(cell, engine, this);
// 			items.name = items.name || this.name + '_picture';
// 			items.group = items.group || this.group;
// 			if (items.convert) {
// 				my.deleteEntity([this.name]);
// 			}
// 			return my.doConvert(image, items);
// 		};


// 		/**
// Helper function for convert functions
// @method prepareConvert
// @return ImageData object
// @private
// **/
// 		my.prepareConvert = function(cell, ctx, obj) {
// 			var image,
// 				data,
// 				left,
// 				right,
// 				top,
// 				bottom,
// 				pos,
// 				i,
// 				iz,
// 				j,
// 				jz;
// 			left = cell.actualWidth;
// 			right = 0;
// 			top = cell.actualHeight;
// 			bottom = 0;
// 			cell.clear();
// 			obj.stamp(null, cell.name);
// 			image = ctx.getImageData(0, 0, cell.actualWidth, cell.actualHeight);
// 			data = image.data;
// 			for (i = 0, iz = cell.actualHeight; i < iz; i++) {
// 				for (j = 0, jz = cell.actualWidth; j < jz; j++) {
// 					pos = (((i * cell.actualWidth) + j) * 4) + 3;
// 					if (data[pos] > 0) {
// 						top = (top > i) ? i : top;
// 						bottom = (bottom < i) ? i : bottom;
// 						left = (left > j) ? j : left;
// 						right = (right < j) ? j : right;
// 					}
// 				}
// 			}
// 			image = ctx.getImageData(left, top, (right - left + 1), (bottom - top + 1));
// 			cell.clear();
// 			return image;
// 		};
// 		/**
// Helper function for convert functions
// @method doConvert
// @return Picture entity object
// @private
// **/
// 		my.doConvert = function(image, items) {
// 			var cv = my.work.imageCanvas;
// 			cv.width = image.width;
// 			cv.height = image.height;
// 			my.work.imageCvx.putImageData(image, 0, 0);
// 			items.url = cv.toDataURL();
// 			items.width = image.width;
// 			items.height = image.height;
// 			image = my.makeImage(items);
// 			return my.makePicture(items);
// 		};

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
