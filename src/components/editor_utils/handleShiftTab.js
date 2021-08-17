import { BlockStore } from "../../scripts/store";

export default function handleShiftTab(evt, focusedBlock, idx, page, blocks, documentBlockElements) {
	if (focusedBlock.indentation < 2) {
		return;
	}

	evt.preventDefault();

	if (page.blocks.length > idx + 1) {
		const belowBlock = page.blocks[idx + 1];

		if (belowBlock.indentation === focusedBlock.indentation || page.id === focusedBlock.parent_id) {
			return;
		}
	}

	let parentBlock;

	for (let block of page.blocks) {
		if (block.block_id === focusedBlock.parent_id) {
			parentBlock = block;
		}
	}

	// If has siblings below
	if (parentBlock.childIds[parentBlock.childIds.length - 1] !== focusedBlock.block_id) {
		return;
	}

	blocks[focusedBlock.parent_id].blocks.pop();

	outer: for (let block of page.blocks) {
		for (let childId of block.childIds) {
			if (childId === focusedBlock.parent_id) {
				blocks[block.block_id].blocks.splice(parentBlock.sibling_position + 1, 0, focusedBlock.block_id);
				break outer;
			}
		}
	}

	BlockStore.update((b) => b);
	documentBlockElements[idx].focus();
}
