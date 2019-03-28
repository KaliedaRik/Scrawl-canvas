/*
# dom mixin
*/
import { constructors, artefact, group } from '../core/library.js';
import { generateUuid, mergeOver, pushUnique, removeItem, isa_obj, isa_fn, isa_quaternion, xt, addStrings, xta } from '../core/utilities.js';
import { uiSubscribedElements, currentCorePosition, applyCoreResizeListener } from '../core/userInteraction.js';
import { addDomShowElement, setDomShowRequired } from '../core/DOM.js';

import { makeQuaternion, requestQuaternion, releaseQuaternion } from '../factory/quaternion.js';

export default function (obj = {}) {

/*
## Define attributes

All factories using the dom mixin will add these to their prototype objects
*/
	let defaultAttributes = {

/*

*/
		width: 300,

/*

*/
		height: 150,

/*

*/
		localWidth: 300,

/*

*/
		localHeight: 150,

/*

*/
		domElement: '',

/*

*/
		uuid: '',

/*

*/
		pitch: 0,

/*

*/
		yaw: 0,

/*

*/
		group: '',

/*

*/
		collisionPoints: null,

/*

*/
		checkHitMethod: 'box',

/*

*/
		css: null,

/*

*/
		currentTransform: '',

/*

*/
		rotation: null,

/*

*/
		position: 'absolute',

/*

*/
		trackHere: false,

/*

*/
		collides: false,

/*

*/
		actionResize: false,

/*

*/
		dirtyDimensions: true,

/*

*/
		dirtyHandle: true,

/*

*/
		dirtyStart: true,
	};
	obj.defs = mergeOver(obj.defs, defaultAttributes);

/*
## Define getter, setter and deltaSetter functions
*/
	let G = obj.getters,
		S = obj.setters,
		D = obj.deltaSetters;

/*

*/
	G.width = function () {

		if(!xt(this.width)){

			let w = this.domElement.style.width;
			this.width = (xt(w)) ? parseFloat(w) : this.defs.width;
		}
		return this.width;
	};

/*

*/
	G.height = function () {

		if(!xt(this.height)){

			let h = this.domElement.style.height;

			if (h === 'auto') h = '0';

			this.height = (xt(h)) ? parseFloat(h) : this.defs.height;
		}
		return this.height;
	};

/*

*/
	G.offsetZ = function () {

		this.checkVector('offset');
		return this.offset.z;
	};

/*

*/
	G.collisionPoints = function (item) {

		return this.getCollisionPointCoordinates();
	};

/*

*/
	S.trackHere = function (item) {

		this.trackHere = item;
		
		if (item) pushUnique(uiSubscribedElements, this.name);
		else removeItem(uiSubscribedElements, this.name);
	};

/*

*/
	S.collides = function (item) {

		if (item) this.makeCollidable();
		this.collides = item;
	};

/*

*/
	S.collisionPoints = function (item) {

		this.addCollisionPoints(item);
	};

/*

*/
	S.width = function (item) {

		this.width = (xt(item)) ? item : this.defs.width;
		this.dirtyDimensions = true;
		this.dirtyHandle = true;
		this.dirtyPivoted = true;
	};

/*

*/
	S.height = function (item) {

		this.height = (xt(item)) ? item : this.defs.height;
		this.dirtyDimensions = true;
		this.dirtyHandle = true;
		this.dirtyPivoted = true;
	};

/*

*/
	S.position = function (item) {

		this.position = item;
		this.dirtyPosition = true;
	};

/*

*/
	S.offsetZ = function (item) {

		this.checkVector('offset');
		this.offset.z = item;
		this.dirtyOffset = true;
	};

/*

*/
	S.offset = function (item = {}) {

		this.checkVector('offset');
		this.offset.x = (xt(item.x)) ? item.x : this.offset.x;
		this.offset.y = (xt(item.y)) ? item.y : this.offset.y;
		this.offset.z = (xt(item.z)) ? item.z : this.offset.z;
		this.dirtyOffset = true;
	};

/*

*/
	S.visibility = function (item) {

		if (this.visibility !== item) {

			this.visibility = item;

			addDomShowElement(this.name);
			setDomShowRequired(true);
		}
	};

/*

*/
	S.roll = function (item) {

		this.roll = this.checkRotationAngle(item);
		this.dirtyRotation = true;
		this.dirtyRotationActive = true;
	};

/*

*/
	S.pitch = function (item) {

		this.pitch = this.checkRotationAngle(item);
		this.dirtyRotation = true;
		this.dirtyRotationActive = true;
	};

/*

*/
	S.yaw = function (item) {

		this.yaw = this.checkRotationAngle(item);
		this.dirtyRotation = true;
		this.dirtyRotationActive = true;
	};

/*

*/
	S.addPivotHandle = function (item) {

		this.addPivotHandle = item;
		this.dirtyHandle = true;
	};

/*

*/
	D.width = function (item) {

		this.width = addStrings(this.width, item);
		this.dirtyDimensions = true;
		this.dirtyHandle = true;
		this.dirtyPivoted = true;
	};

/*

*/
	D.height = function (item) {

		this.height = addStrings(this.height, item);
		this.dirtyDimensions = true;
		this.dirtyHandle = true;
		this.dirtyPivoted = true;
	};

/*

*/
	D.roll = function (item) {

		this.roll = this.checkRotationAngle(this.roll + item);
		this.dirtyRotation = true;
		this.dirtyRotationActive = true;
	};

/*

*/
	D.pitch = function (item) {

		this.pitch = this.checkRotationAngle(this.pitch + item);
		this.dirtyRotation = true;
		this.dirtyRotationActive = true;
	};

/*

*/
	D.yaw = function (item) {

		this.yaw = this.checkRotationAngle(this.yaw + item);
		this.dirtyRotation = true;
		this.dirtyRotationActive = true;
	};

/*

*/
	S.css = function (item) {

		this.css = (this.css) ? mergeOver(this.css, item) : item;

		this.dirtyCss = true;
		addDomShowElement(this.name);
		setDomShowRequired(true);
	};

/*

*/
	S.group = function (item) {

		let g = group[item],
			old;

		if (g) {

			old = g[this.group];

			if (old) old.removeArtefacts(this.name);

			g.addArtefacts(this.name);
			this.group = item;
		}
	};

/*

*/
	obj.setNow = function (items) {

		this.set(items);
		this.prepareStamp();
		return this;
	};

/*

*/
	obj.setDeltaNow = function (items) {

		this.setDelta(items);
		this.prepareStamp();
		return this;
	};

/*

*/
	obj.getDimensions = function () {

		return {
			w: this.localWidth,
			h: this.localHeight
		}
	};

/*

*/
	obj.checkRotationAngle = function (a) {

		if (a < -180 || a > 180) {
			a += (a > 0) ? -360 : 360;
		}

		return a;
	};

/*

*/
	obj.clone = function (items = {}) {

		let copied, clone, keys, key, g, host,
			currentHost, that, i, iz;

		currentHost = this.currentHost;
		delete this.currentHost;
		copied = JSON.parse(JSON.stringify(this));
		this.currentHost = currentHost;
		copied.name = (items.name) ? items.name : generateUuid();

		keys = Object.keys(this);
		that = this;

		for (i = 0, iz = keys.length; i < iz; i++) {

			key = keys[i];
			
			if (/^(local|dirty|current)/.test(key)) delete copied[key];

			if (isa_fn(this[key])) copied[key] = that[key];
		}

		if (this.domElement) {

			copied.domElement = this.domElement.cloneNode(true);
			copied.domElement.id = copied.name;
			host = artefact[this.group];

			if (host && host.domElement) host.domElement.appendChild(copied.domElement);
		}

		clone = new constructors[this.type](copied);
		clone.set(items);

		g = group[this.group];

		if(g) g.addArtefacts(clone);

		return clone;
	};

/*

*/
	obj.addClasses = function (item) {

		let el;

		if (item.substring) {

			el = this.domElement;

			if (!el.className.length) el.className = item;
			else if (' ' === el.className[el.className.length - 1]) el.className += item;
			else el.className += ' ' + item;

			return this;
		}
	};

/*

*/
	obj.removeClasses = function (item) {

		let el,
			classes,
			eClass,
			search,
			i, iz;

		if (item.substring) {

			el = this.domElement;
			eClass = el.className;
			classes = item.split();

			for (i = 0, iz = classes.length; i < iz; i++) {

				search = new RegExp(' ?' + classes[i] + ' ?');
				eClass = eClass.replace(search, ' ');
			}

			el.className = eClass;
		}
		return this;
	};

/*

*/
	obj.makeCollidable = function () {

		this.collides = true;
		this.addCollisionPoints('corners');
		return this;
	};

/*
items argument is either an xy coordinate object, or an array of such objects. A hit will return the hit object with x, y and artefact attributes
*/
	obj.checkHit = function (items, host) {

		let xMin, yMin, xMax, yMax, box, i, iz, x, y, item;

		if (xt(host) && this.collides) {

			if (this.checkHitMethod === 'box') {

				box = this.box;

				if (!this.box || this.dirtyBox) {

					box = this.box = this.getBox(host);
					this.dirtyBox = false;
				}

				if (box) {

					xMin = box[0];
					yMin = box[1];
					xMax = box[2];
					yMax = box[3];
					items = [].concat(items);

					for (i = 0, iz = items.length; i < iz; i++) {

						item = items[i];
						item = isa_obj(item) ? item : {};

						x = item.x;
						y = item.y;

						if (xta(x, y)) {

							if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {

								return {
									x: x,
									y: y,
									artefact: this
								};
							}
						}
					}
				}
			}
		}
		return false;
	};

/*

*/
	obj.getBox = function (host) {

		let xMin = 999999, yMin = 999999, xMax = -999999, yMax = -999999, 
			cp = this.collisionPoints, 
			here, x, y, tx, ty, client, i, iz;

		if (cp && cp.length) {

			here = isa_obj(host.here) ? host.here : {};
			x = currentCorePosition.scrollX - (here.offsetX || 0);
			y = currentCorePosition.scrollY - (here.offsetY || 0);

			for (i = 0, iz = cp.length; i < iz; i++) {

				client = cp[i].getClientRects();
				client = client[0];

				if (client) {
					tx = Math.round(client.left + x);
					ty = Math.round(client.top + y);
					xMin = (xMin > tx) ? tx : xMin;
					xMax = (xMax < tx) ? tx : xMax;
					yMin = (yMin > ty) ? ty : yMin;
					yMax = (yMax < ty) ? ty : yMax;
				}
			}
			return [xMin, yMin, xMax, yMax];
		}
		else return false
	};

/*

*/
	obj.addCollisionPoints = function (...args) {

		let pointsArray, el, i, iz, item, cp;

		let pointMaker = function () {

			let p = document.createElement('div');

			p.style.width = 0;
			p.style.height = 0;
			p.style.position = 'absolute';

			return p;
		};

		cp = this.collisionPoints = [];
		el = this.domElement;

		if (el) {

			pointsArray = new Set();

			for (i = 0, iz = args.length; i < iz; i++) {

				item = args[i];

				if (item.substring) {

					item = item.toLowerCase();

					switch (item) {

						case 'ne' :
							pointsArray.add('ne');
							break;

						case 'n' :
							pointsArray.add('n');
							break;

						case 'nw' :
							pointsArray.add('nw');
							break;

						case 'w' :
							pointsArray.add('w');
							break;

						case 'sw' :
							pointsArray.add('sw');
							break;

						case 's' :
							pointsArray.add('s');
							break;

						case 'se' :
							pointsArray.add('se');
							break;

						case 'e' :
							pointsArray.add('e');
							break;

						case 'corners' :
							pointsArray.add('ne').add('nw').add('sw').add('se');
							break;

						case 'edges' :
							pointsArray.add('n').add('w').add('s').add('e');
							break;

						case 'border' :
							pointsArray.add('ne').add('nw').add('sw').add('se').add('n').add('w').add('s').add('e');
							break;

						case 'center' :
							pointsArray.add('c');
							break;

						case 'all' :
							pointsArray.add('ne').add('nw').add('sw').add('se').add('n').add('w').add('s').add('e').add('c');
							break;
					}
				}
			}

			pointsArray.forEach((val) => {

				let pt = pointMaker();

				switch (val) {

					case 'ne' :
						pt.style.top = '0%';
						pt.style.left = '100%';
						break;

					case 'n' :
						pt.style.top = '0%';
						pt.style.left = '50%';
						break;

					case 'nw' :
						pt.style.top = '0%';
						pt.style.left = '0%';
						break;

					case 'w' :
						pt.style.top = '50%';
						pt.style.left = '0%';
						break;

					case 'sw' :
						pt.style.top = '100%';
						pt.style.left = '0%';
						break;

					case 's' :
						pt.style.top = '100%';
						pt.style.left = '50%';
						break;

					case 'se' :
						pt.style.top = '100%';
						pt.style.left = '100%';
						break;

					case 'e' :
						pt.style.top = '50%';
						pt.style.left = '100%';
						break;

					case 'c' :
						pt.style.top = '50%';
						pt.style.left = '50%';
						break;
				}

				el.appendChild(pt);
				cp.push(pt);
			});
		}
		return this;
	};

/*

*/
	obj.getCollisionPointCoordinates = function (host) {

		let cp = this.collisionPoints,
			here = isa_obj(host.here) ? host.here : {},
			x = currentCorePosition.scrollX - (here.offsetX || 0),
			y = currentCorePosition.scrollY - (here.offsetY || 0),
			client,
			results = [],
			result, i, iz;

		for (i = 0, iz = cp.length; i < iz; i++) {

			client = cp[i].getClientRects();
			client = client[0];
			
			if (client){
				result = [
					Math.round(client.left + x),
					Math.round(client.top + y)
				];
				results.push(result);
			}
		}
		return results;
	};

/*

*/
	obj.setPosition = function () {

		addDomShowElement(this.name);
		setDomShowRequired(true);
	};

/*

*/
	obj.setPositionNow = function () {

		this.domElement.style.position = this.position;
		this.dirtyPosition = false;
	};

/*

*/
	obj.cleanDimensions = function () {

		let here = this.getHere();

		if (this.width.toFixed) this.localWidth = this.width;
		else this.localWidth = (parseFloat(this.width) / 100) * here.w;

		if (this.height.toFixed) this.localHeight = this.height;
		else if (this.height === 'auto') this.localHeight = 0;
		else this.localHeight = (parseFloat(this.height) / 100) * here.h;
	};

/*

*/
	obj.cleanRotation = function () {

		let r;

		if (!this.rotation) this.rotation = makeQuaternion();
		else if (!isa_quaternion(this.rotation)) this.rotation = makeQuaternion(this.rotation);

		r = this.rotation;

		r.setFromEuler({
			pitch: this.pitch || 0,
			yaw: this.yaw || 0,
			roll: this.roll || 0,
		});

		if (r.getMagnitude() !== 1) r.normalize();
	};

/*

*/
	obj.cleanOffset = function () {

		let dims = this.cleanOffsetHelper();

		this.cleanVectorParameter('currentOffset', this.offset, dims[0], dims[1]);

		if (this.offset.z.toFixed) this.currentOffset.z = this.offset.z;

		this.dirtyOffset = false;
		this.dirtyScale = false;
	};

/*

*/
	obj.prepareStamp = function () {

		let mimic;

		if (this.domElement) {

			if (this.mimic) {

				mimic = artefact[this.mimic];

				if (mimic) {

					if (this.position !== mimic.position) {

						this.position = mimic.position;
						this.dirtyPosition = true;
						this.setPosition();
					}

					if (this.localWidth !== mimic.localWidth || this.localHeight !== mimic.localHeight) {

						this.width = mimic.width;
						this.height = mimic.height;
						this.localWidth = mimic.localWidth;
						this.localHeight = mimic.localHeight;
						this.dirtyDimensions = true;
					}

					if (this.roll !== mimic.roll || this.pitch !== mimic.pitch || this.yaw !== mimic.yaw) {

						this.roll = mimic.roll;
						this.pitch = mimic.pitch;
						this.yaw = mimic.yaw;
						this.dirtyRotationActive = true;
						this.dirtyRotation = true;
						this.cleanRotation();
					}

					if (this.scale !== mimic.scale) this.scale = mimic.scale;

					this.currentStart = mimic.currentStart;
					this.dirtyStart = true;

					this.currentHandle = mimic.currentHandle;
					this.dirtyHandle = true;

					this.lockXTo = mimic.lockXTo;
					this.lockYTo = mimic.lockYTo;
				}
			}
			else {

				if (this.dirtyPosition) {

					this.setPosition();
					this.dirtyBox = true;
				}

				if (this.dirtyDimensions) {

					this.cleanDimensions();
					this.dirtyBox = true;
				}

				if (this.dirtyRotation) {

					this.cleanRotation();
					this.dirtyBox = true;
				}

				if (this.dirtyStart) {

					this.cleanStart();
					this.dirtyBox = true;
				}

				if (this.dirtyHandle) {

					this.cleanHandle();
					this.dirtyBox = true;
				}
			}
		}

		if (this.dirtyPivoted) this.updatePivotSubscribers();

		if (this.dirtyOffset || this.dirtyScale || this.pivot) {

			this.cleanOffset();
			this.dirtyBox = true;
		}

		if (this.actionResize) this.checkForResize();
	};

/*

*/
	obj.checkForResize = function () {

		let e = this.domElement,
			s = this.domElement.style,
			eWidth, eHeight,
			item, i, iz;

		eWidth = s.width || e.width;
		this.width = (xt(eWidth)) ? parseFloat(eWidth) : this.defs.width;

		eHeight = s.height || e.height;

		if (eHeight === 'auto') eHeight = 0;

		this.height = (xt(eHeight)) ? parseFloat(eHeight) : this.defs.height;

		if (this.width !== this.localWidth || this.height !== this.localHeight) {

			this.localWidth = this.width;
			this.localHeight = this.height;

			if (this.groups) {

				for (i = 0, iz = this.groups.length; i < iz; i++) {

					item = group[this.groups[i]];
					item.setArtefacts({
						dirtyDimensions: true,
						dirtyHandle: true,
						dirtyStart: true
					});
				}
			}
		}
	};

/*

*/
	obj.stamp = function () {

		let self = this;

		return new Promise((resolve) => {

			let cs, ch, ct, dt, a,
				trans, origin, scale,
				newtransform, newtransformArray,
				pivot, here, path, pathStart,
				rotor, rv, rx, ry, rz, ra, x, y, z,
				notifyForShow = false;

			if (self.domElement) {

				cs = self.currentStart;
				ch = self.currentHandle;
				ct = self.currentOffset;
				dt = self.dragOffset;
				newtransform = '';

				if (self.pivot) pivot = artefact[self.pivot];

				here = self.getHere();
				scale = self.scale;

				if (self.dirtyDimensions) notifyForShow = true;

				if (pivot && self.addPivotHandle) {

					if (self.lockXTo === 'pivot') {

						ch.x = pivot.currentHandle.x;
						self.dirtyHandle = true;
					}

					if (self.lockYTo === 'pivot') {

						ch.y = pivot.currentHandle.y;
						self.dirtyHandle = true;
					}
				}

				if (self.dirtyHandle) {

					self.transformOrigin = `${ch.x}px ${ch.y}px 0`;
					notifyForShow = true;
				}

				x = self.updateStampX() - ch.x;
				y = self.updateStampY() - ch.y;
				z = ct.z;

				if (self.dirtyRotationActive || self.rotateOnPivot) {

					if (self.rotateOnPivot) rotor = requestQuaternion(self.rotation).quaternionRotate(pivot.rotation);
					else if (self.dirtyRotation) rotor = requestQuaternion(self.rotation);
					else rotor = false;

					if (rotor) {

						rv = rotor.v;
						ra = rotor.getAngle(false);
						newtransform = `translate(${x}px,${y}px) rotate3d(${rv.x},${rv.y},${rv.z},${ra}rad) translateZ(${z}px) scale(${scale},${scale})`;
						releaseQuaternion();
					}
					else {

						newtransformArray = self.currentTransform.split(' ');
						newtransform = `translate(${x}px,${y}px) ${newtransformArray[1]} translateZ(${z}px) scale(${scale},${scale})`;
					}
				}
				else newtransform = `translate(${x}px,${y}px) scale(${scale},${scale})`;

				if (!self.currentTransform || self.currentTransform !== newtransform) {

					self.currentTransform = newtransform;
					self.dirtyTransform = true;
					notifyForShow = true;
				}

				self.dirtyStart = false;
				self.dirtyRotation = false;
				self.dirtyOffset = false;

				if (notifyForShow) {

					addDomShowElement(this.name);
					setDomShowRequired(true);
				}
			}
			resolve(true);
		});
	};

/*

*/
	obj.apply = function() {
		applyCoreResizeListener();
	};

	return obj;
};
