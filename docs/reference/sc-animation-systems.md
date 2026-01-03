# Animation and the Display cycle
All SC animation runs off a single ***core animation loop*** whose functionality is defined in the [core/animation-loop.js](../source/core/animation-loop.html) file. This loop is instantiated during [SC initialization](sc-initialization.html) and continues to run until the product-dev instructs it to halt, or the end-user navigates away from the web page.

End-user browsers, devices and screens can all have an effect on the speed at which the core animation loop runs – some combinations will allow the loop to run at 120 frames-per-second (fps), or more. SC makes no attempt to control the loop speed; instead, the individual functions that run during each loop can be choked down to run at 60fps, or less.

The core animation loop itself doesn't include any functionality beyond running and invoking various ***Animation objects*** which either SC, or the product-dev, define. These functions get added to an `animation` Array. At the start of each loop the array will be sorted (if sorting is required), then the loop will check each Animation object to see if its ***animation function*** can be run and, if yes, invoke it.

SC exports the following functions which the product-dev can use to control the core animation loop. Note that halting the loop halts **all** animations across the entire SC system (for all Canvas and Stack artefacts). See [test demo DOM-009](../../demo/dom-009.html) for an example:
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
+ `animation.name` – String – defaults to a unique computer-generated value
+ `animation.order` – Number – defaults to `1`

All Animation objects also include the following core functions:
+ `animation.run()` – start the animation
+ `animation.isRunning()` – check to see if the animation is currently running
+ `animation.halt()` – stop the animation
+ `animation.kill()` – remove the animation object from the SC system

### Animation object serialization and cloning
Serialization – and thus cloning – functionality has not yet been implemented for Animation objects.

### Accessibility considerations around animation
[write up]

## Generic animations
Generic Animation objects are the simplest of the three animation types supported by SC. The object created by the `scrawl.makeAnimation({key: value, ...})` factory function has the following attributes:
+ `name` – String, name identifier (default: computer generated String)
+ `order` – Number, order value (default: `1`)
+ `fn` – Function, invoked during every core animation loop iteration (if permitted)
+ `onRun` – hook Function
+ `onHalt` – hook Function
+ `onKill` – hook Function
+ `maxFrameRate` – Number, animation choke functionality (default: `60`)
+ `lastRun` – Number (internal only), animation choke functionality
+ `chokedAnimation` – Boolean, animation choke functionality (default: `true`)

The object also includes the following methods (functions):
+ `run()` – invokes the `onRun` hook function, then adds the object to the core animation loop's `animation` Array.
+ `halt()` – invokes the `onHalt` hook function, then removes the object from the core animation loop's `animation` Array.
+ `kill()` – invokes the `onKill` hook function, then removes the object from the SC system.
+ `isRunning()` – returns a Boolean: `true` if the object is currently included in the core animation loop's `animation` Array.

The default behaviour of a generic Animation object, when created, is to run immediately. Product-devs can prevent this by adding a `delay: true` attribute to the factory function's argument object.

### The `fn` function
When the Animation object is added to the core animation loop, the loop will invoke the object's `fn` function – choke permitting – as part of each iteration of the loop. By default, the `fn` does nothing (in SC repo terms, it defaults to the `λnull` lambda function defined in the [helper/utilities.js](../source/helper/utilities.html) file).

Product-devs can associate a function object to the `fn` attribute. That function can perform any task either within the SC ecosystem, or beyond. This includes building a bespoke Display cycle animation – see test demo [Canvas-041](../../demo/canvas-041.html) for an example.

### The hook functions
Similar to the `fn` function, the hook functions – `onRun`, `onHalt`, `onKill` – default to `λnull` lambda functions. Product-devs can use these hooks to perform setup and cleanup actions each time the animation run or halts.

### Animation choke functionality
By default, generic Animation objects are choked to run at a maximum of 60 frames-per-second. Testing to see if sufficient time has passed since the `fn` function's last invocation, to allow a new invocation, happens in the core animation loop's `animationLoop()` function.

If product-devs want their Animation object's `fn` function to be invoked on every loop iteration, they can set the object's `chokedAnimation` attribute to `false`. 

