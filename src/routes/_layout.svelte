<script>
	import { onMount, afterUpdate } from "svelte";
	import { MDCTopAppBar } from "@material/top-app-bar";
	import { MDCMenu } from "@material/menu";
	import * as JSLZString from "lz-string";
	import Pinned from "../components/Pinned.svelte";
	import togglePinned from "../scripts/togglePinned";

	import BlockModal from "../components/BlockModal.svelte";
	import SnackBar from "../components/SnackBar.svelte";
	import { toggleTheme, getNextThemeID } from "../scripts/toggleDarkmode";
	import { goto } from "@sapper/app";

	import { label_page, pages, links } from "../scripts/data";
	import createPage from "../scripts/createPage";

	import { ViewStore, ModalStore, BlockStore, PinnedStore } from "../scripts/store";
	import * as constants from "../scripts/constants";
	import * as localStorage from "../scripts/localStorage";
	import SearchModal from "../components/SearchModal.svelte";
	import AboutModal from "../components/AboutModal.svelte";
	import getParent from "../scripts/getParent";

	import { buildelectron } from "../scripts/config";
	import { get } from "svelte/store";
	import downloadObject from "../scripts/downloadObject";

	import { initData } from "../scripts/persistentDataStorage";

	import convertPageReferenceToLabel from "../components/editor_utils/convertPageReferenceToLabel";
	import referenceClickHandler from "../components/editor_utils/referenceClickHandler";
	let currentModal = null;
	let currentView = "";
	let currentViewData = null;

	let ispinned = false;
	let unsubscribePinnedStore = null;

	function subscribePinnedStore() {
		if (unsubscribePinnedStore) {
			unsubscribePinnedStore();
		}
		return PinnedStore.subscribe((data) => {
			if (currentView === "Page") {
				if (data.includes(currentViewData.details.id)) {
					ispinned = true;
				} else {
					ispinned = false;
				}
			}
		});
	}
	unsubscribePinnedStore = subscribePinnedStore();

	let topBarTitle = "";
	let forceMainFullWidth = false;

	let isgraphview = false;
	let parent_routes = [];

	if (process.browser) {
		if (buildelectron) {
			initData();
		}

		document.addEventListener("click", function (event) {
			if (event.target.tagName === "REFERENCE") {
				document.activeElement.blur();
				const referenceTitle = event.target.innerText.trim().slice(2, -2);

				referenceClickHandler(label_page.get(referenceTitle), referenceTitle);
			} else if (event.target.tagName === "A" && event.target.href.startsWith("http")) {
				event.preventDefault();
				if (buildelectron) {
					eval(`require('electron').shell.openExternal(\`` + event.target.href + `\`)`);
				} else {
					window.open(event.target.href);
				}
			}
		});
	}

	parent_routes = [];

	BlockStore.subscribe((blocks) => {
		if (currentView === "Page") {
			topBarTitle = blocks[currentViewData.details.id].content;
		}
	});

	ViewStore.subscribe((data) => {
		topBarTitle = data.title;
		currentView = data.type;
		currentViewData = data;
		parent_routes = [];

		const blocks = get(BlockStore);
		if (currentView === "Page") {
			(function get_parents_recursion(id) {
				let parent = getParent(id, blocks);

				if (parent) {
					parent_routes.push({
						route: "pages/" + parent.parentId,
						title: parent.parentTitle,
					});
					return get_parents_recursion(parent.parentId);
				}
			})(data.details.id);

			parent_routes = parent_routes.reverse();
			unsubscribePinnedStore = subscribePinnedStore();
		}
	});

	ModalStore.subscribe((data) => {
		currentModal = data;
	});

	afterUpdate(() => {
		forceMainFullWidth = currentView === "Graph/Page" ? true : false;
		isgraphview = currentView === "Graph" ? true : false;
	});
	let sidebaractive = false;

	let topAppBarElement;
	let moreVertElement;
	let overflowMenuElement;
	let overflowMenu;

	onMount(async () => {
		// Instantiation MDCTopAppBar
		const topAppBar = new MDCTopAppBar(topAppBarElement);
		overflowMenu = new MDCMenu(overflowMenuElement);

		document.onkeyup = function (e) {
			if (e.altKey && e.key == "q") {
				return ModalStore.set("SEARCH");
			} else if (e.altKey && e.key == "g") {
				return goto("graph");
			} else if (e.altKey && e.key == "ArrowLeft") {
				if (buildelectron) {
					window.history.back();
				}
				return null;
			} else if (e.altKey && e.key == "a") {
				return goto("pages");
			} else if (e.altKey && e.key == "c") {
				const page_id = createPage();

				return goto("pages/" + page_id);
			}
		};
	});

	function openOverflowMenu() {
		if (!overflowMenu.open) {
			overflowMenu.open = true;
		}
	}

	if (process.browser) {
		if (localStorage.getValue(constants.HIDE_SIDEBAR)) {
			toggleSidebar(false);
			if (document.body.clientWidth <= 800) {
				toggleSidebar(true);
			}
		}
	}

	function toggleSidebar(updateLocalStorage = true) {
		sidebaractive = !sidebaractive;
		if (updateLocalStorage) {
			localStorage.setValue(constants.HIDE_SIDEBAR, sidebaractive);
		}
	}
