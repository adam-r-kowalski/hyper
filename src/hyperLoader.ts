import { plugin } from "bun";
import { JSDOM } from "jsdom";

function trimEachLine(str: string) {
  return str
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .join("\n");
}

function scriptContent(dom: JSDOM): string {
  const script = dom.window.document.querySelector("script");
  if (script) {
    const scriptContent = script.textContent!; // trim here
    script.remove();
    return scriptContent;
  }
  return ''
}

plugin({
  name: "Hyper Loader",
  async setup(build) {
    const { readFileSync } = await import("fs");
    build.onLoad({ filter: /\.(hyper)$/ }, (args) => {
      const hyper = readFileSync(args.path, "utf8");
      const dom = new JSDOM(hyper);
      const jsxContent = dom.window.document.body.innerHTML;
      const contents = `
function jsx(name, props, ...children) {
  return {name, props, children}
}

export function get() {
    ${scriptContent(dom)}
    return (
        ${jsxContent}
    )
}`;
      return {
        contents,
        loader: "js",
      };
    });
  },
});
