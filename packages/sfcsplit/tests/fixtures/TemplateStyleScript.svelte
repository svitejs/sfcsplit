<!-- comments are ignored -->
<svelte:options
	foo=bar
	bar="baz"
	blub
></svelte:options>
<svelte:options foo="bar"/>
<!--
comments are ignored
even if multiline
-->

<div>
	template
	<script>
		/*nested script not parsed*/
	</script>
	<style>
		/* nested style not parsed*/
	</style>
</div>

<!-- more comments -->

<style>
	/*style node parsed*/
	div {color: #ff3e00}
</style>

<!-- more comments -->

<style lang="scss">
	/*style node parsed*/
	$foo: #ff3e00;
	div {color: $foo}
</style>

<script lang="ts" context="module">
	const foo = '<script> </'+'script>'
</script>

<!-- more comments -->

<script>
	/* <script> </ script>*/
</script>

<!-- more comments -->
