<script context="module">
	export async function preload(page, session) {
		let { id } = page.params;

		id = parseInt(id);

		return { id };
	}
</script>

<script>
	import { onMount, afterUpdate, tick } from "svelte";
	import { get } from "svelte/store";
	import Page from "../../components/Page.svelte";
	import { createTree } from "../../scripts/data";
	import { ViewStore, BlockStore } from "../../scripts/store";
	export let id;

	let page = null;

	afterUpdate(() => {
		openPage(id);
	});

	async function openPage(id) {
		page = {
			component: Page,
			props: {
				page: createTree(id),
			},
		};

		ViewStore.set({
			type: "Page",
			title: get(BlockStore)[id].content,
			details: {
				id: id,
			},
		});
		return true;
	}
</script>

{#if page}
	<svelte:component this={page.component} {...page.props} />
{/if}
