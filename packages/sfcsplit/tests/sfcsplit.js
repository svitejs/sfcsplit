import { describe, it, expect } from 'vitest';
import { sfcsplit } from '../src/index.js';
// eslint-disable-next-line n/no-missing-import
import glob from 'tiny-glob/sync';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const snapshotDir = fileURLToPath(new URL('./snapshots', import.meta.url));
const fixturerDir = fileURLToPath(new URL('./fixtures', import.meta.url));
const samples = glob(`${fixturerDir}/**/*.svelte`);
describe('sfcsplit', () => {
	it('should be a function', () => {
		expect(sfcsplit).toBeTypeOf('function');
	});
	for (const sample of samples) {
		it(`should split ${sample} as expected`, async () => {
			const content = await fs.readFile(sample, 'utf-8');
			const splitted = sfcsplit(content, {
				tags: ['script', 'style', 'svelte:options', 'template'],
				includeRaw: true,
				allowUnclosedComments: true
			});
			expect(splitted).toBeDefined();
			expect(splitted.tags).toBeDefined();
			expect(splitted.comments).toBeDefined();
			expect(splitted.template).toBeDefined();
			const snapshotName = `${snapshotDir}/${sample.slice(
				sample.indexOf('fixtures') + 9,
				-7
			)}.json`;
			await expect(JSON.stringify(splitted, null, '\t'), `split ${sample}`).toMatchFileSnapshot(
				snapshotName
			);
		});
	}
});
