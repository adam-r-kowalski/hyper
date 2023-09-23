import { expect, test } from "bun:test"
import {html} from '../src/'


function jsx(name: string, props: any, ...children: any[]) {
    return {name, props, children}
}

declare global {
    namespace JSX {
        interface IntrinsicElements extends Record<string, any> {
            [elemName: string]: any;
        }
    }
}

test("basic hyper", async () => {
     // @ts-ignore
    const {get} = await import("./basic.hyper")
    const actual = html(get())
    const expected = html(<h1>Hello World</h1>)
    expect(actual).toEqual(expected)
})


test("interpolation hyper", async () => {
     // @ts-ignore
    const {get} = await import("./interpolation.hyper")
    const actual = html(get())
    const expected = html(<h1>Hello, Joe Smith (42) from New York</h1>)
    expect(actual).toEqual(expected)
})