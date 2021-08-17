import { get } from "svelte/store";
import createPage from "../../scripts/createPage";
import { goto } from "@sapper/app";
import { ModalStore } from "../../scripts/store";
import { tick } from "svelte";

export default async function referenceClickHandler(referenceID, referenceTitle = undefined) {
	if (referenceID === undefined) {
		referenceID = createPage(referenceTitle);
	}

	if (get(ModalStore) === undefined) {
		goto("pages/" + referenceID);
	} else {
		ModalStore.update((curr) => {
			return referenceID;
		});
	}
}
