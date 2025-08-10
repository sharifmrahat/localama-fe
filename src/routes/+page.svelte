<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { marked } from 'marked';
	import Header from '$lib/components/common/Header.svelte';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import ChatInput from '$lib/components/chat/ChatInput.svelte';

	type ChatEntry = {
		role: 'user' | 'assistant';
		text: string;
		typing: boolean;
	};

	let model = $state('gemma3:1b');
	let prompt = $state('');
	let error: string | null = $state(null);
	let eventSource: EventSource | null = $state(null);
	let scrollAreaRef: HTMLDivElement | null = $state(null);

	let history: ChatEntry[] = $state([]);

	// Markdown setup
	marked.setOptions({ breaks: true });

	async function scrollToBottom() {
		await tick(); // wait for DOM update
		if (scrollAreaRef) {
			scrollAreaRef.scrollTop = scrollAreaRef.scrollHeight;
		}
	}

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
		scrollToBottom();

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
					scrollToBottom();
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

	let isStreaming = $state(false);

	function stopStream() {
		if (eventSource) {
			eventSource.close();
			eventSource = null;
			isStreaming = false;

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
		<div
			bind:this={scrollAreaRef}
			class="no-scrollbar mx-auto mb-20 h-[50rem] w-6xl overflow-y-auto px-8"
		>
			<!-- Chat history -->
			{#each history as message}
				{#if message.role === 'user'}
					<div class="my-10 flex justify-end">
						<div
							class="max-w-lg rounded-lg bg-blue-500 px-4 py-2.5 text-white shadow dark:text-black"
						>
							{message.text}
						</div>
					</div>
				{:else}
					<div class="flex justify-start">
						<div class="mb-10 max-w-lg rounded-lg bg-gray-200 px-4 py-2 shadow dark:text-black">
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
				<Alert.Root variant="destructive">
					<CircleAlertIcon class="size-4" />
					<Alert.Title>Error</Alert.Title>
					<Alert.Description>{error}</Alert.Description>
				</Alert.Root>
			{/if}
		</div>
		<ChatInput bind:model bind:prompt bind:isStreaming {startStream} {stopStream} />
	</main>
</div>

<style>
	@layer utilities {
		.no-scrollbar::-webkit-scrollbar {
			display: none; /* Chrome, Safari, Edge */
		}
		.no-scrollbar {
			-ms-overflow-style: none; /* IE and old Edge */
			scrollbar-width: none; /* Firefox */
		}
	}
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
