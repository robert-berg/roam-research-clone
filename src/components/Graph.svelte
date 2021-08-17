<script>
	import loadGraph from "../scripts/makegraph";
	import { simulationLinks, simulationNodes } from "../scripts/data.js";
	import { onMount, onDestroy } from "svelte";
	import { ModalStore } from "../scripts/store";
	import { goto } from "@sapper/app";

	let g = { remove: () => {} };
	let graphContainer;
	onMount(() => {
		g = loadGraph(
			simulationNodes(),
			simulationLinks(),
			(id) => {
				goto("/pages/" + id);
			},
			graphContainer
		);

		window.restart_graph = () => {
			g["remove"]();
			g = loadGraph(
				simulationNodes(),
				simulationLinks(),
				(id) => {
					ModalStore.set(id);
				},
				graphContainer
			);
		};
	});

	onDestroy(() => {
		g["remove"]();
	});
</script>

<div id="graph-container" bind:this={graphContainer} />

<style>
	#graph-container {
		width: 100%;
		height: 100%;
		position: relative;
		background: var(--graph-background);
	}
</style>
