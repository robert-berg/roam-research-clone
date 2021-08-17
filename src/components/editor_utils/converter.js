import showdown from "showdown";

export const converter = new showdown.Converter({
	headerLevelStart: 1,
	simplifiedAutoLink: true,
	literalMidWordUnderscores: true,
	requireSpaceBeforeHeadingText: true,
	openLinksInNewWindow: true,
	strikethrough: true,
	smoothLivePreview: true,
	emoji: true,
	smartIndentationFix: true,
	extensions: ["prettify"],
});
