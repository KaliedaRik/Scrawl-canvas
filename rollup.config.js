import {terser} from 'rollup-plugin-terser';

export default {
  input: 'source/scrawl.js',
  output: {
    file: 'min/scrawl.js',
    format: 'es',
    plugins: [terser({
      mangle: {
        reserved: ['Action', 'Anchor', 'Animation', 'Bezier', 'Block', 'Canvas', 'Cell', 'Cog', 'Color', 'Coordinate', 'Element', 'Emitter', 'Filter', 'FontAttributes', 'Force', 'Gradient', 'Grid', 'Group', 'ImageAsset', 'Line', 'Loom', 'Net', 'Oval', 'Palette', 'Particle', 'ParticleHistory', 'Pattern', 'Phrase', 'Picture', 'Polygon', 'Polyline', 'Quadratic', 'Quaternion', 'RadialGradient', 'Rectangle', 'RenderAnimation', 'Shape', 'Spiral', 'Spring', 'SpriteAsset', 'Stack', 'Star', 'State', 'Tetragon', 'Ticker', 'Tracer', 'Tween', 'UnstackedElement', 'Vector', 'VideoAsset', 'Wheel', 'World']
      }
    })]
  }
};
