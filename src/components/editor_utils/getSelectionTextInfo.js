export default function getSelectionTextInfo(el) {
	var atStart = false,
		atEnd = false;
	var selRange, testRange;
	if (window.getSelection) {
		var sel = window.getSelection();
		if (sel.rangeCount) {
			selRange = sel.getRangeAt(0);
			testRange = selRange.cloneRange();

			testRange.selectNodeContents(el);
			testRange.setEnd(selRange.startContainer, selRange.startOffset);
			atStart = testRange.toString() == "";

			testRange.selectNodeContents(el);
			testRange.setStart(selRange.endContainer, selRange.endOffset);
			atEnd = testRange.toString() == "";
		}
	} else if (document.selection && document.selection.type != "Control") {
		selRange = document.selection.createRange();
		testRange = selRange.duplicate();

		testRange.moveToElementText(el);
		testRange.setEndPoint("EndToStart", selRange);
		atStart = testRange.text == "";

		testRange.moveToElementText(el);
		testRange.setEndPoint("StartToEnd", selRange);
		atEnd = testRange.text == "";
	}

	return { atStart: atStart, atEnd: atEnd };
}
