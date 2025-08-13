<script lang="ts">
	import { onMount } from 'svelte';
	import { Input } from '../ui/input';
	import Button from '../ui/button/button.svelte';
	import { goto } from '$app/navigation';
	// import Loader2 from '@lucide/svelte/icons/loader2';

	let name = $state('');
	let username = $state('');
	let model = $state('');
	let connecting = $state(false);
	let errorMessage = $state('');

	onMount(() => {
		const saved = localStorage.getItem('localama_userInfo');
		if (saved) {
			goto('/chat');
		}
	});

	async function connect() {
		errorMessage = '';
		if (!name.trim() || !username.trim() || !model.trim()) {
			errorMessage = 'All fields are required';
			return;
		}

		connecting = true;

		try {
			// Step 1: Check BE health
			const healthRes = await fetch('http://localhost:5000/api/v1');
			if (!healthRes.ok) throw new Error('Backend not reachable!');

			const healthData = await healthRes.json();
			if (healthData.status !== 200) throw new Error('Backend not ready yet!');

			// Step 2: Check if model exists
			const modelRes = await fetch('http://localhost:5000/api/v1/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					model,
					prompt: 'test connection'
				})
			});

			if (!modelRes.ok) {
				const errData = await modelRes.json();
				throw new Error(errData.message || 'Model not found!');
			}

			// ✅ Save user info
			localStorage.setItem('localama_userInfo', JSON.stringify({ name, username, model }));

			// Redirect to home
			window.location.href = '/chat';
		} catch (err: any) {
			errorMessage = err.message;
		} finally {
			connecting = false;
		}
	}
</script>

<div class="mx-auto w-full max-w-md rounded-xl border bg-white p-6 shadow dark:bg-slate-900">
	<h1 class="mb-6 text-center text-2xl font-bold">Connect to Localama</h1>

	{#if errorMessage}
		<div class="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
			{errorMessage}
		</div>
	{/if}

	<div class="space-y-4">
		<div>
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="mb-1 block text-sm font-medium">Name</label>
			<Input type="text" bind:value={name} placeholder="Your name" />
		</div>

		<div>
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="mb-1 block text-sm font-medium">Username</label>
			<Input type="text" bind:value={username} placeholder="Your username" />
		</div>

		<div>
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label class="mb-1 block text-sm font-medium">Model</label>
			<Input type="text" bind:value={model} placeholder="e.g. llama3" />
		</div>

		<Button class="w-full" disabled={connecting} onclick={connect}>
			{#if connecting}
				<!-- <Loader2 class="mr-2 h-4 w-4 animate-spin" />  -->
				Connecting...
			{:else}
				Connect
			{/if}
		</Button>
	</div>
</div>
