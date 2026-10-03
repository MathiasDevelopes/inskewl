import { nodeResolve } from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";

export default {
  input: "src/modules/attendance-calculator/attendance-calculator.demo.ts",
  output: {
    file: "docs/assets/attendance-calculator-demo.js",
    format: "iife",
    sourcemap: false,
  },
  plugins: [
    nodeResolve(),
    esbuild({ target: "es2024" }),
  ],
};
