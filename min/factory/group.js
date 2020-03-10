import { constructors, cell, artefact, group, groupnames, entity } from '../core/library.js';
import { mergeOver, pushUnique, removeItem, xt } from '../core/utilities.js';
import { scrawlCanvasHold } from '../core/document.js';
import { requestFilterWorker, releaseFilterWorker, actionFilterWorker } from './filter.js';
import { requestCell, releaseCell } from './cell.js';
import { importDomImage } from './imageAsset.js';
import baseMix from '../mixin/base.js';
import filterMix from '../mixin/filter.js';
const Group = function (items = {}) {
this.makeName(items.name);
this.register();
this.artefacts = [];
this.artefactBuckets = [];
this.set(this.defs);
this.set(items);
return this;
};
let P = Group.prototype = Object.create(Object.prototype);
P.type = 'Group';
P.lib = 'group';
P.isArtefact = false;
P.isAsset = false;
P = baseMix(P);
P = filterMix(P);
let defaultAttributes = {
artefacts: null,
artefactBuckets: null,
host: '',
order: 0,
visibility: true,
batchResort: true,
regionRadius: 0
};
P.defs = mergeOver(P.defs, defaultAttributes);
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
P.getHost = function (item) {
let host = this.currentHost;
if (host && item === host.name) return host;
else return artefact[item] || cell[item] || null;
};
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
P.stamp = function () {
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
self.sortArtefacts();
let filterCell = (self.stashOutput || (!self.noFilters && self.filters && self.filters.length)) ?
requestCell() :
false;
if (filterCell && filterCell.element) {
let dims = currentHost.currentDimensions;
if (dims) {
filterCell.element.width = dims[0];
filterCell.element.height = dims[1];
}
}
self.prepareStamp(filterCell);
self.stampAction(filterCell)
.then(res => {
if (filterCell) releaseCell(filterCell);
resolve(self.name);
})
.catch(err => {
if (filterCell) releaseCell(filterCell);
reject(false)
});
}
else resolve(false);
}
else resolve(false);
});
};
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
if (!art.noDeltaUpdates) art.updateByDelta();
art.prepareStamp();
});
};
P.stampAction = function (myCell) {
if (this.dirtyFilters || !this.currentFilters) this.cleanFilters();
let self = this;
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
else {
if (myCell) {
if (!self.noFilters && self.filters && self.filters.length) {
self.applyFilters(myCell)
.then(img => {
if (self.stashOutput) self.stashAction(img);
resolve(true);
})
.catch(err => reject(false));
}
else {
if (self.stashOutput) self.stashAction(myCell.engine.getImageData(0, 0, myCell.element.width, myCell.element.height));
resolve(true);
}
}
else resolve(true);
}
});
};
return next(0);
};
P.applyFilters = function (myCell) {
let self = this;
return new Promise((resolve, reject) => {
let currentHost = self.currentHost,
filterHost = myCell;
if (!currentHost || !filterHost) reject(false);
let cleanup = function () {
releaseFilterWorker(worker);
currentEngine.save();
currentEngine.globalCompositeOperation = self.filterComposite;
currentEngine.globalAlpha = self.filterAlpha;
currentEngine.setTransform(1, 0, 0, 1, 0, 0);
currentEngine.drawImage(filterElement, 0, 0);
currentEngine.restore();
};
let currentElement = currentHost.element,
currentEngine = currentHost.engine;
let filterElement = filterHost.element,
filterEngine = filterHost.engine;
if (self.isStencil) {
filterEngine.save();
filterEngine.globalCompositeOperation = 'source-in';
filterEngine.globalAlpha = 1;
filterEngine.setTransform(1, 0, 0, 1, 0, 0);
filterEngine.drawImage(currentElement, 0, 0);
filterEngine.restore();
}
filterEngine.setTransform(1, 0, 0, 1, 0, 0);
let myimage = filterEngine.getImageData(0, 0, filterElement.width, filterElement.height),
worker = requestFilterWorker();
actionFilterWorker(worker, {
image: myimage,
filters: self.currentFilters,
})
.then(img => {
if (img) {
filterEngine.globalCompositeOperation = 'source-over';
filterEngine.globalAlpha = 1;
filterEngine.setTransform(1, 0, 0, 1, 0, 0);
filterEngine.putImageData(img, 0, 0);
cleanup();
resolve(img);
}
else throw new Error('image issue');
})
.catch(err => {
cleanup();
reject(false);
});
});
};
P.stashAction = function (img) {
if (!img) return false;
this.stashOutput = false;
let [x, y, width, height] = this.getCellCoverage(img);
let myCell = requestCell(),
myEngine = myCell.engine,
myElement = myCell.element;
myElement.width = width;
myElement.height = height;
myEngine.putImageData(img, -x, -y);
this.stashedImageData = myEngine.getImageData(0, 0, width, height);
if (this.stashOutputAsAsset) {
this.stashOutputAsAsset = false;
if (!this.stashedImage) {
let self = this;
let newimg = this.stashedImage = document.createElement('img');
newimg.id = `${this.name}-groupimage`;
newimg.onload = function () {
scrawlCanvasHold.appendChild(newimg);
importDomImage(`#${newimg.id}`);
};
newimg.src = myElement.toDataURL();
}
else this.stashedImage.src = myElement.toDataURL();
}
releaseCell(myCell);
}
P.getCellCoverage = function (img) {
let width = img.width,
height = img.height,
data = img.data,
maxX = 0,
maxY = 0,
minX = width,
minY = height,
counter = 3,
x, y;
for (y = 0; y < height; y++) {
for (x = 0; x < width; x++) {
if (data[counter]) {
if (minX > x) minX = x;
if (maxX < x) maxX = x;
if (minY > y) minY = y;
if (maxY < y) maxY = y;
}
counter += 4;
}
}
if (minX < maxX && minY < maxY) return [minX, minY, maxX - minX, maxY - minY];
else return [0, 0, width, height];
};
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
P.updateArtefacts = function (items) {
this.cascadeAction(items, 'setDelta');
return this;
};
P.setArtefacts = function (items) {
this.cascadeAction(items, 'set');
return this;
};
P.updateByDelta = function () {
this.cascadeAction(false, 'updateByDelta');
return this;
};
P.reverseByDelta = function () {
this.cascadeAction(false, 'reverseByDelta');
return this;
};
P.addArtefactClasses = function (items) {
this.cascadeAction(items, 'addClasses');
return this;
};
P.removeArtefactClasses = function (items) {
this.cascadeAction(items, 'removeClasses');
return this;
};
P.cascadeAction = function (items, action) {
this.artefacts.forEach(name => {
let art = artefact[name];
if(art && art[action]) art[action](items);
});
return this;
};
P.setDeltaValues = function (items = {}) {
this.artefactBuckets.forEach(art => art.setDeltaValues(items));
return this;
};
P.addFiltersToEntitys = function (...args) {
this.artefacts.forEach(name => {
let ent = entity[name];
if (ent && ent.addFilters) ent.addFilters(args);
});
return this;
};
P.removeFiltersFromEntitys = function (...args) {
this.artefacts.forEach(name => {
let ent = entity[name];
if (ent && ent.removeFilters) ent.removeFilters(args);
});
return this;
};
P.clearFiltersFromEntitys = function () {
this.artefacts.forEach(name => {
let ent = entity[name];
if (ent && ent.clearFilters) ent.clearFilters();
});
return this;
};
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
P.getArtefactAt = function (items) {
let myCell = requestCell(),
artBuckets = this.artefactBuckets;
this.sortArtefacts();
for (let i = artBuckets.length - 1; i >= 0; i--) {
let art = artBuckets[i];
if (art) {
let result = art.checkHit(items, myCell);
if (result) {
releaseCell(myCell);
return result;
}
}
}
releaseCell(myCell);
return false;
};
P.getAllArtefactsAt = function (items) {
let myCell = requestCell(),
artBuckets = this.artefactBuckets,
resultNames = [],
results = [];
this.sortArtefacts();
for (let i = artBuckets.length - 1; i >= 0; i--) {
let art = artBuckets[i];
if (art) {
let result = art.checkHit(items, myCell);
if (result && result.artefact) {
let hit = result.artefact;
if (resultNames.indexOf(hit.name) < 0) {
resultNames.push(hit.name);
results.push(result);
}
}
}
}
releaseCell(myCell);
return results;
};
P.getArtefactCollisions = function (art) {
if (!art || !art.isArtefact || !this.artefactBuckets.length) return [];
if (art.substring) art = artefact[art];
if (!art.collides) return [];
let artBuckets = this.artefactBuckets,
targets = [],
target, i, iz;
let [entityRadius, entitySensors] = art.cleanCollisionData();
for (i = 0, iz = artBuckets.length; i < iz; i++) {
target = artBuckets[i];
if (!target || !target.cleanCollisionData || art.name === target.name) targets.push(false);
else targets.push(target);
}
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
dh = Math.sqrt((dx * dx) + (dy * dy));
if (dh > combinedRadius) targets[i] = false;
}
}
let myCell = requestCell();
for (i = 0, iz = targets.length; i < iz; i++) {
target = targets[i];
if (target) targets[i] = target.checkHit(entitySensors, myCell);
}
releaseCell(myCell);
return targets.filter(target => !!target);
};
const makeGroup = function (items) {
return new Group(items);
};
constructors.Group = Group;
export {
makeGroup,
};
