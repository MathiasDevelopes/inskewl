import { nodeResolve } from "@rollup/plugin-node-resolve";
import metablock from "rollup-plugin-userscript-metablock";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/main.ts",
  output: {
    file: "dist/inskewl.user.js",
    format: "iife", // userscripts må bruke IIFE
    sourcemap: false,
  },
  plugins: [nodeResolve(), typescript(), metablock({ file: "./meta.json" })],
};
