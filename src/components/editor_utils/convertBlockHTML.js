import { converter } from "./converter";
import convertPageReferenceToLabel from "./convertPageReferenceToLabel";

export default function convertBlockHTML(html, convertMarkdown = false) {
	let newHTML = html.replace(/(<reference>)|(<\/reference>)/g, "");
	newHTML = newHTML.replace(/(<span>)|(<\/span>)/g, "");
	newHTML = convertPageReferenceToLabel(newHTML);
	newHTML = newHTML.replace(/(\[\[([^\n\[\[\]\]])+\]\])/g, "<reference>$&</reference>");

	if (convertMarkdown) {
		newHTML = converter
			.makeHtml(newHTML)
			.replace(/(<p>)|(<\/p>)/g, "")
			.replace(/(<span>)|(<\/span>)/g, "");
	}
	return newHTML;
}
