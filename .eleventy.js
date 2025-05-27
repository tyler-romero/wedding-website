import {
  EleventyHtmlBasePlugin,
  InputPathToUrlTransformPlugin,
} from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import CleanCSS from "clean-css";
import { DateTime } from "luxon";
import fs from "node:fs";
import { tufteMdWrapper } from "./util/tufteMdWrapper.js";

export default function (eleventyConfig) {
  // Copy `src/assets` to `_site/assets`
  eleventyConfig.addPassthroughCopy("src/assets");

  // Copy some more files to `_site`
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/manifest.json");

  // Asset Watch Targets
  eleventyConfig.addWatchTarget("./src/assets");

  /* Markdown Configuration */
  eleventyConfig.setLibrary("md", tufteMdWrapper);
  eleventyConfig.addFilter("markdown", tufteMdWrapper.render);
  eleventyConfig.addFilter("markdownInline", tufteMdWrapper.renderInline);

  // Date stuff
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`); // useful for copyright
  eleventyConfig.addFilter("postDate", (dateObj) => {
    if (typeof dateObj === "string") {
      dateObj = DateTime.fromISO(dateObj);
    } else {
      dateObj = DateTime.fromJSDate(dateObj);
    }
    return dateObj.toFormat("MMMM d, yyyy");
  });
  eleventyConfig.addFilter("lastModifiedDate", function (filepath) {
    const stat = fs.statSync(filepath);
    return stat.mtime.toISOString();
  });

  // Add wordCount filter
  eleventyConfig.addFilter("wordCount", function (content) {
    if (typeof content !== "string") {
      return 0;
    }
    const words = content.split(/\s+/);
    return words.length;
  });

  // CSS Minification
  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // Image Shortcode And Optimizations
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["avif", "webp", "jpg"], // "auto" means use the original format
    widths: [300, 600, 900, "auto"], // mobile, tablet, desktop viewport widths, and original size
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
      // sizes: "(max-width: 900px) 100vw, 900px",
      // class: "responsive-image",
    },
    urlPath: "/assets/img/",
    outputDir: "_site/assets/img/",
  });

  // Plugins
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);

  return {
    // When a passthrough file is modified, rebuild the pages:
    passthroughFileCopy: true,
    dir: {
      input: "src",
      layouts: "_layouts",
    },
  };
}
