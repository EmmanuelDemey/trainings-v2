// The types of slugify-lite — the package ships none, and under `strict` an
// import without types is an error. This one line is the quick fix: a
// SHORTHAND ambient module, where everything the package exports is `any`.
//
// TODO 1: describe the package for real — read vendor/slugify-lite/index.js.
declare module 'slugify-lite';
