<template>
  <div class="tb-vision">
    <!-- <div class="settings">
      <span>yPos: {{yPos}}</span>
      <span>direction: {{this.direction}}</span>
      <span>bannerHeight: {{bannerHeight}}</span>
      <span>bannerDragActive: {{bannerDragActive}}</span>
      <span>bannerSmallOpacity: {{bannerSmallOpacity}}</span>
      <span>bannerBigOpacity: {{bannerBigOpacity}}</span>
      <span>showBigBanner: {{this.showBigBanner}}</span>
      <span>showSmallBanner: {{this.showSmallBanner}}</span>
    </div> -->
    <div class="tb-vision-holder">
      <div
        class="tb-vision-wrapper"
        :style="inlineHeight"
      >
        <div
          v-if="showSmallBanner"
          class="tb-vision-part tb-vision--small"
          :style="inlineSmallOpacity">
          <img src="./assets/banner-small.png" alt=""
          v-touch:start="onBannerDown"
          v-touch:moving="onBannerMove"
          v-touch:end="onBannerUp"
        ></div>
        <div
          v-if="showBigBanner"
          class="tb-vision-part tb-vision--big"
          :style="inlineBigOpacity"
        >
          <a :href="this.goUrl" target="_blank"><img src="./assets/banner-big.jpg" alt=""></a>
        </div>
      </div>
    </div>
    
      <div
        class="tb-vision-button"
        v-touch:start="onBannerDown"
        v-touch:moving="onBannerMove"
        v-touch:end="onBannerUp"
      ></div>
  </div>
</template>

<script>

