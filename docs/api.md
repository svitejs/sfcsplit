<!-- generated, do not modify -->
## API 

### sfcsplit

```ts
export function sfcsplit(source: string, options: SplitOptions): SFCSplitResult;
```

#### SplitOptions

```ts
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
```

#### SFCSplitResult

```ts
/**
 * sfcsplit result
 */
interface SFCSplitResult {
	/**
	 * found tags matching options.tags at start/end of source
	 */
	tags: Tag[];
	/**
	 * comments at start/end of source. they can also appear between found tags
	 */
	comments: Tag[];
	/**
	 * the content between last found tag from start and first found tag from end
	 */
	template: Template;
}
```

#### Template

```ts
interface Template {
	pos: Position;
	raw?: string;
}
```

#### Tag

```ts
interface Tag {
	name: string;
	pos: Position;
	attributes?: Record<string, string | boolean>;
	content?: string;
	raw?: string;
}
```

##### Position

```ts
interface Position {
	start: number;
	end: number;
}
```
