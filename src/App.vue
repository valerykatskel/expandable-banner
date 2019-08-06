<template>
  <div class="tb-vision">
    <div class="settings">
      <span>yPos: {{yPos}}</span>
      <span>bannerHeight: {{bannerHeight}}</span>
      <span>bannerDragActive: {{bannerDragActive}}</span>
      <span>bannerSmallOpacity: {{bannerSmallOpacity}}</span>
    </div>
    <div class="tb-vision-holder">
      <div class="tb-vision-wrapper" :style="inlineHeight">
        <div class="tb-vision-part tb-vision--small" :style="inlineSmallOpacity">
          <img src="./assets/banner-small.png" alt="">
        </div>
        <div class="tb-vision-part tb-vision--big">
          <banner-part 
            frameSrc="https://cdn.thefabricator.com/mediakits/images/square-banner300x300.jpg" 
            frameWidth="300"
            frameHeight="300"
            frameId="bannerFrameBig"
          />
        </div>
      </div>
      <div
        class="tb-vision-button" 
        v-touch:start="onButtonDown"
        v-touch:moving="onMoveBanner"
      ></div>
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
      bannerHeight: 80,
      bannerDragActive: false,
      yPos: 0,
      bannerSmallOpacity: 1,
    }
  },

  methods: {
    onButtonDown (event) {
      console.log('button pressed (tapped)');
      this.bannerDragActive = true;
      this.yPos = event.changedTouches[0].clientY;
    },
    
    inlineSmallopacity () {
      return `opacity: ${this.bannerSmallOpacity}`;
    },

    onMoveBanner (event) {
      if (this.bannerDragActive) {
        //console.log('banner is moving');
        let diff = event.changedTouches[0].clientY - this.yPos;
        this.yPos = event.changedTouches[0].clientY;
        this.bannerHeight += diff;
        let opacityDiff = (diff*(100/220))/100;
        this.bannerSmallOpacity -= opacityDiff;
        if (this.bannerSmallOpacity < 0) this.bannerSmallOpacity = 0;
        if (this.bannerSmallOpacity > 1) this.bannerSmallOpacity = 1;
        
        if (this.bannerHeight < 80) this.bannerHeight = 80;
        if (this.bannerHeight > 300) this.bannerHeight = 300;
        
        //document.querySelector('.tb-vision-wrapper').style.height = this.bannerHeight;
      }
    },
    
    onButtonUp () {
      console.log('button unpressed');
      this.bannerDragActive = false;
      this.yPos = 0;
    },
  },

  watch: {
    bannerHeight (newValue, oldValue) {
      if (newValue === 80) {
        this.yPos = 0;
        this.bannerDragActive = false;
      }
    }
  },

  computed: {
    inlineHeight () {
      return `height: ${this.bannerHeight}px`;
    },
    

  }
}
</script>

<style lang="scss">
  .settings {
    border: 1px solid red;
    position: absolute;
    span {
      display: block;
    }
  }
  :root {
    --var-b-height: 80px;
  }
  .tb-vision-holder {
    position: relative;
    width: 300px;
    margin-left: auto;
    margin-right: auto;
  }
  .tb-vision-button {
    cursor: pointer;
    background-color: red;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-left: auto;
    margin-right: auto;
    transition: box-shadow 400ms;
    &:hover {
      box-shadow: 0px 0px 8px 8px #fa94946e;
    }
  }
  .tb-vision-wrapper {
    overflow: hidden;
    height: 80px;
    position: relative;
    border: 1px solid black;
    
    .tb-vision-part {
      cursor: pointer;
      background-color: #000;

      &.tb-vision--small {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        img {
          height: 100%;
          width: 100%;
          opacity: 1;
        }
      }
      &.tb-vision--big {
        opacity: 0;
      }
    }
  }
</style>
