declare module 'sfcsplit' {
	export function sfcsplit(source: string, options: SplitOptions): SFCSplitResult;
	/**
	 * options for sfcsplit
	 */
	interface SplitOptions {
		/**
		 * tags to parse, eg script, style
		 */
		tags: string[];
		/**
		 * add `raw` property to results returning the string from pos.start to pos.end
		 */
		includeRaw?: boolean;
		/**
		 * allow unclosed <!-- , to parse this correctly, split has to backtrack more and is slower as a result
		 */
		allowUnclosedComments?: boolean;
	}

	/**
	 * sfcsplit result
	 */
	interface SFCSplitResult {
		/**
		 * List of tags matching options.tags at start/end of source
		 */
		tags: Tag[];
		/**
		 * Comments at start/end of source. they can also appear between found tags
		 */
		comments: Tag[];
		/**
		 * The content between last found tag from start and first found tag from end
		 */
		template: Template;
	}

	interface Tag {
		name: string;
		pos: Position;
		attributes?: Record<string, string | boolean>;
		content?: string;
		raw?: string;
	}

	interface Template {
		pos: Position;
		raw?: string;
	}

	interface Position {
		start: number;
		end: number;
	}
}

//# sourceMappingURL=index.d.ts.map