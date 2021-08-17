<script>
	import PagesTable from "../../components/PagesTable.svelte";
	import { ViewStore } from "../../scripts/store";
	ViewStore.set({ type: "Pages", title: "All Pages" });
</script>

<svelte:head>
	<title>Pages</title>
</svelte:head>
<PagesTable />
