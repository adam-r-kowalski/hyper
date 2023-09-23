interface Tree {
    name: string,
    props: any,
    children: (string | number)[]
}

function* parts(tree: Tree): Generator<string> {
    yield `<${tree.name}`
    if (tree.children.length > 0) {
        yield `>`
        for (const child of tree.children) {
            if (typeof child === 'string') {
                yield child
            } else if (typeof child === 'number') {
                yield child.toString()
            }
        }
    } else {
        yield `/>`
    }
}

export function html(tree: Tree): string {
    return [...parts(tree)].join('')
}