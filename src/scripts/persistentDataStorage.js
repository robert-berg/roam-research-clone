const dataStorageId = "savePersistentDataStorage";

import * as data from "./data";
import { buildelectron } from "./config";
import { setPinnedStore, PinnedStore, BlockStore, setBlockStore } from "./store";
import { get } from "svelte/store";

if (process.browser) {
	window.savePersistentDataStorage = () => {
		savePersistentDataStorage();
	};

	window.loadPersistentDataStorage = () => {
		loadPersistentDataStorage();
	};
}

export function initData() {
	window.useLoadedData = (loadedData) => {
		if (loadedData === undefined) {
			// app is used first time
		} else {
			data.setLabelPage(new Map(Object.entries(loadedData.label_page)));
			data.setPages(loadedData.pages);
			data.setProjects(loadedData.projects);
			setPinnedStore(loadedData.pinned);
			setBlockStore(loadedData.blocks);
			data.setLinks(loadedData.links);
		}
	};

	try {
		eval(`
	
			require('electron').ipcRenderer.on('mainprocess-response', (event, arg) => {
				window.useLoadedData(arg.data)
			})
			window.loadPersistentDataStorage() 
			`);
	} catch {
		//
	}
}

function savePersistentDataStorage() {
	if (buildelectron) {
		const args = {
			task: "save",
			id: dataStorageId,
			data: {
				label_page: Object.fromEntries(data.label_page),
				pages: data.pages,
				projects: data.projects,
				pinned: get(PinnedStore),
				blocks: get(BlockStore),
				links: data.links,
			},
		};
		try {
			eval("require('electron').ipcRenderer.send('request-mainprocess-action', " + JSON.stringify(args) + ")");
		} catch {
			//
		}
	}
}

export function loadPersistentDataStorage() {
	if (buildelectron) {
		const args = {
			task: "load",
			id: dataStorageId,
		};
		if (process.browser) {
			eval("require('electron').ipcRenderer.send('request-mainprocess-action', " + JSON.stringify(args) + ")");
		}
	}
}
