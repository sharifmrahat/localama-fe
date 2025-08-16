<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import logo from '/src/lib/assets/images/localama.png';

	let year = new Date().getFullYear();

	function goToDocs() {
		goto('/docs');
	}

	function goToConnect() {
		goto('/connect');
	}
</script>

<div class="flex min-h-screen flex-col justify-between">
	<!-- Main content -->
	<main class="flex flex-1 flex-col items-center justify-center px-4 text-center">
		<img src={logo} alt="localama" class="mb-4 h-32 w-32 lg:h-42 lg:w-42 dark:invert" />

		<h1 class="mb-4 font-mono text-5xl font-bold lg:text-6xl">Localama</h1>
		<p class="mb-8 max-w-2xl text-muted-foreground">
			Localama is a lightweight, local AI chat system to run
			<a
				href="https://ollama.com"
				target="_blank"
				rel="noopener noreferrer"
				class="underline hover:text-primary"
			>
				Ollama
			</a>
			models directly on your own machine. Keep your data private, enjoy fast local inference, and experiment
			with different large language models without the cloud.
		</p>

		<div class="flex gap-4">
			<Button onclick={goToDocs} variant="outline">Docs</Button>
			<Button onclick={goToConnect}>Connect</Button>
		</div>
	</main>

	<!-- Footer -->
	<footer
		class="flex w-full flex-col items-center justify-between gap-4 border-t border-slate-200 px-6 py-4 text-sm text-muted-foreground lg:flex-row dark:border-slate-900"
	>
		<span>© {year} All rights reserved </span>
		<span
			>Made with passion by <a
				href="https://www.linkedin.com/in/sharifmrahat/"
				target="_blank"
				rel="noopener noreferrer"
				class="underline hover:text-primary"
			>
				Sharif
			</a>
		</span>
	</footer>
</div>
