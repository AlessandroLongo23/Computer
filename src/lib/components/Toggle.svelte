<script>
    import * as LucideIcons from 'lucide-svelte';

    export let selected = 0;
    function selectIcon(index) {
        selected = index;
    }

    let off = 2.25;
    export let icons;

    let options = [];
    for (let i in icons)
        options.push({
            icon: icons[i],
            translateClass: 'transform: translateX(' + (off * i) + 'rem);'
        })
</script>

<button class="relative h-10 rounded-full bg-slate-200 p-1 transition-all duration-300 ease-in-out hover:bg-slate-300 dark:bg-gray-300" aria-label={`Selected icon: ${selected}`} style="width: {off * icons.length + 0.25}rem">
    <div class="absolute left-1 w-8 aspect-square transform rounded-full bg-white shadow-md transition-all duration-500 ease-in-out" style="{options[selected].translateClass}"/>

    <div class="relative flex h-full w-full items-center justify-between px-2">
        {#each options as option, i}
            <button on:click={() => selectIcon(i)} class="transform transition-all duration-300 cursor-pointer hover:scale-110 {selected === i ? 'scale-110 text-black' : 'scale-90 text-gray-600'}">
                <svelte:component this={option.icon} size={16}/>
            </button>
        {/each}
    </div>
</button>