<script lang="ts">
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';

	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
	import Input from '../ui/input/input.svelte';

	let { model = $bindable('gemma3:1b') } = $props<{ model?: string }>();
</script>

<header
	class="fixed flex w-full items-center justify-between bg-gray-50 px-14 py-5 shadow dark:bg-slate-900"
>
	<h1 class="text-xl font-bold text-blue-600">LOCALAMA</h1>

	<div>
		<Input
			type="text"
			placeholder="Model name"
			bind:value={model}
			class="w-full rounded border p-2"
		/>
	</div>

	<Button onclick={toggleMode} variant="outline" size="icon">
		<SunIcon
			class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
		/>
		<MoonIcon
			class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
		/>
		<span class="sr-only">Toggle theme</span>
	</Button>
</header>
