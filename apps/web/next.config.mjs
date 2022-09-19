// @ts-check
import { env } from "./src/env/server.mjs";
import withTM from "next-transpile-modules";
import nextBundleAnalyzer from "@next/bundle-analyzer";

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return config;
}

const withBundleAnalyzer = nextBundleAnalyzer({ enabled: false });

export default withBundleAnalyzer(
  withTM(["@sampleforge/api", "@sampleforge/db"])(
    defineNextConfig({
      reactStrictMode: true,
      swcMinify: true,
    })
  )
);