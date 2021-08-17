import { pages, label_page } from "./data";
import { get } from "svelte/store";
import { BlockStore } from "./store";

export default function createPage(title = "") {
	// debugger
	const blocks = get(BlockStore);
	if (title == null || title == "") {
		title = "";
	} else if (label_page.has(title)) {
		// Page exists
		return null;
	} else {
		label_page.set(title, blocks.length);
		if (process.browser) window.savePersistentDataStorage();
	}

	pages.push(blocks.length);

	const newPageID = blocks.length;
	blocks.push({
		id: newPageID,
		content: title,
		plainText: "",
		type: "text",
		blocks: [blocks.length + 1],
	});

	blocks.push({
		id: blocks.length,
		content: "",
		plainText: "",
		type: "text",
		blocks: [],
	});

	import("./initTribute").then((tribute) => {
		try {
			tribute.appendTributeValues(blocks[newPageID]);
		} catch {}
	});
	if (process.browser) window.savePersistentDataStorage();
	return newPageID;
}
