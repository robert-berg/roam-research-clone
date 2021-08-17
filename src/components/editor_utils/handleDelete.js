import handleBackspace from "./handleBackspace";
import getSelectionTextInfo from "./getSelectionTextInfo";

export default function handleDelete(evt, blockElement, index, page, documentBlockElements, blocks) {
	if (getSelectionTextInfo(blockElement).atEnd) {
		return handleBackspace(evt, blockElement, index + 1, page, documentBlockElements, blocks);
	}
}
