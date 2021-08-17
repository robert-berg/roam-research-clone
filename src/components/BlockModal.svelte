<script>
	import { MDCDialog } from "@material/dialog";
	import { onMount, afterUpdate, tick, onDestroy } from "svelte";
	import togglePinned from "../scripts/togglePinned";
	import { goto } from "@sapper/app";

	import Page from "./Page.svelte";
	import { createTree } from "../scripts/data";
	import { ModalStore, PinnedStore, BlockStore } from "../scripts/store";
	import getParent from "../scripts/getParent";
	import { get } from "svelte/store";
	let dialogElement;
	let dialog;

	export let block_id;

	onMount(() => {
		dialog = new MDCDialog(dialogElement);

		dialog.listen("MDCDialog:closing", function () {
			ModalStore.set(undefined);
		});

		dialog.listen("MDCDialog:opened", function () {});
	});
	let parent_title = null;
	let parent_id = null;
	let page = null;
	let ispinned = false;

	let unsubscribePinnedStore = null;

	function subscribePinnedStore() {
		if (unsubscribePinnedStore) {
			unsubscribePinnedStore();
		}
		return PinnedStore.subscribe((data) => {
			if (data.includes(block_id)) {
				ispinned = true;
			} else {
				ispinned = false;
			}
		});
	}

	unsubscribePinnedStore = subscribePinnedStore();

	afterUpdate(async () => {
		const getParentObject = getParent(block_id, get(BlockStore));

		if (getParentObject) {
			parent_id = getParentObject.parentId;
			parent_title = getParentObject.parentTitle;
		} else {
			parent_title = null;
			parent_id = null;
		}

		page = getPageProps();
		unsubscribePinnedStore = subscribePinnedStore();
		dialog.open();
	});

	function getPageProps() {
		return {
			component: Page,
			props: {
				page: createTree(block_id),
			},
		};
	}

	onDestroy(() => {
		unsubscribePinnedStore();
	});
</script>

