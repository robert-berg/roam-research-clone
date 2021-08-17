import { writable, get } from "svelte/store";
import * as data from "./data";
import { demoData } from "./demodata";
import { buildelectron } from "./config";
const ViewStore = writable("");
const ModalStore = writable(undefined);
let PinnedStore = writable([]);
let BlockStore = writable([]);
let PageBannerMap = new Map([]);

if (!buildelectron) {
	PinnedStore = writable(demoData.pinned);
	BlockStore = writable(demoData.blocks);
}

if (process.browser) {
	window.logdata = () =>
		console.log({
			label_page: Object.fromEntries(data.label_page),
			pages: data.pages,
			pinned: get(PinnedStore),
			blocks: get(BlockStore),
			links: data.links,
		});
}

function setPinnedStore(arr) {
	PinnedStore.update((_) => {
		return arr;
	});
}

function setBlockStore(arr) {
	BlockStore.update((_) => {
		return arr;
	});
}

let Dragged = null;

function setDragged(dID) {
	Dragged = dID;
}

function getDragged() {
	return Dragged;
}

export { ViewStore, ModalStore, setDragged, getDragged, setBlockStore, BlockStore, setPinnedStore, PinnedStore, PageBannerMap };
