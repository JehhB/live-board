import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import getBabelOutputPlugin from '@rollup/plugin-babel';
import replace from 'rollup-plugin-replace';
import terser from '@rollup/plugin-terser';

export default {
  input: 'client.js',
  output: {
    file: 'public/client.js',
    format: 'iife',
    name: 'bundle'
  },
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs(),
    getBabelOutputPlugin({
      babelHelpers: 'bundled',
      presets: [
        ['@babel/preset-env', {
          targets: '> 0.25%, last 2 versions, Firefox ESR, not dead',
        }],
      ],
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'), // Replace process.env.NODE_ENV with 'production'
    }),
    //terser(),
  ]
};
