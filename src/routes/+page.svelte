<script>
  import { log } from '$lib/bridge.js'
  log()
</script>

<svelte:head>
  <title>Home</title>
  <meta name='description' content='Placeholder for Svelte app' />
</svelte:head>

<section>
  <img src='loading-aliased.gif' alt='Proto is loading' id='loading' />
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
  }

  #loading {
    display: block;
    margin-top: 50px;
    left: calc(50%-100px);
    width: 200px;
  }
</style>
