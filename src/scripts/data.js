import { buildelectron } from "./config";
import { BlockStore } from "./store";
import getParent from "./getParent";
import { get } from "svelte/store";
import { demoData } from "./demodata";
export let label_page = new Map([]);
export let pages = [];
export let projects = [];
export let links = [];

if (!buildelectron) {
	setLabelPage(new Map(Object.entries(demoData.label_page)));
	setPages(demoData.pages);
	setLinks(demoData.links);
}

export function setLabelPage(map) {
	label_page = map;
}
export function setPages(pagesUpdated) {
	pages = pagesUpdated;
}
export function setProjects(projectsUpdated) {
	projects = projectsUpdated;
}
export function setLinks(arr) {
	links = arr;
}

export function createTree(id, firstAutoExpand = true) {
	const blocks = get(BlockStore);

	function getBlockArray() {
		if (!firstAutoExpand && blocks[id].collapsed) {
			return [
				{
					block_id: id,
					collapsed_self: true,
					collapsed_inherited: false,
					parent_id: null,
					childIds: blocks[id].blocks,
					sibling_position: 0,
					indentation: 0,
					content: blocks[id].content,
				},
			];
		} else {
			return [
				{
					block_id: id,
					collapsed_self: false,
					collapsed_inherited: false,
					parent_id: null,
					childIds: blocks[id].blocks,
					sibling_position: 0,
					indentation: 0,
					content: blocks[id].content,
				},
				...(function orderHelper(arr, parent_id, parent_indentation) {
					let sibling_position = 0;

					return arr.flatMap((block_id) => {
						let collapsed = blocks[block_id].collapsed;
						return [
							{
								block_id: block_id,
								collapsed_self: collapsed,
								parent_id: parent_id,
								sibling_position: sibling_position++,
								childIds: blocks[block_id].blocks,
								indentation: parent_indentation + 1,
								content: blocks[block_id].content,
							},

							...(() => {
								if (collapsed) {
									return [];
								} else {
									return orderHelper(blocks[block_id].blocks, block_id, parent_indentation + 1);
								}
							})(),
						];
					});
				})(blocks[id].blocks, id, 0),
			];
		}
	}

	return {
		id: id,
		blocks: getBlockArray(),
		root: (function get_root_id(x) {
			let parent = getParent(x, blocks);
			if (parent) {
				return get_root_id(parent.parentId);
			}

			return x;
		})(id),
	};
}

export var simulationNodes = () => {
	let nodes = [];
	const blocks = get(BlockStore);

	pages.forEach((pageId) => {
		nodes.push(blocks[pageId]);
	});

	return nodes;
};

export var simulationLinks = () => {
	return JSON.parse(JSON.stringify(links.slice()));
};

export function getBlocks() {
	return blocks;
}

export function getPages() {
	return pages;
}

export function pushLink(link) {
	links.push(link);
}
