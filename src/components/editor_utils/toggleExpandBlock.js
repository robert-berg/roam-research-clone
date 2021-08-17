import { editBlockValues } from "./editBlockValue";

export default function toggleExpandBlock(id, blocks) {
	blocks[id].collapsed = !blocks[id].collapsed;
	return editBlockValues([]);
}
