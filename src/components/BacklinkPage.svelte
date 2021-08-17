<script>
	import extractLinksInBlock from "../scripts/extractLinksInBlock";

	import { afterUpdate, onMount, tick, onDestroy, beforeUpdate } from "svelte";
	import "showdown-prettify";
	import { ModalStore, setDragged, BlockStore, getDragged } from "../scripts/store";
	import { createTree } from "../scripts/data";
	import { get } from "svelte/store";
	import { goto } from "@sapper/app";
	import handleDroppedBlock from "./editor_utils/handleDroppedBlock";
	import pasteHandler from "./editor_utils/pasteHandler";
	import blockChanged from "./editor_utils/blockChanged";
	import keydown from "./editor_utils/keydown";
	import handleFocusOut from "./editor_utils/handleFocusOut";
	import convertBlockHTML from "./editor_utils/convertBlockHTML";
	import toggleExpandBlock from "./editor_utils/toggleExpandBlock";

	export let page;

	let documentBlockElements = [];
	let blocks = [];

	const unsubscribeBlockStore = BlockStore.subscribe((b) => {
		page = createTree(page.id, false);
		blocks = b;
	});

	onDestroy(() => {
		unsubscribeBlockStore();
	});

	let tributeIsActive = null;
	let tribute = null;

	onMount(() => {
		import("../scripts/initTribute").then((t) => {
			tributeIsActive = t.tributeIsActive;
			tribute = t;
		});
	});

	afterUpdate(async () => {
		page = createTree(page.id);

		blocks = get(BlockStore);
		if (process.browser) window.savePersistentDataStorage();
	});
</script>

<div style=" border-radius: 4px; padding-left: 32px; margin-top: 8px; padding-bottom: 14px; " class="backlink-page">

	{#each page.blocks as block, j (block.block_id)}
		<div
			class="block"
			style=" display: flex; flex-grow: 1; "
			on:dragover={(event) => {
				event.preventDefault();
				event.target.classList.add('draggedover');
			}}
			on:dragleave={(event) => {
				event.preventDefault();
				event.target.classList.remove('draggedover');
			}}
			on:drop={async (evt) => {
				handleDroppedBlock(getDragged(), j, page);
				evt.target.classList.remove('draggedover');
				document.body.classList.remove('dragging');
				await tick();
				handleFocusOut(j, page, documentBlockElements, blocks);
			}}
		>

			{#each { length: block.indentation } as _, i}
				<span style="margin-right:36px; border-left: 1px solid var(--block-line-color); pointer-events: none; " />
			{/each}

			<div style=" position: relative; margin-left:16px; display: flex; flex-grow: 1; max-width: 100% ">

				{#if block.childIds.length > 0}
					<div
						class="collapse"
						on:click={() => {
							toggleExpandBlock(block.block_id, blocks);
						}}
					>
						{#if block.collapsed_self}
							<svg style="transform: rotate(-85deg);" width="20" height="20" viewBox="0 0 20 20" class="">
								<path d="M13.75 9.56879C14.0833 9.76124 14.0833 10.2424 13.75 10.4348L8.5 13.4659C8.16667 13.6584 7.75 13.4178 7.75 13.0329L7.75 6.97072C7.75 6.58582 8.16667 6.34525 8.5 6.5377L13.75 9.56879Z" stroke="none" fill="currentColor" />
							</svg>
						{:else}
							<svg width="20" height="20" viewBox="0 0 20 20" class="">
								<path d="M13.75 9.56879C14.0833 9.76124 14.0833 10.2424 13.75 10.4348L8.5 13.4659C8.16667 13.6584 7.75 13.4178 7.75 13.0329L7.75 6.97072C7.75 6.58582 8.16667 6.34525 8.5 6.5377L13.75 9.56879Z" stroke="none" fill="currentColor" />
							</svg>
						{/if}
					</div>
				{/if}
				<div
					class="zoom {block.collapsed_self ? 'zoom_collapsed_self' : ''}"
					draggable="true"
					on:dragstart={(event) => {
						event.target.classList.add('bullet-dragged');
						document.body.classList.add('dragging');
						setDragged(block.block_id);
					}}
					on:dragend={(event) => {
						event.target.classList.remove('bullet-dragged');
						document.body.classList.remove('dragging');
						setDragged(null);
					}}
					on:click={() => goto('pages/' + block.block_id).then(() => {
							ModalStore.set(undefined);
						})}
				/>
				<div
					style="line-height: 25px; outline: none; white-space: pre-wrap; white-space: -moz-pre-wrap; white-space: -pre-wrap; white-space: -o-pre-wrap; word-wrap: break-word; flex-grow: 1; max-width: 100%; padding-bottom: 0.2em; padding-top: 0.2em; margin: 0; "
					spellcheck="false"
					on:keydown={(event) => keydown(event, j, page, documentBlockElements, blocks, tributeIsActive)}
					on:keyup={(event) => blockChanged(event, j, page, documentBlockElements, blocks, tributeIsActive)}
					on:paste={pasteHandler}
					bind:this={documentBlockElements[j]}
					on:focusin={(ev) => {
						if (tribute) {
							try {
							} catch {}
							try {
								tribute.attachTribute(ev.target);
							} catch {
								console.log('Error tribute focuin');
							}
						}
					}}
					on:focusout={() => {
						try {
							extractLinksInBlock(documentBlockElements[j], page.blocks[j].block_id, page.root);
						} catch {
							console.log('Error focusout');
						}
					}}
					contenteditable
				>
					{@html convertBlockHTML(block.content, true)}
				</div>
			</div>

		</div>
	{/each}
</div>
