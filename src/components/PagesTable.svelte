<script>
	import { MDCDataTable } from "@material/data-table";
	import { onMount, onDestroy } from "svelte";
	import { pages } from "../scripts/data";
	import { ModalStore, BlockStore } from "../scripts/store";
	import convertPageReferenceToLabel from "./editor_utils/convertPageReferenceToLabel";
	import { goto } from "@sapper/app";

	let dataTableElement;
	let rows = [];
	let dataTable;

	onMount(() => {
		dataTable = new MDCDataTable(dataTableElement);
	});

	const unsubscribeBlockStore = BlockStore.subscribe((blocks) => {
		rows = [];
		pages.forEach((root_block_id) => {
			rows.push({
				id: root_block_id,
				title: blocks[root_block_id].content,
				backlinks: null,
				editedDaysAgo: null,
			});
		});
	});

	onDestroy(() => {
		unsubscribeBlockStore();
	});
</script>

<div class="mdc-data-table" bind:this={dataTableElement}>
	<table class="mdc-data-table__table">
		<thead style=" display:none; background: var(--table-header-bg); box-sizing: border-box;">
			<tr class="mdc-data-table__header-row">
				<th style=" width: 100%; " class="mdc-data-table__header-cell mdc-data-table__header-cell--with-sort" role="columnheader" scope="col" aria-sort="none" data-column-id="title">
					<div class="mdc-data-table__header-cell-wrapper">
						<div class="mdc-data-table__header-cell-label">Title</div>

					</div>
				</th>

				<th class="mdc-data-table__header-cell mdc-data-table__header-cell--numeric mdc-data-table__header-cell--with-sort" role="columnheader" scope="col" aria-sort="none" data-column-id="created">
					<div class="mdc-data-table__header-cell-wrapper">

						<div class="mdc-data-table__header-cell-label">References</div>

					</div>
				</th>
				<th class="mdc-data-table__header-cell mdc-data-table__header-cell--numeric mdc-data-table__header-cell--with-sort" role="columnheader" scope="col" aria-sort="none" data-column-id="edited">
					<div class="mdc-data-table__header-cell-wrapper">

						<div class="mdc-data-table__header-cell-label">Last modified</div>

					</div>
				</th>
			</tr>
		</thead>
		<tbody class="mdc-data-table__content">

			{#each rows as row (row.id)}
				<tr
					on:click={() => {
						goto('/pages/' + row.id);
					}}
					class="mdc-data-table__row"
				>
					<td class="mdc-data-table__cell" style=" font-weight: 600; ">
						{#if row.title.length > 0}{convertPageReferenceToLabel(row.title)}{:else}untitled{/if}

					</td>
					<td class="mdc-data-table__cell mdc-data-table__cell--numeric">
						{#if row.backlinks}{row.backlinks} Backlinks{/if}
					</td>
					<td class="mdc-data-table__cell mdc-data-table__cell--numeric">
						{#if row.editedDaysAgo}Edited {row.editedDaysAgo} days ago{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	* {
		font-size: 14.6px;
		color: var(--body-color);
		user-select: none;
	}

	tr {
		cursor: pointer;
	}

	th {
		user-select: none;
	}
	.mdc-data-table__row,
	.mdc-data-table__pagination {
		border-top: none;
	}

	.mdc-data-table {
		width: calc(100% - 32px);
		border: none;
		margin: 16px auto;
	}

	.mdc-data-table__header-cell,
	.mdc-data-table__cell {
		height: 40px;
	}

	thead {
		box-shadow: rgba(0, 0, 0, 0.1) 0px 1.15px 0px 0px, rgba(0, 0, 0, 0.01) 0px 0px 0px 0px, rgba(0, 0, 0, 0.02) 0px 0px 0px 0px;
	}

	.mdc-data-table__sort-icon-button {
		color: var(--body-color);
	}

	.mdc-data-table__sort-icon-button:hover::before,
	.mdc-data-table__sort-icon-button:hover::after {
		opacity: 0 !important;
	}
</style>
