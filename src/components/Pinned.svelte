<script>
	import * as localStorage from "../scripts/localStorage";
	import * as constants from "../scripts/constants";
	import { goto } from "@sapper/app";
	import { PinnedStore, BlockStore } from "../scripts/store";
	import convertPageReferenceToLabel from "./editor_utils/convertPageReferenceToLabel";

	let render_pinned = [];
	let hidePinnedSidebar;
	let blocks = [];

	BlockStore.subscribe((data) => {
		render_pinned = render_pinned;
		blocks = data;
	});
	PinnedStore.subscribe((data) => {
		render_pinned = data;
	});

	if (process.browser) {
		if (localStorage.getValue(constants.HIDE_PINNED_SIDEBAR)) {
			togglePinnedSidebar(false);
		}
	}

	function togglePinnedSidebar(updateLocalStorage = true) {
		hidePinnedSidebar = !hidePinnedSidebar;
		if (updateLocalStorage) {
			localStorage.setValue(constants.HIDE_PINNED_SIDEBAR, hidePinnedSidebar);
		}
	}
</script>

<ul style="border-bottom: none!important; padding-top: 0px; ">
	{#each render_pinned as page (page)}
		<li
			tabindex="0"
			on:keypress={(e) => {
				if (e.keyCode === 13) goto('pages/' + page, { remount: true });
			}}
			on:click={() => goto('pages/' + page, { remount: true })}
		>
			<div class="icon">

				<svg width="18" height="18" viewBox="0 0 24 24" class="pinned_icon" style="color:var(--sidebar-icon-color);">
					<path d="M12 7a5 5 0 110 10 5 5 0 010-10z" fill="currentColor" />
				</svg>
			</div>
			<div style=" max-height: 14px; white-space: nowrap; max-width: 116px; overflow-wrap: anywhere; text-overflow: ellipsis; font-weight: 500">
				{@html convertPageReferenceToLabel(blocks[page].content)}
			</div>
		</li>
	{/each}

</ul>

<style>
	.toggle-visibility-icon {
		transition: 0.4s;
		transform: rotate(0deg);
	}

	.rotate-180 {
		transform: rotate(-180deg);
	}
</style>
