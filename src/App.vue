<template>
  <div class="tb-vision">
    <div 
      class="tb-vision-wrapper"
    >
      <div class="tb-vision-part tb-vision--small">
        <banner-part 
          frameSrc="https://vignette.wikia.nocookie.net/openarena/images/c/cc/Oa_banner_300x80_rocket.png/revision/latest?cb=20100607072258" 
          frameWidth="300"
          frameHeight="80"
        />
      </div>
      <div class="tb-vision--big">
        <banner-part 
          frameSrc="https://cdn.thefabricator.com/mediakits/images/square-banner300x300.jpg" 
          frameWidth="300"
          frameHeight="300"
        />
      </div>
      <div class="tb-vision-button"></div>
    </div>
  </div>
</template>

<script>
import BannerPart from './components/BannerPart.vue'

export default {
  name: 'expandableBanner',
  components: {
    BannerPart
  },
  data () {
    return {
      bannerHeight: 80
    }
  }
}
</script>

<style>
  :root {
    --var-b-height: 80px;
  }
  .tb-vision-button {
    cursor: pointer;
    background-color: red;
    width: 16px;
    height: 16px;
    border-radius: 50%;
  }
  .tb-vision-wrapper {
    width: 300px;
    margin-left: auto;
    margin-right: auto;
    overflow: hidden;
    height: 80px;
  }
  .tb-vision-part {
    cursor: pointer;
  }
</style>
