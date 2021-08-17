import getParent from "../../scripts/getParent";
import { get } from "svelte/store";
import { BlockStore, setBlockStore } from "../../scripts/store";

export default function handleDroppedBlock(sourceBlockID, targetBlockIndex, page) {
	try {
		const targetBlock = page.blocks[targetBlockIndex];
		if (targetBlock.block_id === sourceBlockID) {
			return;
		}
		let source_in_parent_detected = false;
		let oldParentID = getParent(sourceBlockID, get(BlockStore)).parentId;
		(function detect_if_source_in_parents_recursion(id) {
			let parent = getParent(id, get(BlockStore));
			if (parent) {
				if (parent.parentId == sourceBlockID) {
					source_in_parent_detected = true;
					return;
				}
				return detect_if_source_in_parents_recursion(parent.parentId);
			}
		})(targetBlock.block_id);

		if (source_in_parent_detected) {
			return;
		}

		BlockStore.update((b) => {
			let blocks = [...b];
			const newSourceParent = getParent(sourceBlockID, blocks).parentId;
			let newSourceParentBlocks = [];

			// Remove block from parent child blocks
			let removedIndex = null;
			blocks[newSourceParent].blocks.forEach((blockId, i) => {
				if (blockId !== sourceBlockID) {
					newSourceParentBlocks.push(blockId);
				} else {
					removedIndex = i;
				}
			});
			blocks[newSourceParent].blocks = newSourceParentBlocks;

			if (targetBlock.indentation === 0 || targetBlock.childIds.length > 0) {
				blocks[targetBlock.block_id].blocks.unshift(sourceBlockID);
			} else {
				// Check if item above was deleted and position needs to be one less
				if (targetBlock.parent_id == oldParentID && removedIndex < targetBlockIndex) {
					blocks[targetBlock.parent_id].blocks.splice(targetBlock.sibling_position, 0, sourceBlockID);
				} else {
					blocks[targetBlock.parent_id].blocks.splice(targetBlock.sibling_position + 1, 0, sourceBlockID);
				}
			}

			console.log(blocks);
			return blocks;
		});
	} catch {
		console.log("ERROR handleDroppedBlock");
	}
}
