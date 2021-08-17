import Tribute from "tributejs";
import { pages } from "./data";
import { BlockStore } from "./store";
import { get } from "svelte/store";

let values = (() => {
	let v = [];
	pages.forEach((p) => {
		v.push(get(BlockStore)[p]);
	});

	return v;
})();
let tribute = new Tribute({
	trigger: "[[",
	noMatchTemplate: "",
	lookup: "content",
	fillAttr: "content",
	replaceTextSuffix: "",
	containerClass: "autocomplete-container",
	values: values,
	selectTemplate: (item) => {
		if (item) {
			return "[[" + item.string + "";
		} else {
			return "[[";
		}
	},
	allowSpaces: false,
});

export function appendTributeValues(val) {
	values.indexOf(val) === -1 ? values.push(val) : {};
}

export function tributeIsActive() {
	return tribute.isActive;
}

export function attachTribute(element) {
	tribute.attach(element);
}

export function detachTribute(element) {
	tribute.detach(element);
}
