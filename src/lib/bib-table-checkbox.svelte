<script lang="ts">
  import Plus from 'lucide-svelte/icons/plus'
  import { slate400 } from './colors'

  export let onClick: () => void = () => {}
</script>

<button on:click={onClick}>
  <Plus color={slate400} class="cursor-pointer" />
</button>
