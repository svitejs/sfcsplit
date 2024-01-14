# sfcsplit

[![npm version](https://img.shields.io/npm/v/sfcsplit)](https://www.npmjs.com/package/sfcsplit)
[![CI](https://github.com/svitejs/sfcsplit/actions/workflows/test.yml/badge.svg)](https://github.com/svitejs/sfcsplit/actions/workflows/test.yml)

A utility to split Single File Components into their top level parts

# Why

Doing a full parse is costly and approaches using regex are slow and error prone.

# Features

- [x] completely without regex
- [x] zero dependencies
- [x] small
- [x] unbundled esm js, no sourcemaps needed
- [x] [types](./packages/sfcsplit/types/index.d.ts) generated with [dts-buddy](https://github.com/Rich-Harris/dts-buddy)

# Links

[package readme](./packages/sfcsplit/README.md)
[api](./docs/api.md)
[changelog](./packages/sfcsplit/CHANGELOG.md)

# Develop

This repo uses

- [pnpm](https://pnpm.io)
- [changesets](https://github.com/changesets/changesets)

In every PR you have to add a changeset by running `pnpm changeset` and following the prompts

PRs are going to be squash-merged

```shell
# install dependencies
pnpm install
# run tests
pnpm test
```

# License

[MIT](./packages/sfcsplit/LICENSE)
