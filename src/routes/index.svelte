<script>
	import { goto } from "@sapper/app";
	import { buildelectron } from "../scripts/config";

	import { onMount } from "svelte";

	onMount(() => {
		if (!buildelectron) {
			goto("/pages/0");
		} else {
			goto("graph");
		}
	});
</script>

<style>

</style>