</script>

{#if buildelectron}
	<header id="titlebar">
		<div id="drag-region">
			<div id="window-title">
				<span>Linked Thinking</span>
			</div>
			<div id="window-controls">
				<div
					class="button"
					id="min-button"
					on:click={() => {
						eval(`require('electron').remote.BrowserWindow.getFocusedWindow().minimize();`);
					}}
				>
					<img alt="" class="icon" srcset="images/min-w-10.png 1x, images/min-w-12.png 1.25x, images/min-w-15.png 1.5x, images/min-w-15.png 1.75x, images/min-w-20.png 2x, images/min-w-20.png 2.25x, images/min-w-24.png 2.5x, images/min-w-30.png 3x, images/min-w-30.png 3.5x" draggable="false" />
				</div>
				<div
					class="button"
					id="max-button"
					on:click={() => {
						eval(`require('electron').remote.BrowserWindow.getFocusedWindow().maximize();`);
					}}
				>
					<img alt="" class="icon" srcset="images/max-w-10.png 1x, images/max-w-12.png 1.25x, images/max-w-15.png 1.5x, images/max-w-15.png 1.75x, images/max-w-20.png 2x, images/max-w-20.png 2.25x, images/max-w-24.png 2.5x, images/max-w-30.png 3x, images/max-w-30.png 3.5x" draggable="false" />
				</div>
				<div class="button" id="restore-button">
					<img alt="" class="icon" srcset="images/restore-w-10.png 1x, images/restore-w-12.png 1.25x, images/restore-w-15.png 1.5x, images/restore-w-15.png 1.75x, images/restore-w-20.png 2x, images/restore-w-20.png 2.25x, images/restore-w-24.png 2.5x, images/restore-w-30.png 3x, images/restore-w-30.png 3.5x" draggable="false" />
				</div>
				<div
					class="button"
					id="close-button"
					on:click={() => {
						eval(`require('electron').remote.BrowserWindow.getFocusedWindow().close();`);
					}}
				>
					<img style="margin-right: 5px;" alt="" class="icon" srcset="images/close-w-10.png 1x, images/close-w-12.png 1.25x, images/close-w-15.png 1.5x, images/close-w-15.png 1.75x, images/close-w-20.png 2x, images/close-w-20.png 2.25x, images/close-w-24.png 2.5x, images/close-w-30.png 3x, images/close-w-30.png 3.5x" draggable="false" />
				</div>
			</div>
		</div>
	</header>
{/if}

<span id="app" class:buildelectron class:isgraphview class:sidebaractive>
	<span class="overlay" on:click={toggleSidebar} />
	<header class="mdc-top-app-bar mdc-top-app-bar--fixed" bind:this={topAppBarElement}>
		<div class="mdc-top-app-bar__row">
			<section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">

				<button on:click={toggleSidebar} class="material-icons mdc-top-app-bar__navigation-icon mdc-icon-button" aria-label="Open navigation menu" id="header-toggle-sidebar-button">menu</button>

				<span style="user-select:none" class="mdc-top-app-bar__title">

					{#each parent_routes as parent (parent.route)}
						<span
							class="parent-link"
							on:click={() => {
								goto(parent.route);
							}}
						>
							{convertPageReferenceToLabel(parent.title).trim()}
						</span>
						<svg width="5" height="8" viewBox="0 0 5 8" fill="none" class=" _h91wub" style=" margin: 2px 8px; ">
							<path d="M0 0 L4 4 L0 8" stroke="currentColor" stroke-linecap="round" />
						</svg>
					{/each}
					<span>
						{#if topBarTitle}
							{convertPageReferenceToLabel(topBarTitle).trim()}
						{:else}
							<!--loading ...-->
						{/if}
					</span>
				</span>

				<span style="margin-left:24px" />
			</section>
			<section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar">

				{#if currentView === 'Page'}
					<button on:click={togglePinned(currentViewData.details.id)} style=" opacity: 0.675; " class="material-icons mdc-icon-button">

						<svg width="24" height="24" style=" transform: scale(0.86); margin-top: 0.6px;">
							{#if ispinned}
								<path xmlns="http://www.w3.org/2000/svg" d="M16,9V4l1,0c0.55,0,1-0.45,1-1v0c0-0.55-0.45-1-1-1H7C6.45,2,6,2.45,6,3v0 c0,0.55,0.45,1,1,1l1,0v5c0,1.66-1.34,3-3,3h0v2h5.97v7l1,1l1-1v-7H19v-2h0C17.34,12,16,10.66,16,9z" fill="currentcolor" />
							{:else}
								<path xmlns="http://www.w3.org/2000/svg" d="M14,4v5c0,1.12,0.37,2.16,1,3H9c0.65-0.86,1-1.9,1-3V4H14 M17,2H7C6.45,2,6,2.45,6,3c0,0.55,0.45,1,1,1c0,0,0,0,0,0l1,0v5 c0,1.66-1.34,3-3,3v2h5.97v7l1,1l1-1v-7H19v-2c0,0,0,0,0,0c-1.66,0-3-1.34-3-3V4l1,0c0,0,0,0,0,0c0.55,0,1-0.45,1-1 C18,2.45,17.55,2,17,2L17,2z" fill="currentcolor" />
							{/if}
						</svg>
					</button>
				{/if}

				<div class="mdc-menu-surface--anchor">
					<button class="material-icons mdc-top-app-bar__action-item mdc-icon-button" aria-label="Options" bind:this={moreVertElement} on:click={openOverflowMenu}>more_vert</button>
					<div class="mdc-menu mdc-menu-surface" bind:this={overflowMenuElement}>
						<ul class="mdc-list" role="menu" aria-hidden="true" aria-orientation="vertical" tabindex="-1">
							<li
								class="mdc-list-item"
								role="menuitem"
								on:click={() => {
									goto('pages');
								}}
							>
								<span class="mdc-list-item__ripple" />
								<span class="mdc-list-item__text">All Pages</span>
							</li>
							<li
								class="mdc-list-item"
								role="menuitem"
								on:click={() => {
									goto('graph');
								}}
							>
								<span class="mdc-list-item__ripple" />
								<span class="mdc-list-item__text">Graph Overview</span>
							</li>
							<li
								on:click={() => {
									toggleTheme(getNextThemeID());
								}}
								class="mdc-list-item"
								role="menuitem"
							>
								<span class="mdc-list-item__ripple" />
								<span class="mdc-list-item__text">Night Mode</span>
							</li>
							<li
								on:click={() => {
									const compressed = JSLZString.compressToUTF16(JSON.stringify([label_page, pages, get(BlockStore), links]));
									window.compressedToUTF16 = compressed;
									window.decompressFromUTF16 = JSLZString.decompressFromUTF16;
									downloadObject(compressed, 'Export');
								}}
								class="mdc-list-item"
								role="menuitem"
							>
								<span class="mdc-list-item__ripple" />
								<span class="mdc-list-item__text">Export Database</span>
							</li>

							<li
								on:click={() => {
									ModalStore.set('ABOUT');
								}}
								class="mdc-list-item"
								role="menuitem"
							>
								<span class="mdc-list-item__ripple" />
								<span class="mdc-list-item__text">About</span>
							</li>

						</ul>
					</div>
				</div>
			</section>
		</div>
	</header>

	<aside>

		<ul style="padding-top:0">
			<li style=" height: 32px;background:transparent!important; cursor:default!important;">
				<div on:click={toggleSidebar} class="doubleChevronLeft" style=" cursor:pointer; border-radius: .2px; position: relative; float: right; width: 24px; height: 24px; margin-right: 16px;">
					<svg viewBox="0 0 14 14" style=" width: 14px; height: 14px; display: block; fill: rgba(202, 204, 206, 0.6); flex-shrink: 0; backface-visibility: hidden; cursor: pointer; box-sizing: border-box; float: right; margin-top: 4px; margin-right: 4px;">
						<path d="M7 2.225L5.775 1L0 7.125L5.775 13.25L7 12.025L2.45 7.125L7 2.225ZM14 2.225L12.775 1L7 7.125L12.775 13.25L14 12.025L9.45 7.125L14 2.225Z" />
					</svg>
				</div>
			</li>
		</ul>
		<ul style=" padding-top: 0; padding-bottom: 16px;">
			<li on:click={() => ModalStore.set('SEARCH')}>
				<div class="icon">

					<svg viewBox="0 0 14 14" class="sidebarSearch" style="width: 14px; height: 100%; display: block; fill: rgba(202, 204, 206, 0.6); flex-shrink: 0; backface-visibility: hidden;">
						<path d="M5.92239093,0.540000021 C2.94055203,0.540000021 0.5,2.98052217 0.5,5.96238099 C0.5,8.9442199 2.94055203,11.384762 5.92239093,11.384762 C7.02329179,11.384762 8.05258749,11.0564678 8.91032559,10.4866744 L12.1460745,13.6802311 C12.5695899,14.1037465 13.2589477,14.1037465 13.6823635,13.6802311 C14.1058788,13.2567158 14.1058788,12.5730353 13.6823635,12.1495199 L10.4410368,8.95033558 C11.0107904,8.09259747 11.3447619,7.06329182 11.3447619,5.96238099 C11.3447619,2.98052217 8.90420992,0.540000021 5.92239093,0.540000021 Z M5.92239093,2.70895241 C7.7320027,2.70895241 9.17580956,4.15272939 9.17580956,5.96238099 C9.17580956,7.77201268 7.7320027,9.21581954 5.92239093,9.21581954 C4.11275925,9.21581954 2.66895239,7.77201268 2.66895239,5.96238099 C2.66895239,4.15272939 4.11275925,2.70895241 5.92239093,2.70895241 Z" />
					</svg>
				</div>
				<div style=" font-weight: 500;">Quick Find</div>
			</li>
			<li on:click={() => goto('/pages')}>
				<div class="icon" style="color:#87898c; font-weight: 600; ">☰</div>
				<div style=" font-weight: 500;">All Pages</div>
			</li>

			<li on:click={() => goto('/graph')}>
				<div class="icon">
					<svg width="15" height="18" viewBox="0 0 32 32" fill="rgba(202, 204, 206, 0.6)" xmlns="http://www.w3.org/2000/svg" style=" color: var(--sidebar-icon-color); ">
						<path d="M22 17.0175C20.4934 17.0189 19.0274 17.5064 17.82 18.4075L13.6 14.1875C14.5117 12.9889 15.0037 11.5235 15 10.0175C15.0039 8.44041 14.4752 6.9082 13.4995 5.66917C12.5237 4.43015 11.1582 3.55692 9.6241 3.19102C8.09003 2.82511 6.47735 2.98796 5.04741 3.65318C3.61747 4.3184 2.45407 5.44701 1.74575 6.85609C1.03742 8.26518 0.825686 9.87217 1.14485 11.4166C1.46402 12.9611 2.29539 14.3525 3.50422 15.3654C4.71305 16.3783 6.22851 16.9534 7.805 16.9973C9.38148 17.0412 10.9266 16.5515 12.19 15.6075L16.4 19.8275C15.4562 21.0905 14.9665 22.6352 15.0102 24.2112C15.0538 25.7873 15.6282 27.3025 16.6404 28.5114C17.6526 29.7202 19.0433 30.552 20.5872 30.8719C22.131 31.1918 23.7377 30.9811 25.1469 30.274C26.5561 29.5669 27.6853 28.4047 28.3517 26.9758C29.018 25.5468 29.1824 23.9348 28.8182 22.4007C28.454 20.8667 27.5827 19.5005 26.3452 18.5235C25.1077 17.5465 23.5767 17.0158 22 17.0175ZM2.99999 10.0175C2.99999 9.0286 3.29323 8.0619 3.84264 7.23966C4.39205 6.41741 5.17294 5.77655 6.08657 5.39811C7.0002 5.01967 8.00553 4.92066 8.97544 5.11358C9.94534 5.30651 10.8363 5.78271 11.5355 6.48197C12.2348 7.18124 12.711 8.07215 12.9039 9.04206C13.0968 10.012 12.9978 11.0173 12.6194 11.9309C12.2409 12.8446 11.6001 13.6254 10.7778 14.1749C9.95559 14.7243 8.98889 15.0175 7.99999 15.0175C6.6739 15.0175 5.40213 14.4907 4.46445 13.553C3.52677 12.6154 2.99999 11.3436 2.99999 10.0175Z" fill="black" style=" fill: currentcolor; " />
						<circle cx="26.5" cy="5.5" r="4.5" fill="black" style=" fill: currentcolor; " />
					</svg>
				</div>
				<div style=" font-weight: 500;">Graph Overview</div>
			</li>
			<li
				on:click={() => {
					const page_id = createPage();
					goto('pages/' + page_id);
				}}
			>
				<div class="icon" style="color:#87898c; font-weight: 600; ">
					<svg width="14" height="17" viewBox="0 0 16 17" style=" color: var(--sidebar-icon-color); margin: 0px 2px 1px 5px; width: 13px; height: 17px; " fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M15.8283 9.41299H9.1134V16.1113H6.90279V9.41299H0.204489V7.18576H6.90279V0.48746H9.1134V7.18576H15.8283V9.41299Z" fill="currentcolor" />
					</svg>
				</div>
				<div style=" font-weight: 500;">New Page</div>
			</li>
		</ul>

		<Pinned />
	</aside>
	<main class:forceMainFullWidth>
		<slot />
	</main>

</span>

{#if typeof currentModal === 'number'}
	<BlockModal block_id={currentModal} />
{:else if currentModal === 'SEARCH'}
	<SearchModal />
{:else if currentModal === 'ABOUT'}
	<AboutModal />
{/if}

<SnackBar />

<style>
	main {
		scroll-behavior: smooth;
		width: 100%;
		position: absolute;
		right: 0;
		height: calc(100% - var(--header-height) - 56px);
		overflow-x: auto;
		display: flex;
		box-shadow: var(--main-shadow);
		z-index: 6;
		background: var(--main-background);
		transition-duration: 0.35s;
		box-shadow: var(--main-shadow);
		transition-property: margin-right, margin-left, padding-left, padding-right, padding-top, left, right, width;
	}

	.sidebaractive main {
		width: calc(100% - var(--sidebar-width));
	}

	.parent-link {
		opacity: 0.975;
		color: #e9e9ea;
		transition: 0.3s;
	}

	.parent-link:hover {
		cursor: pointer;
		opacity: 1;
		text-decoration: underline;
	}

	#app header {
		z-index: 7;
	}

	.sidebaractive header {
		left: var(--sidebar-width) !important;
		width: calc(100% - var(--sidebar-width)) !important;
	}

	.sidebaractive header #header-toggle-sidebar-button {
		display: none;
	}

	.isgraphview header {
		background: var(--header-graph-active-background);
	}

	aside {
		position: absolute;
		height: calc(100%);
		background: var(--sidebar-background);
		width: var(--sidebar-width);
		left: calc(0px - var(--sidebar-width));
		top: 0;
		transition-property: left;
		transition-duration: 0.35s;
		box-sizing: border-box;
		font-family: var(--sidebar-font);
		padding-bottom: 62px;
		display: block;
		position: fixed;
		overflow-y: auto;
		overflow-x: hidden;
		z-index: 7;
	}

	main {
		padding-top: var(--header-height);
	}
	.sidebaractive aside {
		left: 0px;
	}

	@media (max-width: 500px) {
		aside {
			position: absolute;
			z-index: 999;
		}
		main,
		#app header {
			left: 0 !important;
			width: 100% !important;
		}

		.sidebaractive header #header-toggle-sidebar-button {
			display: block !important;
		}
	}

	#app header {
		background: var(--header-background);
		border-bottom: var(--header-border);
		width: 100%;
		left: 0;
		transition: 0.35s;
		transition-property: margin-right, margin-left, padding-left, padding-right, padding-top, left, right, width;
	}

	aside .icon svg {
		color: var(--sidebar-icon-color);
	}

	header .mdc-icon-button {
		width: 44px;
		height: 44px;
		padding: 10px;
		font-size: 22.4px;
	}
	.forceMainFullWidth {
		width: 100% !important;
		left: 0 !important;
		transition: 0 !important;
	}

	.mdc-top-app-bar__row {
		height: var(--header-height);
	}

	.mdc-top-app-bar__title {
		font-size: 14px;
		opacity: 1;
	}

	.overlay {
		position: fixed;
		width: 0;
		height: 0;
		background: #161617bb;
		z-index: 998;
		display: block;
		opacity: 0;
		transition: 0.35s;
		transition-property: opacity;
	}

	@media (max-width: 500px) {
		.sidebaractive .overlay {
			width: 100%;
			height: 100%;
			opacity: 1;
		}
	}
</style>
