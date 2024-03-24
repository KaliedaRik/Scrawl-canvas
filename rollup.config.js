import terser from '@rollup/plugin-terser';

export default {
  input: 'source/scrawl.js',
  output: {
    file: 'min/scrawl.js',
    format: 'es',
    plugins: [terser({
      mangle: {
        reserved: ['Action', 'Anchor', 'Animation', 'Bezier', 'Block', 'Button', 'Canvas', 'Cell', 'Cog', 'Color', 'ConicGradient', 'Coordinate', 'Crescent', 'Element', 'Emitter', 'EnhancedLabel', 'Filter', 'FilterEngine', 'FontAttributes', 'Force', 'Gradient', 'Grid', 'Group', 'ImageAsset', 'Label', 'Line', 'LineSpiral', 'Loom', 'Mesh', 'Net', 'NoiseAsset', 'Oval', 'Palette', 'Particle', 'ParticleHistory', 'Pattern', 'Phrase', 'Picture', 'Polygon', 'Polyline', 'Quadratic', 'Quaternion', 'RadialGradient', 'RawAsset', 'RdAsset', 'Rectangle', 'RenderAnimation', 'Shape', 'Spiral', 'Spring', 'SpriteAsset', 'Stack', 'Star', 'State', 'Tetragon', 'Ticker', 'Tracer', 'Tween', 'UnstackedElement', 'Vector', 'VideoAsset', 'Wheel', 'World']
      }
    })]
  }
};
