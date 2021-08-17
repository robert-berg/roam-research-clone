import updateBlock from "./updateBlock";
import updateTitle from "../../scripts/updateTitle";
import extractLinksInBlock from "../../scripts/extractLinksInBlock";
import { get } from "svelte/store";
import { ViewStore } from "../../scripts/store";

export default function handleFocusOut(index, page, documentBlockElements, blocks) {
	try {
		const block = page.blocks[index];
		const blockElement = documentBlockElements[index];
		const oldContent = block.content;

		extractLinksInBlock(blockElement, block.block_id, page.root);
		updateBlock(block, blockElement, page, true, false, blocks);

		if (index === 0 && page.id === block.block_id && page.id === page.root) {
			updateTitle(page.id, oldContent, blocks[block.block_id].content);
			if (get(ViewStore).type === "Graph") {
				window.restart_graph();
			}
		}
	} catch {
		console.log("Error handleFocusOUT");
	}
}
