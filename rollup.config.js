import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'index.js',
  format: 'umd',
  globals: {
    d3: 'd3',
    lodash: '_'
  },
  moduleName: 'd3VoronoiScatterplot',
  plugins: [nodeResolve({ jsnext: true, main: true }), json(), babel()],
  external: ['lodash'],
  dest: 'build/bundle.js',
  acorn: {
    allowReserved: true
  }
};