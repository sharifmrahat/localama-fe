<script lang="ts">
	import '../app.css';
	import favicon from '/src/lib/assets/images/localama-logo.jpg';
	import { ModeWatcher } from 'mode-watcher';
	import Header from '$lib/components/common/Header.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<Header />
<div class="bg-slate-50 dark:bg-slate-800">
	{@render children?.()}
</div>
