/*
# Group factory
*/
import { constructors, cell, artefact, group, groupnames, entity } from '../core/library.js';
import { mergeOver, pushUnique, removeItem } from '../core/utilities.js';

import { requestFilterWorker, releaseFilterWorker, actionFilterWorker } from './filter.js';
import { requestCell, releaseCell } from './cell.js';

import baseMix from '../mixin/base.js';
import filterMix from '../mixin/filter.js';

/*
## Group constructor
*/
const Group = function (items = {}) {

	this.makeName(items.name);
	this.register();
	this.set(this.defs);

	this.artefacts = [];
	this.artefactBuckets = [];
	this.set(items);

	return this;
};

/*
## Group object prototype setup
*/
let P = Group.prototype = Object.create(Object.prototype);

P.type = 'Group';
P.lib = 'group';
P.isArtefact = false;
P.isAsset = false;

/*
Apply mixins to prototype object
*/
P = baseMix(P);
P = filterMix(P);

/*
## Define default attributes
*/
let defaultAttributes = {

/*

*/
	artefacts: null,

/*

*/
	artefactBuckets: null,

/*

*/
	host: '',

/*

*/
	order: 0,

/*

*/
	visibility: true,

/*

*/
	batchResort: true,

/*

*/
	regionRadius: 0
};
P.defs = mergeOver(P.defs, defaultAttributes);

/*
## Define attribute getters and setters
*/
let G = P.getters,
	S = P.setters;

G.artefacts = function () {
	return [].concat(this.artefacts);
};

S.artefacts = function (item) {
	this.artefacts = [];
	this.addArtefacts(item);
};

S.host = function (item) {

	let host = this.getHost(item);

	if (host && host.addGroups) {
		this.host = item;
		host.addGroups(this.name);
	}
};

S.order = function (item) {

	let host = this.getHost(item);

	this.order = item;
	if(host){
		host.set({
			batchResort: true
		});
	}
};

/*
## Define prototype functions
*/

/*

*/
P.getHost = function (item) {

	return artefact[item] || cell[item] || null;
};

/*
The Display Cycle is mediated through Groups - these Group functions control display functionality via a series of Promise cascades which in turn allow individual artefacts to make use of web workers, where appropriate, to achieve their stamping functionality - for example when they need to apply image filters to their output.
*/
P.stamp = function () {

	let self = this;

	return new Promise((resolve) => {

		let filterCell;

		if (self.visibility) {

			filterCell = self.checkForFilters();
			self.sortArtefacts();

			self.prepareStamp(filterCell);

			self.stampAction()
			.then((res) => {

				if (filterCell) {

					self.applyFilters(filterCell)
					.then((res) => resolve(true))
					.catch((err) => resolve(false));
				}
				else resolve(true);
			})
			.catch((err) => resolve(false));
		}
		else resolve(true);
	});
};

/*

*/
P.forceStamp = function () {

	var self = this;

	return new Promise((resolve) => {

		let v = self.visibility;
		self.visibility = true;

		self.stamp()
		.then((res) => {
			self.visibility = v;
			resolve(res);
		})
		.catch((err) => {
			self.visibility = v;
			resolve(err);
		});
	});
};

