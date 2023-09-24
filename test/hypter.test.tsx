import { expect, test } from "bun:test";
import { html, compile } from "../src";

declare global {
  namespace JSX {
    interface IntrinsicElements extends Record<string, any> {
      [elemName: string]: any;
    }
  }
}

test("basic hyper", async () => {
  const actual = compile(`<h1>Hello World</h1>`);
  const expected = html(
    <html>
      <head>
        <title>Hyper</title>
      </head>
      <body>
        <h1>Hello World</h1>
      </body>
    </html>
  );
  expect(actual).toEqual(expect.anything());
});

test("interpolation hyper", async () => {
  const actual = compile(`
        <script>
            const name = "Joe Smith"
            const age = 42
            const city = "New York"
        </script>

        <h1>Hello, {name} ({age}) from {city}</h1>
    `);
  const expected = html(
    <html>
      <head>
        <title>Hyper</title>
      </head>
      <body>
        <h1>Hello, Joe Smith (42) from New York</h1>
      </body>
    </html>
  );
  expect(actual).toEqual(expected);
});

test("nested hyper", async () => {
  const actual = compile(`
        <script>
            const fruit = ["apple", "banana", "orange"];
        </script>

        <ul>
            <li>{fruit[0]}</li>
            <li>{fruit[1]}</li>
            <li>{fruit[2]}</li>
        </ul>
    `);
  const expected = html(
    <html>
      <head>
        <title>Hyper</title>
      </head>
      <body>
        <ul>
          <li>apple</li>
          <li>banana</li>
          <li>orange</li>
        </ul>
      </body>
    </html>
  );
  expect(actual).toEqual(expected);
});

test("style hyper", async () => {
  const actual = compile(`
        <style>
            body {
                font-family: sans-serif;
            }
        </style>

        <h1>Hello World</h1>
    `);
  const expected = html(
    <html>
      <head>
        <title>Hyper</title>
        <style>
          {`
            body {
              font-family: sans-serif;
            }
          `}
        </style>
      </head>
      <body>
        <h1>Hello World</h1>
      </body>
    </html>
  );
  expect(actual).toEqual(expected);
});

// test("for hyper", async () => {
//      // @ts-ignore
//     const {get} = await import("./for.hyper")
//     const actual = html(get())
//     const expected = html(
//         <ul>
//             <li>apple</li>
//             <li>banana</li>
//             <li>orange</li>
//         </ul>
//     )
//     expect(actual).toEqual(expected)
// })
