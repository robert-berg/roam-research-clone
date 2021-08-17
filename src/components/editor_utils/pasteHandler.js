export default function pasteHandler(evt) {
	evt.preventDefault();
	document.execCommand("insertHTML", false, (evt.originalEvent || evt).clipboardData.getData("text/plain"));
}