/*

*/
P.applyFilters = function (myCell) {

	let self = this;

	if (this.dirtyFilters || !this.currentFilters) this.cleanFilters();

	return new Promise((resolve) => {

		let oldHost = self.getHost(self.host),
			oldElement = oldHost.element,
			oldEngine = oldHost.engine,
			oldComposite = oldEngine.globalCompositeOperation,
			oldAlpha = oldEngine.globalAlpha,

			host = myCell,
			hostElement = host.element,
			hostEngine = host.engine,
			hostState = host.state,

			image, worker;

		let cleanup = function () {

			releaseFilterWorker(worker);
			
			oldEngine.globalCompositeOperation = self.filterComposite || 'source-over';
			oldEngine.globalAlpha = self.filterAlpha || 1;
			oldEngine.setTransform(1, 0, 0, 1, 0, 0);

			oldEngine.drawImage(hostElement, 0, 0);
			
			releaseCell(host);

			oldEngine.globalCompositeOperation = oldComposite;
			oldEngine.globalAlpha = oldAlpha;
		};

		if (self.isStencil) {
			// this is where we copy over the current canvas to the new canvas using appropriate gco
			hostState.globalCompositeOperation = hostEngine.globalCompositeOperation = 'source-in';
			hostState.globalAlpha = hostEngine.globalAlpha = 1;
			hostEngine.setTransform(1, 0, 0, 1, 0, 0);
			hostEngine.drawImage(oldElement, 0, 0);
		} 

		// at this point we will send the contents of the host canvas over to the web worker, alongside details of the filters we wish to apply to it
		image = hostEngine.getImageData(0, 0, host.width, host.height);
		worker = requestFilterWorker();

		actionFilterWorker(worker, {
			image: image,
			filters: self.currentFilters
		})
		.then((img) => {

			if (img) {
				hostEngine.putImageData(img, 0, 0);
				cleanup();
				resolve(true);
			}
			else throw 'image issue';
		})
		.catch((err) => {

			cleanup();
			resolve(false);
		});
	});
};

/*

*/
P.checkForFilters = function () {

	if(this.filters && this.filters.length){
		return requestCell();
	}
	return false;
};

/*
REPLACE call to bucketSort with own functionality here
- the key is that artefactBuckets MUST be a flat array
*/
P.sortArtefacts = function () {

	if (this.batchResort) {

		this.batchResort = false;

		let floor = Math.floor,
			buckets = [];
		
		this.artefacts.forEach(name => {

			let obj = artefact[name],
				order = floor(obj.order) || 0;

			if (!buckets[order]) buckets[order] = [];

			buckets[order].push(obj);
		});

 		this.artefactBuckets = buckets.reduce((a, v) => a.concat(v), []);
	}
};

/*

*/
P.prepareStamp = function (myCell) {

	let artefactBuckets = this.artefactBuckets,
		host = this.getHost(this.host);

	if (myCell && myCell.element) {

		myCell.width = myCell.element.width = host.localWidth;
		myCell.height = myCell.element.height = host.localHeight;
	}

	artefactBuckets.forEach(item => {

		item.currentHost = (myCell && item.lib === 'entity') ? myCell : host;
		item.updateByDelta();
		item.prepareStamp();
	});
};

/*

*/
P.stampAction = function () {

	let artefactBuckets = this.artefactBuckets;

	let next = (counter) => {

		return new Promise((resolve) => {

			let art = artefactBuckets[counter];

			if (art && art.stamp) {

				art.stamp()
				.then(() => {

					next(counter + 1)
					.then(() => resolve(true))
					.catch(() => resolve(false));
				})
				.catch((err) => resolve(false));
			}
			else resolve(true)
		});
	};

	return next(0);
};

/*
Artefacts should be added to, and removed from, the group object using the __addArtefacts__ and __removeArtefacts__ functions. The argument can be one or more artefact object's name attribute, or the artefact object(s) itself.
*/
P.addArtefacts = function (...args) {

	args.forEach(item => {

		if (item) {

			if (item.substring) pushUnique(this.artefacts, item);
			else if (item.name) pushUnique(this.artefacts, item.name);
		}
	}, this);

	this.batchResort = true;
	return this;
};

/*

*/
P.moveArtefactsIntoGroup = function (...args) {

	args.forEach(item => {

		if (item) {

			let temp;

			if (item.substring) {

				temp = group[artefact[item].group];

				if (temp) temp.removeArtefacts(item);

				pushUnique(this.artefacts, item);
			}
			else if (item.name) {

				temp = group[item.group];

				if (temp) temp.removeArtefacts(item.name);

				pushUnique(this.artefacts, item.name);
			}
		}
	}, this);

	this.batchResort = true;
	return this;
};

/*

*/
P.removeArtefacts = function (...args) {

	args.forEach(item => {

		if (item) {

			if (item.substring) removeItem(this.artefacts, item);
			else if (item.name) removeItem(this.artefacts, item.name);
		}
	}, this);

	this.batchResort = true;
	return this;
};

