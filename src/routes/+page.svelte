<script lang="ts">
	import { Heading } from 'flowbite-svelte';
	import Camera from '$lib/components/Camera.svelte';
</script>

<svelte:head>
	<title>ML Vision</title>
	<meta
		name="description"
		content="A simple ML Vision app"
	/>
</svelte:head>

<Heading
	tag="h1"
	class="text-center"
	>Image Classifier
</Heading>
<Camera />
