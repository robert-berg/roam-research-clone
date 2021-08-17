import * as sapper from "@sapper/app";
import * as scss from "../static/global.scss";

sapper
	.start({
		target: document.querySelector("body"),
	})
	.then(() => {
		console.log("client-side app has started");
	});
