import handleFocusOut from "./handleFocusOut";
import getSelectionTextInfo from "./getSelectionTextInfo";
import { tick } from "svelte";
import convertToMarkdown from "./convertToMarkdown";
import extractLinksInBlock from "../../scripts/extractLinksInBlock";
import { BlockStore } from "../../scripts/store";

function splitParaAtCaret(focusedBlock) {
	var range, frag;
	range = window.getSelection().getRangeAt(0);
	range.setEndAfter(focusedBlock);

	let div = document.createElement("div");
	div.appendChild(range.cloneContents());

	if (div.innerText == "]]") {
		return "<div></div>";
	}

	range.extractContents(); //extract a document fragment - removes items from dom

	try {
		return div.getElementsByTagName("div")[0].innerHTML;
	} catch {
		return "<div></div>";
	}
}

export default function handleEnter(evt, focusedBlock, idx, blockElement, blocks, documentBlockElements, page) {
	evt.preventDefault();

	let newBlockContent = "";
	if (idx > 0) {
		newBlockContent = convertToMarkdown(splitParaAtCaret(blockElement));
	}

	handleFocusOut(idx, page, documentBlockElements, blocks);
	const newBlockId = blocks.length;

	const newBlock = {
		id: newBlockId,
		content: newBlockContent,
		plainText: "",
		type: "text",
		blocks: [],
	};
	blocks.push(newBlock);

	if (!focusedBlock.collapsed_self && (focusedBlock.indentation === 0 || focusedBlock.childIds.length > 0 /*&& !getSelectionTextInfo(blockElement).atStart*/)) {
		blocks[focusedBlock.block_id].blocks.unshift(newBlockId);
		console.log("object");
	} else {
		console.log("object2");
		blocks[focusedBlock.parent_id].blocks.splice(focusedBlock.sibling_position + 1, 0, newBlockId);
	}
	// debugger
	(async () => {
		await tick();
		try {
			documentBlockElements[idx + 1].focus();
			BlockStore.update((b) => blocks);
			extractLinksInBlock(documentBlockElements[idx + 1], newBlockId, page.root);
		} catch {
			console.log("ERROR handleEnter");
		}
	})();

	return;
}
