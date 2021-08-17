import { BlockStore } from "../../scripts/store";
import { get } from "svelte/store";

export default function convertPageReferenceToLabel(str) {
	return str.replace(/(\[\[\{\{\{([^\n\[\[\]\]])+\}\}\}\]\])/g, function (match, capture) {
		const page_id = capture.slice(5, -5);
		const label = get(BlockStore)[page_id].content;
		if (label) {
			return "[[" + label + "]]";
		} else {
			return capture;
		}
	});
}
