<script lang="ts">
  export let bibKey: string
</script>

{#if bibKey}
  <img
    src={`/survis2/img/${bibKey}.png`}
    alt={`Thumbnail for ${bibKey}`}
    width="100px"
  />
{/if}
