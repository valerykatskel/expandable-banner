<template>
  <div>  
    <iframe 
      :src="this.frameSrc" 
      :width="this.frameWidth" 
      :height="this.frameHeight" 
      frameborder="0"></iframe>  
  </div>
</template>

<script>
export default {
  name: 'BannerPart',
  props: {
    frameSrc: String,
    frameWidth: String,
    frameHeight: String
  }
}
</script>

<style scoped>

</style>