export default {
  name: 'expandableBanner',

  props: {
    url: String,
    minHeight: Number,
    maxHeight: Number,
    bigPicture: String,
    smallPicture: String
  },

  data () {
    return {
      goUrl: this.url || 'http://www.tut.by/',
      bannerMinHeight: this.minHeight || 80, // Минимальная высота баннера (равняется высоте малого подбаннера).
      bannerMaxHeight: this.maxHeight || 300, // Максимальная  высота баннера (равняется высоте большого подбаннера).
      bannerHeight: this.minHeight || 80, // Изначальная высота баннера (равняется малому подбаннеру).
      bannerDragActive: false, // Свойство, показывающее, что мы начали свайпить баннер.
      yPos: 0, // Свойство хранит координаты пальца при свайпе.
      bannerSmallOpacity: 1, // Начальная прзрачность малого подбаннера.
      bannerBigOpacity: 0, // Начальная прозрачность большого подбаннера.
      direction: 'none', // Свойство хранит направление, в котором растягивается баннер: вниз (раскрываем) или вверх (схлопываем).
      bigPartTriggerValue: 0.2, // Свойство хранит расстояние до максимальной высоты баннера (в %), с которого начнет показываться большой подбаннер.
    }
  },

  methods: {
    onBannerDown (event) {
      // Метод вызывается, когда мы тапнули по кнопке или мелкому подбаннеру.      
      this.bannerDragActive = true
      this.yPos = event.targetTouches[0].clientY
    },
    
    onBannerUp () {
      // Метод вызывается, когда мы "оттапнули" кнопку
      this.bannerDragActive = false
      this.yPos = 0
    },
    
    onBannerMove (event) {
      // Метод вызывается, когда мы двигаем пальцем по тачскрину      
      if (this.bannerDragActive) {
        // Получаем текущую координату y при движении пальцем по тачскрину
        let currentY = event.targetTouches[0].clientY
        // Получаем разность в пикселях между предыдущей координатой y и текущей
        let diff = currentY - this.yPos
        // Обновляем координаты пальца при свайпе
        this.yPos = currentY
        // Высчитываем новую высоту баннера
        this.bannerHeight += diff
        
        // Обновляем значение прозрачности для малого подбаннера
        this.getOpacityForSmallBannerPart(diff)
        // Обновляем значение прозрачности для большого подбаннера
        this.getOpacityForBigBannerPart(diff)

        // Ограничим изменение высоты баннера
        this.checkBannerHeight()
      }
    },

    getOpacityForSmallBannerPart (diff) {
      // Метод обновляет значение прозрачности для малого подбаннера
      let opacityDiff = (diff*(100/this.bannerMovingSize))/100
      this.bannerSmallOpacity -= opacityDiff
      if (this.bannerSmallOpacity < 0) this.bannerSmallOpacity = 0
      if (this.bannerSmallOpacity > 1) this.bannerSmallOpacity = 1  
    },
 
    getOpacityForBigBannerPart (diff) {
      // Метод обновляет значение прозрачности для большого подбаннера
      if (this.showBigBanner) {
        if (this.bannerHeight >= this.bannerMaxHeight) {
          this.bannerBigOpacity = 1
        } else {
          let opacityDiff = (diff*(100/(this.bannerMovingSize*this.bigPartTriggerValue)))/100
          this.bannerBigOpacity += opacityDiff
            
          if (this.bannerBigOpacity < 0) this.bannerBigOpacity = 0
          if (this.bannerBigOpacity > 1) this.bannerBigOpacity = 1  
        }
      }
    }, 

    checkBannerHeight() {
      // Свойство обновляет высоту баннера, если это требуется
      if (this.bannerHeight < this.bannerMinHeight) {
        this.bannerHeight = this.bannerMinHeight
      }
      if (this.bannerHeight > this.bannerMaxHeight) {
        this.bannerHeight = this.bannerMaxHeight
      }
    },
  },

  watch: {
    bannerHeight (newValue, oldValue) {
      // Слушаем изменения свойства высоты баннера
      if (newValue === this.bannerMinHeight && newValue === this.bannerMaxHeight) {
        this.yPos = 0
        this.bannerDragActive = false
      }

      // Добавим оверлей
      if (newValue > this.bannerMinHeight) {
        document.querySelector('body').classList.add('active')
        // Проверим наличие функции adfox для расхлопа фрейма
        if (typeof window.expandBanner === "function") { 
          window.expandBanner()
        }
      }

      // Удалим оверлей
      if (newValue === this.bannerMinHeight) {
        document.querySelector('body').classList.remove('active')
        // Проверим наличие функции adfox для расхлопа фрейма
        if (typeof window.collapseBanner === "function") { 
          window.collapseBanner()
        }
      }

      // Определяем направление изменения высоты баннера
      this.direction = newValue > oldValue? 'down' : 'up'

      // Уводим в ноль прозрачность малого подбаннера на очень маленьких значениях прозрачности, чтобы не было прыжков этой самой прозрачности (артефакт)
      if (this.direction === 'down' && this.bannerSmallOpacity <= 0.1)
        this.bannerSmallOpacity = 0
    },

    bannerDragActive (newValue) {
      // Слушаем изменения свойства начала изменения высоты баннера
      if (!newValue && this.bannerHeight > this.bannerMinHeight)
        this.bannerHeight = this.bannerMaxHeight

      if (!newValue) {
        if (this.direction === 'down') {
          this.bannerHeight = this.bannerMaxHeight
          this.bannerSmallOpacity = 0
          this.bannerBigOpacity = 1
        }
        if (this.direction === 'up') {
          this.bannerHeight = this.bannerMinHeight
          this.bannerSmallOpacity = 1
          this.bannerBigOpacity = 0
        }
      } 
    },
  },

  computed: {
    inlineHeight () {
      // Свойство возвращает инлайн стиль для изменения высоты баннера
      return `height: ${this.bannerHeight}px`
    },

    inlineSmallOpacity () {
      // Свойство возвращает инлайн стиль для обновления прозрачности малого подбаннера
      return `opacity: ${this.bannerSmallOpacity}`
    },

    inlineBigOpacity () {
      // Свойство возвращает инлайн стиль для обновления прозрачности большого подбаннера
      return `opacity: ${this.bannerBigOpacity}`
    },    

    showBigBanner () {
      // Свойство, которое показывает, нужно ли показывать большой подбаннер
      return this.bannerHeight >= (this.bannerMaxHeight - this.bannerMaxHeight * this.bigPartTriggerValue)
    },
    
    showSmallBanner () {
      // Свойство, которое показывает, нужно ли показывать малый подбаннер
      return this.bannerHeight < this.bannerMaxHeight
    },

    bannerMovingSize () {
      // Свойство, которое возвращает диапазон (в пикселях), в котором изменяется высота баннера
      return this.bannerMaxHeight - this.bannerMinHeight
    },
  }
}
</script>

