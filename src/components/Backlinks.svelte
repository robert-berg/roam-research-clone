<script>
	import { links } from "../scripts/data";
	import { onMount, onDestroy, afterUpdate } from "svelte";
	import { goto } from "@sapper/app";
	import { ModalStore, BlockStore } from "../scripts/store";
	import convertPageReferenceToLabel from "./editor_utils/convertPageReferenceToLabel";
	import referenceClickHandler from "./editor_utils/referenceClickHandler";
	import BacklinkPage from "./BacklinkPage.svelte";
	import { createTree } from "../scripts/data";
	import { get } from "svelte/store";

	export let currentPage;
	let backlinks = [];
	const unsubscribeBlockStore = BlockStore.subscribe((b) => {
		updateBacklinks(b);
	});
	afterUpdate(() => {
		updateBacklinks(get(BlockStore));
	});

	function updateBacklinks(blocks) {
		let linkList = [];
		links.forEach((link) => {
			if (link.target === currentPage) {
				linkList.push({
					page: blocks[link.source],
					block: blocks[link.block_id],
				});
			}
		});
		backlinks = linkList;
	}

	onDestroy(() => {
		unsubscribeBlockStore();
	});
</script>

{#if backlinks.length > 0}

	<div class="backlinks">

		<strong>Linked References</strong>
		{#each backlinks as backlink, i (i)}
			<li
				on:click={() => {
					referenceClickHandler(backlink.page.id);
				}}
			>

				{#if backlink.page.content}{convertPageReferenceToLabel(backlink.page.content)}{:else}untitled{/if}
			</li>
			<BacklinkPage page={createTree(backlink.block.id, false)} />
		{/each}
	</div>
{/if}

<style>
	.backlinks li {
		list-style: none;
		cursor: pointer;
		opacity: 0.7;
		margin-top: 12px;
		border-radius: 3px;
		padding: 4px 8px;
	}

	.backlinks strong {
		opacity: 0.8;
	}

	.backlinks {
		padding-top: 24px;
		transition: 0.4s;
		max-width: 708px;
		margin: auto;
		overflow-y: auto;
		margin-left: 0;
		margin-top: 24px;
	}
	.backlinks li:hover {
		background: var(--backlinks-page-title-hover);
		opacity: 0.72;
	}
</style>
