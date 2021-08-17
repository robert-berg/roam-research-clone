import { label_page, links } from "./data";
import { BlockStore } from "../scripts/store";
import { get } from "svelte/store";
import findDuplicatePageTitles from "../components/editor_utils/findDuplicatePageTitles";

export default function updateTitle(pageId, oldContent, newContent) {
	const blocks = get(BlockStore);

	const label = newContent;

	if (findDuplicatePageTitles(pageId, label)) {
		return false;
	} else {
		let oldLabel = oldContent;
		delete label_page[oldContent];
		label_page.set(label, pageId);

		function replaceLink(x) {
			return x.replace(new RegExp(`\\[\\[${oldLabel}\\]\\]`), "[[" + label + "]]");
		}

		for (let i = 0; i < links.length; i += 1) {
			if (links[i].target === pageId) {
				blocks[links[i].block_id].content = replaceLink(blocks[links[i].block_id].content);
			}
		}
		BlockStore.update((b) => {
			return blocks;
		});
		if (process.browser) window.savePersistentDataStorage();
		return true;
	}
}
