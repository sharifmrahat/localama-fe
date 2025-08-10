<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { marked } from 'marked';
	import Header from '$lib/components/common/Header.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';

	type ChatEntry = {
		role: 'user' | 'assistant';
		text: string;
		typing: boolean;
	};

	let model = 'gemma3:1b';
	let prompt = '';
	let error: string | null = null;
	let eventSource: EventSource | null = null;

	let history: ChatEntry[] = [];

	// Markdown setup
	marked.setOptions({ breaks: true });

	onMount(() => {
		const saved = localStorage.getItem('localama-history');
		if (saved) {
			history = JSON.parse(saved);
		}
	});

	function saveHistory() {
		localStorage.setItem('localama-history', JSON.stringify(history));
	}

	function startStream() {
		if (!prompt.trim() || !model.trim()) {
			error = 'Please enter both model and prompt.';
			return;
		}
		error = null;

		// Add user bubble
		history = [...history, { role: 'user', text: prompt, typing: false }];

		// Add assistant bubble with typing placeholder
		history = [...history, { role: 'assistant', text: '', typing: true }];
		saveHistory();

		const modelIndex = history.length - 1;
		let currentResponse = '';
		let streamEndedGracefully = false;

		eventSource = new EventSource(
			`http://localhost:5050/api/v1/chat/stream?model=${encodeURIComponent(
				model
			)}&prompt=${encodeURIComponent(prompt)}`
		);

		prompt = '';

		eventSource.onmessage = (event) => {
			try {
				const parsed = JSON.parse(event.data);
				if (parsed.message?.content) {
					currentResponse += parsed.message.content;
					history[modelIndex].text = currentResponse;
					history = [...history];
					saveHistory();
				}
				if (parsed.done) {
					streamEndedGracefully = true;
					history[modelIndex].typing = false;
					history = [...history];
					saveHistory();
					stopStream();
				}
			} catch {
				console.warn('Non-JSON SSE chunk', event.data);
			}
		};

		eventSource.onerror = () => {
			if (!streamEndedGracefully) {
				error = 'Stream connection failed.';
				history[modelIndex].typing = false;
				history = [...history];
				saveHistory();
			}
			stopStream();
		};
	}

	function stopStream() {
		if (eventSource) {
			eventSource.close();
			eventSource = null;

			// Get the last message (assistant's bubble)
			const lastIndex = history.length - 1;
			if (lastIndex >= 0 && history[lastIndex].role === 'assistant') {
				if (history[lastIndex].text.trim() === '') {
					// No content → remove the bubble
					history.splice(lastIndex, 1);
				} else {
					// Keep whatever text we got, remove typing status
					history[lastIndex].typing = false;
				}
				history = [...history];
				saveHistory();
			}
		}
	}

	onDestroy(() => stopStream());
</script>

<div class="flex min-h-screen flex-col bg-gray-50 dark:bg-slate-800">
	<Header bind:model />

	<main class="mx-auto mt-20 w-6xl flex-1 space-y-4 p-4">
		<ScrollArea class="mx-auto h-[24rem] w-6xl px-8 ">
			<!-- Chat history -->
			{#each history as message}
				{#if message.role === 'user'}
					<div class="flex justify-end">
						<div
							class="max-w-xl rounded-lg bg-blue-500 px-4 py-2.5 text-white shadow dark:text-black"
						>
							{message.text}
						</div>
					</div>
				{:else}
					<div class="flex justify-start">
						<div class="max-w-xl rounded-lg bg-gray-200 px-4 py-2 shadow dark:text-black">
							{#if message.typing && !message.text}
								<div class="typing-dots flex gap-1 text-gray-600">
									<span>•</span><span>•</span><span>•</span>
								</div>
							{:else}
								<div class="prose prose-sm max-w-none">
									{@html marked(
										message.text + (message.typing ? '<span class="cursor">|</span>' : '')
									)}
								</div>
							{/if}
						</div>
					</div>
				{/if}
			{/each}

			<!-- Error -->
			{#if error}
				<div class="mt-2 text-red-500">{error}</div>
			{/if}
		</ScrollArea>

		<!-- Input -->
		<div
			class="fixed bottom-0 mx-auto w-fit space-y-3 rounded bg-gray-50 p-4 text-black shadow lg:w-6xl dark:bg-slate-900 dark:text-white"
		>
			<Textarea
				placeholder="Enter your prompt..."
				bind:value={prompt}
				class="h-12 w-full rounded border p-2"
			></Textarea>

			<div class="flex cursor-pointer items-center gap-2">
				<Button
					variant="default"
					onclick={startStream}
					disabled={history.some((h) => h.typing)}
					class="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				>
					Send
				</Button>
				{#if eventSource}
					<Button
						variant="destructive"
						onclick={stopStream}
						class="cursor-pointer rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
					>
						Stop
					</Button>
				{/if}
			</div>
		</div>
	</main>
</div>

<style>
	.typing-dots span {
		display: inline-block;
		animation: blink 1.4s infinite both;
	}
	.typing-dots span:nth-child(2) {
		animation-delay: 0.2s;
	}
	.typing-dots span:nth-child(3) {
		animation-delay: 0.4s;
	}
	@keyframes blink {
		0%,
		80%,
		100% {
			opacity: 0;
		}
		40% {
			opacity: 1;
		}
	}
	@keyframes blinkCursor {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}
</style>
