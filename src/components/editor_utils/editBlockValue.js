import { BlockStore } from "../../scripts/store";

// ctrl+z to go back in history
let history = [];
function ctrlZHandler() {
	if (history.length < 1) return;
	const lastAction = history.pop();
	BlockStore.update((blocks) => {
		blocks[lastAction.blockId].content = lastAction.oldValue;
		historyReversed.push(lastAction);
		return blocks;
	});
}

// ctrl+y to go forward in history
let historyReversed = [];

function ctrlYHandler() {
	if (historyReversed.length < 1) return;
	const reversedAction = historyReversed.pop();
	BlockStore.update((blocks) => {
		blocks[reversedAction.blockId].content = reversedAction.newValue;
		history.push(reversedAction);
		return blocks;
	});
}

if (process.browser) {
	document.addEventListener("keydown", function (event) {
		if (event.ctrlKey && event.key === "z") {
			ctrlZHandler();
		}
		if (event.ctrlKey && event.key === "y") {
			ctrlYHandler();
		}
	});
}

export class BlockChange {
	constructor(blockId, oldValue, newValue) {
		this.blockId = blockId;
		this.oldValue = oldValue;
		this.newValue = newValue;
	}
}

export function editBlockValues(BlockChangeArray) {
	BlockStore.update((blocks) => {
		for (let blockChange of BlockChangeArray) {
			blocks[blockChange.blockId].content = blockChange.newValue;
			history.push(blockChange);
		}

		return blocks;
	});
}
