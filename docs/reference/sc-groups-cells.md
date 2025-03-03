# Scrawl-canvas Groups and Cells
Scrawl-canvas works by generating a **retained mode** description - an object model of graphical primatives (called entitys) - for a scene which displays in a `<canvas>` element. SC builds this [scene graph](https://en.wikipedia.org/wiki/Scene_graph) using Group and Cell objects, alongside entity objects which get gathered into the Group objects that have been created for the scene.

> **tl;dr: *SC is not a game engine!*** The SC scene graph does not use the classic [tree structure](https://en.wikipedia.org/wiki/Tree_(abstract_data_type)) approach to build out a top-down hierarchy of layers and nodes to describe the scene. Rather, SC uses a more bottom-up approach to creating the scene graph where entity objects control how, where and when they will appear in the canvas display. Using a tree structure for the scene graph may have been a more efficient design choice, but *SC is not a game engine!*
> 
> Dev-users should be aware that this - *somewhat different* - approach may take a bit of getting used to but, once the concepts are in place, it should be relatively simple to work with.

## The SC scene graph
The following code creates a canvas display with this output. Note that the code is creating a deliberately complex scene-graph, for demonstration purposes; none of the test demos generate scene graphs as complex as this one:

![Code output](sc-groups-cells-asset-001.webp)

```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      canvas { margin: 1em auto; }
    </style>
  </head>
  <body>
    <canvas 
      id="my-canvas"
      width="600"
      height="400"
      data-scrawl-canvas
      data-base-background-color="slategray"
    ></canvas>

    <script type="module">
      // Import SC
      import * as scrawl from 'scrawl-canvas';

      // Get a handle to the Canvas artefact
      const canvas = scrawl.findCanvas('my-canvas');

      // Namespacing boilerplate
      const namespace = `${canvas.name}-placehold`;
      const name = (n) => `${namespace}-${n}`;

      // The Canvas artefact includes a hidden Cell, used as a Pattern style by an entity
      canvas.buildCell({
          name: name('my-hidden-cell'),
          shown: false,
          dimensions: [80, 80],
          backgroundColor: 'lightgray',
      });

      // A yellow Block in the hidden Cell
      scrawl.makeBlock({
          name: name('yellow-block'),
          group: name('my-hidden-cell'),
          dimensions: ['50%', '50%'],
          start: ['center', 'center'],
          handle: ['center', 'center'],
          roll: 30,
          fillStyle: 'yellow',
          lineWidth: 2,
          method: 'fillThenDraw',
      });

      // An extra Cell that will appear towards the bottom-right of the canvas display
      canvas.buildCell({
          name: name('my-extra-cell'),
          dimensions: ['50%', '50%'],
          start: ['70%', '70%'],
          handle: ['50%', '50%'],
          roll: 45,
          backgroundColor: 'aliceblue',
      });

      // The extra Cell has an additional Group as well as its namesake Group
      scrawl.makeGroup({
          name: name('my-additional-group'),
          host: name('my-extra-cell'),
      });

      // Part of the additional Group
      scrawl.makeBlock({
          name: name('blue-block'),
          group: name('my-additional-group'),
          dimensions: ['100%', '60%'],
          offsetY: 20,
          fillStyle: 'blue',
          lineWidth: 2,
          method: 'fillThenDraw',
      });

      // For this scene, the extra Cell's namesake Group
      // needs to compile after its additional Group
      scrawl.findGroup(name('my-extra-cell')).set({ order: 1 });

      // Part of the extra Cell's namesake Group
      scrawl.makeBlock({
          name: name('red-block'),
          group: name('my-extra-cell'),
          pivot: name('blue-block'),
          lockTo: 'pivot',
          dimensions: ['40%', '40%'],
          fillStyle: 'red',
          lineWidth: 2,
          method: 'fillThenDraw',
      });

      // Part of the extra Cell's namesake Group
      // - using the hidden Cell as its fillStyle value
      scrawl.makeBlock({
          name: name('last-block'),
          group: name('my-extra-cell'),
          fillStyle: name('my-hidden-cell'),
          dimensions: ['75%', '75%'],
          start: ['25%', '25%'],
          lineWidth: 2,
          method: 'fillThenDraw',
      });

      // Part of the Canvas artefact's base Cell's namesake Group
      scrawl.makeBlock({
          name: name('orange-block'),
          dimensions: ['40%', '40%'],
          start: ['30%', '30%'],
          handle: ['center', 'center'],
          fillStyle: 'orange',
          lineWidth: 2,
          method: 'fillThenDraw',
      });

      // Part of the Canvas artefact's base Cell's namesake Group
      scrawl.makeBlock({
          name: name('black-block'),
          dimensions: ['30%', '30%'],
          pivot: name('orange-block'),
          lockTo: 'pivot',
          handle: ['center', 'center'],
          fillStyle: 'black',
          lineWidth: 2,
          method: 'fillThenDraw',
      });

      canvas.render();
    </script>
  </body>
</html>
```

The scene graph for the above code looks like this:

```
- Canvas artefact 'my-canvas'
  |
  |- base Cell object 'my-canvas_base'
  |  |
  |  |- namesake Group object 'my-canvas_base'
  |     |
  |     |- Block entity 'orange-block'
  |     |- Block entity 'brown-block' (position dependency on 'orange-block')
  |
  |- hidden Cell object 'my-hidden-cell'
  |  |
  |  |- namesake Group object 'my-hidden-cell'
  |     |
  |     |- Block entity 'yellow-block'
  |
  |- extra Cell object 'my-extra-cell'
     |
     |- additional Group object 'my-additional-group'
     |  |
     |  |- Block entity 'blue-block'
     |
     |- namesake Group object 'my-extra-cell'
        |
        |- Block entity 'red-block' (position dependency on 'blue-block')
        |- Block entity 'last-block' (style dependency on 'my-hidden-cell')
```

The scene graph described above demonstrates these properties:
+ The scene graph hierarchy is exactly four levels deep ...
  - Level 1 - Artefact objects,
  - Level 2 - Cell objects (relevant only for Canvas artefacts),
  - Level 3 - Group objects,
  - Level 4 - Entity objects.
+ Every Cell object has a namesake Group object.
+ Cells cannot be nested; Groups cannot be nested, etc.
+ Though only shown here for one Cell, every Cell, Group and Entity object can control its own visibility in the Canvas display.
+ Entitys are assigned to Groups (and Groups to Cells, Cells to the Canvas artifact) as they are created - the object lower down the hierarchy maintains details of the object it has assigned itself to.
+ Though not shown here ... Cell, Group and Entity objects can reassign themsleves to a different Canvas, Cell or Group object (respectively) at any time.
+ Again not shown here ... entitys can belong to more than one Group object at any time.
+ Furthermore not shown here ... Group objects can exist independently of Cell objects - they're just collections of entity objects.
+ Cell objects can position themselves in the Canvas display; Entity objects can position themselves in their Cell's display.
+ Group objects play no role in positioning - there is no "cascade of matrix multiplications" between Cells, Groups and entitys.
+ Some of the entitys have direct dependencies on other entitys for their positioning data, and one entity has a direcet dependency on a Cell to supply its fill style.
+ A final not shown here ... Entitys can change their positioning and/or styling dependencies at any time.

## SC Group objects
[describe]

## SC Cell objects
[describe]
