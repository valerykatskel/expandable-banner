<template>
  <div class="resp-container" @message="getMessage">  
    <iframe 
      :id="this.frameId"
      :src="this.frameSrc" 
      :width="this.frameWidth" 
      :height="this.frameHeight" 
      frameborder="0"
      @load="iframeStyles"
      ref="iframeContent"
    ></iframe>  
  </div>
</template>

<script>
export default {
  name: 'BannerPart',
  props: {
    frameId: String,
    frameSrc: String,
    frameWidth: String,
    frameHeight: String
  },
  
  methods: {
    getMessage () {
      console.log('there is a message')
    },

    iframeStyles () {
      //console.log(parent)
      
      let frame = this.$refs.iframeContent;
      console.log(frame)
      // let css = document.createElement('style')
      // css.type = 'text/css'

      // let styles = `
      //   body {
      //     background-color: lime;
      //     color: pink;
      //   }`

      //this.frame.postMessage('OK', '*')
      // css.appendChild(document.createTextNode(styles))
      // let head = frame.document.getElementsByTagName("head")[0];
      //console.log(frame)
      //head.appendChild(css)
    },
  },

}
</script>

<style scoped>
  .resp-container {
    position: relative;
    overflow: hidden;
  }
</style>
