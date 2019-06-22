/*
# Group factory
*/
import { constructors, cell, artefact, group, groupnames, entity } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, xt } from '../core/utilities.js';

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

	this.artefacts = [];
	this.artefactBuckets = [];

	this.set(this.defs);
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

		this.dirtyHost = true;
	}
};

S.order = function (item) {

	let host = this.getHost(this.host);

	this.order = item;

	if (host) {

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

	let host = this.currentHost;

	if (host && item === host.name) return host;
	else return artefact[item] || cell[item] || null;
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
The Display Cycle is mediated through Groups - these Group functions control display functionality via a series of Promise cascades which in turn allow individual artefacts to make use of web workers, where appropriate, to achieve their stamping functionality - for example when they need to apply image filters to their output.
*/
P.stamp = function () {

	// Check we have a host of some sort (either a Stack artefact or a Cell asset)
	if (this.dirtyHost || !this.currentHost) {

		this.dirtyHost = false;

		let currentHost = this.getHost(this.host);

		if (currentHost) this.currentHost = currentHost;
		else this.dirtyHost = true;
	}

	let self = this;

	return new Promise((resolve, reject) => {

		if (self.visibility) {

			let currentHost = self.currentHost;

			if (currentHost) {

				// Check if artefacts need to be sorterd and, if yes, sort them by their order attribute
				self.sortArtefacts();

				// Check to see if there is a Group filter in place and, if yes, pull a Cell aset from the pool
				let filterCell = (self.filters && self.filters.length) ? requestCell() : false;

				// Setup the pool Cell, if required
				if (filterCell && filterCell.element) {

					let dims = currentHost.currentDimensions;

					if (dims) {

						filterCell.element.width = dims[0];
						filterCell.element.height = dims[1];
					}
				}

				// Prepare the Group's artefacts for the forthcoming stamp activity
				self.prepareStamp(filterCell);

				// Get the Group's artefacts to stamp themselves on the current host
				self.stampAction(filterCell)
				.then(res => resolve(self.name))
				.catch(err => reject(false));
			}

			// Bale out of the stamp functionality if the Group has no host on which to perform its actions
			else resolve(false);
		}

		// Bale out of the stamp functionality if the Group is not visible
		else resolve(false);
	});
};

/*

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

	let host = this.currentHost;

	if (myCell) host = myCell;

	this.artefactBuckets.forEach(art => {

		if (art.lib === 'entity') {
			
			if (!art.currentHost || art.currentHost.name !== host.name) {

				art.currentHost = host;
				if (!myCell) art.dirtyHost = true;
			}
		}
		art.updateByDelta();
		art.prepareStamp();
	});
};

/*

*/
P.stampAction = function (myCell) {

	let self = this;

	// Doing it this way to ensure that each artefact completes its stamp action before the next one starts - performed as a promise so that if the artefact needs to filter its output it can use the (asynchronous) filter worker. This function is essentially a cascade of promises which collapse into resolution once all the artefacts have been actioned
	let next = (counter) => {

		return new Promise((resolve, reject) => {

			let art = self.artefactBuckets[counter];

			if (art && art.stamp) {

				art.stamp()
				.then(() => {

					next(counter + 1)
					.then(res => resolve(true))
					.catch(err => reject(false));
				})
				.catch(err => reject(false));
			}

			// The else branch should only trigger once all the artefacts have been processed. At this point we should be okay to action any Group-level filters on the (entity) artefact output
			else {

				if (myCell) {

					self.applyFilters(myCell)
					.then(res => resolve(true))
					.catch(err => reject(false));
				}

				// Terminate the cascade and start the resolution collapse
				else resolve(true);
			}
		});
	};

	// Start the artefact stamp cascade
	return next(0);
};

/*

*/
P.applyFilters = function (myCell) {

	// Clean and sort the Group-level filters before sending them to the filter worker for application
	if (this.dirtyFilters || !this.currentFilters) this.cleanFilters();

	let self = this;

	return new Promise((resolve, reject) => {

		// Determine if we have all the required resources to perform the filter operation and, if not, clean up and resolve
		let currentHost = self.currentHost,
			filterHost = myCell;

		if (!currentHost || !filterHost) {

			if (filterHost) releaseCell(filterHost);
			reject(false);
		}

		// An internal cleanup function to release resources and restore the non-filter defaults to what they were before. It's also in the cleanup phase that we (finally) copy over the results of the filter over to the current canvas display, taking into account the Group's composite and alpha values
		let cleanup = function () {

			releaseFilterWorker(worker);

			currentEngine.save();
			
			currentEngine.globalCompositeOperation = self.filterComposite;
			currentEngine.globalAlpha = self.filterAlpha;
			currentEngine.setTransform(1, 0, 0, 1, 0, 0);

			currentEngine.drawImage(filterElement, 0, 0);
			
			releaseCell(filterHost);

			currentEngine.restore();
		};

		// Get handles to current and filter cell elements and engines
		let currentElement = currentHost.element,
			currentEngine = currentHost.engine;

		let filterElement = filterHost.element,
			filterEngine = filterHost.engine;

		// Action a request to use the filtered artefacts as a stencil
		if (self.isStencil) {
			
			filterEngine.save();
			filterEngine.globalCompositeOperation = 'source-in';
			filterEngine.globalAlpha = 1;
			filterEngine.setTransform(1, 0, 0, 1, 0, 0);
			filterEngine.drawImage(currentElement, 0, 0);
			filterEngine.restore();
		} 

		// At this point we will send the contents of the filterHost canvas over to the web worker, alongside details of the filters we wish to apply to it
		filterEngine.setTransform(1, 0, 0, 1, 0, 0);

		let myimage = filterEngine.getImageData(0, 0, filterElement.width, filterElement.height),
			worker = requestFilterWorker();

		actionFilterWorker(worker, {
			image: myimage,
			filters: self.currentFilters,
		})
		.then(img => {

			// Copy the filter worker's output back onto the filterHost canvas
			if (img) {

				filterEngine.globalCompositeOperation = 'source-over';
				filterEngine.globalAlpha = 1;
				filterEngine.setTransform(1, 0, 0, 1, 0, 0);
				filterEngine.putImageData(img, 0, 0);

				// On success, cleanup and resolve
				cleanup();
				resolve(true);
			}
			else throw new Error('image issue');
		})
		.catch(err => {

			cleanup();
			reject(false);
		});
	});
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
P.setDeltaValues = function (items = {}) {

	this.artefactBuckets.forEach(art => art.setDeltaValues(items));

	return this;
};

/*

*/
P.addFiltersToEntitys = function (...args) {

	this.artefacts.forEach(name => {

		let ent = entity[name];
		
		if (ent && ent.addFilters) ent.addFilters(args);
	});
	return this;
};

/*

*/
P.removeFiltersFromEntitys = function (...args) {

	this.artefacts.forEach(name => {

		let ent = entity[name];

		if (ent && ent.removeFilters) ent.removeFilters(args);
	});
	return this;
};

/*

*/
P.clearFiltersFromEntitys = function () {

	this.artefacts.forEach(name => {

		let ent = entity[name];

		if (ent && ent.clearFilters) ent.clearFilters();
	});
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
The __getArtefactAt__ function checks to see if any of the group object's artefacts are located at the supplied coordinates in the argument object. 

The hit report from the first artefact to respond back positively (artefacts with the highest order value are checked first) will be returned by the function. 

Where no artefacts are present at that coordinate the function returns false.

A __hit report__ is a Javascript object with the following attributes:

* .x - the x coordinate supplied in this functions argument object
* .y - the y coordinate supplied in this functions argument object
* .artefact - the Scrawl-canvas artefact object reporting the hit

This function forms part of the Scrawl-canvas library's __drag-and-drop__ functionality.
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
The __getAllArtefactsAt__ function returns an array of hit reports from all of the group object's artefacts located at the supplied coordinates in the argument object. The artefact with the highest order attribute value will be returned first in the response array.

The function will always return an array of hit reports, or an empty array if no hits are reported.
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
					results.push(result);
				}
			}
		}
	}
	return results;
};

