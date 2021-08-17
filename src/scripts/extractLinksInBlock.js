import { links, setLinks, label_page, pushLink } from "./data";
import createPage from "./createPage";
import { ViewStore } from "./store";
import { get } from "svelte/store";

function partition(array, filter) {
	let pass = [],
		fail = [];
	array.forEach((e, idx, arr) => (filter(e, idx, arr) ? pass : fail).push(e));
	return [pass, fail];
}

function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length !== b.length) return false;
	for (var i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

export default function extractLinksInBlock(blockElement, blockId, currentPage) {
	// Find links in block
	const matches = [...new Set(blockElement.innerText.match(/(\[\[([^\n\[\[\]\]])+\]\])/g))];

	console.log(links);

	const partitionLinksList = partition(links, (element) => {
		return element.block_id !== blockId;
	});

	const oldLinksForBLock = partitionLinksList[1];
	setLinks(partitionLinksList[0]);

	let target = null;
	let newLinksForBLock = [];

	for (let i = 0; i < matches.length; i += 1) {
		createPage(matches[i].slice(2, -2));
		target = label_page.get(matches[i].slice(2, -2));

		pushLink({ source: currentPage, block_id: blockId, target: target });
		newLinksForBLock.push({
			source: currentPage,
			block_id: blockId,
			target: target,
		});
	}

	if (get(ViewStore).type === "Graph" && !arraysEqual(oldLinksForBLock, newLinksForBLock)) {
		window.restart_graph();
	}
	if (process.browser) window.savePersistentDataStorage();
}
