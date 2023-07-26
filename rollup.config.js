import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
//import { terser } from 'rollup-plugin-terser';
//import nodePolyfills from 'rollup-plugin-polyfill-node';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
//import babel from "@rollup/plugin-babel";

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: {
		'viewer': 'src/main.js'
	},
	output: {
		dir: 'public',
		//file: 'public/bundle.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
		sourcemap: true,
		name: 'docxViewer'
	},
	plugins: [
		globals(),
		builtins(),
		resolve(),
		commonjs({
			requireReturnsDefault: false,
			//esmExternals: true,
			transformMixedEsModules: true
		}),
		//production && terser(), // minify, but only in production
	]
};