/*
The __getArtefactCollisions__ function returns an array of hit reports from all of the group object's artefacts which are currently in collision with the __sensor__ coordinates supplied by the artefact argument. The function will always return an array of hit reports, or an empty array if no hits are reported.

The argument must be either the artefact object itself, or its String name.
*/
P.getArtefactCollisions = function (art) {

	// return empty array if no argument, or the argument is not an artefact, or the group is empty
	if (!art || !art.isArtefact || !this.artefactBuckets.length) return [];

	if (art.substring) art = artefact[art];

	// Return empty array if the artefact argument has not been setup to check for collisions
	if (!art.collides) return [];

	let host = artefact[this.host],
		artBuckets = this.artefactBuckets,
		targets = [],
		target, i, iz;

	// Get entity collision data
	let [entityRadius, entitySensors] = art.cleanCollisionData();

	// Winnow step 1: don't check the entity itself, or any missing or malformed artefacts in the group
	for (i = 0, iz = artBuckets.length; i < iz; i++) {

		target = artBuckets[i];

		if (!target || !target.cleanCollisionData || art.name === target.name) targets.push(false);
		else targets.push(target);
	}

	// Winnow step 2: exclude all targets outside the artefact/target collision radius
	let [entityStampX, entityStampY] = art.currentStampPosition;

	let combinedRadius, targetData, dx, dy, dh;

	for (i = 0, iz = targets.length; i < iz; i++) {

		target = targets[i];

		if (target) {

			let [targetStampX, targetStampY] = target.currentStampPosition;

			targetData = target.cleanCollisionData();
			combinedRadius = entityRadius + targetData[0];

			dx = entityStampX - targetStampX;
			dy = entityStampY - targetStampY;
			dh = Math.sqrt((dx * dx) + (dy + dy));

			if (dh > combinedRadius) targets[i] = false;
		}
	}

	// Winnow step 3: perform hit checks on remaining targets - this will not retrieve targets entirely inside the artefact
	for (i = 0, iz = targets.length; i < iz; i++) {

		target = targets[i];

		if (target) targets[i] = target.checkHit(entitySensors);
	}

	// return filtered results
	return targets.filter(target => !!target);

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
