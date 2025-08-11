<script lang="ts">
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let isLoggedIn = $state(false);
	let model = $state('');
	let fullName = $state('');
	let username = $state('');

	$effect(() => {
		const userInfo = localStorage.getItem('localama_userInfo');
		if (userInfo) {
			try {
				const parsed = JSON.parse(userInfo);
				fullName = parsed.name;
				username = parsed.username || '';
				model = parsed.model || '';
				isLoggedIn = true;
			} catch {
				isLoggedIn = false;
			}
		}
	});

	function goToDocs() {
		goto('/docs');
	}

	function goToConnect() {
		goto('/connect');
	}

	function goToChat() {
		goto('/chat');
	}

	function logout() {
		localStorage.removeItem('localama_userInfo');
		localStorage.removeItem('localama_chatHistory');
		isLoggedIn = false;
		goto('/');
	}
</script>

<header
	class="fixed z-50 flex w-full items-center justify-between bg-gray-50 px-4 py-5 shadow lg:px-14 dark:bg-slate-900"
>
	<a href="/" class="font-mono text-xl font-bold text-gray-800 lg:text-2xl dark:text-gray-100">
		Localama
	</a>

	{#if isLoggedIn && $page.url.pathname === '/chat'}
		<div class="flex items-center gap-4">
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<span class="rounded border bg-gray-100 px-3 py-1 dark:bg-slate-700 dark:text-white">
							{model}
						</span>
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>Model Name</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		</div>
	{/if}

	<div class="flex items-center gap-4">
		{#if !isLoggedIn}
			<!-- Home page buttons -->
			{#if $page.url.pathname === '/'}
				<Button onclick={goToDocs} variant="outline">Docs</Button>
				<Button onclick={goToConnect}>Connect</Button>
			{/if}
		{:else if $page.url.pathname === '/'}
			<!-- Logged in, on Home -->
			<Button onclick={goToDocs} variant="outline">Docs</Button>
			<Button onclick={goToChat}>Chat</Button>
		{:else if $page.url.pathname === '/chat'}
			<!-- Logged in, on Chat -->
			<div class="flex items-center gap-4">
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<Button variant="outline" size="sm">{fullName}</Button>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>@{username}</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>

				<Button onclick={logout} variant="destructive" size="sm" class="cursor-pointer"
					>Logout</Button
				>
			</div>
		{/if}

		<!-- Dark/Light toggle -->
		<Button onclick={toggleMode} variant="outline" size="icon">
			<SunIcon
				class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 !transition-all dark:scale-0 dark:-rotate-90"
			/>
			<MoonIcon
				class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 !transition-all dark:scale-100 dark:rotate-0"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
	</div>
</header>
