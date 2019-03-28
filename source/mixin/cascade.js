/*
# Cascade mixin
*/
import { group } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, xtGet } from '../core/utilities.js';

export default function (obj = {}) {

/*
## Define attributes

All factories using the cascade mixin will add these to their prototype objects
*/
	let defaultAttributes = {

/*
The __groups__ attribute holds the String names of all the Group objects associated with the controller object.
*/
		groups: null,

/*
The __groupBuckets__ attribute holds a reference to each Group object, in a set of arrays grouping Groups according to their order values.
*/
		groupBuckets: null,

/*
The __batchResort__ flag determines whether the groups will be sorted by their order value before instructions get passed to each in sequence. Best to leave this flag alone to do its job.
*/
		batchResort: true,
	};
	obj.defs = mergeOver(obj.defs, defaultAttributes);

/*
## Define getter, setter and deltaSetter functions
*/
	let G = obj.getters,
		S = obj.setters;

/*

*/
	G.groups = function () {
		return [].concat(this.groups);
	};

/*

*/
	S.groups = function (item) {
		this.groups = [];
		this.addGroups(item);
	};

/*
## Define functions to be added to the factory prototype
*/

/*

*/
	obj.sortGroups = function (force = false) {

		let buckets = [],
			i, iz, item, order, oGroup, b,
			floor = Math.floor;

		if (this.batchResort) {

			this.batchResort = false;
			oGroup = this.groups;

			for (i = 0, iz = oGroup.length; i < iz; i++) {

				item = group[oGroup[i]];
				order = floor(item.order) || 0;

				if (!buckets[order]) buckets[order] = [];

				buckets[order].push(item);
			}

			this.groupBuckets = [];

			for (i = 0, iz = buckets.length; i < iz; i++) {

				b = buckets[i];
				
				if (b && b.length) this.groupBuckets.push(b);
			}
		}
	};

/*
Groups should be added to, and removed from, the controller object using the __addGroups__ and __removeGroups__ functions. The argument can be one or more group object's name attribute, or the group object(s) itself.
*/
	obj.addGroups = function (...args) {

		let i, iz, item;

		for (i = 0, iz = args.length; i < iz; i++) {

			item = args[i];

			if (item && item.substring) pushUnique(this.groups, item);
			else if (group[item]) pushUnique(this.groups, item.name);
		}

		this.batchResort = true;
		return this;
	};

/*

*/
	obj.removeGroups = function (...args) {

		let i, iz, item;

		for (i = 0, iz = args.length; i < iz; i++) {

			item = args[i];
			
			if (item && item.substring) removeItem(this.groups, item);
			else if (group[item]) removeItem(this.groups, item.name);
		}

		this.batchResort = true;
		return this;
	};

/*
DRY function to handle a number of actions.
*/
	obj.cascadeAction = function (items, action) {

		let i, iz, g;

		for (i = 0, iz = this.groups.length; i < iz; i++) {

			g = group[this.groups[i]];
			
			if(g) g[action](items);
		}
		return this;
	};

/*
Update all artefact objects in all the controller object's groups using the __updateArtefacts__ function. The supplied argument will be passed on to each artefact's _setDelta_ function.
*/
	obj.updateArtefacts = function (items) {

		this.cascadeAction(items, 'updateArtefacts');
		return this;
	};

/*
Set all artefact objects in all the controller object's groups using the __setArtefacts__ function. The supplied argument will be passed on to each artefact's _set_ functions
*/
	obj.setArtefacts = function (items) {

		this.cascadeAction(items, 'setArtefacts');
		return this;
	};

/*

*/
	obj.addArtefactClasses = function (items) {

		this.cascadeAction(items, 'addArtefactClasses');
		return this;
	};

/*

*/
	obj.removeArtefactClasses = function (items) {

		this.cascadeAction(items, 'removeArtefactClasses');
		return this;
	};

/*

*/
	obj.updateByDelta = function () {

		this.cascadeAction(false, 'updateByDelta');
		return this;
	};

/*

*/
	obj.reverseByDelta = function () {

		this.cascadeAction(false, 'reverseByDelta');
		return this;
	};

/*
The __getArtefactAt__ function checks to see if any of the controller object's groups' artefacts are located at the supplied coordinates in the argument object. The first artefact to report back as being at that coordinate will be returned by the function; where no artefacts are present at that coordinate the function returns false. The artefact with the highest order attribute value will be returned first. This function forms part of the Scrawl-canvas library's __drag-and-drop__ functionality.
*/
	obj.getArtefactAt = function (items) {

		let i, g, result;

		items = xtGet(items, this.here, false);

		if (items) {

			for (i = this.groups.length - 1; i >= 0; i--) {

				g = group[this.groups[i]];

				if (g) {

					result = g.getArtefactAt(items);

					if (result) return result;
				}
			}
		}
		return false;
	};

/*
 The __getAllArtefactsAt__ function returns all of the controller object's groups' artefacts located at the supplied coordinates in the argument object. The artefact with the highest order attribute value will be returned first. The function will always return an array of artefact objects.
*/
	obj.getAllArtefactsAt = function (items) {

		let i, g, result,
			results = [];

		items = xtGet(items, this.here, false);

		if (items) {

			for (i = this.groups.length - 1; i >= 0; i--) {

				g = group[this.groups[i]];

				if (g) {

					result = g.getAllArtefactsAt(items);

					if(result) results = results.concat(result);
				}
			}
			return results;
		}
		return [];
	};

	return obj;
};
