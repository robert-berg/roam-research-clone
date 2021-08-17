import { BlockStore } from "../../scripts/store";

export default function handleTab(evt, focusedBlock, idx, page, blocks, documentBlockElements) {
	evt.preventDefault();
	const aboveBlock = page.blocks[idx - 1];

	if (aboveBlock.indentation === focusedBlock.indentation) {
		if (aboveBlock.collapsed_self) {
			return;
		}
		blocks[aboveBlock.block_id].blocks = [focusedBlock.block_id];
	} else if (aboveBlock.indentation > focusedBlock.indentation) {
		blocks[aboveBlock.parent_id].blocks.push(focusedBlock.block_id);
	} else {
		return;
	}

	let newParenBtlocks = [];

	blocks[focusedBlock.parent_id].blocks.forEach((blockId) => {
		if (blockId !== focusedBlock.block_id) {
			newParenBtlocks.push(blockId);
		}
	});
	blocks[focusedBlock.parent_id].blocks = newParenBtlocks;
	BlockStore.update((b) => b);
	documentBlockElements[idx].focus();
}
