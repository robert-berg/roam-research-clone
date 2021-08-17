<script>
	import extractLinksInBlock from "../scripts/extractLinksInBlock";

	import { afterUpdate, onMount, tick, onDestroy } from "svelte";
	import "showdown-prettify";
	import { ModalStore, setDragged, BlockStore, getDragged, PageBannerMap } from "../scripts/store";
	import { createTree } from "../scripts/data";
	import { get } from "svelte/store";
	import Backlinks from "./Backlinks.svelte";
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
		page = createTree(page.id);
		blocks = b;
	});

	onDestroy(() => {
		unsubscribeBlockStore();
		for (let i = 0; i < page.blocks.length; i += 1) {
			handleFocusOut(i, page, documentBlockElements, blocks);
		}
		if (process.browser) window.savePersistentDataStorage();
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
		if (process.browser) {
			window.savePersistentDataStorage();
		}
	});
</script>

<div class="page">

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
				for (let i = 0; i < page.blocks.length; i += 1) {
					handleFocusOut(i, page, documentBlockElements, blocks);
				}
			}}
		>

			{#if block.indentation === 0}
				<div
					style=" padding-right: 44px; line-height: 48px; margin-bottom: 2px; width: 100%; outline: none; white-space: pre-wrap; overflow-wrap: break-word; font-size: 32px!important; font-weight: 400!important; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid var(--headline-underline-color); transition: .15s; line-height: 36px; "
					contenteditable
					placeholder="Untitled"
					bind:this={documentBlockElements[j]}
					on:keydown={(event) => keydown(event, j, page, documentBlockElements, blocks, tributeIsActive)}
					on:keyup={(event) => blockChanged(event, j, page, documentBlockElements, blocks, tributeIsActive)}
					on:paste={pasteHandler}
					on:focusin={() => {}}
					on:focusout={() => {
						handleFocusOut(j, page, documentBlockElements, blocks);
					}}
					spellcheck="false"
				>
					{@html convertBlockHTML(block.content, true)}
				</div>
			{:else}
				{#each { length: block.indentation - 1 } as _, i}
					<span class="line" />
				{/each}

				<div style="position: relative; margin-left:18px; display: flex; flex-grow: 1; max-width: 100% ">

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
						style="line-height: 25px; outline: none; white-space: pre-wrap; white-space: -moz-pre-wrap; white-space: -pre-wrap; white-space: -o-pre-wrap; word-wrap: break-word; flex-grow: 1; max-width: 100%; padding-bottom: 0.24em; padding-top: 0.2em; margin: 0; "
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
								handleFocusOut(j, page, documentBlockElements, blocks);
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
			{/if}

		</div>
	{/each}
	<Backlinks currentPage={page.id} />
</div>

<style>
	.line {
		margin-left: 2.5px;
		margin-right: 36px;
		border-left: 1px solid var(--block-line-color);
		pointer-events: none;
	}
</style>
