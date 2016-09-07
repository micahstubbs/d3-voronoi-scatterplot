import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';

export default {
  entry: 'index.js',
  format: 'umd',
  globals: {
    d3: 'd3',
    lodash: '_'
  },
  moduleName: 'd3VoronoiScatterplot',
  plugins: [ json(), babel() ],
  dest: 'build/bundle.js'
};