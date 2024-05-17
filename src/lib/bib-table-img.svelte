<script lang="ts">
  export let bibKey: string
  export let className = ''
  export let width = '100px'
</script>

{#if bibKey}
  <img
    class={className}
    src={`/survis2/img/${bibKey}.png`}
    alt={`Thumbnail for ${bibKey}`}
    {width}
  />
{/if}
