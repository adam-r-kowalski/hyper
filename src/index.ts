import { JSDOM } from "jsdom";
import { Tree, Child } from "./jsx-dev-runtime";

function* childParts(child: Child): Generator<string> {
  if (typeof child === "string") {
    yield child;
  } else if (typeof child === "number") {
    yield child.toString();
  } else if (Array.isArray(child)) {
    for (const c of child) {
      yield* childParts(c);
    }
  } else {
    yield* parts(child);
  }
}

function* parts(tree: Tree): Generator<string> {
  if (typeof tree.tag === "function") {
    const result = tree.tag(tree.props!);
    yield* childParts(result);
  } else if (tree.tag === "Fragment") {
    yield* childParts(tree.props!.children!);
  } else {
    yield `<${tree.tag}`;
    if (tree.props?.children) {
      yield `>`;
      yield* childParts(tree.props.children);
      yield `</${tree.tag}>`;
    } else {
      yield `/>`;
    }
  }
}

export function html(tree: Tree): string {
  return [...parts(tree)].join("");
}

function scriptContent(dom: JSDOM): string {
  const script = dom.window.document.querySelector("script");
  if (script) {
    const scriptContent = script.textContent ?? "";
    script.remove();
    return scriptContent;
  }
  return "";
}

function styleContent(dom: JSDOM): string {
  const style = dom.window.document.querySelector("style");
  if (style) {
    const styleContent = style.textContent ?? "";
    style.remove();
    return `
<style>
\{\`
${styleContent}
\`\}
</style>
`;
  }
  return "";
}

function hyperToTsx(hyper: string): string {
  const dom = new JSDOM(hyper);
  const jsxContent = dom.window.document.body.innerHTML;
  const contents = `
function jsxDEV(tag, props) {
  return {tag, props}
}

function Fragment(props) {
  return {tag: "Fragment", props}
}

function get() {
${scriptContent(dom)}
  return (
    <html>
      <head>
        <title>Hyper</title>
${styleContent(dom)}
      </head>
      <body>
${jsxContent}
      </body>
    </html>
  )
}

return {get}
`;
  return contents;
}

const transpiler = new Bun.Transpiler({ loader: "tsx" });

export function compile(hyper: string): string {
  const tsx = hyperToTsx(hyper);
  const js = transpiler.transformSync(tsx);
  const func = new Function(js);
  const content = html(func().get());
  return content;
}

const server = Bun.serve({
  port: 3000,
  async fetch(request) {
    const file = Bun.file("./routes/index.hyper");
    const hyper = await file.text();
    const content = compile(hyper);
    return new Response(content, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
});
