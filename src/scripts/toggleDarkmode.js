import * as localStorage from "./localStorage";
import * as constants from "./constants";

let themes = ["light", "dark"];
let themesColors = ["#27292C", "#27292C"];

export function getCurrentThemeID() {
	let activeTheme = localStorage.getValue(constants.ACTIVE_THEME);
	if (activeTheme) {
		return activeTheme;
	}
	return 0;
}

export function getNextThemeID() {
	let nextThemeID = getCurrentThemeID() + 1;
	if (nextThemeID > themes.length - 1) {
		return 0;
	}
	return nextThemeID;
}

if (process.browser) {
	toggleTheme(getCurrentThemeID());
}

export function toggleTheme(themeID) {
	document.body.dataset.theme = themes[themeID];
	localStorage.setValue(constants.ACTIVE_THEME, themeID);
	document.querySelector("#theme-color").content = themesColors[themeID];
}
