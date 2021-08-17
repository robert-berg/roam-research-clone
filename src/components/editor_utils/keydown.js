import SetCaretPosition from "./SetCaretPosition";
import insertAtSelection from "../insertAtSelection";
import updateBlock from "./updateBlock";
import handleBackspace from "./handleBackspace";
import handleShiftTab from "./handleShiftTab";
import handleTab from "./handleTab";
import handleDelete from "./handleDelete";
import handleEnter from "./handleEnter";
import extractLinksInBlock from "../../scripts/extractLinksInBlock";
import getCaretCharacterOffsetWithin from "./getCaretCharacterOffsetWithin";
import placeCaretAtEnd from "./placeCaretAtEnd";
import { tick } from "svelte";

function isAtTextEnd() {
	var sel = window.getSelection(),
		offset = sel.focusOffset;
	sel.modify("move", "forward", "character");
	if (offset == sel.focusOffset) return true;
	else {
		sel.modify("move", "backward", "character");
		return false;
	}
}

/**
 * Get the caret position in all cases
 *
 * @returns {object} left, top distance in pixels
 */
function getCaretTopPoint() {
	const sel = document.getSelection();
	const r = sel.getRangeAt(0);
	let rect;
	let r2;
	// supposed to be textNode in most cases
	// but div[contenteditable] when empty
	const node = r.startContainer;
	const offset = r.startOffset;
	if (offset > 0) {
		// new range, don't influence DOM state
		r2 = document.createRange();
		r2.setStart(node, offset - 1);
		r2.setEnd(node, offset);
		// https://developer.mozilla.org/en-US/docs/Web/API/range.getBoundingClientRect
		// IE9, Safari?(but look good in Safari 8)
		rect = r2.getBoundingClientRect();

		return { left: rect.right, top: rect.top };
	} else if (offset < node.length) {
		r2 = document.createRange();
		// similar but select next on letter
		r2.setStart(node, offset);
		r2.setEnd(node, offset + 1);
		rect = r2.getBoundingClientRect();

		return { left: rect.left, top: rect.top };
	} else {
		// textNode has length
		// https://developer.mozilla.org/en-US/docs/Web/API/Element.getBoundingClientRect
		rect = node.getBoundingClientRect();
		const styles = getComputedStyle(node);
		const lineHeight = parseInt(styles.lineHeight);
		const fontSize = parseInt(styles.fontSize);
		// roughly half the whitespace... but not exactly
		const delta = (lineHeight - fontSize) / 2;

		return { left: rect.left, top: rect.top + delta };
	}
}

export default function keydown(evt, index, page, documentBlockElements, blocks, tributeIsActive) {
	if (evt.key == "[") {
		insertAtSelection("[", "]");
		evt.preventDefault();
	}

	if (evt.key == "(") {
		insertAtSelection("(", ")");
		evt.preventDefault();
	}

	if (evt.keyCode == 17 || evt.keyCode == 18) {
		return;
	}

	const block = page.blocks[index];
	const blockElement = documentBlockElements[index];

	if (evt.keyCode == 9) {
		if (index === 0) {
			return;
		}
		if (evt.shiftKey) {
			return handleShiftTab(evt, block, index, page, blocks, documentBlockElements);
		}
		return handleTab(evt, block, index, page, blocks, documentBlockElements);
	}

	if (evt.shiftKey) {
		if (evt.keyCode === 13) {
			return evt.preventDefault();
		}
		return;
	}

	switch (evt.keyCode) {
		case 8:
			handleBackspace(evt, blockElement, index, page, documentBlockElements, blocks);

			break;
		case 46:
			handleDelete(evt, blockElement, index, page, documentBlockElements, blocks);

			break;

		case 37:
			if (index > 0 && getCaretCharacterOffsetWithin(documentBlockElements[index]) === 0) {
				evt.preventDefault();
				placeCaretAtEnd(documentBlockElements[index - 1]);
			}
			break;

		case 39:
			if (isAtTextEnd()) {
				if (documentBlockElements.length > index + 1) {
					evt.preventDefault();
					try {
						documentBlockElements[index + 1].focus();
					} catch (error) {}
				}
			}

			break;

		case 40:
			if (!tributeIsActive()) {
				if (isAtTextEnd() && documentBlockElements.length > index + 1) {
					evt.preventDefault();
					try {
						documentBlockElements[index + 1].focus();
						updateBlock(block, blockElement, page, true, true, blocks);
					} catch {
						console.log("ERROR Case 40");
					}
				}
			}
			break;
		case 38:
			if (!tributeIsActive()) {
				if (getCaretCharacterOffsetWithin(documentBlockElements[index]) === 0 && index > 0) {
					evt.preventDefault();
					documentBlockElements[index - 1].focus();
					placeCaretAtEnd(documentBlockElements[index - 1]);
					updateBlock(block, blockElement, page, true, true, blocks);
				}
			}
			break;
		case 13:
			if (!tributeIsActive()) {
				console.log("CASE 13");
				evt.preventDefault();
				extractLinksInBlock(blockElement, block.block_id, page.root);
				handleEnter(evt, block, index, blockElement, blocks, documentBlockElements, page);
			} else {
				setTimeout(() => {
					const charOffSet = getCaretCharacterOffsetWithin(blockElement);
					updateBlock(block, blockElement, page, true, true, blocks);
					(async () => {
						await tick();
						SetCaretPosition(documentBlockElements[index], charOffSet + 2);
					})();
				}, 10);
			}
			break;
		default:
			return;
	}
}
