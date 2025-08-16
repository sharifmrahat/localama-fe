<script lang="ts">
	import Textarea from '../ui/textarea/textarea.svelte';
	import Button from '../ui/button/button.svelte';
	import { onDestroy, onMount } from 'svelte';
	import SendHorizontal from '@lucide/svelte/icons/send-horizontal';
	import CircleStop from '@lucide/svelte/icons/circle-stop';
	import Mic from '@lucide/svelte/icons/mic';
	import AudioLines from '@lucide/svelte/icons/audio-lines';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	let {
		prompt = $bindable(''),
		isStreaming = $bindable(false),
		startStream,
		stopStream
	} = $props<{
		prompt?: string;
		isStreaming?: boolean;
		startStream?: () => void;

		stopStream?: () => void;
	}>();

	// UI state
	let isRecording = $state(false);
	let isSpeaking = $state(false);

	// Speech Recognition instance
	let recognition: any | null = null;

	onMount(() => {
		if (typeof window !== 'undefined') {
			const SpeechRecognitionCtor =
				(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

			if (SpeechRecognitionCtor) {
				recognition = new SpeechRecognitionCtor();
				recognition.continuous = true;
				recognition.interimResults = true;
				recognition.lang = 'en-US';
			}
		}
	});

	// Start or stop recognition
	function toggleMic() {
		if (!recognition) return;

		if (!isRecording) {
			recognition.start();
			isRecording = true;
			recognition.onresult = (ev: any) => {
				let interim = '';
				let final = '';
				for (let i = ev.resultIndex; i < ev.results.length; ++i) {
					const r = ev.results[i];
					if (r.isFinal) final += r[0].transcript;
					else interim += r[0].transcript;
				}
				prompt =
					prompt.replace(/\[recording:.*\]$/, '') +
					(final ? final : '') +
					(interim ? `[recording:${interim}]` : '');
				if (final) {
					prompt = prompt.replace(/\[recording:.*\]$/, '').trimEnd();
				}
			};
			recognition.onerror = (e: any) => {
				console.error('Speech recognition error', e);
				stopMic();
			};
			recognition.onend = () => {
				if (isRecording) stopMic();
			};
		} else {
			stopMic();
		}
	}

	function stopMic() {
		if (!recognition) return;
		try {
			recognition.stop();
		} catch {}
		isRecording = false;
		prompt = prompt.replace(/\[recording:.*\]$/, '').trimEnd();
	}

	// Text-to-Speech
	function speakText(text?: string) {
		if (typeof window === 'undefined') return;
		const message = text ?? prompt;
		if (!message) return;
		if (!('speechSynthesis' in window)) return;

		if (isSpeaking) {
			window.speechSynthesis.cancel();
			isSpeaking = false;
			return;
		}

		const utter = new SpeechSynthesisUtterance(message);
		utter.lang = 'en-US';
		utter.onend = () => (isSpeaking = false);
		utter.onerror = () => (isSpeaking = false);
		isSpeaking = true;
		window.speechSynthesis.speak(utter);
	}

	// Send button pressed
	function onSend() {
		if (!prompt.trim()) return;
		startStream();

		isStreaming = true;
	}

	// Stop streaming
	function onStop() {
		stopStream();
		isStreaming = false;
	}

	// Cleanup
	onDestroy(() => {
		if (recognition && isRecording) {
			try {
				recognition.stop();
			} catch {}
		}
		if (typeof window !== 'undefined' && window.speechSynthesis && isSpeaking) {
			window.speechSynthesis.cancel();
		}
	});
</script>

<div class="fixed inset-x-0 bottom-0 mx-auto w-full p-2.5 lg:max-w-3xl">
	<!-- small helper / status -->
	<div class="my-2 flex items-center gap-3 text-xs text-gray-500">
		{#if isRecording}
			<span class="font-medium text-red-500">Recording...</span>
		{/if}
		{#if isSpeaking}
			<span>Playing...</span>
		{/if}
	</div>
	<div class="flex items-start gap-3">
		<!-- Textarea -->
		<div class="relative flex-1">
			<!-- svelte-ignore element_invalid_self_closing_tag -->
			<!-- svelte-ignore event_directive_deprecated -->
			<Textarea
				bind:value={prompt}
				placeholder="Type a message..."
				class="max-h-48 min-h-[120px] w-full resize-none rounded-lg border p-3 pr-28 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none dark:bg-slate-900 dark:text-white"
				onkeydown={(e) => {
					// send on Enter (shift+enter for newline)
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						if (!isStreaming) onSend();
						else onStop(); // optional: Enter can also stop while streaming
					}
				}}
			/>
			<!-- Right inline control group -->
			<div class="absolute top-2 right-2 flex items-center gap-2">
				<!-- Mic (speech-to-text) -->
				<!-- svelte-ignore a11y_consider_explicit_label -->

				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<Button
								type="button"
								onclick={toggleMic}
								class="0 flex h-9 w-9 items-center justify-center rounded-md  border p-1 shadow-sm"
								aria-pressed={isRecording}
							>
								<Mic />
							</Button>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>{isRecording ? 'Stop recording' : 'Record voice'}</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>

				<!-- Speaker (text-to-speech) -->
				<!-- svelte-ignore a11y_consider_explicit_label -->
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<Button
								type="button"
								onclick={() => speakText()}
								disabled={!prompt}
								class="flex h-9 w-9 items-center justify-center rounded-md border  p-1 shadow-sm "
							>
								<AudioLines />
							</Button>
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>Play Text</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			</div>

			<!-- Bottom-right action (Send / Stop) -->
			<div class="absolute right-2 bottom-2 flex items-center gap-2">
				{#if !isStreaming}
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger>
								<Button
									onclick={onSend}
									class="flex items-center gap-2 rounded-lg  px-4 py-2 text-sm font-medium  shadow"
									disabled={!prompt.trim()}
								>
									<SendHorizontal />
								</Button>
							</Tooltip.Trigger>
							<Tooltip.Content>
								<p>Send</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				{:else}
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger>
								<Button
									onclick={onStop}
									class="flex items-center gap-2 rounded-lg  px-4 py-2 text-sm font-medium  shadow "
								>
									<CircleStop />
								</Button>
							</Tooltip.Trigger>
							<Tooltip.Content>
								<p>Stop</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				{/if}
			</div>
		</div>
	</div>
</div>
