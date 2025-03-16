# Animation and the Display cycle
All SC animation runs off a single ***core animation loop*** whose functionality is defined in the [core/animation-loop.js](../source/core/animation-loop.html) file. This loop is instantiated during [SC initialization](sc-initialization.html) and continues to run until the dev-user instructs it to halt, or the end-user navigates away from the web page.

End-user browsers, devices and screens can all have an effect on the speed at which the core animation loop runs - some combinations will allow the loop to run at 120 frames-per-second (fps), or more. SC makes no attempt to control the loop speed; instead, the individual functions that run during each loop can be choked down to run at 60fps, or less.

The core animation loop itself doesn't include any functionality beyond running and invoking various ***Animation objects*** which either SC, or the dev-user, define. These functions get added to an `animation` Array. At the start of each loop the array will be sorted (if sorting is required), then the loop will check each Animation object to see if its ***animation function*** can be run and, if yes, invoke it.

SC exports the following functions which the dev-user can use to control the core animation loop. Note that halting the loop halts **all** animations across the entire SC system (for all Canvas and Stack artefacts). See [demo test DOM-009](../../demo/dom-009.html) for an example:
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
Generic animation objects are the simplest of the three animation types supported by SC. The object created by the `scrawl.makeAnimation({key: value, ...})` factory function has the following attributes:
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

### The `fn` function
When the Animation object is added to the core animation loop, the loop will invoke the objects `fn` function - choke permitting - as part of each iteration of the loop. By default, the `fn` does nothing (in SC repo terms, it defaults to the `λnull` lambda function defined in the [helper/utilities.js](../source/helper/utilities.html) file).

Dev-users can set the Animation object's `fn` attribute to perform any task either within the SC ecosystem, or beyond. This includes building a bespoke Display cycle animation - see [demo test Canvas-041](../../demo/canvas-041.html) for an example.

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

Ticker object sorting is required whenever a Ticker object is added to, or removed from, the `tickerAnimations` Array, and also when the dev-user updates a Ticker object's `order` attribute. Any of these actions will result in the `tickerAnimationsFlag` signal boolean being set to `true`, which in turns triggers the sorting functionality. As for other SC order functionality, sorting is performed by means of a bucket sort algorithm.

#### Create, serialize, clone and kill Ticker objects
Dev-users can create a Ticker object using the `scrawl.makeTicker({key: value, ...})` factory function.

Ticker objects can be serialized using the `ticker.saveAsPacket()` function, and restored against any SC object that includes `mixin/base` functionality using the `obj.actionPacket('packet-string')` function.

Any Ticker object can be cloned using the `ticker.clone({key: value, ...})` function.

To remove a Ticker object from the SC environment, invoke `ticker.kill()` on it. The kill function will also remove all Tween/Action objects currently subscribed to it. To remove the Tween/Action objects while retaining the Ticker object, invoke the `ticker.killTweens()` function.

Note that Tickers can be set up to automatically delete themselves once their run completes, by setting their `killOnComplete` flag to `true`.

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

> **tl;dr:** Dev-users need to remember that their Ticker object's effective duration may be longer than the value they set in the `duration` attribute. This happens, for instance, when they set a Tween object to run at or near the end of the Ticker object's duration; in such cases SC will automatically extend the Ticker object's `effectiveDuration` to include the Tween object's duration.

#### Ticker cycles
By default a Ticker object will, once started, run once and then halt. Dev-users can set the ticker to loop multiple times by setting the object's `cycles` attribute to an integer number value greater than `1`.

Note that if the Ticker object's `killOnComplete` flag has been set to `true`, then the Ticker object (and all of its associated Tween/Action objects) will auto-destruct once the ticker completes its required number of cycles.

Setting the `cycles` attribute to `0` will cause the Ticker object to loop indefinitely, until halted by the dev-user.

#### Ticker subscribers
When a dev-user creates a Ticker object, they can assign existing Tween/Action objects to the ticker by including their `name` attribute values in an Array keyed to the Ticker object's `subscribers` attribute.

After instantiation, the best way to add or remove Tween/Action objects to the Ticker object is by using the `ticker.subscribe(arg, ...)` and `ticker.unsubscribe(arg, ...)` functions:
+ Both functions can accept one or more arguments.
+ Each argument can be a Tween/Action object, or the String `name` attribute of the object.
+ The argument can also be an array of such strings and objects. See [demo test DOM-006](../../demo/dom-006.html) for an example.

Note that Tween and Action objects can also add or remove themselves from a Ticker object using their `tween.addToTicker()` and `tween.removeFromTicker()` functions.

#### Running and halting tickers

+ [demo test Canvas-027](../../demo/canvas-027.html) - using `ticker.seekTo()` instead of `ticker.run()`

### Tween objects
[write up]

#### Tween targets
[write up]

#### Definitions objects
[write up]

#### Easing functions
[write up]

Bespoke easing functions
+ [demo test Canvas-005](../../demo/canvas-005.html) - animating a gradient over 3 loops
+ [demo test Canvas-017](../../demo/canvas-017.html) - bespoke easings for gradients

Other Tween tests
+ [demo test Canvas-006](../../demo/canvas-006.html) - canvas tween stress test
+ [demo test Canvas-040](../../demo/canvas-040.html) - tween `entity.lineDashOffset` attribute
+ [demo test Canvas-045](../../demo/canvas-045.html) - tween `entity.roll` attribute
+ [demo test Canvas-047](../../demo/canvas-047.html) - tween `color.range`
+ [demo test DOM-009](../../demo/dom-009.html) - DOM element tween stress test

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