<style lang="scss">
  body {
    /* Disables pull-to-refresh but allows overscroll glow effects. */
    overscroll-behavior-y: contain;
    margin: 0;
    &.active {      
      background: rgba(0, 0, 0, 0.54);
    }
  }
  .settings {
    border: 1px solid red;
    position: absolute;
    bottom: 0;
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
    z-index: -1;
  }
  .tb-vision-button {
    cursor: pointer;
    background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAqCAYAAAD1T9h6AAAACXBIWXMAABYlAAAWJQFJUiTwAAADv0lEQVRYhdVZW08TQRT+tl1u0i7gg9hEQ9HEkEgRH0wkkQDqDygxXl6A1qiJUazxD8Bf8FVNyuXRGPgHauIbiCXoi4lSoglgCOi2GEFgzKln69oWut1Z2vIlk+7Ozpz5zpzLds4qsAAhRD2AIIAuAO3c9gMxbq8BTCqK8l1qDSGEXwgRFaUDre3fi+OuFhBCDAOIAKjnrjUAXwAsA1gFsOmwBSoBHAbQCOA4gAbuJys8VhRl2JIC7C5RdhnCNwBzTLyYIEUCAI7wmpMAwplupeQg/9Lk4+SPH4tMPBOnMvj0mJXIVGCCd/43B9KPUjI3oY4TSAUHd6/xyGVcsM8bbvMGQBKAu0xakjkRgsw1BYXJU6S/44D9AOBz0ffYGk4AOM2BfVZRlLjK04aYPGWXBd71cgRx83G2GkoFNQfuGpOdMl2XKyi9nmNuDarJ78nP9DLefQM6c/UQd5Wjm7ACQM0/vyywwgp0qaYcmzgAu28gwb/tFAOCb8j/t0vLyzLcRhxkuoxlC8zNvT+k67ojFtM0bTsQaP1pZ666y3VeTE9N1z198uyYA/xx+86tr4FAq60/hy7TdUFv3fDN0Krf3/RLljzJIFk23vhZCqiFtsHI4JKsAiyj4LUdUaCj4/zmpcsXdbvkaS7JkFHAnIU+2SGh67rrSu/VpvX1dZeF4WnU1tbuvJh4vqBp2o6ddQGcBFsgzh01dnZC0zTXvft3VwtdnebQXJu7X8Ni4mYFKmwKU4O9wY22tsCGVfI0lubYXY+5phWIyVjAaA8fRZJWFeCxttcyWSBGCszyTZXM4aWlpUUMhPrzvoxoDI2VPChVsbhZhQ8z89whVYdJJBJKf1/Iu7y0nDOgG4827oyNjyS8Xq/I9bwAGJWSZhedakxxUC1jWq/X645EHuz6RqVnNEbSfapZXJy4Gzs1yr+VksLV7p4udHZeyEqN1EfPZOUzxzRn85nYcKMtSfNicXERA31hNZn8G9cejwej49Etn88nKxqsBKE5bQF2oxF+IF2J8Pl87us3rqX9nK6pz6EKB2GEOf+rC2VYwREM9IdTYkbHok6KTe9+Vi/VW5ws4868nUk1h/FfjTRXaZHqQ3tWhEuIONeDcpcWWYl2VqIcQeRjZl5ZLxweEC5D8uFM8nvC6XiQRM5vAwdFCXvkTUqESkg+JEXepES7EGK+iMTnOZk4B0qxRXKpYU7n+4N9/HKZ94uk0xbx827JuBbNJRm2iVv60G1FGQDdAM5wsZjuM0kZ5w7K5XQKfJXz/0whAPAHxcFOEUMg5eAAAAAASUVORK5CYII=');
    background-size: 100%;
    width: 48px;
    height: 42px;
    margin-top: -15px;
    margin-left: auto;
    margin-right: auto;
    z-index: 9;
  }
  .tb-vision-wrapper {
    overflow: hidden;
    height: 80px;
    position: relative;
    background-color: #000;
    
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
        opacity: 1;
      }
    }
  }
</style>
