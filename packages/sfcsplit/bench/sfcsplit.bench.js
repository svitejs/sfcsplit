import { describe, bench } from 'vitest';
import { sfcsplit } from '../src/index.js';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
// eslint-disable-next-line n/no-missing-import
import glob from 'tiny-glob/sync';
const carbonComponents = fileURLToPath(
	new URL('../node_modules/carbon-components-svelte/src', import.meta.url)
);
const skeletonComponents = fileURLToPath(
	new URL('../node_modules/@skeletonlabs/skeleton/dist/components', import.meta.url)
);
const fixtures = fileURLToPath(new URL('../tests/fixtures', import.meta.url));
const files = [
	...glob(`${carbonComponents}/**/*.svelte`),
	...glob(`${skeletonComponents}/**/*.svelte`),
	...glob(`${fixtures}/**/*.svelte`)
];
const samples = files.map((file) => {
	return { file, content: fs.readFileSync(file, 'utf-8') };
});

// regexes for parsing script and style tags in svelte sfc used by svelte
const scriptLangRE =
	/<!--[^]*?-->|<script (?:[^>]*|(?:[^=>'"/]+=(?:"[^"]*"|'[^']*'|[^>\s]+)\s+)*)lang=["']?([^"' >]+)["']?[^>]*>/g;
const styleRe =
	/<!--[^]*?-->|<style((?:\s+[^=>'"/]+=(?:"[^"]*"|'[^']*'|[^>\s]+)|\s+[^=>'"/]+)*\s*)(?:\/>|>([\S\s]*?)<\/style>)/g;

describe('sfcsplit', () => {
	bench('sfcsplit', () => {
		for (const { content } of samples) {
			sfcsplit(content, { tags: ['script', 'style', 'svelte:options'] });
		}
	});
	bench('sfcsplit allowUnclosedComments', () => {
		for (const { content } of samples) {
			sfcsplit(content, {
				tags: ['script', 'style', 'svelte:options'],
				allowUnclosedComments: true
			});
		}
	});
	bench('svelte regex', () => {
		for (const { content } of samples) {
			content.match(scriptLangRE);
			content.match(styleRe);
		}
	});
});
