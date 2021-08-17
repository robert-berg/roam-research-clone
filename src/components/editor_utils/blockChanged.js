import updateBlock from "./updateBlock";
import getCaretCharacterOffsetWithin from "./getCaretCharacterOffsetWithin";
import SetCaretPosition from "./SetCaretPosition";
import { tick } from "svelte";

export default function blockChanged(evt, index, page, documentBlockElements, blocks, tributeIsActive) {
	if (evt.keyCode == 17 || evt.keyCode == 18) {
		return;
	}

	const block = page.blocks[index];
	const blockElement = documentBlockElements[index];
	const charOffSet = getCaretCharacterOffsetWithin(blockElement);

	if (document.getSelection().toString().length > 0) {
	} else if (evt.keyCode == 9 || evt.keyCode == 8 || evt.keyCode == 46 || evt.keyCode == 40 || evt.keyCode == 13 || evt.keyCode == 38) {
		evt.preventDefault;
		return;
	} else {
		updateBlock(block, blockElement, page, false, true, blocks);
		(async () => {
			await tick();
			SetCaretPosition(documentBlockElements[index], charOffSet);
		})();
	}
}
