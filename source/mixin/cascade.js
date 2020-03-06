/*
# Cascade mixin

TODO - documentation
*/
import { group } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, xtGet } from '../core/utilities.js';

export default function (P = {}) {

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
	P.defs = mergeOver(P.defs, defaultAttributes);

/*
## Define getter, setter and deltaSetter functions
*/
	let G = P.getters,
		S = P.setters;

/*
TODO - documentation
*/
	G.groups = function () {

		return [].concat(this.groups);
	};

	S.groups = function (item) {

		this.groups = [];
		this.addGroups(item);
	};

/*
## Define functions to be added to the factory prototype
*/

/*
TODO - documentation
*/
	P.sortGroups = function (force = false) {

		if (this.batchResort) {

			this.batchResort = false;

			let floor = Math.floor,
				groupnames = this.groups,
				buckets = [];

			groupnames.forEach(name => {

				let mygroup = group[name],
					order = (mygroup) ? floor(mygroup.order) : 0;

				if (!buckets[order]) buckets[order] = [];

				buckets[order].push(mygroup);
			});

			this.groupBuckets = buckets.reduce((a, v) => a.concat(v), []);
		}
	};

/*
TODO - documentation
*/
	P.initializeCascade = function () {

		this.groups = [];
		this.groupBuckets = [];
	};

/*
Groups should be added to, and removed from, the controller object using the __addGroups__ and __removeGroups__ functions. The argument can be one or more group object's name attribute, or the group object(s) itself.
*/
	P.addGroups = function (...args) {

		args.forEach( item => {

			if (item && item.substring) pushUnique(this.groups, item);
			else if (group[item]) pushUnique(this.groups, item.name);

		}, this);

		this.batchResort = true;
		return this;
	};

	P.removeGroups = function (...args) {

		args.forEach( item => {

			if (item && item.substring) removeItem(this.groups, item);
			else if (group[item]) removeItem(this.groups, item.name);

		}, this);

		this.batchResort = true;
		return this;
	};

/*
DRY function to handle a number of actions.
*/
	P.cascadeAction = function (items, action) {

		this.groups.forEach( groupname => {

			let grp = group[groupname];

			if (grp) grp[action](items);

		}, this);

		return this;
	};

/*
Update all artefact objects in all the controller object's groups using the __updateArtefacts__ function. The supplied argument will be passed on to each artefact's _setDelta_ function.
*/
	P.updateArtefacts = function (items) {

		this.cascadeAction(items, 'updateArtefacts');
		return this;
	};

/*
Set all artefact objects in all the controller object's groups using the __setArtefacts__ function. The supplied argument will be passed on to each artefact's _set_ functions
*/
	P.setArtefacts = function (items) {

		this.cascadeAction(items, 'setArtefacts');
		return this;
	};

/*
TODO - documentation
*/
	P.addArtefactClasses = function (items) {

		this.cascadeAction(items, 'addArtefactClasses');
		return this;
	};

	P.removeArtefactClasses = function (items) {

		this.cascadeAction(items, 'removeArtefactClasses');
		return this;
	};

/*
TODO - documentation
*/
	P.updateByDelta = function () {

		this.cascadeAction(false, 'updateByDelta');
		return this;
	};

	P.reverseByDelta = function () {

		this.cascadeAction(false, 'reverseByDelta');
		return this;
	};

/*
The __getArtefactAt__ function checks to see if any of the controller object's groups' artefacts are located at the supplied coordinates in the argument object. The first artefact to report back as being at that coordinate will be returned by the function; where no artefacts are present at that coordinate the function returns false. The artefact with the highest order attribute value will be returned first. This function forms part of the Scrawl-canvas library's __drag-and-drop__ functionality.
*/
	P.getArtefactAt = function (items) {

		items = xtGet(items, this.here, false);

		if (items) {

			let grp, result;

			for (let i = this.groups.length - 1; i >= 0; i--) {

				grp = group[this.groups[i]];

				if (grp) {

					result = grp.getArtefactAt(items);

					if (result) return result;
				}
			}
		}
		return false;
	};

/*
 The __getAllArtefactsAt__ function returns all of the controller object's groups' artefacts located at the supplied coordinates in the argument object. The artefact with the highest order attribute value will be returned first. The function will always return an array of artefact objects.
*/
	P.getAllArtefactsAt = function (items) {

		items = xtGet(items, this.here, false);

		if (items) {

			let grp, result,
				results = [];

			for (let i = this.groups.length - 1; i >= 0; i--) {

				grp = group[this.groups[i]];

				if (grp) {

					result = grp.getAllArtefactsAt(items);

					if(result) results = results.concat(result);
				}
			}
			return results;
		}
		return [];
	};

	return P;
};
