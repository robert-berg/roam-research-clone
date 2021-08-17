import convertBlockHTML from "./convertBlockHTML";
import getCaretCharacterOffsetWithin from "./getCaretCharacterOffsetWithin";
import SetCaretPosition from "./SetCaretPosition";
import { BlockChange, editBlockValues } from "./editBlockValue";
import convertToMarkdown from "./convertToMarkdown";
import findDuplicatePageTitles from "./findDuplicatePageTitles";

export default function updateBlock(block, blockElement, page, convertMarkdown = false, setCaret = true, blocks, callback = () => {}) {
	const offset = getCaretCharacterOffsetWithin(blockElement);
	const newHTML = convertBlockHTML(blockElement.innerHTML, convertMarkdown);
	const newValue = convertToMarkdown(newHTML);

	if (block.block_id == page.root) {
		if (newValue.length > 0 && findDuplicatePageTitles(block.block_id, newValue)) {
			return window.show_message("A page with the title '" + newValue + "' already exist");
		}
	}

	editBlockValues([new BlockChange(block.block_id, blocks[block.block_id].content, newValue)]);

	if (blockElement.innerHTML !== newHTML) {
		blockElement.innerHTML = newHTML;

		callback();
		if (setCaret) {
			SetCaretPosition(blockElement, offset);
		}
	}
}
