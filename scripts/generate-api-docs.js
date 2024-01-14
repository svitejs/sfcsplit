// very simple .d.ts to .md converter
// splits blocks extracts title and wraps in ```ts ``` code fence

import fs from 'fs';

const header = '<!-- generated, do not modify -->\n## API \n\n';

function parseBlock(block) {
	// eslint-disable-next-line no-unused-vars
	const [_, kind, title] = block.match(/(function|class|interface|type) ([a-zA-Z]+)/);
	const heading = '#'.repeat(blockHeadings[title] || 3);
	return {
		kind,
		title,
		md: heading + ' ' + title + '\n\n```ts\n' + stripPrivate(block) + '\n```'
	};
}

function stripPrivate(str) {
	return str.replace(/^\s*#?private[; ].*\n?/gm, '');
}

const typesFile = 'packages/sfcsplit/types/index.d.ts';
const blockSeparator = '\n-- cut here --\n';
let dts = fs
	.readFileSync(typesFile, 'utf-8')
	.replace("declare module 'sfcsplit' {\n", '')
	.replace('}\n\n//# sourceMappingURL=index.d.ts.map', '')
	.replace(/^\s+export function [a-zA-Z]+\(.*$/gm, `$&${blockSeparator}`)
	.replace(/^\s*}\s*$/gm, `$&${blockSeparator}`)
	.replace(/^\t/gm, '');

const blocks = dts
	.split(blockSeparator)
	.map((b) => b.trim())
	.filter(Boolean);

const blockHeadings = {
	sfcsplit: 3,
	SplitOptions: 4,
	SFCSplitResult: 4,
	Template: 4,
	Tag: 4,
	Position: 5
};
const order = Object.keys(blockHeadings);

function sortBlocks(a, b) {
	const aIndex = order.indexOf(a.title);
	const bIndex = order.indexOf(b.title);
	if (aIndex < 0) {
		console.log('misssing title order: ', a.title);
	}
	if (bIndex < 0) {
		console.log('misssing title order: ', b.title);
	}
	return aIndex - bIndex;
}

const md =
	header +
	blocks
		.map((block) => parseBlock(block))
		.sort(sortBlocks)
		.map((b) => b.md)
		.join('\n\n') +
	'\n';
fs.writeFileSync('docs/api.md', md);
console.log(`generated docs/api.md from ${typesFile}`);
