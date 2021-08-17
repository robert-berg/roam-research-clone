let parent_id = null;
let parent_title = null;

export default function getParent(block_id, blocks) {
	let debug = [];

	for (let i = 0; i < blocks.length; i += 1) {
		for (let j = 0; j < blocks[i].blocks.length; j += 1) {
			debug.push({
				i: i,
				j: j,
				block_id: block_id,
				isSame: blocks[i].blocks[j] === block_id,
				blocks_j: blocks[i].blocks[j],
			});

			if (blocks[i].blocks[j] === block_id) {
				parent_title = blocks[i].content;
				parent_id = i;
				return { parentId: parent_id, parentTitle: parent_title };
			}
		}
	}

	return undefined;
}
