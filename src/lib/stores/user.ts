import { writable } from 'svelte/store';

interface UserInfo {
	name: string;
	username: string;
	model: string;
}

export const isLoggedIn = writable(false);
export const username = writable('');
export const model = writable('');

export function loadUserFromStorage() {
	const data = localStorage.getItem('localama_userInfo');
	if (data) {
		try {
			const parsed: UserInfo = JSON.parse(data);
			username.set(parsed.username || '');
			model.set(parsed.model || '');
			isLoggedIn.set(true);
		} catch {
			isLoggedIn.set(false);
		}
	} else {
		isLoggedIn.set(false);
	}
}

export function logoutUser() {
	localStorage.removeItem('localama_userInfo');
	localStorage.removeItem('localama_chatHistory');
	isLoggedIn.set(false);
	username.set('');
	model.set('');
}
