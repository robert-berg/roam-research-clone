import { get } from "svelte/store";
import { BlockStore } from "../../scripts/store";
import extractLinksInBlock from "../../scripts/extractLinksInBlock";
import getParent from "../../scripts/getParent";
import removeItemOnce from "../../scripts/removeItemOnce.js";
import { tick } from "svelte";
import getSelectionTextInfo from "./getSelectionTextInfo";
import placeCaretAtEnd from "./placeCaretAtEnd";
import convertBlockHTML from "./convertBlockHTML";
import updateBlock from "./updateBlock";
import handleFocusOut from "./handleFocusOut";
import getCaretCharacterOffsetWithin from "./getCaretCharacterOffsetWithin";
import SetCaretPosition from "./SetCaretPosition";
import { links, setLinks } from "../../scripts/data";

function pasteHtmlAtCaret(html) {
	var sel, range;
	if (window.getSelection) {
		// IE9 and non-IE
		sel = window.getSelection();

		if (sel.getRangeAt && sel.rangeCount) {
			range = sel.getRangeAt(0);
			var startNode = range.startContainer,
				startOffset = range.startOffset;
			range.deleteContents();

			// Range.createContextualFragment() would be useful here but is
			// only relatively recently standardized and is not supported in
			// some browsers (IE9, for one)
			var el = document.createElement("div");
			el.innerHTML = html;
			var frag = document.createDocumentFragment(),
				node,
				lastNode;
			while ((node = el.firstChild)) {
				lastNode = frag.appendChild(node);
			}
			range.insertNode(frag);

			var startTextNode = document.createTextNode("");
			var endTextNode = document.createTextNode("");

			var boundaryRange = range.cloneRange();
			boundaryRange.collapse(true);
			boundaryRange.insertNode(endTextNode);
			boundaryRange.setStart(startNode, startOffset);
			boundaryRange.collapse(true);
			boundaryRange.insertNode(startTextNode);

			// Reselect the original text
			range.setStartAfter(startTextNode);
			range.setEndBefore(endTextNode);
			sel.removeAllRanges();
			sel.addRange(range);
		}
	} else if (document.selection && document.selection.type != "Control") {
		// IE < 9
		document.selection.createRange().pasteHTML(html);
	}
}

export default async function handleBackspace(evt, blockElement, index, page, documentBlockElements, blocks) {
	if (index === 0) {
		return;
	}

	if (window.getSelection) {
		if (window.getSelection().toString().length > 0) {
			return;
		}
	}

	// Removing block
	async function removeBlockIfPossible(block, attachContentToAboveBlock) {
		evt.preventDefault();
		if (block.childIds.length > 0) {
			// Cant remove if has children
			return false;
		}

		try {
			const parentBlockObj = getParent(block.block_id, get(BlockStore));
			const parentId = parentBlockObj.parentId;

			const documentTargetBlock = documentBlockElements[index - 1];
			const targetBlock = page.blocks[index - 1];
			const deletedBlockContent = block.content;

			blocks[parentId].blocks = removeItemOnce(blocks[parentId].blocks, block.block_id);
			blocks[block.block_id].content = "";

			await tick();
			placeCaretAtEnd(documentTargetBlock);

			let linksWithoutRemovedBlock = [];
			links.forEach((l) => {
				if (l.block_id !== block.block_id) {
					linksWithoutRemovedBlock.push(l);
				}
			});
			setLinks(linksWithoutRemovedBlock);

			if (attachContentToAboveBlock) {
				pasteHtmlAtCaret(convertBlockHTML(deletedBlockContent, true));

				const charOffSet = getCaretCharacterOffsetWithin(documentTargetBlock);
				updateBlock(targetBlock, documentTargetBlock, page, true, true, blocks);
				(async () => {
					await tick();
					SetCaretPosition(documentTargetBlock, charOffSet);
				})();
			}
			await tick();

			BlockStore.update((b) => blocks);
		} catch {
			return;
		}
		return true;
	}

	try {
		if (documentBlockElements[index].innerText.replace(/\n$/, "").length > 0) {
			if (getSelectionTextInfo(blockElement).atStart) {
				if (index > 1) {
					return removeBlockIfPossible(page.blocks[index], true);
				} else {
					return;
				}
			} else {
				return;
			}
		} else {
			return removeBlockIfPossible(page.blocks[index], false);
		}
	} catch {
		console.log("ERROR handleBackspace");
	}
}
