import {terser} from 'rollup-plugin-terser';

export default {
  input: 'source/scrawl.js',
  output: {
    file: 'min/scrawl.js',
    format: 'es',
    plugins: [terser({
      mangle: {
        reserved: ['Action', 'Anchor', 'Animation', 'Bezier', 'Block', 'Canvas', 'Cell', 'Color', 'Coordinate', 'Element', 'Filter', 'FontAttributes', 'Gradient', 'Grid', 'Group', 'ImageAsset', 'Line', 'Loom', 'Oval', 'Palette', 'Pattern', 'Phrase', 'Picture', 'Polygon', 'Polyline', 'Quadratic', 'Quaternion', 'RadialGradient', 'Rectangle', 'RenderAnimation', 'Shape', 'Spiral', 'SpriteAsset', 'Stack', 'Star', 'State', 'Tetragon', 'Ticker', 'Tween', 'UnstackedElement', 'Vector', 'VideoAsset', 'Wheel']
      }
    })]
  }
};
