import { pages } from "../../scripts/data";
import { BlockStore } from "../../scripts/store";
import { get } from "svelte/store";

export default function findDuplicatePageTitles(selfID, value) {
	let blocks = get(BlockStore);
	for (let i = 0; i < pages.length; i += 1) {
		let pageID = pages[i];
		if (pageID !== selfID && blocks[pageID].content == value) {
			return true;
		}
	}

	return false;
}
