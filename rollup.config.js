import {terser} from 'rollup-plugin-terser';

export default {
  input: 'source/scrawl.js',
  output: {
    file: 'min/scrawl.js',
    format: 'es',
    plugins: [terser()]
  }
};