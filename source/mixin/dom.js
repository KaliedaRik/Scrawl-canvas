/*
# dom mixin

TODO - documentation
*/
import { constructors, artefact, group } from '../core/library.js';
import { generateUuid, mergeOver, pushUnique, removeItem, isa_obj, isa_fn, isa_quaternion, xt, addStrings, xta } from '../core/utilities.js';
import { uiSubscribedElements, currentCorePosition, applyCoreResizeListener } from '../core/userInteraction.js';
import { addDomShowElement, setDomShowRequired, domShow } from '../core/document.js';

import { makeQuaternion, requestQuaternion, releaseQuaternion } from '../factory/quaternion.js';

export default function (P = {}) {

/*
## Define attributes

All factories using the dom mixin will add these to their prototype objects
*/
	let defaultAttributes = {

/*
TODO - documentation - don't think this needs to be in the defs object
*/
		domElement: '',

/*
TODO - documentation
*/
		pitch: 0,
		yaw: 0,

/*
Unlike the X and Y offsets, offsetZ can only ever be a number as there is no 3d box (as such) to act as a length for relative N% strings (and 'front', 'center', 'back' strings would be equally nonsensical)
*/
		offsetZ: 0,

/*
TODO - documentation
*/
		// collides: false, 			// set in mixin/position
		pathCorners: null,			// does this need to be in dims object?
		collisionPath: null,		// does this need to be in dims object?
		collisionPoints: null,		// does this need to be in dims object?

/*
TODO - documentation
*/
		css: null,

/*
TODO - documentation
*/
		classes: '',

/*
TODO - do we want this in the defs object?
*/
		currentTransformString: '',			// does this need to be in dims object?
		currentTransformOriginString: '',	// does this need to be in dims object?

/*
TODO - do we want this in the defs object?
*/
		rotation: null,						// does this need to be in dims object?

/*
TODO - documentation
*/
		position: 'absolute',

/*
... relates to dimensions somehow
TODO: check if we're actually using this attribute anywhere
    - has been used in demos DOM-007 and DOM-011
        - check to see if it actually having any effect
        - or if other functionality could (already?) handle the issues it is supposed to be addressing 
*/
		actionResize: false,

/*
TODO - documentation
*/
		trackHere: false,
	};
	P.defs = mergeOver(P.defs, defaultAttributes);


/*
## Define getter, setter and deltaSetter functions
*/
	let S = P.setters,
		D = P.deltaSetters;

/*
TODO - documentation
*/
	S.trackHere = function (item) {

		this.trackHere = item;
		
		if (item) pushUnique(uiSubscribedElements, this.name);
		else removeItem(uiSubscribedElements, this.name);
	};

/*
TODO - documentation
*/
	S.actionResize = function (item) {

		this.actionResize = item;

		if (item) {

			this.prepareStamp();
			domShow(this.name);
			this.triggerResizeCascade();
		}
	};

/*
TODO - documentation
*/
	S.position = function (item) {

		this.position = item;
		this.dirtyPosition = true;
	};

/*
TODO - documentation
*/
	S.visibility = function (item) {

		this.visibility = item;
		this.dirtyVisibility = true;
	};

/*
TODO - documentation
*/
	S.offsetZ = function (item) {

		this.offsetZ = item;
		this.dirtyOffsetZ = true;
	};

	D.offsetZ = function (item) {

		this.offsetZ += item;
		this.dirtyOffsetZ = true;
	};

/*
TODO - documentation
*/
	S.roll = function (item) {

		this.roll = this.checkRotationAngle(item);
		this.dirtyRotation = true;
	};

	S.pitch = function (item) {

		this.pitch = this.checkRotationAngle(item);
		this.dirtyRotation = true;
	};

	S.yaw = function (item) {

		this.yaw = this.checkRotationAngle(item);
		this.dirtyRotation = true;
	};

	D.roll = function (item) {

		this.roll = this.checkRotationAngle(this.roll + item);
		this.dirtyRotation = true;
	};

	D.pitch = function (item) {

		this.pitch = this.checkRotationAngle(this.pitch + item);
		this.dirtyRotation = true;
	};

	D.yaw = function (item) {

		this.yaw = this.checkRotationAngle(this.yaw + item);
		this.dirtyRotation = true;
	};

/*
TODO - documentation
*/
	S.css = function (item) {

		this.css = (this.css) ? mergeOver(this.css, item) : item;

		this.dirtyCss = true;
	};

/*
TODO - documentation
*/
	S.classes = function (item) {

		this.classes = item;

		this.dirtyClasses = true;
	};

/*
TODO - documentation
*/
	S.collides = function (item) {

		this.collides = item;

		if (item) this.dirtyPathObject = true;
	};

/*
TODO - documentation
*/
	S.domAttributes = function (item) {

		this.updateDomAttributes(item);
	}

/*
TODO - documentation
*/
	P.checkRotationAngle = function (angle) {

		if (angle < -180 || angle > 180) {
			angle += (angle > 0) ? -360 : 360;
		}

		return angle;
	};

/*
Overwrites the clone function in mixin/base.js
*/
	P.clone = function (items = {}) {

		let self = this,
			regex = /^(local|dirty|current)/;

		let host = this.currentHost || artefact[this.host];
		this.currentHost = null;

		let grp = this.group;
		this.group = grp.name;

		let corners = this.pathCorners;
		this.pathCorners = null;

		let points = this.collisionPoints;
		this.collisionPoints = null;

		let tempPivot = this.pivot, 
			tempMimic = this.mimic, 
			tempPath = this.path;

		if (tempPivot && tempPivot.name) this.pivot = tempPivot.name;
		if (tempMimic && tempMimic.name) this.mimic = tempMimic.name;
		if (tempPath && tempPath.name) this.path = tempPath.name;

		let copied = JSON.parse(JSON.stringify(this));

		if (tempPivot) this.pivot = tempPivot;
		if (tempMimic) this.mimic = tempMimic;
		if (tempPath) this.path = tempPath;

		copied.name = (items.name) ? items.name : generateUuid();

		if (this.anchor && this.anchor.clickAction) copied.anchor.clickAction = this.anchor.clickAction;
		if (items.anchor) copied.anchor = mergeOver(copied.anchor, items.anchor);

		this.currentHost = host;
		this.group = grp;
		this.pathCorners = corners;
		this.collisionPoints = points;

		Object.entries(this).forEach(([key, value]) => {

			if (regex.test(key)) delete copied[key];
			if (isa_fn(this[key])) copied[key] = self[key];
		}, this);

		if (this.domElement) {

			let newbie = copied.domElement = this.domElement.cloneNode(true);
			newbie.id = copied.name;

			let kids = newbie.querySelectorAll('[data-corner-div="sc"]');

			kids.forEach(kid => newbie.removeChild(kid));

			if (host && host.domElement) host.domElement.appendChild(copied.domElement);
		}

		let clone = new constructors[this.type](copied);
		clone.set(items);

		if (grp) grp.addArtefacts(clone);

		return clone;
	};

/*
TODO - documentation
*/
	P.addClasses = function (item) {

		if (item.substring) {

			let classes = this.classes;

			classes += ` ${item}`;
			classes = classes.trim();
			classes = classes.replace(/[\s\uFEFF\xA0]+/g, ' ');

			if (classes !== this.classes) {

				this.classes = classes;
				this.dirtyClasses = true;
			}
		}
		return this;
	};

	P.removeClasses = function (item) {

		if (item.substring) {

			let classes = this.classes,
				targets = item.split(),
				search;

			targets.forEach(cls => {

				search = new RegExp(' ?' + cls + ' ?');
				classes = classes.replace(search, ' ');
				classes = classes.trim();
				classes = classes.replace(/[\s\uFEFF\xA0]+/g, ' ');
			});

			if (classes !== this.classes) {

				this.classes = classes;
				this.dirtyClasses = true;
			}
		}
		return this;
	};

/*
TODO - documentation
*/
	P.updateDomAttributes = function (items, value) {

		if (this.domElement) {

			let el = this.domElement;

			if (items.substring && xt(value)) {

				if (value) el.setAttribute(items, value);
				else el.removeAttribute(items);
			}
			else if (isa_obj(items)) {

				Object.entries(items).forEach(([item, val]) => {

					if (val) el.setAttribute(item, val);
					else el.removeAttribute(item);
				});
			}

		}
		return this;
	};

/*
TODO - documentation
*/
	P.addPathCorners = function () {

		if (!this.noUserInteraction) {

			let pointMaker = function () {

				let p = document.createElement('div');

				p.style.width = 0;
				p.style.height = 0;
				p.style.position = 'absolute';

				return p;
			};

			let tl = pointMaker(),
				tr = pointMaker(),
				br = pointMaker(),
				bl = pointMaker();

			tl.style.top = '0%';
			tl.style.left = '0%';
			tl.setAttribute('data-corner-div', 'sc');

			tr.style.top = '0%';
			tr.style.left = '100%';
			tr.setAttribute('data-corner-div', 'sc');

			br.style.top = '100%';
			br.style.left = '100%';
			br.setAttribute('data-corner-div', 'sc');

			bl.style.top = '100%';
			bl.style.left = '0%';
			bl.setAttribute('data-corner-div', 'sc');

			let el = this.domElement;

			el.appendChild(tl);
			el.appendChild(tr);
			el.appendChild(br);
			el.appendChild(bl);

			this.pathCorners.push(tl);
			this.pathCorners.push(tr);
			this.pathCorners.push(br);
			this.pathCorners.push(bl);

			if (!this.currentCornersData) this.currentCornersData = [];
		}
		return this;
	};

/*
TODO - documentation
*/
	P.checkCornerPositions = function (corner) {

		let pathCorners = this.pathCorners;

		if (pathCorners.length === 4) {

			let here = this.getHere(),
				x = currentCorePosition.scrollX - (here.offsetX || 0),
				y = currentCorePosition.scrollY - (here.offsetY || 0),
				round = Math.round,
				results = [],
				client;

			const cornerPush = function (c) {

				let coord = c[0];

				if (coord) {

					results.push(round(coord.left + x));
					results.push(round(coord.top + y));
				}
				else results.push(0, 0);
			};

			switch (corner) {

				case 'topLeft' :

					client = pathCorners[0].getClientRects();
					cornerPush(client);
					return results;

				case 'topRight' :

					client = pathCorners[1].getClientRects();
					cornerPush(client);
					return results;

				case 'bottomRight' :

					client = pathCorners[2].getClientRects();
					cornerPush(client);
					return results;

				case 'bottomLeft' :

					client = pathCorners[3].getClientRects();
					cornerPush(client);
					return results;

				default :

					pathCorners.forEach(point => {

						client = point.getClientRects();
						cornerPush(client);
					});
					return results;
			}
		}
	}

/*
TODO - documentation
*/
	P.getCornerCoordinate = function (corner, coordinate) {

		let x, y;

		switch (corner) {

			case 'topLeft' :
				[x, y] = this.checkCornerPositions('topLeft');
				break;

			case 'topRight' :
				[x, y] = this.checkCornerPositions('topRight');
				break;

			case 'bottomRight' :
				[x, y] = this.checkCornerPositions('bottomRight');
				break;

			case 'bottomLeft' :
				[x, y] = this.checkCornerPositions('bottomLeft');
				break;

			default :
				[x, y] = this.currentStampPosition;
		}

		if (coordinate) {

			if (coordinate === 'x') return x;
			if (coordinate === 'y') return y;
		}
		return [x, y];
	};

/*
TODO - documentation
*/
	P.cleanPathObject = function () {

		this.dirtyPathObject = false;

		if (!this.noUserInteraction) {

			if (!this.pathCorners.length) this.addPathCorners();

			if (!this.currentCornersData) this.currentCornersData = [];
			let cornerData = this.currentCornersData;
			cornerData.length = 0;
			cornerData.push(...this.checkCornerPositions());

			let p = this.pathObject = new Path2D();
			p.moveTo(cornerData[0], cornerData[1]);
			p.lineTo(cornerData[2], cornerData[3]);
			p.lineTo(cornerData[4], cornerData[5]);
			p.lineTo(cornerData[6], cornerData[7]);
			p.closePath();
		}
	};

/*
TODO - documentation

Overwrites mixin/position.js function
*/
	P.calculateSensors = function () {

		if (!this.noUserInteraction) {

			let [_tlx, _tly, _trx, _try, _brx, _bry, _blx, _bly] = this.currentCornersData;

			let sensors = this.currentSensors;
			sensors.length = 0;

			sensors.push([_tlx, _tly]);
			sensors.push([_trx, _try]);
			sensors.push([_brx, _bry]);
			sensors.push([_blx, _bly]);

			let sensorSpacing = this.sensorSpacing || 50,
				topLengthX = _tlx - _trx,
				topLengthY = _tly - _try,
				topLength = Math.sqrt((topLengthX * topLengthX) + (topLengthY * topLengthY)),
				topSensors = parseInt(topLength / sensorSpacing, 10) - 1,

				rightLengthX = _trx - _brx,
				rightLengthY = _try - _bry,
				rightLength = Math.sqrt((rightLengthX * rightLengthX) + (rightLengthY * rightLengthY)),
				rightSensors = parseInt(rightLength / sensorSpacing, 10) - 1,

				bottomLengthX = _brx - _blx,
				bottomLengthY = _bry - _bly,
				bottomLength = Math.sqrt((bottomLengthX * bottomLengthX) + (bottomLengthY * bottomLengthY)),
				bottomSensors = parseInt(bottomLength / sensorSpacing, 10) - 1,

				leftLengthX = _blx - _tlx,
				leftLengthY = _bly - _tly,
				leftLength =  Math.sqrt((leftLengthX * leftLengthX) + (leftLengthY * leftLengthY)),
				leftSensors = parseInt(leftLength / sensorSpacing, 10) - 1;

			let partX, partY, dx, dy, i;

			if (topSensors > 0) {

				partX = _trx;
				partY = _try;
				dx = topLengthX / (topSensors + 1);
				dy = topLengthY / (topSensors + 1);

				for (i = 0; i < topSensors; i++) {

					partX += dx;
					partY += dy;
					sensors.push([partX, partY]);
				}
			}

			if (rightSensors > 0) {

				partX = _brx;
				partY = _bry;
				dx = rightLengthX / (rightSensors + 1);
				dy = rightLengthY / (rightSensors + 1);

				for (i = 0; i < rightSensors; i++) {

					partX += dx;
					partY += dy;
					sensors.push([partX, partY]);
				}
			}

			if (bottomSensors > 0) {

				partX = _blx;
				partY = _bly;
				dx = bottomLengthX / (bottomSensors + 1);
				dy = bottomLengthY / (bottomSensors + 1);

				for (i = 0; i < bottomSensors; i++) {

					partX += dx;
					partY += dy;
					sensors.push([partX, partY]);
				}
			}

			if (leftSensors > 0) {

				partX = _tlx;
				partY = _tly;
				dx = leftLengthX / (leftSensors + 1);
				dy = leftLengthY / (leftSensors + 1);

				for (i = 0; i < leftSensors; i++) {

					partX += dx;
					partY += dy;
					sensors.push([partX, partY]);
				}
			}
		}
	};

/*
TODO - documentation
*/
	P.cleanRotation = function () {

		this.dirtyRotation = false;

		if (!this.rotation || !isa_quaternion(this.rotation)) this.rotation = makeQuaternion();

		if (!this.currentRotation || !isa_quaternion(this.rotation)) this.currentRotation = makeQuaternion();

		let calculatedRotation = this.rotation;

		calculatedRotation.setFromEuler({
			pitch: this.pitch || 0,
			yaw: this.yaw || 0,
			roll: this.roll || 0,
		});

		if (calculatedRotation.getMagnitude() !== 1) calculatedRotation.normalize();

		let processedRotation = requestQuaternion(),
			path = this.path,
			mimic = this.mimic,
			pivot = this.pivot,
			lock = this.lockTo;

		if (path && lock.indexOf('path') >= 0) {

			processedRotation.set(calculatedRotation);
			// TODO check to see if path roll needs to be added

		}
		else if (mimic && this.useMimicRotation && lock.indexOf('mimic') >= 0) {

			if (xt(mimic.currentRotation)) {

				processedRotation.set(mimic.currentRotation);
				if (this.addOwnRotationToMimic) processedRotation.quaternionRotate(calculatedRotation);
			}
			else this.dirtyMimicRotation = true;
		} 
		else {

			processedRotation.set(calculatedRotation);

			if (pivot && this.addPivotRotation && lock.indexOf('pivot') >= 0) {

				if (xt(pivot.currentRotation)) processedRotation.quaternionRotate(pivot.currentRotation);
				else this.dirtyPivotRotation = true;
			}
		}

		this.currentRotation.set(processedRotation);

		releaseQuaternion(processedRotation);

		this.dirtyPositionSubscribers = true;
		
		if (this.mimicked && this.mimicked.length) this.dirtyMimicRotation = true;
	};

/*
TODO - documentation
*/
	P.cleanOffsetZ = function () {

		// nothing to do here - function only exists in case we need to do stuff in future Scrawl-canvas version
		this.dirtyOffsetZ = false;
	};

/*
TODO - documentation
*/
	P.cleanContent = function () {

		this.dirtyContent = false;

		let el = this.domElement;

		if (el) this.dirtyDimensions = true;
	};

/*
TODO - documentation
*/
	P.initializeDomLayout = function (items) {

		let el = items.domElement,
			elStyle = el.style;

		if (el && items.setInitialDimensions) {

			let dims = el.getBoundingClientRect(),
				trans = el.style.transform,
				transOrigin = el.style.transformOrigin,
				host = false,
				hostDims;

			if (items && items.host) {

				host = items.host;

				if (host.substring && artefact[host]) host = artefact[host];
			}

			// TODO - discover scale

			// discover dimensions (width, height)
			this.currentDimensions[0] = dims.width;
			this.currentDimensions[1] = dims.height;
			items.width = dims.width;
			items.height = dims.height;

			// recover classes already assigned to the element
			if (el.className) items.classes = el.className;

			// go with lock defaults - no work required

			// discover start (boundingClientRect - will be the difference between this object and its host (parent) object 'top' and 'left' values)
			if (host && host.domElement) {

				hostDims = host.domElement.getBoundingClientRect();

				if (hostDims) {

					items.startX = dims.left - hostDims.left;
					items.startY = dims.top - hostDims.top;
				}
			}


			// TODO go with offset defaults - though may be worthwhile checking if the translate style has been set?

			// TODO discover handle (transform, transformOrigin)

			// TODO go with rotation (pitch, yaw, roll) defaults - no further work required?

			// for Stack artefacts only, discover perspective and perspective-origin values
			if (this.type === 'Stack') {

				// TODO - currently assumes all lengths supplied are in px - need a way to calculate non-px values
				if (!xt(items.perspective) && !xt(items.perspectiveZ)) {

					// TODO - this isn't working! 
					items.perspectiveZ = (xt(elStyle.perspective) && elStyle.perspective) ? parseFloat(elStyle.perspective) : 0;
				}

				let perspectiveOrigin = elStyle.perspectiveOrigin;

				if (perspectiveOrigin.length) {

					perspectiveOrigin = perspectiveOrigin.split(' ');

					if (perspectiveOrigin.length > 0 && !xt(items.perspective) && !xt(items.perspectiveX)) items.perspectiveX = perspectiveOrigin[0];

					if (!xt(items.perspective) && !xt(items.perspectiveY)) {

						if (perspectiveOrigin.length > 1) items.perspectiveY = perspectiveOrigin[1];
						else items.perspectiveY = perspectiveOrigin[0];
					}
				}
			}
		}
	};

/*
TODO - documentation
*/
	P.checkForResize = function () {

		let el = this.domElement;

		if (el) {

			let dims = el.getBoundingClientRect(),
				flag = false;

			if (this.currentDimensions[0] !== dims.width) {

				this.dimensions[0] = this.currentDimensions[0] = dims.width;
				flag = true;
			}

			if (this.currentDimensions[1] !== dims.height) {

				this.dimensions[1] = this.currentDimensions[1] = dims.height;
				flag = true;
			}

			if (flag && (this.type === 'Stack')) this.triggerResizeCascade();
		}
	};

	P.triggerResizeCascade = function () {

		let gBucket = this.groupBuckets,
			aBucket;

		if (gBucket && gBucket.length) {

			gBucket.forEach(grp => {

				aBucket = grp.artefactBuckets;

				if (aBucket && aBucket.length) {

					aBucket.forEach(art => {

						if (art) {

							art.dirtyDimensions = true;
						}
					})
				}
			})
		}
	};

/*
TODO - documentation
*/
	P.prepareStamp = function () {

		if (this.actionResize) this.checkForResize();

		if (this.dirtyScale || this.dirtyDimensions || this.dirtyStart || this.dirtyOffset || this.dirtyHandle || this.dirtyRotation) {

			this.dirtyPathObject = true;
			this.dirtyCollision = true;
		}

		if (this.dirtyContent) this.cleanContent();
		if (this.dirtyScale) this.cleanScale();
		if (this.dirtyDimensions) this.cleanDimensions();
		if (this.dirtyLock) this.cleanLock();
		if (this.dirtyStart) this.cleanStart();
		if (this.dirtyOffset) this.cleanOffset();
		if (this.dirtyOffsetZ) this.cleanOffsetZ();
		if (this.dirtyHandle) this.cleanHandle();
		if (this.dirtyRotation) this.cleanRotation();

		if (this.isBeingDragged || this.lockTo.indexOf('mouse') >= 0) {

			this.dirtyStampPositions = true;
			this.dirtyStampHandlePositions = true;
		}

		if (this.pivoted.length) this.dirtyStampPositions = true;

		if (this.dirtyStampPositions) this.cleanStampPositions();
		if (this.dirtyStampHandlePositions) this.cleanStampHandlePositions();

		if (this.dirtyPathObject) this.cleanPathObject();
	};

	P.cleanStampPositionsAdditionalActions = function () {

		if (this.domElement && this.collides) this.dirtyPathObject = true;
	};

/*
TODO - documentation
*/
	P.stamp = function () {

		let self = this;

		return new Promise((resolve, reject) => {

			// do not process if the DOM element is missing
			if (!self.domElement) reject(false);

			// calculate transform strings on each iteration
			let [stampX, stampY] = self.currentStampPosition,
				[handleX, handleY] = self.currentStampHandlePosition,
				scale = self.currentScale;

			let rotation = self.currentRotation,
				v, vx, vy, vz, angle;

			let nTransformOrigin = `${handleX}px ${handleY}px 0`,
				nTransform = `translate(${stampX - handleX}px,${stampY - handleY}px)`;

			if (self.yaw || self.pitch || self.roll || (self.pivot && self.addPivotRotation) || (self.mimic && self.useMimicRotation) || (self.path && self.addPathRotation)) {

				v = rotation.v;
				vx = v.x;
				vy = v.y;
				vz = v.z;
				angle = rotation.getAngle(false);

				nTransform += ` rotate3d(${vx},${vy},${vz},${angle}rad)`;
			}

			if (self.offsetZ) nTransform += ` translateZ(${self.offsetZ}px)`;

			if (scale !== 1) nTransform += ` scale(${scale},${scale})`;

			if (nTransform !== self.currentTransformString) {

				self.currentTransformString = nTransform;
				self.dirtyTransform = true;
			}

			if (nTransformOrigin !== self.currentTransformOriginString) {

				self.currentTransformOriginString = nTransformOrigin;
				self.dirtyTransformOrigin = true;
			}

			// determine whether there is a need to trigger a redraw of the DOM element
			if (self.dirtyTransform || self.dirtyPerspective || self.dirtyPosition || self.dirtyDomDimensions || self.dirtyTransformOrigin || self.dirtyVisibility || self.dirtyCss || self.dirtyClasses || self.domShowRequired) {

				addDomShowElement(self.name);
				setDomShowRequired(true);
			}

			// update artefacts subscribed to this artefact (using it as their pivot or mimic source), if required
			if (self.dirtyPositionSubscribers) self.updatePositionSubscribers();

			// if this artefact's pivot or mimic source was playing up, reset appropriate dirty flags so we can try and fix on next iteration
			if(self.dirtyMimicRotation || self.dirtyPivotRotation) {

				self.dirtyMimicRotation = false;
				self.dirtyPivotRotation = false;
				self.dirtyRotation = true;
			}

			if(self.dirtyMimicScale) {

				self.dirtyMimicScale = false;
				self.dirtyScale = true;
			}

			resolve(true);
		});
	};

/*
TODO - documentation

Overwrites mixin/position.js function
*/
	P.checkHit = function (items = [], mycell) {

		if (this.noUserInteraction) return false;

		if (this.dirtyCollision || !this.pathObject || this.dirtyPathObject) {

			this.cleanPathObject();
			this.dirtyCollision = false;
		}

		let tests = (!Array.isArray(items)) ?  [items] : items,
			poolCellFlag = false;

		if (!mycell) {

			mycell = requestCell();
			poolCellFlag = true;
		}

		let engine = mycell.engine,
			stamp = this.currentStampPosition,
			x = stamp[0],
			y = stamp[1],
			tx, ty;

		if (tests.some(test => {

// console.log(test)
			if (Array.isArray(test)) {

				tx = test[0];
				ty = test[1];
			}
			else if (xta(test, test.x, test.y)) {

				tx = test.x;
				ty = test.y;
			}
			else return false;

			if (!tx.toFixed || !ty.toFixed || isNaN(tx) || isNaN(ty)) return false;

			return engine.isPointInPath(this.pathObject, tx, ty);

		}, this)) {

			if (poolCellFlag) releaseCell(mycell);

			return {
				x: tx,
				y: ty,
				artefact: this,
			};
		}
		
		if (poolCellFlag) releaseCell(mycell);
		
		return false;
	};

/*
TODO - documentation

I really don't like this functionality - see if we can purge it from the code base?
*/
	P.apply = function() {

		applyCoreResizeListener();

		this.prepareStamp();

		let self = this;

		this.stamp()
		.then(() => {

			domShow(self.name);
			self.dirtyPathObject = true;
			self.cleanPathObject();
		})
		.catch(() => {});
	};

	return P;
};
