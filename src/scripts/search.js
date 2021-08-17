import Wade from "wade";
import { pages, label_page } from "./data";
import { BlockStore } from "./store";
import { get } from "svelte/store";

Wade.config.stopWords = [];

export let search = null;
let tempLabelsArray = [];

function createSearchIndex(s) {
	const blocks = get(BlockStore);
	tempLabelsArray = [];
	s = Wade(
		(() => {
			let v = [];
			pages.forEach((p) => {
				v.push(blocks[p]);
			});

			return v;
		})().map((node) => {
			tempLabelsArray.push(node.content);
			return node.content;
		})
	);

	if (process.browser) {
		window.tempLabelsArray = tempLabelsArray;
		window.wade = (() => {
			let v = [];
			pages.forEach((p) => {
				v.push(blocks[p]);
			});

			return v;
		})().map((node) => {
			return node.content;
		});
	}
	return s;
}

export function searchPage(q) {
	const blocks = get(BlockStore);
	const searchIndex = createSearchIndex(search);
	const results = searchIndex(q);
	return results.map((r) => {
		return {
			id: label_page.get(tempLabelsArray[r.index]),
			label: blocks[r.index].label,
		};
	});
}
