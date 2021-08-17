<script>
	import { MDCDialog } from "@material/dialog";
	import { onMount, afterUpdate } from "svelte";
	import { goto } from "@sapper/app";
	import { ModalStore, BlockStore } from "../scripts/store";

	import { searchPage } from "../scripts/search";
	import { pages } from "../scripts/data";
	import { get } from "svelte/store";

	let dialogElement;
	let dialog;

	const blocks = get(BlockStore);

	onMount(() => {
		dialog = new MDCDialog(dialogElement);

		dialog.listen("MDCDialog:closing", function () {
			ModalStore.set(undefined);
		});

		dialog.listen("MDCDialog:opened", function () {
			document.getElementById("searchbar").focus();
		});
	});
	afterUpdate(() => {
		dialog.open();
	});

	let query;
	let resultList = [];
	pages.forEach((p) => {
		resultList.push(blocks[p]);
	});
	let updateResults = (query) => {
		if (!query) {
			resultList = [];
			pages.forEach((p) => {
				resultList.push(blocks[p]);
			});

			return;
		}

		let newResultList = [];
		searchPage(query).forEach((link) => {
			newResultList.push(blocks[link.id]);
		});

		resultList = newResultList;
	};
</script>

<div class="mdc-dialog" bind:this={dialogElement}>
	<div class="mdc-dialog__container">
		<div class="mdc-dialog__surface" role="alertdialog" aria-modal="true" aria-labelledby="my-dialog-title" aria-describedby="my-dialog-content">
			<div class="mdc-dialog__actions" style=" padding: 8px 14px; ">
				<input
					autocomplete="off"
					autofocus
					bind:value={query}
					on:input={(e) => {
						updateResults(e.target.value);
					}}
					placeholder="Search pages"
					id="searchbar"
				/>
				<button type="button" class="mdc-button mdc-dialog__button" data-mdc-dialog-action="close">
					<div class="mdc-button__ripple" />
					<button class="material-icons mdc-top-app-bar__navigation-icon mdc-icon-button" aria-label="Open navigation menu">close</button>

				</button>
			</div>
			<div style="padding-top: 4px;" class="mdc-dialog__content" id="my-dialog-content">

				<div id="quickfind">

					<div style="overflow-y: auto;">
						{#each resultList as backlink, i (backlink)}
							{#if backlink}
								<li
									class="searchresult"
									on:click={() => {
										goto('pages/' + backlink.id);
										ModalStore.set(undefined);
									}}
								>
									{#if backlink.content}{backlink.content}{:else}untitled{/if}
								</li>
							{/if}
						{/each}
					</div>
				</div>

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
		max-width: 704px;
		height: calc(100% - 144px);
		width: 94.2%;
	}

	#quickfind {
		width: 856px;
		max-width: 100%;
	}

	.mdc-dialog__actions input {
		font-size: 16px;
		line-height: 48px;
		width: calc(100% - 98px);
		outline: none;
		font-family: Whitney, "Microsoft YaHei", "Hiragino Kaku Gothic Pro", Meiryo, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, font-family;
		font-weight: 500;
		white-space: pre-wrap;
		background: transparent;
		color: var(--primary-color);
		opacity: 0.9;
		border: none;
	}
	.searchresult {
		list-style: none;
		user-select: none;
		font-size: 16px;
		cursor: pointer;
		padding: 8px 16px;
		border-radius: 5px;
		max-height: 24px;
		overflow-y: hidden;
		overflow-x: hidden;
		overflow-wrap: anywhere;
		max-width: 100%;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	li.searchresult:hover {
		background: rgba(71, 76, 80, 0.226);
	}
</style>
