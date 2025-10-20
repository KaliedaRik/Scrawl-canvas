# Path-based entitys
A brief overview of path-based entity functionality

Path-based entitys that use SVG `d` strings
+ `Shape`

Path-based entitys mapping to Canvas API primitive paths
+ `Line`
+ `Quadratic`
+ `Bezier`
+ Using reference positioning for control points

SC pre-defined path-based entitys
+ `Cog`
+ `LineSpiral`
+ `Oval`
+ `Polygon`
+ `Rectangle`
+ `Spiral`
+ `Star`
+ `Tetragon`

Other things
+ `Polyline` - generating a path-based entity from sets of coordinates (which can be references to other artefacts, and even particles)
+ `Loom` - a compound entity that uses path-based entitys to define its display shape
+ `EnhancedLabel` - can use path-based entitys for "text along a path" effects

Maybe include some thoughts on why SC doesn't support importing SVGs into the system, and will never support exporting canvas displays as SVGs.
