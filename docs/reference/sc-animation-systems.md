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
| `scrawl.makeTicker()` | keyframe | tickeranimation | [factory/ticker.js](../source/factory/ticker.html) | [Tween animations](https://en.wikipedia.org/wiki/Inbetweening) |
| `scrawl.makeTween()` | keyframe | tickeranimation | [factory/tween.js](../source/factory/tween.html) | Tween animations |

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
During the [SC initialization process](sc-initialization.html) a number of system Animation objects get created and added to the core animation loop:
+ `SC-core-filters-cleanup-action` - defined in [helper/filter-engine.js](../source/helper/filter-engine.html)
+ `SC-core-gradient-delta-animation` - defined in [mixin/styles.js](../source/mixin/styles.html)
+ `SC-core-listeners-tracker` - defined in [core/user-interaction.js](../source/core/user-interaction.html)
+ `SC-core-tickers-animation` - defined in [factory/ticker.js](../source/factory/ticker.html)
+ `SC-core-workstore-hygeine` - defined in [helper/workstore.js](../source/helper/workstore.html)

## Keyframe animations - linear interpolation with tweens
[write up]

### Easing functions
[write up]

#### What can be eased?
+ Tween animations
+ Color ranges
+ Gradients
+ ??? other things ???

### Timeline objects
[write up]

### Tween objects
[write up]

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


