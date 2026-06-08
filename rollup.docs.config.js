import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/modules/attendance-calculator/attendance-calculator.demo.ts",
  output: {
    file: "docs/assets/attendance-calculator-demo.js",
    format: "iife",
    sourcemap: false,
  },
  plugins: [
    nodeResolve(),
    typescript({
      compilerOptions: {
        outDir: "docs/assets",
      },
    }),
  ],
};
