/**
 * @param {string} source
 * @param {import('./public.d.ts').SplitOptions} options
 * @returns {import('./public.d.ts').SFCSplitResult}
 */
export function sfcsplit(source, options) {
	let tags = parseFromStart(source, options);
	const templateStart = tags.length ? tags[tags.length - 1].pos.end + 1 : 0;
	let templateEnd;
	if (templateStart < source.length - 1) {
		const endTags = parseFromEnd(source, options, templateStart);
		templateEnd = endTags.length ? endTags[0].pos.start - 1 : source.length;
		tags = tags.concat(endTags);
	} else {
		templateEnd = source.length - 1;
	}
	const template = {
		pos: {
			start: templateStart,
			end: templateEnd
		}
	};
	if (options.includeRaw) {
		template.raw = source.slice(template.pos.start, template.pos.end + 1);
		for (const tag of tags) {
			tag.raw = source.slice(tag.pos.start, tag.pos.end + 1);
		}
	}
	return {
		tags: tags.filter((tag) => tag.name !== '$comment'),
		comments: tags.filter((tag) => tag.name === '$comment'),
		template
	};
}

/**
 * @param {string} source
 * @param {import('./public.d.ts').SplitOptions} options
 * @returns {import('./public.d.ts').Tag[]}
 */
function parseFromStart(source, options) {
	/**@type {import('./public.d.ts').Tag[]}*/
	const result = [];
	/**@type {import('./public.d.ts').Tag | undefined}*/
	let tag;
	// eslint-disable-next-line no-cond-assign
	while ((tag = nextTag(source, options, tag ? tag.pos.end + 1 : 0))) {
		result.push(tag);
	}
	return result;
}
/**
 * @param {string} source
 * @param {import('./public.d.ts').SplitOptions} options
 * @param {number} from
 * @returns {import('./public.d.ts').Tag | void}
 */
function nextTag(source, options, from) {
	let i = from;
	let end = source.length;
	while (i < end) {
		if (isWS(source[i])) {
			i++;
		} else if (source[i] === '<') {
			if (source[i + 1] === '!' && source[i + 2] === '-' && source[i + 3] === '-') {
				const endOfComment = source.indexOf('-->', i + 4) + 2;
				if (endOfComment < 2) {
					if (options.allowUnclosedComments) {
						return {
							name: '$comment',
							pos: { start: i, end: source.length - 1 },
							content: source.slice(i)
						};
					} else {
						return;
					}
				}
				return {
					name: '$comment',
					pos: {
						start: i,
						end: endOfComment
					},
					content: source.slice(i + 4, endOfComment - 2)
				};
			} else {
				return parseTag(source, options, i);
			}
		} else {
			return;
		}
	}
}

/**
 *
 * @param {string} c
 * @returns {boolean}
 */
function isWS(c) {
	return c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f';
}

/**
 * @param {string} source
 * @param {import('./public.d.ts').SplitOptions} options
 * @param {number} start
 * @param {string} [name]
 * @returns {import('./public.d.ts').Tag | void}
 */
function parseTag(source, options, start, name) {
	name =
		name ??
		options.tags.find((tag) => {
			const len = tag.length;
			for (let i = 0; i < len; i++) {
				if (tag[i] !== source[start + i + 1]) {
					return false;
				}
			}
			const next = start + len + 1;
			return (
				source[next] === '>' ||
				isWS(source[next]) ||
				(source[next] === '/' && source[next + 1] === '>')
			);
		});
	if (!name) {
		return;
	}
	const parsedAttributes = parseAttributes(source, start + name.length + 1);
	if (!parsedAttributes) {
		return;
	}
	const { attributes, pos, selfClosing } = parsedAttributes;

	if (selfClosing) {
		return { name, pos: { start, end: pos }, attributes };
	}

	const parsedContent = parseContent(source, name, pos + 1);
	if (!parsedContent) {
		return;
	}
	const { content, end } = parsedContent;
	return {
		pos: { start, end },
		name,
		attributes,
		content
	};
}

/**
 *
 * @param {string} source
 * @param {number} start
 * @returns {{selfClosing: boolean,pos: number,attributes:Record<string,string|boolean>} | void}
 */

