// # Coordinate factory
// Scrawl-canvas uses Coordinate Arrays extensively throughout the code base - in particular to hold artefact coordinate [x, y] and dimensional [w, h] data. The Coordinate factory does not care whether these values are presented as Numbers or Strings (or a mixture of both) - it leaves such functionality to other mixins (in particular the [position](../mixin/position.html), [dom](../mixin/dom.html) and [entity](../mixin/entity.html) mixins) and factories.


// #### Imports
import { constructors } from '../core/library.js';
import { xt, isa_number } from '../core/utilities.js';


// #### Coordinate constructor
const Coordinate = function (items, y) {

    let coords = [0, 0];

    Object.setPrototypeOf(coords, Coordinate.prototype);

    if (items) coords.set(items, y);

    return coords;
};


// #### Coordinate prototype
let P = Coordinate.prototype = Object.create(Array.prototype);
P.constructor = Coordinate;
P.type = 'Coordinate';


// #### Mixins
// Coordinate Arrays do not use mixins - they are regular Javascript Arrays. As such, they do not possess packet, clone or kill functionality.


// #### Coordinate attributes
// There are no attributes. The constructor returns an Array containing two members, whose prototype object includes functions for manipulating those members in various ways.


// #### Get, Set, deltaSet
// The Array members can be set using a `set` function, which is overloaded as follows:
// + `mycoordinate.set(Coordinate)` - use another Coordinate Array to set this Coordinate members' values
// + `mycoordinate.set(Array)` -  - use a Javascript Array to set this Coordinate members' values
// + `mycoordinate.set(Quaternion)` - use a Quaternion object (specifically, its __v__ Vector object attribute) to set this Coordinate members' values
// + `mycoordinate.set(Vector)` - use a Vector object to set this Coordinate members' values
// + `mycoordinate.set(a:Number|String, b:Number|String)` - supply two arguments to the function
P.set = function (items, y) {

    if (xt(items)) {

        if (items.type === 'Coordinate') this.setFromArray(items);
        else if (items.type === 'Vector') this.setFromVector(items);
        else if (items.type === 'Quaternion') this.setFromVector(items.v);
        else if (Array.isArray(items)) this.setFromArray(items);
        else if (xt(y)) this.setFromArray([items, y]);
    }
    return this;
};

P.setFromArray = function (item) {

    this[0] = item[0];
    this[1] = item[1];

    return this;
};

P.setFromVector = function (item) {

    let {x, y} = item;

    this[0] = x;
    this[1] = y;

    return this;
};


// #### Prototype functions
// Set the Coordinate array to `[0, 0]`
P.zero = function () {

    this[0] = 0;
    this[1] = 0;

    return this;
};

// Add a Vector object's __x__ and __y__ attributes to the Coordinate members' values
P.vectorAdd = function (item) {

    let {x, y} = item;

    this[0] += x;
    this[1] += y;

    return this;
};

// Subtract a Vector object's __x__ and __y__ attributes from the Coordinate members' values
P.vectorSubtract = function (item) {

    let {x, y} = item;

    this[0] -= x;
    this[1] -= y;

    return this;
};

// Array addition - argument is a `[Number, Number]` Array
P.add = function (item) {

    let [x, y] = item;

    this[0] += x;
    this[1] += y;

    return this;
};

// Array subtraction - argument is a `[Number, Number]` Array
P.subtract = function (item) {

    let [x, y] = item;

    this[0] -= x;
    this[1] -= y;

    return this;
};

// Array multiplication - argument is a `[Number, Number]` Array
P.multiply = function (item) {

    let [x, y] = item;

    this[0] *= x;
    this[1] *= y;

    return this;
};

// Array division - argument is a `[Number, Number]` Array
P.divide = function (item) {

    let [x, y] = item;

    if (x && y) {

        this[0] /= x;
        this[1] /= y;
    }


    return this;
};

// Multiply both Coordinate Array members by the argument Number
P.scalarMultiply = function (item) {

    this[0] *= item;
    this[1] *= item;

    return this;
};

// Divide both Coordinate Array members by the argument Number
P.scalarDivide = function (item) {

    if (item && item.toFixed) {

        this[0] /= item;
        this[1] /= item;
    }

    return this;
};

// Get the Array's __magnitude__ value (treating the Coordinate as if it was a 2D vector)
P.getMagnitude = function () {

    return Math.hypot(...this);
};

// Rotate the Coordinate by the argument number (treating the Coordinate as if it was a 2D vector) - the argument represents degrees, not radians
P.rotate = function (angle) {

    let stat_vr = [0, 0];

    let [x, y] = this;

    stat_vr[0] = Math.atan2(y, x);
    stat_vr[0] += (angle * 0.01745329251);
    stat_vr[1] = Math.hypot(x, y);

    this[0] = stat_vr[1] * Math.cos(stat_vr[0]);
    this[1] = stat_vr[1] * Math.sin(stat_vr[0]);

    return this;
};

// Reverse the numerical sign on each of the Array's members
P.reverse = function () {

    this[0] = -this[0];
    this[1] = -this[1];

    return this;
};

// Get the Array's __dot product__ value (treating the Coordinate as if it was a 2D vector)
P.getDotProduct = function (coord) {

    return (this[0] * coord[0]) + (this[1] * coord[1]);
};

// __Normalize__ the Array's members (treating the Coordinate as if it was a 2D vector)
P.normalize = function() {
    
    let val = this.getMagnitude();
    
    if (val > 0) {
        this[0] /= val;
        this[1] /= val;
    }
    return this;
};


// #### Coordinate pool
// An attempt to reuse coordinates rather than constantly creating and deleting them
const coordinatePool = [];

// `exported function` - retrieve a Coordinate from the coordinate pool
const requestCoordinate = function (items, y) {

    if (!coordinatePool.length) coordinatePool.push(new Coordinate());

    let c = coordinatePool.shift();
    c.set(items, y);
    return c
};

// `exported function` - return a Coordinate to the coordinate pool. Failing to return Coordinates to the pool may lead to more inefficient code and possible memory leaks.
const releaseCoordinate = function (coordinate) {

    if (coordinate && coordinate.type === 'Coordinate') coordinatePool.push(coordinate.zero());
};


// #### Factory
const makeCoordinate = function (items, y) {

    return new Coordinate(items, y);
};

constructors.Coordinate = Coordinate;


// #### Exports
export {
    makeCoordinate,
    requestCoordinate,
    releaseCoordinate,
};
