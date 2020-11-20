// # Force factory
// Details

// #### Demos:
// + [particles-001](../../demo/particles-001.html) - Emitter entity, and Particle World, basic functionality
// + [particles-007](../../demo/particles-007.html) - Particle Force objects: generation and functionality
// + [particles-008](../../demo/particles-008.html) - Net entity: generation and basic functionality, including Spring objects
// + [particles-009](../../demo/particles-009.html) - Net particles: drag-and-drop functionality


// #### Imports
import { constructors } from '../core/library.js';
import { mergeOver, pushUnique, λnull, isa_fn } from '../core/utilities.js';

import { requestVector, releaseVector } from './vector.js';

import baseMix from '../mixin/base.js';


// #### Force constructor
const Force = function (items = {}) {

    this.makeName(items.name);
    this.register();

    this.set(this.defs);

    this.set(items);

    if (!this.action) this.action = λnull;

    return this;
};


// #### Force prototype
let P = Force.prototype = Object.create(Object.prototype);
P.type = 'Force';
P.lib = 'force';
P.isArtefact = false;
P.isAsset = false;


// #### Mixins
P = baseMix(P);


// #### Force attributes
// + Attributes defined in the [base mixin](../mixin/base.html): __name__.
// + Attributes defined in the [tween mixin](../mixin/tween.html): __order__, __ticker__, __targets__, __time__, __action__, __reverseOnCycleEnd__, __reversed__.
let defaultAttributes = {

    action: null,
};
P.defs = mergeOver(P.defs, defaultAttributes);


// #### Packet management
P.packetFunctions = pushUnique(P.packetFunctions, ['action']);


// #### Clone management
// No additional clone functionality required


// #### Kill management
P.kill = function () {

    this.deregister();

    return true;
};



// #### Get, Set, deltaSet
let S = P.setters;

S.action = function (item) {

    if (isa_fn(item)) this.action = item;
    else this.action = λnull;
}


// #### Factory
const makeForce = function (items) {
    return new Force(items);
};

constructors.Force = Force;


makeForce({

    name: 'gravity',
    action: (particle, world, host) => {

        let {mass, load} = particle;

        let c = requestVector();

        c.setFromVector(world.gravity).scalarMultiply(mass);
        load.vectorAdd(c);

        releaseVector(c);
    },
});


// #### Exports
export {
    makeForce,
};