/*
Update all artefact objects using the __updateArtefacts__ function. The supplied argument will be passed on to each artefact's _setDelta_ function.
*/
P.updateArtefacts = function (items) {

	this.cascadeAction(items, 'setDelta');
	return this;
};

/*
Set all artefact objects using the __setArtefacts__ function. The supplied argument will be passed on to each artefact's _set_ function.
*/
P.setArtefacts = function (items) {

	this.cascadeAction(items, 'set');
	return this;
};

/*

*/
P.updateByDelta = function () {

	this.cascadeAction(false, 'updateByDelta');
	return this;
};

/*

*/
P.reverseByDelta = function () {

	this.cascadeAction(false, 'reverseByDelta');
	return this;
};

/*

*/
P.addArtefactClasses = function (items) {

	this.cascadeAction(items, 'addClasses');
	return this;
};

/*

*/
P.removeArtefactClasses = function (items) {

	this.cascadeAction(items, 'removeClasses');
	return this;
};

/*

*/
P.cascadeAction = function (items, action) {

	this.artefacts.forEach(name => {

		let art = artefact[name];
		
		if(art && art[action]) art[action](items);
	});
	return this;
};

/*

*/
P.setDeltaValues = function (items, method) {

	this.artefacts.forEach(name => {

		let art = artefact[name];

		if (art && art.setDeltaValues) art.setDeltaValues(items, method);
	});
	return this;
};

/*

*/
P.addFiltersToEntitys = function () {

	if (this.filters) {

		this.artefacts.forEach(name => {

			let ent = entity[name];
			
			if (ent && ent.addFilters) ent.addFilters.apply(ent, arguments);
		});
	}
	return this;
};

/*

*/
P.removeFiltersFromEntitys = function (...args) {

	if (this.filters) {

		this.artefacts.forEach(name => {

			let ent = entity[name];

			if (ent && ent.removeFilters) ent.removeFilters.apply(ent, arguments);
		});
	}
	return this;
};

/*

*/
P.demolishGroup = function (removeFromDom) {

	let cp = [].concat(this.artefacts);

	cp.forEach(name => {

		let art = artefact[name];

		if (art && art.demolish) art.demolish(removeFromDom);
	});

	removeItem(groupnames, this.name);
	delete group[this.name];
	return true;
};

/*
The __getArtefactAt__ function checks to see if any of the group object's artefacts are located at the supplied coordinates in the argument object. The first artefact to report back as being at that coordinate will be returned by the function; where no artefacts are present at that coordinate the function returns false. The artefact with the highest order attribute value will be returned first. This function forms part of the Scrawl-canvas library's __drag-and-drop__ functionality.
*/
P.getArtefactAt = function (items) {

	let host = artefact[this.host],
		artBuckets = this.artefactBuckets;

	this.sortArtefacts();

	for (let i = artBuckets.length - 1; i >= 0; i--) {

		let art = artBuckets[i];
		
		if (art) {

			let result = art.checkHit(items, host);

			if (result) return result;
		}
	}
	return false;
};

/*
The __getAllArtefactsAt__ function returns all of the group object's artefacts located at the supplied coordinates in the argument object. The artefact with the highest order attribute value will be returned first. The function will always return an array of artefact objects.

There's scope here to use a Set?
*/
P.getAllArtefactsAt = function (items) {

	let host = artefact[this.host],
		artBuckets = this.artefactBuckets,
		resultNames = [],
		results = [];

	this.sortArtefacts();
	
	for (let i = artBuckets.length - 1; i >= 0; i--) {

		let art = artBuckets[i];
		
		if (art) {

			let result = art.checkHit(items, host);
			
			if (result && result.artefact) {

				let hit = result.artefact;

				if (resultNames.indexOf(hit.name) < 0) {

					resultNames.push(hit.name);
					results.push(hit);
				}
			}
		}
	}
	return results;
};

/*
## Exported factory function
*/
const makeGroup = function (items) {

	return new Group(items);
};

/*
Also store constructor in library - clone functionality expects to find it there
*/
constructors.Group = Group;

export {
	makeGroup,
};
