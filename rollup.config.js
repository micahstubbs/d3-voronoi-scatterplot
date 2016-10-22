import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs'; 

export default {
  entry: 'index.js',
  format: 'umd',
  globals: {
    d3: 'd3',
    lodash: '_',
    'bootstrap.native': 'bsn' 
  },
  moduleName: 'd3VoronoiScatterplot',
  plugins: [
    nodeResolve({ jsnext: true, main: true }),
    json(),
    babel(),
    commonjs()
  ],
  external: ['lodash'],
  dest: 'build/bundle.js',
  acorn: {
    allowReserved: true
  }
};