# Animation and the Display cycle
All SC animation runs off a single ***core animation loop*** whose functionality is defined in the [core/animation-loop.js](../source/core/animation-loop.html) file. This loop is instantiated during [SC initialization](sc-initialization.html) and continues to run until the dev-user instructs it to halt, or the end-user navigates away from the web page.

End-user browsers, devices and screens can all have an effect on the speed at which the core animation loop runs - some combinations will allow the loop to run at 120 frames-per-second (fps), or more. SC makes no attempt to control the loop speed; instead, the individual functions that run during each loop can be choked down to run at 60fps, or less.

The core animation loop itself doesn't include any functionality beyond running and invoking various ***Animation objects*** which either SC, or the dev-user, define. These functions get added to an `animation` Array. At the start of each loop the array will be sorted (if sorting is required), then the loop will check each Animation object to see if its ***animation function*** can be run and, if yes, invoke it.

SC exports the following functions which the dev-user can use to control the core animation loop. Note that halting the loop halts **all** animations across the entire SC system (for all Canvas and Stack artefacts). See [test demo DOM-009](../../demo/dom-009.html) for an example:
+ `scrawl.startCoreAnimationLoop()`
+ `scrawl.stopCoreAnimationLoop()`

## Animation objects
SC defines three types of Animation object, each of which can be created using SC factory functions. The objects returned from these factories are *tracked objects* which get referenced in the SC library:

