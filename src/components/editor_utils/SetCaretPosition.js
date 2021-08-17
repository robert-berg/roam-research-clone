export default function SetCaretPosition(el, pos) {
	// Loop through all child nodes
	for (var node of el.childNodes) {
		if (node.nodeType == 3) {
			if (node.length >= pos) {
				var range = document.createRange(),
					sel = window.getSelection();
				range.setStart(node, pos);
				range.collapse(true);
				sel.removeAllRanges();
				sel.addRange(range);
				return -1;
			} else {
				pos -= node.length;
			}
		} else {
			pos = SetCaretPosition(node, pos);
			if (pos == -1) {
				return -1;
			}
		}
	}
	return pos;
}
