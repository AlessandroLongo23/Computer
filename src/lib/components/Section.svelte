<script>
    import { page } from '$app/stores'
    export let title;

    let href = $page.url.pathname.replace('/home', '') + "/" + title;
</script>

<a href="{href}" class="flex flex-col justify-center items-center w-1/4 m-4 bg-white rounded-lg shadow-md hover:shadow-lg hover:no-underline transition-all duration-300">
    <p class="text-xl m-4 text-gray-900">{title}</p>
    <img src="/{title}/thumb.png" alt="{title}" class="rounded-lg" />
</a>

<style>
</style>