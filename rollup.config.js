import { nodeResolve } from "@rollup/plugin-node-resolve";
import metablock from "rollup-plugin-userscript-metablock";
import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" with { type: 'json' };

const buildVersion = process.env.BUILD_VERSION ?? pkg.version;
const updateURL = process.env.UPDATE_URL;
const downloadURL = process.env.DOWNLOAD_URL ?? updateURL;

export default {
  input: "src/main.ts",
  output: {
    file: "dist/inskewl.user.js",
    format: "iife", // userscripts må bruke IIFE
    sourcemap: false,
  },
  plugins: [nodeResolve(), typescript(), metablock({
    file: "./meta.json",
    override: {
      version: buildVersion,
      ...(updateURL ? { updateURL } : {}),
      ...(downloadURL ? { downloadURL } : {}),
    },
  })],
};
