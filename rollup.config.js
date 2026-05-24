import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const targets = [
  {
    input: 'src/CSUI/example.ts',
    tsconfig: 'src/CSUI/tsconfig.json',
    output: 'scripts/CSUI/CSUI_example.js'
  }
];

export default targets.map(({ input, output, tsconfig }) => ({
  input,
  output: {
    file: output,
    format: "esm",
  },
  external: ['cs_script/point_script'],
  plugins: [
    typescript({
      tsconfig,
      exclude: ["src/CSUI/FontAtlasGenerator/**"],
    }),
    nodeResolve(),
    commonjs()
  ],
}));