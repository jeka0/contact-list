declare module '*.scss?url' {
  const src: string;
  export default src;
}

declare module '*.html?raw' {
  const raw: string;
  export default raw;
}
