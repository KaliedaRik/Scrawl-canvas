/*
# Group factory
*/
import { constructors, cell, artefact, group, groupnames, entity } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, bucketSort } from '../core/utilities.js';

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
let Gp = Group.prototype = Object.create(Object.prototype);

Gp.type = 'Group';
Gp.lib = 'group';
Gp.artefact = false;

/*
Apply mixins to prototype object
*/
Gp = baseMix(Gp);
Gp = filterMix(Gp);

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
Gp.defs = mergeOver(Gp.defs, defaultAttributes);

/*
## Define attribute getters and setters
*/
let G = Gp.getters,
	S = Gp.setters;

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
Gp.getHost = function (item) {

	return artefact[item] || cell[item] || null;
};

/*
The Display Cycle is mediated through Groups - these Group functions control display functionality via a series of Promise cascades which in turn allow individual artefacts to make use of web workers, where appropriate, to achieve their stamping functionality - for example when they need to apply image filters to their output.
*/
Gp.stamp = function () {

	let self = this;

	return new Promise((resolve) => {

		let filterCell;

		if (self.visibility) {

			// need a way to (intelligently) integrate filters and displace maps
			// - particularly as the map is really a form of filter ...
			// - but I want displacement work handled in a dedicated displacement worker
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
Gp.forceStamp = function () {

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
Gp.applyFilters = function (myCell) {

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
Gp.checkForFilters = function () {

	if(this.filters && this.filters.length){
		return requestCell();
	}
	return false;
};

/*

*/
Gp.sortArtefacts = function () {

	let i, iz, item, order, arts, b;

	if (this.batchResort) {

		this.batchResort = false;

		this.artefacts = bucketSort('artefact', 'order', this.artefacts);
		arts = this.artefacts;

		if (Array.isArray(this.artefactBuckets)) this.artefactBuckets.length = 0;
		else this.artefactBuckets = [];

		b = this.artefactBuckets;

		for (i = 0, iz = arts.length; i < iz; i++) {

			item = artefact[arts[i]];
			if (item) b.push(item);
		}
	}
};

/*

*/
Gp.prepareStamp = function (myCell) {

	let arts = this.artefactBuckets,
		host = this.getHost(this.host),
		i, iz, item;

	if (myCell && myCell.element) {

		myCell.width = myCell.element.width = host.localWidth;
		myCell.height = myCell.element.height = host.localHeight;
	}

	for (i = 0, iz = arts.length; i < iz; i++) {

		item = arts[i];
		item.currentHost = (myCell && item.lib === 'entity') ? myCell : host;
		item.updateByDelta();
		item.prepareStamp();
	}
};

/*

*/
Gp.stampAction = function () {

	let self = this;

	return new Promise((resolve) => {

		self.batchProcess(0)
		.then((res) => resolve(true))
		.catch((err) => resolve(false));
	});
};

/*

*/
Gp.batchProcess = function (counter) {

	let self = this;

	return new Promise((resolve) => {

		let i, iz, check,
			item = self.artefactBuckets[counter];

		if (item) {

			item.stamp()
			.then((res) => {

				check = self.artefactBuckets[counter + 1];

				if (check) {

					self.batchProcess(counter + 1)
					.then((res) => resolve(true))
					.catch((err) => resolve(false));
				}
				else resolve(true);
			})
			.catch((err) => resolve(false));
		}
		else resolve(true)
	});
};

/*
Artefacts should be added to, and removed from, the group object using the __addArtefacts__ and __removeArtefacts__ functions. The argument can be one or more artefact object's name attribute, or the artefact object(s) itself.
*/
Gp.addArtefacts = function (...args) {

	let i, iz, item;

	for(i = 0, iz = args.length; i < iz; i++){

		item = args[i];

		if (item) {

			if (item.substring) pushUnique(this.artefacts, item);
			else if (item.name) pushUnique(this.artefacts, item.name);
		}
	}

	this.batchResort = true;
	return this;
};

/*

*/
Gp.moveArtefactsIntoGroup = function (...args) {

	let i, iz, item, temp;

	for (i = 0, iz = args.length; i < iz; i++) {

		item = args[i];
		
		if (item) {

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
	}

	this.batchResort = true;
	return this;
};

/*

*/
Gp.removeArtefacts = function (...args) {

	let i, iz, item;

	for (i = 0, iz = args.length; i < iz; i++) {

		item = args[i];

		if (item) {

			if (item.substring) removeItem(this.artefacts, item);
			else if (item.name) removeItem(this.artefacts, item.name);
		}
	}

	this.batchResort = true;
	return this;
};

/*
Update all artefact objects using the __updateArtefacts__ function. The supplied argument will be passed on to each artefact's _setDelta_ function.
*/
Gp.updateArtefacts = function (items) {

	this.cascadeAction(items, 'setDelta');
	return this;
};

/*
Set all artefact objects using the __setArtefacts__ function. The supplied argument will be passed on to each artefact's _set_ function.
*/
Gp.setArtefacts = function (items) {

	this.cascadeAction(items, 'set');
	return this;
};

/*

*/
Gp.updateByDelta = function () {

	this.cascadeAction(false, 'updateByDelta');
	return this;
};

/*

*/
Gp.reverseByDelta = function () {

	this.cascadeAction(false, 'reverseByDelta');
	return this;
};

/*

*/
Gp.addArtefactClasses = function (items) {

	this.cascadeAction(items, 'addClasses');
	return this;
};

/*

*/
Gp.removeArtefactClasses = function (items) {

	this.cascadeAction(items, 'removeClasses');
	return this;
};

/*

*/
Gp.cascadeAction = function (items, action) {

	let i, iz, art;

	for (i = 0, iz = this.artefacts.length; i < iz; i++) {

		art = artefact[this.artefacts[i]];
		
		if(art && art[action]) art[action](items);
	}
	return this;
};

/*

*/
Gp.setDeltaValues = function (items, method) {

	let i, iz, art;

	for (i = 0, iz = this.artefacts.length; i < iz; i++) {

		art = artefact[this.artefacts[i]];

		if (art && art.setDeltaValues) art.setDeltaValues(items, method);
	}
	return this;
};

/*

*/
Gp.addFiltersToEntitys = function () {

	let i, iz, ent;

	if (this.filters) {

		for (i = 0, iz = this.artefacts.length; i < iz; i++) {

			ent = entity[this.artefacts[i]];
			
			if (ent && ent.addFilters) ent.addFilters.apply(ent, arguments);
		}
	}
	return this;
};

/*

*/
Gp.removeFiltersFromEntitys = function (...args) {

	let i, iz, ent;

	if (this.filters) {

		for (i = 0, iz = this.artefacts.length; i < iz; i++) {

			ent = entity[this.artefacts[i]];

			if (ent && ent.removeFilters) ent.removeFilters.apply(ent, arguments);
		}
	}
	return this;
};

/*

*/
Gp.demolishGroup = function (removeFromDom) {

	let i, iz, art,
		cp = [].concat(this.artefacts);

	for (i = 0, iz = cp.length; i < iz; i++) {

		art = artefact[cp[i]];

		if (art && art.demolish) art.demolish(removeFromDom);
	}
	removeItem(groupnames, this.name);
	delete group[this.name];
	return true;
};

/*
The __getArtefactAt__ function checks to see if any of the group object's artefacts are located at the supplied coordinates in the argument object. The first artefact to report back as being at that coordinate will be returned by the function; where no artefacts are present at that coordinate the function returns false. The artefact with the highest order attribute value will be returned first. This function forms part of the Scrawl-canvas library's __drag-and-drop__ functionality.
*/
Gp.getArtefactAt = function (items) {

	let i, art, artBuckets,
		host = artefact[this.host],
		result;

	this.sortArtefacts();
	artBuckets = this.artefactBuckets;

	for (i = artBuckets.length - 1; i >= 0; i--) {

		art = artBuckets[i];
		
		if (art) {

			result = art.checkHit(items, host);

			if (result) return result;
		}
	}
	return false;
};

/*
The __getAllArtefactsAt__ function returns all of the group object's artefacts located at the supplied coordinates in the argument object. The artefact with the highest order attribute value will be returned first. The function will always return an array of artefact objects.
*/
Gp.getAllArtefactsAt = function (items) {

	let i, artBuckets,
		host = artefact[this.host],
		result, hit,
		resultNames = [],
		results = [];

	this.sortArtefacts();
	artBuckets = this.artefactBuckets;

	for (i = artBuckets.length - 1; i >= 0; i--) {

		art = artBuckets[i];
		
		if (art) {

			result = art.checkHit(items, host);
			
			if (result && result.artefact) {

				hit = result.artefact;

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