function parseAttributes(source, start) {
	let i = start;
	let end = source.length;
	let attributes = {};

	while (i < end) {
		while (isWS(source[i])) {
			i++;
			if (i === end) {
				return;
			}
		}
		if (source[i] === '>') {
			return { attributes, pos: i, selfClosing: false };
		} else if (source[i] === '/' && source[i + 1] === '>') {
			return { attributes, pos: i + 1, selfClosing: true };
		}
		const nameStart = i;
		let name;
		let nameOnly = false;
		while (i++ < end) {
			if (
				isWS(source[i]) ||
				source[i] === '=' ||
				source[i] === '>' ||
				(source[i] === '/' && source[i + 1] === '>')
			) {
				name = source.slice(nameStart, i);
				while (isWS(source[i])) {
					i++;
				}
				if (source[i] !== '=') {
					nameOnly = true;
				} else {
					i++;
					while (isWS(source[i])) {
						i++;
					}
				}
				break;
			}
		}
		if (i >= end) {
			return;
		}

		if (nameOnly) {
			attributes[name] = true;
		} else {
			const quote = source[i] === '"' ? '"' : source[i] === "'" ? "'" : '';
			let value;
			if (quote) {
				const valueEnd = source.indexOf(quote, i + 1);
				if (valueEnd < 0) {
					return;
				}
				value = source.slice(i + 1, valueEnd);
				i = valueEnd + 1;
			} else {
				const valueStart = i;
				while (!isWS(source[i]) && source[i] !== '>') {
					i++;
				}
				value = source.slice(valueStart, i);
				i++;
			}
			attributes[name] = value;
		}
	}
}

/**
 *
 * @param {string} source
 * @param {string} tag
 * @param {number} start
 * @returns {{content:string,end:number}|void}
 */
function parseContent(source, tag, start) {
	const closing = `</${tag}`;
	let closingStart = source.indexOf(closing, start);
	let end = closingStart;
	if (end < 0) {
		return;
	} else {
		end += closing.length;
		while (source[end] !== '>') {
			end++;
			if (end > source.length) {
				return;
			}
		}
	}
	const content = source.slice(start, closingStart);
	return { content, end };
}

/**
 * @param {string} source
 * @param {import('./public.d.ts').SplitOptions} options
 * @param {number} stopAt
 * @returns {import('./public.d.ts').Tag[]}
 */
function parseFromEnd(source, options, stopAt) {
	/**@type {import('./public.d.ts').Tag[]}*/
	const result = [];
	/**@type {import('./public.d.ts').Tag | undefined}*/
	let tag;
	// eslint-disable-next-line no-cond-assign
	while ((tag = prevTag(source, options, tag ? tag.pos.start - 1 : source.length - 1, stopAt))) {
		result.unshift(tag);
	}
	return result;
}

/**
 * @param {string} source
 * @param {import('./public.d.ts').SplitOptions} options
 * @param {number} start
 * @param {number} stopAt
 * @returns {import('./public.d.ts').Tag | void}
 */
function prevTag(source, options, start, stopAt) {
	let i = start;
	let isEndOfSource = start === source.length - 1;
	while (i > stopAt) {
		if (isWS(source[i])) {
			i--;
		} else if (source[i] === '>') {
			if (source[i - 1] === '-' && source[i - 2] === '-') {
				const commentStart = source.lastIndexOf('<!--', i - 1);
				if (commentStart < stopAt) {
					return;
				}
				return {
					name: '$comment',
					pos: {
						start: commentStart,
						end: i
					},
					content: source.slice(commentStart + 4, i - 3)
				};
			} else {
				return parsePrevTag(source, options, i);
			}
		} else if (options.allowUnclosedComments && isEndOfSource) {
			while (i > stopAt) {
				if (source[i] === '>' && source[i - 1] === '-' && source[i - 2] === '-') {
					return;
				} else if (
					source[i] === '-' &&
					source[i - 1] === '-' &&
					source[i - 2] === '!' &&
					source[i - 3] === '<'
				) {
					return {
						name: '$comment',
						pos: {
							start: i - 3,
							end: start
						},
						content: source.slice(i - 3)
					};
				}
				i--;
			}
		} else {
			return;
		}
	}
}

/**
 * @param {string} source
 * @param {import('./public.d.ts').SplitOptions} options
 * @param {number} to
 * @returns {import('./public.d.ts').Tag | void}
 */
function parsePrevTag(source, options, to) {
	let i = to;
	let selfClosing = source[i - 1] === '/';
	if (selfClosing) {
		while (source[i] !== '<') {
			if (source[i] === '"') {
				i = source.lastIndexOf('"', i) - 4;
			} else if (source[i] === "'") {
				i = source.lastIndexOf("'", i) - 4;
			} else {
				i--;
			}
		}
		return parseTag(source, options, i);
	} else {
		const nameStart = source.lastIndexOf('</', i) + 2;
		const name = options.tags.find((tag) => {
			const len = tag.length;
			for (let i = 0; i < len; i++) {
				if (tag[i] !== source[nameStart + i]) {
					return false;
				}
			}
			const next = nameStart + len + 1;
			return next === i || isWS(source[next]);
		});
		if (name) {
			const openStart = source.lastIndexOf(`<${name}`, nameStart - name.length - 2);
			return parseTag(source, options, openStart, name);
		}
	}
}