| Factory | Type | Library section | File | Purpose |
|:---|:---|:---|:---|
| `scrawl.makeAnimation()` | generic | animation | [factory/animation.js](../source/factory/animation.html) | Functions that run once per loop |
| `scrawl.makeRender()` | display | animation | [factory/render-animation.js](../source/factory/render-animation.html) | Display cycle animations |
| `scrawl.makeTicker()` | time-based | tickeranimation | [factory/ticker.js](../source/factory/ticker.html) | [Tween animations](https://en.wikipedia.org/wiki/Inbetweening) |
| `scrawl.makeTween()` | time-based | tickeranimation | [factory/tween.js](../source/factory/tween.html) | Tween animations |

Every Animation object will include two common attributes:
+ `animation.name` - String - defaults to a unique computer-generated value
+ `animation.order` - Number - defaults to `1`

All Animation objects also include the following core functions:
+ `animation.run()` - start the animation
+ `animation.isRunning()` - check to see if the animation is currently running
+ `animation.halt()` - stop the animation
+ `animation.kill()` - remove the animation object from the SC system

### Animation object serialization and cloning
Serialization - and thus cloning - functionality has not yet been implemented for Animation objects.

### Accessibility considerations around animation
[write up]

## Generic animations
Generic Animation objects are the simplest of the three animation types supported by SC. The object created by the `scrawl.makeAnimation({key: value, ...})` factory function has the following attributes:
+ `name` - String, name identifier (default: computer generated String)
+ `order` - Number, order value (default: `1`)
+ `fn` - Function, invoked during every core animation loop iteration (if permitted)
+ `onRun` - hook Function
+ `onHalt` - hook Function
+ `onKill` - hook Function
+ `maxFrameRate` - Number, animation choke functionality (default: `60`)
+ `lastRun` - Number (internal only), animation choke functionality
+ `chokedAnimation` - Boolean, animation choke functionality (default: `true`)

The object also includes the following methods (functions):
+ `run()` - invokes the `onStart` hook function, then adds the object to the core animation loop's `animation` Array.
+ `halt()` - invokes the `onHalt` hook function, then removes the object from the core animation loop's `animation` Array.
+ `kill()` - invokes the `onKill` hook function, then removes the object from the SC system.
+ `isRunning()` - returns a Boolean: `true` if the object is currently included in the core animation loop's `animation` Array.

The default behaviour of a generic Animation object, when created, is to run immediately. Dev-users can prevent this by adding a `delay: true` attribute to the factory function's argument object.

### The `fn` function
When the Animation object is added to the core animation loop, the loop will invoke the object's `fn` function - choke permitting - as part of each iteration of the loop. By default, the `fn` does nothing (in SC repo terms, it defaults to the `λnull` lambda function defined in the [helper/utilities.js](../source/helper/utilities.html) file).

Dev-users can associate a function object to the `fn` attribute. That function can perform any task either within the SC ecosystem, or beyond. This includes building a bespoke Display cycle animation - see test demo [Canvas-041](../../demo/canvas-041.html) for an example.

### The hook functions
Similar to the `fn` function, the hook functions - `onRun`, `onHalt`, `onKill` - default to `λnull` lambda functions. Dev-users can use these hooks to perform setup and cleanup actions each time the animation run or halts.

### Animation choke functionality
By default, generic Animation objects are choked to run at a maximum of 60 frames-per-second. Testing to see if sufficient time has passed since the `fn` function's last invocation, to allow a new invocation, happens in the core animation loop's `animationLoop()` function.

If dev-users want their Animation object's `fn` function to be invoked on every loop iteration, they can set the object's `chokedAnimation` attribute to `false`. 

Note that the choking functionality is not precise: if a web page is slow (for any reason), then the core animation loop will be similarly slow. While dev-users could define an Animation object to run, say, every 2 seconds (by setting the object's `maxFrameRate` attribute to `0.5`), SC cannot guarantee that the function *will* run precisely every 2 seconds.

### System-instantiated animations
During the [SC initialization process](sc-initialization.html) a number of system Animation objects get created and added to the core animation loop. During each iteration of the loop they will run in the following order:
+ `SC-core-listeners-tracker` - defined in [core/user-interaction.js](../source/core/user-interaction.html); order value: `0`. At the start of each Display cycle this function interrogates each of the attributes tracked in the `currentCorePosition` object and, when changes are detected, alerts affected artefact and entity objects by setting various `dirty` flags on them.
+ `SC-core-tickers-animation` - defined in [factory/ticker.js](../source/factory/ticker.html); order value: `0`. Ticker objects have their own animation subsystem within the core animation loop; tweens update affected artefact and entity objects (via `dirty` flags) prior to the main Display cycle iteration starting.
+ `SC-core-gradient-delta-animation` - defined in [mixin/styles.js](../source/mixin/styles.html); order value `1`. Used to delta-animate gradient-related Styles objects.
+ `SC-core-workstore-hygeine` - defined in [helper/workstore.js](../source/helper/workstore.html); order value: `1`. The `workstore` object has its contents purged on a regular basis, controlled by this function. Note that the function implements its own choke functionality; by default the function only runs every 200 milliseconds (or just over).
+ *(Dev-user defined Animation objects)*
+ `SC-core-filters-cleanup-action` - defined in [helper/filter-engine.js](../source/helper/filter-engine.html); order value `999`. At the end of each core animation loop iteration this function checks every Filter object and resets its `dirtyFilterIdentifier` flag to `false`.

Dev-user defined `generic` and `display` Animation object functions will (by default) run before the `SC-core-filters-cleanup-action` function, but after the other system-defined functions complete. `Time-based` animations defined by dev-users will run when the `SC-core-tickers-animation` function runs.

## Time-based animations
SC comes with its own bespoke [inbetweening](https://en.wikipedia.org/wiki/Inbetweening) system that dev-users can use to create animation effects.

The basic premise of an SC time-based animation is as follows:
+ Create a **Ticker object** with a given timeline duration.
+ Add **Tween objects** to the Ticker object, each with a start time (relative to the ticker's duration) and their own duration. Within the tween, define a set of attributes to be animated and a set of SC objects to be targeted; each attribute definition requires a start and end value, alongside an (optional) **easing engine** function. 
+ Add **Action objects** to the ticker, which define a (reversible) function to be run at a given moment along the ticker's timeline.
+ Start the Ticker object running using the `ticker.run()` function. Control the ticker's progress using `ticker.halt()`, `ticker.resume()`, `ticker.seekTo()`, etc.

For a better dev-user experience, simple time-based animations can also be created using just a Tween object, in which case SC will automatically create an associated Ticker object with the same duration as the tween. These animations can be controlled by invoking `tween.run()`,  `tween.halt()`, `tween.resume()`, `tween.seekTo()`, etc.

The code for SC time-based animations can be found in the following files:
+ [factory/action.js](../source/factory/action.html) - defines the `scrawl.makeAction()` factory function.
+ [factory/ticker.js](../source/factory/ticker.html) - defines the `scrawl.makeTicker()` factory function.
+ [factory/tween.js](../source/factory/tween.html) - defines the `scrawl.makeTween()` factory function.
+ [mixin/tween.js](../source/mixin/tween.html) - shared functionality imported into the `action.js` and `tween.js` factory files.
+ [helper/utilities.js](../source/helper/utilities.html) - includes a set of pre-defined easing engine functions.

### Ticker objects
SC Ticker objects are the only *time-based* animation objects in the SC system. Tween and Action objects have no functionality if they are not associated with a Ticker object. 

> **tl;dr:** Even though dev-users can create a tween animation using the `scrawl.makeTween()` factory, and then run it using `tween.run()`, SC does not recognise the Tween object as an animation object; instead, if the dev-user has not associated the Tween object with a Ticker object, SC will automatically create a Ticker object for that tween and run the animation on the ticker.

The [factory/ticker.js](../source/factory/ticker.html) file does more than just provide a factory function for creating tickers. When the file is first run (during SC initialization) it creates a local `tickerAnimations` Array (and an associated `tickerAnimationsFlag` signal boolean) alongside the `SC-core-tickers-animation` generic Animation object

The purpose of the `SC-core-tickers-animation` Animation object is to invoke each of the Ticker objects currently included in the `tickerAnimations` Array at the start of each iteration of the core animation loop. When the Animation object is invoked, it will:
+ Check whether the Ticker objects need to be sorted. 
+ Interrogate each of the Ticker objects to see if it is currently running and, if yes, invoke its `fn` function.

Note that in the repo code, a single iteration of the Animation object is referred to as a **tick**.

Ticker object sorting is required whenever a Ticker object is added to, or removed from, the `tickerAnimations` Array, and also when the dev-user updates a Ticker object's `order` attribute. Any of these actions will result in the `tickerAnimationsFlag` signal boolean being set to `true`, which in turns triggers the sorting functionality. As for other SC order functionality, sorting is performed by means of a bucket sort algorithm.

#### Create, serialize and clone Ticker objects
Dev-users can create a Ticker object using the `scrawl.makeTicker({key: value, ...})` factory function.

Ticker objects can be serialized using the `ticker.saveAsPacket()` function, and restored against any SC object that includes `mixin/base` functionality using the `obj.actionPacket('packet-string')` function.

Any Ticker object can be cloned using the `ticker.clone({key: value, ...})` function.

#### Kill Ticker objects
To remove a Ticker object from the SC environment, invoke `ticker.kill(killTweens = true, autokill = true)` on it:
+ If the `killTweens` argument is set to `true` then SC will also remove all Tween/Action objects currently subscribed to the Ticker.
+ To remove the Tween/Action objects while retaining the Ticker object, dev-users can invoke the `ticker.killTweens()` function - this is a convenience function for `ticker.kill(true, false)`.
+ Tickers can be set up to automatically delete themselves once their run completes, by setting their `killOnComplete` flag to `true`. This action will automatically remove all Tween and Action objects associated with the Ticker.

#### Ticker attributes
The following attributes can be set during Ticker object creation, then updated using the `ticker.set()` function:
```
Attribute         Type                               Default
------------------------------------------------------------------------------------------
name              String                             Autogenerated (names must be unique)
order             Number                             1
duration          Number | String                    0
subscribers       String[]                           []
killOnComplete    Boolean                            false
cycles            Number                             1
observer          RenderAnimation | String | null    null
onRun             Function                           λnull
onHalt            Function                           λnull
onReverse         Function                           λnull
onResume          Function                           λnull
onSeekTo          Function                           λnull
onSeekFor         Function                           λnull
onComplete        Function                           λnull
onReset           Function                           λnull
```

#### Ticker duration
By default, Tickers objects have a `duration` value of `0`. If the dev-user does not set a duration value when creating the Ticker object then it will, when first run, consult its subscribed Tween/Action objects to calculate an `effectiveDuration` value sufficiently long to accommodate their timing requirements.

Internally, the `effectiveDuration` value is the canonical duration. Calculating this value is handled automatically using the `setEffectiveDuration()` and `recalculateEffectiveDuration()` functions.

The `duration` attribute can be either a Number or a String value:
+ **Number** values represent a duration measured in milliseconds.
+ **String** values can be used to mark the duration as being measured in either milliseconds (`'2000ms'`) or seconds (`'2s'`).

> **tl;dr:** Dev-users need to remember that their Ticker object's effective duration may be longer than the value they set in the `duration` attribute. This happens when, for instance, they set a Tween object to run at or near the end of the Ticker object's duration; in such cases SC will automatically extend the Ticker object's `effectiveDuration` to include the Tween object's duration.

#### Ticker cycles
By default a Ticker object will, once started, run once and then halt. Dev-users can set the ticker to loop multiple times by setting the object's `cycles` attribute to an integer number value greater than `1`.

Note that if the Ticker object's `killOnComplete` flag has been set to `true`, then the Ticker object (and all of its associated Tween/Action objects) will auto-destruct once the ticker completes its required number of cycles.

Setting the `cycles` attribute to `0` will cause the Ticker object to loop indefinitely, until halted by the dev-user.

#### Ticker subscribers
When a dev-user creates a Ticker object, they can assign existing Tween/Action objects to the ticker by including their `name` attribute values in an Array keyed to the Ticker object's `subscribers` attribute.

After instantiation, the best way to add or remove Tween/Action objects to the Ticker object is by using the `ticker.subscribe(arg, ...)` and `ticker.unsubscribe(arg, ...)` functions:
+ Both functions can accept one or more arguments.
+ Each argument can be a Tween/Action object, or the String `name` attribute of the object.
+ The argument can also be an array of such strings and objects. See test demo [DOM-006](../../demo/dom-006.html) for an example.

Note that Tween and Action objects can also add or remove themselves from a Ticker object using their `tween.addToTicker()` and `tween.removeFromTicker()` functions.

#### Running and halting tickers
Unlike generic and display animations, Ticker Animation objects do not start running as soon as they are created. Instead the dev-user needs to invoke the object's `ticker.run()` function as-and-when they want the animation to commence.

For immediate invocation on creation, use `scrawl.makeTicker({key: value, ...}).run()`.

Ticker objects have a rich selection of control functions: 
+ `ticker.complete()` - set the ticker's elapsed time to its maximum value and let it run to completion.
+ `ticker.halt()` - halt the ticker without changing its elapsed time.
+ `ticker.isRunning()` - returns a boolean value - `true` if the Ticker object is currently running.
+ `ticker.reset()` - halt the ticker and reset its elapsed time `0`.
+ `ticker.resume()` - run the ticker from its current elapsed time.
+ `ticker.reverse(resume: Boolean = false)` - change the ticker's temporal direction; this action will halt the ticker unless the `resume` argument is `true`.
+ `ticker.run()` - run the ticker from elapsed time `0`.
+ `ticker.seekFor(milliseconds: Number = 0, resume: Boolean = false)` - update the elapsed time by adding the `milliseconds` argument to it; this action will halt the ticker (if it is currently running) unless the `resume` argument is `true`.
+ `ticker.seekTo(milliseconds: Number = 0, resume: Boolean = false)` - set the elapsed time to the `milliseconds` argument; this action will halt the ticker (if it is currently running) unless the `resume` argument is `true`.

Just as for generic Animation objects, Ticker objects come with a series of hook functions (defaulting to `λnull` functions) which will trigger as part of each control function invocation. Dev-users can use these hooks for any functionality they require, for instance tracking the progress of the ticker animation.

Ticker objects do not need to be running to animate. When the dev-user invokes the `seekTo` or `seekFor()` functions the ticker will update its elapsed time and then invoke its `fn` function to inform all of its subscribed Tween/Action objects of the change. 
+ Tween objects will in turn apply the required updates to their target objects.
+ Action objects will check to see if the change triggers their functionality and, if yes, fire their `action` or `revert` functions as appropriate.

Examples of using non-running tickers:
+ Test demo [Canvas-027](../../demo/canvas-027.html) - using `ticker.seekTo()` instead of `ticker.run()` to tie the animation to a video playback.
+ Test demo [Modules-006](../../demo/modules-006.html) - a number of examples of tying `ticker.seekTo()` to end-user page scroll events.

#### Ticker progress
The Ticker object includes several internal (private) attributes which it uses to keep track of its progress:
+ `cycleCount`: how many cycles have been completed in the current run
+ `active`: whether the ticker is currently running
+ `effectiveDuration`: total duration (in milliseconds) of a ticker cycle
+ `startTime`: epoch timestamp of when the current ticker run was invoked
+ `currentTime`: current epoch timestamp
+ `tick`: elapsed time since the start of the current ticker run (currentTime - startTime)

Note that these attribute values will be affected not only by the ongoing passage of time, but also by operations such as halting, resuming, or seeking along the ticker timeline. Code for these adjustments can be found in the relevant hook functions.

#### Temporal direction
SC Ticker objects can run both forwards and backwards. Dev-users can change the *temporal direction* of the ticker by invoking the `ticker.reverse()` function when required. This function acts like a switch: if the ticker was running forwards, it will immediately start running backwards; if it was running backwards it will now run forwards.

Internally, SC doesn't actually reverse time; rather it updates the ticker's currently associated subscriber Tween/Action objects with the new temporal direction of travel (using the `changeSubscriberDirection()` function). It is up to Tween and Action objects to interpret the data that their Ticker object sends to them on each tick

#### Subscriber communication
During each iteration of the Ticker object's run, the overarching ticker Animation object will, if relevant, invoke the Ticker object's `ticker.fn(reverse: Boolean)` function. Here, the ticker calculates relevant timing data which it passes onto each of its Tween/Action object subscribers' `tween.update()` function.

This data is passed to subscribers in the following shape:
```
{
  tick: Number - elapsed time (currentTime - startTime)
  reverseTick: Number - time remaining (effectiveDuration - tick)
  willLoop: Boolean - will the ticker loop?
  next: Boolean - will there be another ticker iteration?
}
```

Ticker result objects are pooled in the local `resultObjectPool` Array. Repo-devs can retrieve a result object using the `requestResultObject()` function, and return it using `releaseResultObject()`. 

To note: in practice there will only ever be one result object, shared between all ticker objects. The pool was created as part of an experiment to see if time-based animations could be run in a web worker, and retained after that experiment failed because the `releaseResultObject()` function sets the object's attributes back to default values after every use.

The `ticker.fn()` function takes a single argument - a boolean to indicate whether the ticker is currently running in *reversed mode*:
+ When operating in *forward mode* the ticker will communicate with its current subscriber Tween/Action objects in line with their order, from lowest to highest.
+ When operating in *reversed mode* it is important that the ticker communicates with its subscribers in the opposite order (highest to lowest); this ensures that Action object functions get invoked in the correct order.

### Tween objects
[write up]

#### Create and serialize Tween objects
Dev-users can create a Tween object using the `scrawl.makeTween({key: value, ...})` factory function.

If the factory function's argument object includes a valid `ticker` attribute, then the new Tween will associate itself to that Ticker object. If however the attribute is not included in the argument object, or the desired Ticker object does not (yet) exist, then the new Tween will create its own ticker, giving it the name `${tween.name}_ticker`.

Tweens are not animation objects,  but they do include functionality that makes them seem like they are animation objects. For instance, the invocation `scrawl.makeTween({key: value, ...}).run()` will make the new Tween run immediately after its creation.

Tween objects can be serialized using the `tween.saveAsPacket()` function, and restored against any SC *tracked object* using the `obj.actionPacket('packet-string')` function.

#### Clone Tween objects
Any Tween object can be cloned using the `tween.clone({key: value, ...})` function.

When a Tween is cloned it will, by default, associate itself to its original's Ticker object. Dev-users can force the Tween to create its own new Ticker object by including the attribute `useNewTicker: true` in the clone function's argument object.

#### Kill Tween objects
To remove a Tween object from the SC environment, invoke `tween.kill()` on it.

If the Tween object, when created or cloned, created its own Ticker object, then killing the Tween will also kill that Ticker. Otherwise the Tween will disassociate itself from any Ticker objects before terminating its existence.

#### Tween attributes
The following attributes can be set during Tween object creation, then updated using the `tween.set()` function:
```
Attribute           Type                               Default
------------------------------------------------------------------------------------------
name                String                             Autogenerated (names must be unique)
order               positive integer Number            1
targets             SC-object | String | Array         []

ticker              String                             ''
time                Number | String                    0
duration            Number | String                    0
reverseOnCycleEnd   Boolean                            false
killOnComplete      Boolean                            false

definitions         Array of definition objects        []

action              Function                           λnull
commenceAction      Function                           λnull
completeAction      Function                           λnull
onRun               Function                           λnull
onHalt              Function                           λnull
onResume            Function                           λnull
onReverse           Function                           λnull
onSeekTo            Function                           λnull
onSeekFor           Function                           λnull

// The following attributes are kept on the associated Ticker, not the Tween
cycles              positive integer Number            1
observer            RenderAnimation object | String    undefined
```

time__ - the timeline time when the Tween/Action activates and runs.
// + Tween/Actions given a time value of `0` will run as soon as their associated Ticker timeline runs; values greater than 0 will delay their run until that time is reached on the timeline.
// + Time can be set as a Number value representing microseconds
// + It can also be set as a time string - `3s` is 3000 milliseconds; `200ms` is 200 milliseconds
// + Or it can be set as a percentage String - `30%` - measured against the duration of the Ticker timeline.
        time: 0,

// __definitions__ - Array of objects defining the animations to be performed by the Tween. Object attributes include:
// + __attribute__ (required) - String attribute key.
// + __start__ - Number or String value for this attribute's start point.
// + __end__ - Number or String value for this attribute's end point.
// + __integer__ - Boolean flag indicating whether we should force results to be integers (default: false)
// + __engine__ - String name for the easing function ___engine___ to be used to animate this change; or an easing function supplied by the developer.
//
// Scrawl-canvas includes functionality to allow `start` and `end` values to be defined as Strings, with a measurement suffix (`%`, `px`, etc) attached to the number.
// + These values should be of a type that the target object (generally an artefact) expects to receive in its `set` function.
// + Any object with a `set` function that takes an object as its argument can be tweened.
    definitions: null,

// __duration__ - can accept a variety of values:
// + Number, representing milliseconds.
// + String time value, for example `'500ms', '0.5s'`.
// + % String value - `20%` - a relative value measured against the Ticker's ___effective duration___. For example, if the Ticker has an effective duration of 5000 (5 seconds), and the Tween wants to run for 20% of that time, the Tween's effective duration will be 1000 (1 second).
    duration: 0,

#### Tween targets
[write up]

#### Definitions objects
[write up]

#### Easing functions
[write up]

Bespoke easing functions
+ Test demo [Canvas-005](../../demo/canvas-005.html) - animating a gradient over 3 loops
+ Test demo [Canvas-017](../../demo/canvas-017.html) - bespoke easings for gradients

Other Tween tests
+ Test demo [Canvas-006](../../demo/canvas-006.html) - canvas tween stress test
+ Test demo [Canvas-040](../../demo/canvas-040.html) - tween `entity.lineDashOffset` attribute
+ Test demo [Canvas-045](../../demo/canvas-045.html) - tween `entity.roll` attribute
+ Test demo [Canvas-047](../../demo/canvas-047.html) - tween `color.range`
+ Test demo [DOM-009](../../demo/dom-009.html) - DOM element tween stress test
+ Test demo [Modules-003](../../demo/modules-003.html) - tween gradient `paletteStart` and `paletteEnd` attributes

### Action objects
[write up]

## Display animations and the Display cycle
+ The Display cycle
  - `clear` operation
  - `compile` operation
  - -> `calculate` phase
  - -> `stamp` phase
  - `show` operation

### Artefact and entity object delta animation
[write up]

### Animating gradients
[write up]

### Animating filters
[write up]