Note that the choking functionality is not precise: if a web page is slow (for any reason), then the core animation loop will be similarly slow. While product-devs could define an Animation object to run, say, every 2 seconds (by setting the object's `maxFrameRate` attribute to `0.5`), SC cannot guarantee that the function *will* run precisely every 2 seconds.

### System-instantiated animations
During the [SC initialization process](sc-initialization.html) a number of system Animation objects get created and added to the core animation loop. During each iteration of the loop they will run in the following order:
+ `SC-core-listeners-tracker` – defined in [core/user-interaction.js](../source/core/user-interaction.html); order value: `0`. At the start of each Display cycle this function interrogates each of the attributes tracked in the `currentCorePosition` object and, when changes are detected, alerts affected artefact and entity objects by setting various `dirty` flags on them.
+ `SC-core-tickers-animation` – defined in [factory/ticker.js](../source/factory/ticker.html); order value: `0`. Ticker objects have their own animation subsystem within the core animation loop; tweens update affected artefact and entity objects (via `dirty` flags) prior to the main Display cycle iteration starting.
+ `SC-core-gradient-delta-animation` – defined in [mixin/styles.js](../source/mixin/styles.html); order value `1`. Used to delta-animate gradient-related Styles objects.
+ `SC-core-workstore-hygiene` – defined in [helper/workstore.js](../source/helper/workstore.html); order value: `1`. The `workstore` object has its contents purged on a regular basis, controlled by this function. Note that the function implements its own choke functionality; by default the function only runs every 200 milliseconds (or just over).
+ *(Product-dev defined Animation objects)*
+ `SC-core-filters-cleanup-action` – defined in [helper/filter-engine.js](../source/helper/filter-engine.html); order value `999`. At the end of each core animation loop iteration this function checks every Filter object and resets its `dirtyFilterIdentifier` flag to `false`.

Product-dev defined `generic` and `display` Animation object functions will (by default) run before the `SC-core-filters-cleanup-action` function, but after the other system-defined functions complete. `Time-based` animations defined by product-devs will run when the `SC-core-tickers-animation` function runs.

## Time-based animations
SC comes with its own bespoke *delimited* [inbetweening](https://en.wikipedia.org/wiki/Inbetweening) system that product-devs can use to create animation effects.

The basic premise of an SC time-based animation is as follows:
+ Create a **Ticker object** with a given timeline duration.
+ Add **Tween objects** to the Ticker object, each with a start time relative to the ticker's duration, and their own duration. Within the tween, define a set of attributes to be animated and a set of SC objects to be targeted; each attribute definition requires a start and end value (the *delimit* values), alongside an (optional) **easing engine** function. 
+ Add **Action objects** to the ticker, which define a (reversible) function to be run at a given moment along the ticker's timeline.
+ Start the Ticker object running using the `ticker.run()` function. Control the ticker's progress using `ticker.halt()`, `ticker.resume()`, `ticker.seekTo()`, etc.

For a better product-dev experience, simple time-based animations can also be created using just a Tween object, in which case SC will automatically create an associated Ticker object with the same duration as the tween. These animations can be controlled by invoking `tween.run()`,  `tween.halt()`, `tween.resume()`, `tween.seekTo()`, etc.

The code for SC time-based animations can be found in the following files:
+ [factory/action.js](../source/factory/action.html) – defines the `scrawl.makeAction()` factory function.
+ [factory/ticker.js](../source/factory/ticker.html) – defines the `scrawl.makeTicker()` factory function.
+ [factory/tween.js](../source/factory/tween.html) – defines the `scrawl.makeTween()` factory function.
+ [mixin/tween.js](../source/mixin/tween.html) – shared functionality imported into the `action.js` and `tween.js` factory files.
+ [helper/utilities.js](../source/helper/utilities.html) – includes a set of pre-defined easing engine functions.

### Ticker objects
SC Ticker objects are the only *time-based* animation objects in the SC system. Tween and Action objects have no functionality if they are not associated with a Ticker object. 

> **tl;dr:** Even though product-devs can create a tween animation using the `scrawl.makeTween()` factory, and then run it using `tween.run()`, SC does not recognise the Tween object as an animation object; instead, if the product-dev has not associated the Tween object with a Ticker object, SC will automatically create a Ticker object for that tween and run the animation on the ticker.

The [factory/ticker.js](../source/factory/ticker.html) file does more than just provide a factory function for creating tickers. When the file is first run (during SC initialization) it creates a local `tickerAnimations` Array (and an associated `tickerAnimationsFlag` signal boolean) alongside the `SC-core-tickers-animation` generic Animation object

The purpose of the `SC-core-tickers-animation` Animation object is to invoke each of the Ticker objects currently included in the `tickerAnimations` Array at the start of each iteration of the core animation loop. When the Animation object is invoked, it will:
+ Check whether the Ticker objects need to be sorted. 
+ Interrogate each of the Ticker objects to see if it is currently running and, if yes, invoke its `fn` function.

Note that in the repo code, a single iteration of the Animation object is referred to as a **tick**.

Ticker object sorting is required whenever a Ticker object is added to, or removed from, the `tickerAnimations` Array, and also when the product-dev updates a Ticker object's `order` attribute. Any of these actions will result in the `tickerAnimationsFlag` signal boolean being set to `true`, which in turns triggers the sorting functionality. As for other SC order functionality, sorting is performed by means of a bucket sort algorithm.

#### Create, serialize and clone Ticker objects
Product-devs can create a Ticker object using the `scrawl.makeTicker({key: value, ...})` factory function.

Ticker objects can be serialized using the `ticker.saveAsPacket()` function, and restored against any SC object that includes `mixin/base` functionality using the `obj.actionPacket('packet-string')` function.

Any Ticker object can be cloned using the `ticker.clone({key: value, ...})` function.

#### Kill Ticker objects
To remove a Ticker object from the SC environment, invoke `ticker.kill(killTweens = true, autokill = true)` on it:
+ If the `killTweens` argument is set to `true` then SC will also remove all Tween/Action objects currently subscribed to the Ticker.
+ To remove the Tween/Action objects while retaining the Ticker object, product-devs can invoke the `ticker.killTweens()` function – this is a convenience function for `ticker.kill(true, false)`.
+ Tickers can be set up to automatically delete themselves once their run completes, by setting their `killOnComplete` flag to `true`. This action will automatically remove all Tween and Action objects associated with the Ticker.

#### Ticker attributes
The following attributes can be set during Ticker object creation, then updated using the `ticker.set()` function:
```
Attribute         Type                               Default
------------------------------------------------------------------------------------------
name              String                             Autogenerated (names must be unique)
order             Number                             1
observer          RenderAnimation | String | null    null

duration          Number | String                    0
cycles            Number                             1
killOnComplete    Boolean                            false

subscribers       String[]                           []

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
By default, Tickers objects have a `duration` value of `0`. If the product-dev does not set a duration value when creating the Ticker object then it will, when first run, consult its subscribed Tween/Action objects to calculate an `effectiveDuration` value sufficiently long to accommodate their timing requirements.

Internally, the `effectiveDuration` value is the canonical duration. Calculating this value is handled automatically using the `setEffectiveDuration()` and `recalculateEffectiveDuration()` functions.

The `duration` attribute can be either a Number or a String value:
+ **Number** values represent a duration measured in milliseconds.
+ **String** values can be used to mark the duration as being measured in either milliseconds (`'2000ms'`) or seconds (`'2s'`).

> **tl;dr:** Product-devs need to remember that their Ticker object's effective duration may be longer than the value they set in the `duration` attribute. This happens when, for instance, they set a Tween object to run at or near the end of the Ticker object's duration; in such cases SC will automatically extend the Ticker object's `effectiveDuration` to include the Tween object's duration.

#### Ticker cycles
By default a Ticker object will, once started, run once and then halt. Product-devs can set the ticker to loop multiple times by setting the object's `cycles` attribute to an integer number value greater than `1`.

Note that if the Ticker object's `killOnComplete` flag has been set to `true`, then the Ticker object (and all of its associated Tween/Action objects) will auto-destruct once the ticker completes its required number of cycles.

Setting the `cycles` attribute to `0` will cause the Ticker object to loop indefinitely, until halted by the product-dev.

#### Ticker subscribers
When a product-dev creates a Ticker object, they can assign existing Tween/Action objects to the ticker by including their `name` attribute values in an Array keyed to the Ticker object's `subscribers` attribute.

After instantiation, the best way to add or remove Tween/Action objects to the Ticker object is by using the `ticker.subscribe(arg, ...)` and `ticker.unsubscribe(arg, ...)` functions:
+ Both functions can accept one or more arguments.
+ Each argument can be a Tween/Action object, or the String `name` attribute of the object.
+ The argument can also be an array of such strings and objects. See test demo [DOM-006](../../demo/dom-006.html) for an example.

Note that Tween and Action objects can also add or remove themselves from a Ticker object using their `tween.addToTicker()` and `tween.removeFromTicker()` functions.

#### Running and halting tickers
Unlike generic and display animations, Ticker Animation objects do not start running as soon as they are created. Instead the product-dev needs to invoke the object's `ticker.run()` function as-and-when they want the animation to commence.

For immediate invocation on creation, use `scrawl.makeTicker({key: value, ...}).run()`.

Ticker objects have a rich selection of control functions: 
+ `ticker.complete()` – set the ticker's elapsed time to its maximum value and let it run to completion.
+ `ticker.halt()` – halt the ticker without changing its elapsed time.
+ `ticker.isRunning()` – returns a boolean value – `true` if the Ticker object is currently running.
+ `ticker.reset()` – halt the ticker and reset its elapsed time `0`.
+ `ticker.resume()` – run the ticker from its current elapsed time.
+ `ticker.reverse(resume: Boolean = false)` – change the ticker's temporal direction; this action will halt the ticker unless the `resume` argument is `true`.
+ `ticker.run()` – run the ticker from elapsed time `0`.
+ `ticker.seekFor(milliseconds: Number = 0, resume: Boolean = false)` – update the elapsed time by adding the `milliseconds` argument to it; this action will halt the ticker (if it is currently running) unless the `resume` argument is `true`.
+ `ticker.seekTo(milliseconds: Number = 0, resume: Boolean = false)` – set the elapsed time to the `milliseconds` argument; this action will halt the ticker (if it is currently running) unless the `resume` argument is `true`.

Just as for generic Animation objects, Ticker objects come with a series of hook functions (defaulting to `λnull` functions) which will trigger as part of each control function invocation. Product-devs can use these hooks for any functionality they require, for instance tracking the progress of the ticker animation.

Ticker objects do not need to be running to animate. When the product-dev invokes the `seekTo` or `seekFor()` functions the ticker will update its elapsed time and then invoke its `fn` function to inform all of its subscribed Tween/Action objects of the change. 
+ Tween objects will in turn apply the required updates to their target objects.
+ Action objects will check to see if the change triggers their functionality and, if yes, fire their `action` or `revert` functions as appropriate.

Examples of using non-running tickers:
+ Test demo [Canvas-027](../../demo/canvas-027.html) – using `ticker.seekTo()` instead of `ticker.run()` to tie the animation to a video playback.
+ Test demo [Modules-006](../../demo/modules-006.html) – a number of examples of tying `ticker.seekTo()` to end-user page scroll events.

#### Ticker progress
The Ticker object includes several internal (private) attributes which it uses to keep track of its progress:
+ `cycleCount`: how many cycles have been completed in the current run
+ `active`: whether the ticker is currently running
+ `effectiveDuration`: total duration (in milliseconds) of a ticker cycle
+ `startTime`: epoch timestamp of when the current ticker run was invoked
+ `currentTime`: current epoch timestamp
+ `tick`: elapsed time since the start of the current ticker run (currentTime – startTime)

Note that these attribute values will be affected not only by the ongoing passage of time, but also by operations such as halting, resuming, or seeking along the ticker timeline. Code for these adjustments can be found in the relevant hook functions.

#### Ticker observer
By default Ticker objects will run whenever they are triggered; they are not tied to the SC Display cycle in any way. However this can lead to suboptimal performance, particularly if their animation takes place in a `<canvas>` element not currently visible in the end-user's device viewport.

If a product-dev creates a Display animation object to control a `<canvas>` animation – using the `scrawl.makeRender()` factory function – and they have not set the `observe` attribute in the factory function's argument to `false`, then that object will only run when the `<canvas>` element becomes visible in the end-user's device viewport.

Dev users can extend this functionality to include Ticker animations running on the `<canvas>` element simply by including the `observer` attribute in the `scrawl.makeTicker()` factory function's argument object, setting its value to the Display animation object itself, or to its `name` String. This will force the ticker to check whether its associated Display animation is currently running before actioning its subscribed Tween/Action objects.

#### Temporal direction
SC Ticker objects can run both forwards and backwards. Product-devs can change the *temporal direction* of the ticker by invoking the `ticker.reverse()` function when required. This function acts like a switch: if the ticker was running forwards, it will immediately start running backwards; if it was running backwards it will now run forwards.

Internally, SC doesn't actually reverse time; rather it updates the ticker's currently subscribed Tween/Action objects with the new temporal direction of travel (using the `changeSubscriberDirection()` function). It is up to Tween and Action objects to interpret the data that their Ticker object sends to them on each tick.

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

The `ticker.fn()` function takes a single argument – a boolean to indicate whether the ticker is currently running in *reversed mode*:
+ When operating in *forward mode* the ticker will communicate with its current subscriber Tween/Action objects in line with their order, from lowest to highest.
+ When operating in *reversed mode* it is important that the ticker communicates with its subscribers in the opposite order (highest to lowest); this ensures that Action object functions get invoked in the correct order.

### Tween objects
Tween objects define small, targeted, *delimited* inbetween animations. Each object includes details of their start and duration **timings**, their **target** SC objects, and an array of **definitions** that detail the start and end points – *key frames* – of the target object attributes to be animated.

> **tl;dr:** Every Tween object needs to be associated with a Ticker object: The Tween object holds the state for a set of inbetween animations; the Ticker object controls a passage of time within which the Tween will operate.

SC can animate many Tween objects at once, over multiple object attributes:
+ Test demo [Canvas-006](../../demo/canvas-006.html) – SC entity tween stress test.
+ Test demo [DOM-005](../../demo/dom-005.html) – DOM element tween stress test.

#### Create and serialize Tween objects
Product-devs can create a Tween object using the `scrawl.makeTween({key: value, ...})` factory function.

If the factory function's argument object includes a valid `ticker` attribute, then the new Tween will associate itself to that Ticker object. If however the attribute is not included in the argument object, or the desired Ticker object does not (yet) exist, then the new Tween will create its own ticker, giving it the name `${tween.name}_ticker`.

Tweens are not animation objects,  but they do include functionality that makes them seem like they are animation objects. For instance, the invocation `scrawl.makeTween({key: value, ...}).run()` will make the Ticker associated with the new Tween run immediately after the Tween's creation.

Tween objects can be serialized using the `tween.saveAsPacket()` function, and restored against any SC *tracked object* using the `obj.actionPacket('packet-string')` function.

#### Clone Tween objects
Any Tween object can be cloned using the `tween.clone({key: value, ...})` function.

When a Tween is cloned it will, by default, associate itself to its original's Ticker object. Product-devs can force the Tween to create its own new Ticker object by including the attribute `useNewTicker: true` in the clone function's argument object – see test demo [DOM-005](../../demo/dom-005.html) for an example.

#### Kill Tween objects
To remove a Tween object from the SC environment, invoke `tween.kill()` on it.

If the Tween object, when created or cloned, created its own Ticker object, then killing the Tween will also kill that Ticker. Otherwise the Tween will disassociate itself from any Ticker objects before terminating its existence.

The Tween object can be set to self-destruct if its `killOnComplete` attribute is set to `true` – see test demo [Canvas-046](../../demo/canvas-046.html) for an example.

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
killOnComplete      Boolean                            false
observer            RenderAnimation object | String    undefined
```

#### Tweens and Tickers
Product-devs can associate a Tween object with an existing Ticker object as part of its creation via the `scrawl.makeTween(arg)` factory function. To do this, they need to set the factory function's `ticker` attribute to the Ticker object, or that object's `name` attribute.

For Tween objects created without a Ticker object association, the factory function will create a new Ticker animation object for that Tween at the same time as the Tween object instantiates. To facilitate this, the factory function's argument object can include attributes to be used specifically with the new Ticker object:
+ `cycles` – the number of times the Ticker should loop before completing its run.
+ `killOnComplete` – whether the Ticker and Tween should self-destruct when the Ticker completes its run.
+ `observer` – whether a Ticker object should observe a Render animation object, only continuing to run while the Render animation object is running.

After the Tween object has been created product-devs can move it between Ticker objects, or remove it, using the `tween.addToTicker(arg)` and `tween.removeFromTicker(arg)` functions, where the argument is the Ticker object itself, or that object's `name` attribute.

#### Tween start and duration times
The Tween object's `time` and `duration` attributes define the object's timing constraints. 
+ The `time` attribute represents the elapsed time (the *delay*) from the start of the Ticker object's run to the point where the Tween object's run starts.
+ The `duration` attribute represents the length of time given to the Tween object to complete its run. 

Both attributes can accept temporal measurement values in the following formats:
+ Number values represent time measured in milliseconds.
+ Suffixed String values measure time in seconds or milliseconds – `3s` is 3000 milliseconds; `200ms` is 200 milliseconds.
+ Percentage String values calculate time relative to the Tween's associated Ticker's duration – for example, given a Ticker object with a 10 second duration, `30%` represents 3000 milliseconds.

#### Tween targets
Tween objects can target any SC object with an `entity.set()` (or similar) function. These objects can be subscribed to the Tween as part of the Tween's instantiation using the factory function's argument object `target` attribute, which accepts an Array of SC objects and/or the `name` attributes of those objects.

Tween objects can also target Group objects, which will use their `group.setArtefacts()` function to update all of their associated artefact and entity objects at the Tween object's request.

After the Tween has been created product-devs can update its `targets` array using the following functions, each of which accepts a comma-separated list of items which can be either the target object itself, or the object's `name` value, or arrays thereof:
+ `tween.setTargets(item, ...)` – replace the current `targets` Array members with the new items.
+ `tween.addToTargets(item, ...)` – add the new items to the `targets` Array.
+ `tween.removeFromTargets(item, ...)` – remove the items from the `targets` Array.

(TODO: create a demo test for these target-related functions.)

Know that the association between a Tween and its target objects is one-way. The targets don't know they've been targeted. In fact, they could be targeted by many Tween objects, each updating different attributes on the target.

Examples of Tween targeting include:
+ Test demo [Canvas-040](../../demo/canvas-040.html) – tweening an entity object's  `lineDashOffset` attribute.
+ Test demo [Canvas-045](../../demo/canvas-045.html) – tweening an entity object's `roll` attribute.
+ Test demo [Canvas-047](../../demo/canvas-047.html) – tweening an SC Color object's `range` attribute.
+ Test demo [Modules-003](../../demo/modules-003.html) – tween an SC Gradient object's `paletteStart` and `paletteEnd` attributes.

#### Tween Definition objects
Definitions objects are normal JavaScript objects with the following attributes:
```
{
  attribute:  Required    String
              - SC object settable key
              - Only one attribute can be targeted by each definitions object.

  start:      Required    Number | String
              - Start value for the tween animation

  end:        Required    Number | String
              - End value for the tween animation

  integer:    Optional    Boolean             (default: false)
              - Flag indicating whether tween calculation results should be integer form

  engine:     Optional    Function | String   (default: 'linear')
              - String name of an SC easing function, or a product-dev-defined function
}
```

SC allows definition object `start` and `end` values to be defined as Strings with a measurement suffix (`%`, `px`, etc) attached to the number. All `start|end` values should be of a type that a target object (generally an SC artefact) expects to receive in its `set` function.

SC also allows `start|end` value calculations (for both Number and String-suffixed values) to be rounded to integer-equivalent values. For example see test demo [Canvas-005](../../demo/canvas-005.html) which includes a Tween object that uses a bespoke easing engine to calculate a Gradient animation. The Tween changes the Gradient object's `paletteStart` and `paletteEnd` values, both of which must be integer Numbers in the range `0`-`999`:

```
const tweenEngine = (start, change, position) => {

  const temp = 1 - position;

  const val = (position < 0.5) ?
    start + ((position * position) * change * 2) :
    (start + change) + ((temp * temp) * -change * 2);

  return val % 1000;
};

scrawl.makeTween({
  name: name('mytween'),
  targets: name('colored-pipes'),
  duration: 5000,
  cycles: 1,
  definitions: [{
    attribute: 'paletteStart',
    integer: true,
    start: 0,
    end: 2999,
    engine: tweenEngine
  }, {
    attribute: 'paletteEnd',
    integer: true,
    start: 999,
    end: 3998,
    engine: tweenEngine
  }],
});
```

#### Easing engine functions
SC includes a large number of easing functions out of the box – see test demo [Canvas-047](../../demo/canvas-047.html).

The naming convention for these functions follows the metaphor of trains and stations. This is (probably) different to how easings are named elsewhere:
+ `in` – the easing starts fast and slows down (the train eases into the station, and stops).
+ `out` – the easing starts slow and speeds up (the train eases out of the station, gathering speed).

The code for these pre-defined easing functions can be found in the [helper/utilities.js](../source/helper/utilities.html) file:
```
linear            cosine            hermite           quintic

out                                                   in

easeOut           easeOutIn         easeInOut         easeIn
easeOut3          easeOutIn3        easeInOut3        easeIn3
easeOut4          easeOutIn4        easeInOut4        easeIn4      
easeOut5          easeOutIn5        easeInOut5        easeIn5

easeOutSine       easeOutInSine                       easeInSine     
easeOutQuad       easeOutInQuad                       easeInQuad     
easeOutCubic      easeOutInCubic                      easeInCubic    
easeOutQuart      easeOutInQuart                      easeInQuart    
easeOutQuint      easeOutInQuint                      easeInQuint    
easeOutCirc       easeOutInCirc                       easeInCirc     

easeOutBack       easeOutInBack                       easeInBack   
easeOutElastic    easeOutInElastic                    easeInElastic
easeOutBounce     easeOutInBounce                     easeInBounce 
```

Easing functions are not restricted to Tween objects. SC also uses them to help interpret Color object `range` requests, and applies them to various gradient-based objects – **eased linear gradients** – and even the swirl filter.

Product-devs can also define their own easing engines. The function will need to take the following arguments:
```
const myEasingFunction = function (start, change, position) {

  // code here

  return result;  // Number
};

Where:
  start     - the required start value of the attribute (Number)
  change    - the required end value of the attribute (Number)
  position  - elapsed time / duration (Number between 0 and 1)
```

For examples of some bespoke easing functions, see:
+ Test demos [Canvas-003](../../demo/canvas-003.html), [Canvas-004](../../demo/canvas-004.html), [Canvas-017](../../demo/canvas-017.html), [Canvas-049](../../demo/canvas-049.html) – eased linear gradients
+ Test demo [Canvas-005](../../demo/canvas-005.html) – easing a gradient animation for 3 loops
+ Test demo [Filters-022](../../demo/filters-022.html) – easings applied to a mapToGradient filter
+ Test demo [Filters-026](../../demo/filters-026.html) – easings applied to a swirl filter

### Action objects
SC Action objects add (reversible) functions to a Ticker object. These are particularly useful for updating SC object attributes that are not tweenable – for instance showing and hiding objects as the Ticker animation progresses.

Action object functionality is defined in the [factory/action.js](../source/factory/action.html) file, and also inherit functionality from the [mixin/tween.js](../source/mixin/tween.html) file.

#### Create, serialize, clone and kill Action objects
Product-devs can create an Action object using the `scrawl.makeAction({key: value, ...})` factory function.

Action objects can be serialized using the `action.saveAsPacket()` function, and restored against any SC *tracked object* using the `obj.actionPacket('packet-string')` function.

Any Action object can be cloned using the `action.clone({key: value, ...})` function.

To remove an Action object from the SC environment, invoke `action.kill()` on it. Unlike Tweens, deleting an Action object has no effect on its associated Ticker object.

#### Action attributes
The following attributes can be set during Action object creation, then updated using the `action.set()` function:
```
Attribute           Type                               Default
------------------------------------------------------------------------------------------
name                String                             Autogenerated (names must be unique)
order               positive integer Number            1

targets             SC-object | String | Array         []

ticker              String                             ''
time                Number | String                    0

action              Function                           λnull
revert              Function                           λnull
```

See the notes on Tween objects (above) for details on the `targets`, `ticker` and `time` attributes. Note that unlike Tweens, Action objects do not create their own Ticker objects if they are instantiated with the `ticker` attribute undefined.

#### Action and revert functions
The `action` and `revert` functions should, ideally, reflect each other: whatever the `action` function does, the `revert` function should undo. A good example of this can be seen in test demo [DOM-006](../../demo/dom-006.html), where the `action` functions change the Element artefact's background color, while the `revert` functions change the color back again.

## Display animations and the Display cycle
As described in the [objects overview](sc-objects-overview.html) page of this Runbook, SC acts as a buffer between the product-dev and the Canvas API by introducing a [stateful scene graph](sc-groups-cells.html) composed of objects, and groups of objects, which define a set of entities to be drawn onto the canvas. 

Unlike the native [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), which performs each line of code as soon as it reads it ([immediate mode rendering](https://learn.microsoft.com/en-us/windows/win32/learnwin32/retained-mode-versus-immediate-mode)), SC requires that its scene graph be defined before it is painted onto the `<canvas>` element.

This painting *action* is called, in SC, the **Display cycle**. It consists of three distinct *operations*:
+ First, the **`clear`** operation removes any previous graphics from an SC Cell object's display and sets up the Cell for painting.

+ Next, the **`compile`** operation paints the scene graph onto the Cell object's display. This operation is itself split into two *phases*:

  – The ***`calculate`*** phase runs through the scene graph hierarchy and updates any objects that have been marked by `dirty` flags with recalculated data.

  – The ***`stamp`*** phase paints the scene graph onto the Cell object's display.

+ Finally, the ***`show`*** operation clears the `<canvas>` element's display and paints the finalized Cell display onto it.

Product-devs can implement a Display cycle with the various `.clear()`, `.compile()` and `.show()` functions. Alternatively they can use the `.render()` convenience functions to perform all three operations in one call. These functions can be invoked on:
+ Individual Cell objects – `cell.clear()`, `cell.compile()`, `cell.show()`.
+ Canvas artefact objects, which invokes the relevant functions on all Cell objects associated with that Canvas object – `canvas.clear()`, `canvas.compile()`, `canvas.show()`, `canvas.render()`.
+ Stack artefact objects – `stack.clear()`, `stack.compile()`, `stack.show()`, `stack.render()`.
+ SC itself, which will trigger the functions on all Canvas and Stack objects across the web page – `scrawl.clear()`, `scrawl.compile()`, `scrawl.show()`, `scrawl.render()`.

These functions can be used at any time to update a display. This is particularly useful for static displays which only need to be rendered once – see, for instance:
+ Test demos [Canvas-015](../../demo/canvas-015.html) and [Canvas-016](../../demo/canvas-016.html), which display blocks of static color strings.
+ Test demo [Canvas-046](../../demo/canvas-046.html) – where a complex display is created on a Cell and then saved as an image to be used elsewhere in the animation.
+ Test demo [Canvas-051](../../demo/canvas-051.html) – another static test.

These functions can also be used with a generic Animation object to create an animated Display cycle – see test demo [Canvas-041](../../demo/canvas-041.html) for an example.

### The `scrawl.makeRender()` factory function
SC RenderAnimation objects are animations that aim to simplify coding up Display cycles. They build on the functionality of generic Animation objects while also exposing a suite of **Display cycle hook functions** – attributes which can accept a function to be run at various points during each Display cycle.

RenderAnimation object functionality is defined in the [factory/render-animation.js](../source/factory/render-animation.html) file.

#### Create, serialize, clone and kill RenderAnimation objects
To create a RenderAnimation object, use the `scrawl.makeRender({key: value, ...})` factory function. Once created, the object can be updated in the normal SC way with the `animation.set({key: value, ...})` function.

Similarly to generic Animation objects, serialization – and thus cloning – functionality has not yet been implemented for RenderAnimation objects.

To remove a RenderAnimation object from the SC system, invoke the `animation.kill()` function on it.

#### RenderAnimation attributes
RenderAnimation objects include most of the attributes that generic Animation objects have, which operate in the same way:
+ `name` – String, name identifier (default: computer generated String)
+ `order` – Number, order value (default: `1`)
+ `onRun` – hook Function
+ `onHalt` – hook Function
+ `onKill` – hook Function
+ `maxFrameRate` – Number, animation choke functionality (default: `60`)
+ `lastRun` – Number (internal only), animation choke functionality
+ `chokedAnimation` – Boolean, animation choke functionality (default: `true`)

The object also includes the following methods (functions):
+ `run()` – invokes the `onStart` hook function, then adds the object to the core animation loop's `animation` Array.
+ `halt()` – invokes the `onHalt` hook function, then removes the object from the core animation loop's `animation` Array.
+ `kill()` – invokes the `onKill` hook function, then removes the object from the SC system.
+ `isRunning()` – returns a Boolean: `true` if the object is currently included in the core animation loop's `animation` Array.

The default behaviour of a RenderAnimation object, when created, is to run immediately. Product-devs can prevent this by adding a `delay: true` attribute to the factory function's argument object.

#### RenderAnimation targets
A RenderAnimation object needs a *target* object to control. For the most part these targets will be SC artefact – Canvas, Stack – objects. The product-dev can specify the target when creating the RenderAnimation object by setting the factory's argument object's `target` attribute to either the target object itself, or to its `name` String.

Note that while SC allows the target attribute to take an Array of targets, this is generally not a Good Idea – Product-devs should instead create separate RenderAnimation objects for each target as this allows for more fine-grained control of that target's animation.

Note also that the `target` attribute is not mandatory. For instance a few of the test demos involving multiple SC animated Artefact objects define an additional RenderAnimation object to render a frame rate readout that appears in a normal `<div>` element – see test demo [Filters-103](../../demo/filters-103.html) for an example: note that the factory function argument's `noTarget` attribute has to be set to `true` for this to work correctly.

(For info: the code that creates the frame rate readout can be found in the [demo suite's utility.js](../demo/utilities.html) file. Like the test demo files, the utilities file is not part of the SC library.)

#### RenderAnimation observers
SC does not, by default, run RenderAnimation object code if the object's target Artefact object is not currently visible in the end user's device's viewport. SC does this to minimize the impact of (often computationally heavy) Display cycle code on the end-user's device.

This functionality is controlled by an [IntersectionObserver API object](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) which SC will create for each RenderAnimation object it instantiates.

If the product-dev decides they don't want an observer running alongside their RenderAnimation object they can disable it by setting the factory function's argument object's `observer` attribute to `false`. They can also change the observer's functionality by setting that attribute to an `options object`, as described in the linked MDN page.

Note that because SC actively suppresses code running on non-displayed Artefact animations, edge cases can appear where the web page environment changes (eg: the end-user resizes their browser window) which triggers changes that the Artefact display needs to action but, because they are not running their Display cycle, those changes won't get picked up. To handle such situations non-running RenderAnimation objects can be triggered to run a single Display cycle tick using the `animation.updateOnce()` function. See the code in the [animated-highlight-gradient-text-snippet.js](../demo/snippets/animated-highlight-gradient-text-snippet.html) file for an example.

Observer object functionality is defined in the [core/events.js](../source/core/events.html) file.

(TODO: Product-devs have access to the `scrawl.makeAnimationObserver()` factory function, should they ever feel the need to create their own IntersectionObserver objects – but does the factory function really need to be exported to the outside world? Note that the scrawl-canvas-website canvas components do use the function, so any change here will need to take that "test" into account.)

#### RenderAnimation hook functions
Unlike generic Animations, the `makeRender()` factory function does not allow the product-dev to define their own `fn` function. Instead, RenderAnimation objects all use the same `fn` object defined on their prototype object:

```
RenderAnimation.prototype.fn = function () {

  if (this.noTarget) {

    this.commence();
    this.afterClear();
    this.afterCompile();
    this.afterShow();

    if (this.readyToInitialize) {

      this.afterCreated(this);
      this.readyToInitialize = false;
    }
  }
  else if (this.isRunning()) {

    this.commence();
    this.target.clear();
    this.afterClear();
    this.target.compile();
    this.afterCompile();
    this.target.show();
    this.afterShow();

    if (this.readyToInitialize) {

      this.target.checkAccessibilityValues();

      this.afterCreated(this);
      this.readyToInitialize = false;
    }
  }
};
```

As can be seen, this function invokes a set of **hook functions** before, during and after each of the Display cycle operations. By default these functions are set to the SC `λnull` (no-op) function: 
+ `commence` – triggers at the start of the Display cycle, before the `clear` operation begins.
+ `afterClear` – triggers when the `clear` operation completes, before the `compile` operation begins.
+ `afterCompile` – triggers when the `compile` operation completes, before the `show` operation begins.
+ `afterShow` – triggers at the end of the Display cycle, after the `show` operation completes.
+ `afterCreated` – triggers once, after the first Display cycle completes.

Product-devs can define these hook functions when they invoke the `makeRender()` factory function. If they need to be updated at any point after creation, this can be achieved using the `animation.updateHook(hook: String, func: Function)` function – note that if the second argument is not included, the current hook function will be updated to the `λnull` function. See the code in the [before-after-slider-infographic.js](../demo/snippets/before-after-slider-infographic.html) file for an example.

## Delta animation
SC delta animations are *unlimited* animations – that is, (by default) they have no start and end values, and they run continuously until the product-dev stops them.

Product-devs can define delta animations directly as part of the SC objects on which they will run. They can be used for continuous animations such as artefact or entity rotations. See the following test demos for examples:
+ Continuous rotation animations – [Canvas-002](../../demo/canvas-002.html), [Canvas-009](../../demo/canvas-009.html), [Canvas-031](../../demo/canvas-031.html), [DOM-008](../../demo/dom-008.html), [Modules-003](../../demo/modules-003.html), [Modules-004](../../demo/modules-004.html), [Particles-013](../../demo/particles-013.html).
+ Animation along a path – [Canvas-012](../../demo/canvas-012.html), [Canvas-014](../../demo/canvas-014.html), [Canvas-030](../../demo/canvas-030.html), [Canvas-208](../../demo/canvas-208.html).
+ Gradient animations – [Canvas-054](../../demo/canvas-054.html), [Filters-022](../../demo/filters-022.html).
+ Continuous motion animations – [Canvas-050](../../demo/canvas-050.html), [DOM-007](../../demo/dom-007.html).
+ Line dash offset (marching ants) – [Canvas-040](../../demo/canvas-040.html), [Canvas-058](../../demo/canvas-058.html), [Canvas-201](../../demo/canvas-201.html).
+ Loom entity animations – [Canvas-024](../../demo/canvas-024.html), [DOM-015](../../demo/dom-015.html).

Delta animation functionality is defined in the [mixin/delta.js](../source/mixin/delta.html) file.

### Define a delta animation
The delta mixin adds a `delta` attribute to all Artefact and entity factory functions. The attribute takes a normal JS object whose keys represent the attributes to be delta-animated:

```
scrawl.makeWheel({

  ...

  delta: {
    roll: -0.5,
  },
});
```

The values assigned to the delta object keys should be the amount of change to be added to the attribute during each Display cycle tick. The above code will make the Wheel entity rotate aoround its *rotation-reflection* coordinate by -0.5 degrees each tick.

> **tl;dr:** Only a subset of attributes can be delta-animated – specifically those attributes that take a Number value, or a String value which can be ennumerated. The `/scrawl.d.ts` type definitions file takes this into account, in the hope that this will help product-devs.

### Control a delta animation
Delta updates run automatically as part of the Display cycle. To halt these updates, product-devs can set the Artefact or entity's `noDeltaUpdates` flag attribute to `true`.

SC includes functionality to add min/max *limits* to a delta animation, and to define the action an animation should take when it reaches those limits. Product-devs can implement this functionality by adding a companion `deltaConstraints` attribute to the Artefact or entity object:

```
scrawl.makeWheel({

  ...

  delta: {
    startX: 4,
    startY: '0.25%',
    roll: -0.5,
    globalAlpha: 0.006,
  },

  deltaConstraints: {
    startX: [50, 550, 'reverse'],
    startY: ['10%', '90%', 'reverse'],
    scale: [0.5, 2, 'reverse'],
    globalAlpha: [0.2, 1, 'reverse'],
  },

  checkDeltaConstraints: true,
});
```

Each key in the `deltaConstraints` object should match a key defined in the `delta` object.

The values assigned to `deltaConstraints` object keys are always an Array comprising the following elements:
```
{
  key: [minimum_value, maximum_value, action],
  ...
}

Where action is a String: either 'reverse', or 'loop'
```

See test demo [Canvas-050](../../demo/canvas-050.html) for an example.

#### Experimental features
The mixin file includes code for some (half-abandoned) experimental functionality for further manipulating and controlling delta animations. Given that repo-devs are unsure whether to continue or abandon these experiments, that code has not been detailed in the Runbook.

