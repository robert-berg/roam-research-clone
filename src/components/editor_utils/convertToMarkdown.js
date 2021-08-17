import { converter } from "./converter";
import { label_page } from "../../scripts/data";

export default function convertToMarkdown(str) {
	str = str.replace(/(<reference>)|(<\/reference>)/g, "");
	str = str.replace(/(<span>)|(<\/span>)/g, "");
	str = str.replace(/(<font color="#65b8ff">)|(<\/font>)/g, "");
	str = str.replace(/(\[\[([^\n\[\[\]\]])+\]\])/g, function (match, capture) {
		const label = capture.slice(2, -2);
		const page_id = label_page.get(label);

		if (page_id) {
			return "[[{{{" + page_id + "}}}]]";
		} else {
			return capture;
		}
	});
	str = converter.makeMarkdown(str);
	return str;
}
