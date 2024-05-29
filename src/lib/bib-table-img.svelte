<script lang="ts">
  export let bibKey: string
  export let className = ''
  export let width = '100px'
  export let dir: 'thumbnail' | 'raw' = 'thumbnail'
</script>

{#if bibKey}
  <img
    class={className}
    src={`${import.meta.env.BASE_URL}img/${dir}/${bibKey}.png`}
    alt={`Thumbnail for ${bibKey}`}
    {width}
  />
{/if}
