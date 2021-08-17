import { PinnedStore } from "../scripts/store";
export default function togglePinned(id) {
	PinnedStore.update((data) => {
		if (data.includes(id)) {
			data = data.filter((element, idx, arr) => {
				return element !== id;
			});
		} else {
			data.push(id);
		}
		return data;
	});
	if (process.browser) window.savePersistentDataStorage();
}
