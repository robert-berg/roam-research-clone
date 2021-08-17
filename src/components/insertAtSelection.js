export default function insertAtSelection(textBefore, textAfter) {
	if (window.getSelection) {
		var sel = window.getSelection();
		if (sel.rangeCount > 0) {
			var range = sel.getRangeAt(0);
			var startNode = range.startContainer,
				startOffset = range.startOffset;

			var startTextNode = document.createTextNode(textBefore);
			var endTextNode = document.createTextNode(textAfter);

			var boundaryRange = range.cloneRange();
			boundaryRange.collapse(false);
			boundaryRange.insertNode(endTextNode);
			boundaryRange.setStart(startNode, startOffset);
			boundaryRange.collapse(true);
			boundaryRange.insertNode(startTextNode);

			// Reselect the original text
			range.setStartAfter(startTextNode);
			range.setEndBefore(endTextNode);
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}
}
