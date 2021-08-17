<script>
	import { MDCSnackbar } from "@material/snackbar";
	import { onMount } from "svelte";
	let snackBarElement;
	let snackbar;
	let msg = "";

	onMount(() => {
		snackbar = new MDCSnackbar(snackBarElement);
		window.show_message = (text) => {
			msg = text;
			snackbar.open();
		};
	});
</script>

<div class="mdc-snackbar mdc-snackbar--leading" bind:this={snackBarElement}>

	<div style="background:#202124;" class="mdc-snackbar__surface" role="status" aria-relevant="additions">
		<div class="mdc-snackbar__label" aria-atomic="false">{msg}</div>
	</div>
</div>