<div class="mdc-dialog" bind:this={dialogElement}>
	<div class="mdc-dialog__container">
		<div class="mdc-dialog__surface" role="alertdialog" aria-modal="true" aria-labelledby="my-dialog-title" aria-describedby="my-dialog-content">
			<div class="mdc-dialog__actions">

				<div style=" margin-right: auto; padding-left: 23px; display: inline-flex; ">
					<div
						class="open-as-page"
						on:click={() => goto('pages/' + block_id).then(() => {
								ModalStore.set(undefined);
								dialog.close();
							})}
					>
						<svg viewBox="0 0 14 14" class="openAsPageThick" style="width: 14px; height: 14px; display: block; fill: currentColor; flex-shrink: 0; backface-visibility: hidden; margin-right: 6px;">
							<polygon points="9.13029 3.66667 3.66667 9.13029 3.66667 7 2 7 2 12 7 12 7 10.3333 4.82065 10.3333 10.3333 4.82065 10.3333 7 12 7 12 2 7 2 7 3.66667" />
						</svg>
						Open as page
					</div>

					<div class="add-shortcut" on:click={togglePinned(block_id)}>
						<svg style=" transform: scale(0.86); width: 20px; height: 20px; display: block; fill: rgba(202, 204, 206, 0.6); flex-shrink: 0; backface-visibility: hidden; margin-right: 6px;" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							{#if ispinned}
								<path xmlns="http://www.w3.org/2000/svg" d="M16,9V4l1,0c0.55,0,1-0.45,1-1v0c0-0.55-0.45-1-1-1H7C6.45,2,6,2.45,6,3v0 c0,0.55,0.45,1,1,1l1,0v5c0,1.66-1.34,3-3,3h0v2h5.97v7l1,1l1-1v-7H19v-2h0C17.34,12,16,10.66,16,9z" fill="currentcolor" />
							{:else}
								<path xmlns="http://www.w3.org/2000/svg" d="M14,4v5c0,1.12,0.37,2.16,1,3H9c0.65-0.86,1-1.9,1-3V4H14 M17,2H7C6.45,2,6,2.45,6,3c0,0.55,0.45,1,1,1c0,0,0,0,0,0l1,0v5 c0,1.66-1.34,3-3,3v2h5.97v7l1,1l1-1v-7H19v-2c0,0,0,0,0,0c-1.66,0-3-1.34-3-3V4l1,0c0,0,0,0,0,0c0.55,0,1-0.45,1-1 C18,2.45,17.55,2,17,2L17,2z" fill="currentcolor" />
							{/if}
						</svg>
						{#if ispinned}Remove shortcut{:else}Add shortcut{/if}
					</div>

					{#if parent_id}
						<div
							class="linked-parent"
							on:click={() => {
								ModalStore.set(parent_id);
							}}
						>

							<svg style=" width: 20px; height: 20px; display: block; fill: rgba(202, 204, 206, 0.6); flex-shrink: 0; backface-visibility: hidden; margin-right: 6px;" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M6.75 3C7.67996 2.99907 8.5771 3.34371 9.26725 3.96703C9.9574 4.59035 10.3913 5.44787 10.4848 6.37313C10.5782 7.29838 10.3246 8.22536 9.77302 8.9741C9.22146 9.72285 8.41137 10.2399 7.5 10.425V12.75C7.49985 13.7021 7.86185 14.6186 8.51256 15.3136C9.16327 16.0086 10.054 16.43 11.004 16.4925L11.25 16.5H13.575C13.7609 15.5895 14.2782 14.7804 15.0267 14.2296C15.7752 13.6788 16.7015 13.4256 17.6261 13.519C18.5507 13.6124 19.4077 14.0458 20.031 14.7351C20.6542 15.4245 20.9992 16.3207 20.9992 17.25C20.9992 18.1793 20.6542 19.0755 20.031 19.7649C19.4077 20.4542 18.5507 20.8876 17.6261 20.981C16.7015 21.0744 15.7752 20.8212 15.0267 20.2704C14.2782 19.7196 13.7609 18.9105 13.575 18H11.25C9.9074 18.0001 8.61578 17.4858 7.64069 16.5629C6.6656 15.64 6.08115 14.3786 6.0075 13.038L6 12.75V10.425C5.08863 10.2399 4.27854 9.72285 3.72698 8.9741C3.17543 8.22536 2.92176 7.29838 3.01522 6.37313C3.10868 5.44787 3.5426 4.59035 4.23275 3.96703C4.9229 3.34371 5.82004 2.99907 6.75 3V3ZM17.25 15C16.6533 15 16.081 15.2371 15.659 15.659C15.2371 16.081 15 16.6533 15 17.25C15 17.8467 15.2371 18.419 15.659 18.841C16.081 19.2629 16.6533 19.5 17.25 19.5C17.8467 19.5 18.419 19.2629 18.841 18.841C19.2629 18.419 19.5 17.8467 19.5 17.25C19.5 16.6533 19.2629 16.081 18.841 15.659C18.419 15.2371 17.8467 15 17.25 15ZM6.75 4.5C6.15326 4.5 5.58097 4.73705 5.15901 5.15901C4.73705 5.58097 4.5 6.15326 4.5 6.75C4.5 7.34674 4.73705 7.91903 5.15901 8.34099C5.58097 8.76295 6.15326 9 6.75 9C7.34674 9 7.91903 8.76295 8.34099 8.34099C8.76295 7.91903 9 7.34674 9 6.75C9 6.15326 8.76295 5.58097 8.34099 5.15901C7.91903 4.73705 7.34674 4.5 6.75 4.5Z" fill="" />

							</svg>
							{parent_title}
						</div>
					{/if}
				</div>

				<button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="close">
					<div class="mdc-button__ripple" />

				</button>
				<button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="close">
					<div class="mdc-button__ripple" />
					<button class="material-icons mdc-top-app-bar__navigation-icon mdc-icon-button" aria-label="Open navigation menu">close</button>

				</button>
			</div>
			<div class="mdc-dialog__content" id="my-dialog-content">
				{#if page}
					<svelte:component this={page.component} {...page.props} />
				{/if}
			</div>
		</div>
	</div>
	<div class="mdc-dialog__scrim" />
</div>

<style>
	.mdc-dialog .mdc-dialog__content,
	button {
		color: var(--body-color);
	}

	.mdc-dialog__surface {
		max-width: 977px;
		height: calc(100% - 144px);
		width: 94.2%;
	}

	.open-as-page,
	.add-shortcut,
	.linked-parent {
		user-select: none;
		transition: 20ms;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		flex-shrink: 0;
		white-space: nowrap;
		height: 28px;
		border-radius: 3px;
		font-size: 14px;
		line-height: 1.2;
		min-width: 0px;
		padding-left: 6px;
		padding-right: 8px;
		color: var(--popup-button-color);
	}

	.open-as-page:hover,
	.add-shortcut:hover,
	.linked-parent:hover {
		background: var(--popup-button-hover-bg);
	}
</style>
