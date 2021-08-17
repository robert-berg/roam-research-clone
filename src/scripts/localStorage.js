export function getValue(key) {
	return JSON.parse(window.localStorage.getItem(key));
}

export function setValue(key, value) {
	return window.localStorage.setItem(key, JSON.stringify(value));
}
