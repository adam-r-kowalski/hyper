import { JSDOM } from "jsdom";
import { Tree, Children } from "./jsx-dev-runtime";

function* childParts(children: Children): Generator<string> {
  if (typeof children === "string") {
    yield children;
  } else if (typeof children === "number") {
    yield children.toString();
  } else if (Array.isArray(children)) {
    for (const c of children) {
      yield* childParts(c);
    }
  } else {
    yield* parts(children);
  }
}

function* parts(tree: Tree): Generator<string> {
  if (typeof tree.tag === "function") {
    const result = tree.tag(tree.props!);
    yield* childParts(result);
  } else if (tree.tag === "Fragment") {
    yield* childParts(tree.props!.children!);
  } else if (tree.tag === "style") {
    const children = tree.props!.children!;
    if (typeof children === "string") {
      const trimmed = children
        .split("\n")
        .map((line) => line.trim())
        .join("\n");
      yield `<style>${trimmed}</style>`;
    }
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
    return `<style>\{\`${styleContent}\`\}</style>`;
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
