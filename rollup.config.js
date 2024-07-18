import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import getBabelOutputPlugin from '@rollup/plugin-babel';

export default {
  input: 'client.js',
  output: {
    file: 'public/client.js',
    format: 'iife',
    name: 'bundle'
  },
  plugins: [
    resolve(),
    commonjs(),
    getBabelOutputPlugin({
      babelHelpers: 'bundled',
      presets: [
        ['@babel/preset-env', {
          targets: '> 0.25%, last 2 versions, Firefox ESR, not dead',
        }],
      ],
    }),
  ]
};
