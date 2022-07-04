import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import css from "rollup-plugin-import-css";
import replace from '@rollup/plugin-replace';
import { terser } from "rollup-plugin-terser";

export default {
    input: 'src/index.js',
    output: {
        file: 'bundle.js',
        format: 'iife',
        compact: true,
        globals: {
            gsap: 'gsap'
        },
        plugins: process.env.BUILD === 'production' ? [terser({ compress: { drop_console: true } })] : []
    },
    plugins: [
        /**
         * Recommended (but not required):
         *
         * alias allow us to use release builds in production
         * minified builds in PixiJS exclude verbose logs
         * and other non-critical debugging information.
         */
        /* ...process.env.BUILD === 'production' ? [alias({
            entries: [{
                find: /^(@pixi\/([^\/]+))$/,
                replacement: '$1/dist/esm/$2.min.js',
            }, {
                find: 'pixi.js',
                replacement: 'pixi.js/dist/esm/pixi.min.js',
            }]
        })] : [], */
        /**
         * Required!
         * 
         * `preferBuiltins` is required to not confuse Rollup with
         * the 'url' dependence that is used by PixiJS utils
         */
        resolve({
            preferBuiltins: false,
        }),
        replace({
            preventAssignment: true,
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        /**
         * Required!
         *
         * PixiJS third-party dependencies use CommonJS exports
         * and do not have modules bundles available 
         */
        commonjs(),
        json(),
        css(),
    ]
};