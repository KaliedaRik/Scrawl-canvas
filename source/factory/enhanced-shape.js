// # EnhancedShape factory
// A factory for generating shape-based entitys from the details of contributing shape-based entitys, using boolean path operations


// #### Imports
import { entity, entitynames, constructors } from '../core/library.js';

import { doCreate, isa_obj, mergeOver, Ωempty } from '../helper/utilities.js';

import baseMix from '../mixin/base.js';
import shapeMix from '../mixin/shape-basic.js';

// Shared constants
import { _floor, _isArray, _isFinite, ENTITY, T_COG, T_ENHANCED_SHAPE, T_OVAL, T_POLYGON, T_RECTANGLE, T_STAR, T_TETRAGON, ZERO_PATH } from '../helper/shared-vars.js';

// Local constants
const BASE = 'base',
    ADD = 'add',
    SUBTRACT = 'subtract',
    INTERSECT = 'intersect',
    OPERATIONS = [BASE, ADD, SUBTRACT, INTERSECT];

// Note: excluding the following shape-based entitys from contributing to EnhancedShape entitys (for the moment) because they are, or have the potential to be, open (unclosed) shapes and we're not sure yet how to handle them when it comes to boolean path operations
// + T_BEZIER, T_LINE, T_LINE_SPIRAL, T_POLYLINE, T_QUADRATIC, T_SHAPE, T_SPIRAL,
// + T_ENHANCED_SHAPE - while nesting EnhancedShape entitys may be possible, it's something we want to avoid during development
const PERMITTED_ENTITYS = [T_COG, T_OVAL, T_POLYGON, T_RECTANGLE, T_STAR, T_TETRAGON];


// #### EnhancedShape constructor
const EnhancedShape = function (items = Ωempty) {

    this.components = [];
    this.shapeInit(items);

    return this;
};


// #### EnhancedShape prototype
const P = EnhancedShape.prototype = doCreate();
P.type = T_ENHANCED_SHAPE;
P.lib = ENTITY;
P.isArtefact = true;
P.isAsset = false;


// #### Mixins
baseMix(P);
shapeMix(P);


// #### EnhancedShape attributes
const defaultAttributes = {

    components: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
// No additional packet functionality required


// #### Clone management
// No additional clone functionality required


// #### Kill management
// No additional kill functionality required


// #### Get, Set, deltaSet
let S = P.setters;

S.components = function (item) {

console.log('components - item', item);
    if (_isArray(item)) {

        const existing = [];

        const sanitisedItems = item.map(i => {

            const s = this.getSanitisedComponentObject(i, existing);
            if (s) existing.push(s.component);
            return s;

        }).filter(i => i !== false);

console.log('components - sanitisedItems', JSON.stringify(sanitisedItems));

        // TODO: Do work here to go through each component entity and remove the ES name from their `enhanced` array
        const name = this.name;

        this.components.length = 0;

        this.components.push(...sanitisedItems);

        // TODO: Do work here to go through each component entity and add the ES name to their `enhanced` array
        // + This sets up the signalling system. When the component changes shape, position, scale or rotation it should then be able to communicate back to the EnhancedShape entity (using the `dirtySpecies` flag) that our entity needs to recalculate its path

        this.dirtySpecies = true;
        this.dirtyComponentOrder = true;
    }
};


// #### Prototype functions
// `getSanitisedComponentObject` - internal helper function - sanitise the component objects. We need the objects to have the following shape:
// ```
// {
//   component: string (name string of an existing, permitted entity,
//   operation: 'base' | add' | 'subtract' | 'intersect',
//   order: positive-finite-number,
// }
// ```
P.getSanitisedComponentObject = function (item, existing) {

    // All required attributes must be present
    if (!isa_obj(item)) return false;
    if (item.component == null || item.operation == null || item.order == null) return false;

    const res = {
        component: item.component,
        operation: item.operation,
        order: item.order,
    };

    // Reject non-finite, non-positive numbers
    if (!_isFinite(res.order) || res.order < 0) return false;
    res.order = _floor(res.order);

    // Reject unsupported operations
    if (!OPERATIONS.includes(res.operation)) return false;

    // Reject if the entity has not yet been defined and registered in the library
    if (res.component.substring && !entitynames.includes(res.component)) return false;
    if (res.component.name && !entitynames.includes(res.component.name)) return false;

    // Component attribute must be a string
    if (res.component.name) res.component = res.component.name;

    // Reject non-permitted components
    const e = entity[res.component];
    if (e == null || !PERMITTED_ENTITYS.includes(e.type)) return false;

    // Reject duplicate entitys
    if (existing.includes(res.component)) return false;

    return res;
};


// TODO: consider if we want the ability to add/remove/clear components to/from the components array
// + To replace one set of components with another set, use `entity.set({ components: [{...}, ...]})`


// `cleanSpecies` - internal helper function - called by `prepareStamp`
P.cleanSpecies = function () {

    this.dirtySpecies = false;
    this.pathDefinition = this.makeEnhancedShapePath();
};

P.cleanStampHandlePositionsAdditionalActions = function () {

    const box = this.localBox;

    if (!box || box.length < 2) return;

    const stampHandle = this.currentStampHandlePosition;

    stampHandle[0] += box[0];
    stampHandle[1] += box[1];
};

// `makeEnhancedShapePath` - internal helper function - called by `cleanSpecies`
P.makeEnhancedShapePath = function () {

console.log('makeEnhancedShapePath triggered');

    // Step 1: sort components, if required
    if (this.dirtyComponentOrder) this.sortComponents();


    // This is where we get path-related data from contributing shape-based entitys and then combine them following the instructions in the `components` array

    let myData = ZERO_PATH;

    // Temporary for development - just to display something
    myData += 'h50v50h-50z';

    return myData;
};

P.sortComponents = function () {

console.log('sortComponents triggered');
    this.dirtyComponentOrder = false;

    this.components.sort((a, b) => a.order - b.order);

console.log(JSON.stringify(this.components))
};

P.calculateLocalPathAdditionalActions = function () {

    let scale = this.scale;

    if (scale < 0.001) scale = 0.001;

    const [x, y] = this.localBox;

    this.pathDefinition = this.pathDefinition.replace(ZERO_PATH, `m${-x / scale},${-y / scale}`);

    this.pathCalculatedOnce = false;

    // ALWAYS, when invoking `calculateLocalPath` from `calculateLocalPathAdditionalActions`, include the second argument, set to `true`! Failure to do this leads to an infinite loop which will make your machine weep.
    // + We need to recalculate the local path to take into account the offset required to put the EnhancedShape entity's start coordinates at the top-left of the local box, and to recalculate the data used by other artefacts to place themselves on, or move along, its path.
    this.calculateLocalPath(this.pathDefinition, true);
};


// #### Factories

// ##### makeEnhancedShape
export const makeEnhancedShape = function (items) {

    if (!items) return false;
    return new EnhancedShape(items);
};

constructors.EnhancedShape = EnhancedShape;
