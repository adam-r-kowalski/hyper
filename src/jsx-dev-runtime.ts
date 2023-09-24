export type Children = string | number | Tree | Children[];

export interface Props {
  children?: Children;
}

export interface Tree {
  tag: string | ((props: Props) => Tree);
  props?: Props;
}

export function jsxDEV(tag: string, props: Props): Tree {
  return {
    tag,
    props,
  };
}

export function Fragment(props: Props): Tree {
  return {
    tag: "Fragment",
    props,
  };
}
