<template>
  <div class="tb-vision">
    <div class="tb-vision-holder">
      <div
        class="tb-vision-wrapper"
        :class="tappedClass"
        :style="inlineHeight"
      >
        <div
          v-if="showSmallBanner"
          class="tb-vision-part tb-vision--small"
          :style="inlineSmallOpacity"
          v-touch:tap.prevent="onBannerTap"
          v-touch:start="onBannerDown"
          v-touch:moving="onBannerMove"
          v-touch:end="onBannerUp"
        >
          <img src="./assets/banner-small.jpg" alt=""/>
        </div>
        <div
          v-if="showBigBanner"
          class="tb-vision-part tb-vision--big"
          :style="inlineBigOpacity"
        >
          <a :href="this.goUrl" @click.prevent="onClickLink"><img src="./assets/banner-big.jpg" alt=""></a>
        </div>
      </div>
    </div>
    
      <div
        class="tb-vision-button"
        v-touch:tap="onBannerTap"
        v-touch:start="onBannerDown"
        v-touch:moving="onBannerMove"
        v-touch:end="onBannerUp"
      ><span>Свернуть</span></div>
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
      goUrl: this.url || 'http://www.google.com/',
      bannerSmallSrc: this.smallPicture || './assets/banner-small.jpg',
      bannerBigSrc: this.bigPicture || './assets/banner-big.jpg',
      bannerMinHeight: this.minHeight || 80, // Минимальная высота баннера (равняется высоте малого подбаннера).
      bannerMaxHeight: this.maxHeight || 300, // Максимальная  высота баннера (равняется высоте большого подбаннера).
      bannerHeight: this.minHeight || 80, // Изначальная высота баннера (равняется малому подбаннеру).
      bannerDragActive: false, // Свойство, показывающее, что мы начали свайпить баннер.
      yPos: 0, // Свойство хранит координаты пальца при свайпе.
      bannerSmallOpacity: 1, // Начальная прзрачность малого подбаннера.
      bannerBigOpacity: 0, // Начальная прозрачность большого подбаннера.
      direction: 'none', // Свойство хранит направление, в котором растягивается баннер: вниз (раскрываем) или вверх (схлопываем).
      bigPartTriggerValue: 0.2, // Свойство хранит расстояние до максимальной высоты баннера (в %), с которого начнет показываться большой подбаннер.
      useTapEvent: true,
    }
  },

  methods: {
    onBannerTap () {
      // Метод вызывается, когда мы тапнули по кнопке или мелкому подбаннеру
      // Если мы тапнули по большому подбаннеру, то редиректим на страницу рекламодателя
      this.useTapEvent = true
      if (this.bannerHeight === this.bannerMinHeight)
        this.bannerHeight = this.bannerMaxHeight
      else
        this.bannerHeight = this.bannerMinHeight
    },

    onClickLink () {
      // Метод вызывается, когда мы кликнули по ссылке в большом подбаннере
      window.open(this.goUrl,'_blank')
    },

    onBannerDown (event) {
      // Метод вызывается, когда мы нажали по кнопке или мелкому подбаннеру   
      this.useTapEvent = false 
      this.bannerDragActive = true
      this.yPos = event.targetTouches[0].clientY
    },
    
    onBannerUp () {
      // Метод вызывается, когда мы отпустили кнопку или мелкий подбаннер
      this.bannerDragActive = false
      this.useTapEvent = true
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

    tappedClass () {
      return this.useTapEvent? 'tapped' : '';
    }
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
      .tb-vision-button {
        background-image: url('data:image/png;base64,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');
        background-size: 100%;
        width: 48px;
        height: 42px;
        margin-top: -15px;
        margin-left: auto;
        margin-right: auto;
        z-index: 9;
        span {
          display: inline-block;
          margin-top: 45px;
          font-family : Verdana;
          font-weight : bold;
          font-size : 8px;
          letter-spacing : 0.96px;
          text-transform: uppercase;
          color : #FFFFFF;
          color : rgb(255, 255, 255);
        }
      }
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
    
  }
  .tb-vision-button {
    cursor: pointer;
    background-image: url('data:image/png;base64,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');
    background-size: 100%;
    width: 48px;
    height: 42px;
    margin-top: -15px;
    margin-left: auto;
    margin-right: auto;
    position: relative;
    span {
      display: none;
    }
  }
  .tb-vision-wrapper {
    overflow: hidden;
    height: 80px;
    position: relative;
    background-color: #000;
    
    &.tapped{
      transition: height 300ms;
    }
    
    .tb-vision-part {
      cursor: pointer;
      background-color: #000;

      img {
        display: block;
      }

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
