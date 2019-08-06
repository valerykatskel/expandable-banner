<template>
  <div class="tb-vision">
    <div class="settings">
      <span>yPos: {{yPos}}</span>
      <span>direction: {{this.direction}}</span>
      <span>bannerHeight: {{bannerHeight}}</span>
      <span>bannerDragActive: {{bannerDragActive}}</span>
      <span>bannerSmallOpacity: {{bannerSmallOpacity}}</span>
      <span>bannerBigOpacity: {{bannerBigOpacity}}</span>
      <span>showBigBanner: {{this.showBigBanner}}</span>
      <span>showSmallBanner: {{this.showSmallBanner}}</span>
    </div>
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
        ></div>
        <div 
          v-if="showBigBanner"
          class="tb-vision-part tb-vision--big"
          :style="inlineBigOpacity"
        >
          <img src="./assets/banner-big.jpg" alt="">
        </div>
      </div>
      <div
        class="tb-vision-button" 
        v-touch:start="onButtonDown"
        v-touch:moving="onMoveBanner"
        v-touch:end="onButtonUp"
      ></div>
    </div> 
  </div>
</template>

<script>

export default {
  name: 'expandableBanner',

  data () {
    return {
      bannerMinHeight: 80, // Минимальная высота баннера (равняется высоте малого подбаннера).
      bannerMaxHeight: 300, // Максимальная  высота баннера (равняется высоте большого подбаннера).
      bannerHeight: 80, // Изначальная высота баннера (равняется малому подбаннеру).
      bannerDragActive: false, // Свойство, показывающее, что мы начали свайпить баннер.
      yPos: 0, // Свойство хранит координаты пальца при свайпе.
      bannerSmallOpacity: 1, // Начальная прзрачность малого подбаннера.
      bannerBigOpacity: 0, // Начальная прозрачность большого подбаннера.
      direction: 'none', // Свойство хранит направление, в котором растягивается баннер: вниз (раскрываем) или вверх (схлопываем).
      bigPartTriggerValue: 0.2, // Свойство хранит расстояние до максимальной высоты баннера (в %), с которого начнет показываться большой подбаннер.
    }
  },

  methods: {
    onButtonDown (event) {
      // Метод вызывается, когда мы тапнули по кнопке.      
      this.bannerDragActive = true
      this.yPos = event.changedTouches[0].clientY
    },
    
    onButtonUp () {
      // Метод вызывается, когда мы "оттапнули" кнопку
      this.bannerDragActive = false
      this.yPos = 0
    },
    
    onMoveBanner (event) {
      // Метод вызывается, когда мы двигаем пальцем по тачскрину      
      if (this.bannerDragActive) {
        // Получаем текущую координату y при движении пальцем по тачскрину
        let currentY = event.changedTouches[0].clientY
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
        this.checkBannerHeight
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
      }

      // Удалим оверлей
      if (newValue === this.bannerMinHeight) {
        document.querySelector('body').classList.remove('active')
      }

      // Определяем направление изменения высоты баннера
      this.direction = newValue > oldValue? 'down' : 'up'

      // Уводим в ноль прозрачность малого подбаннера на очень маленьких значениях прозрачности, чтобы не было прыжков этой самой прозрачности (артефакт)
      if (this.direction === 'down' && this.bannerSmallOpacity <= 0.1)
        this.bannerSmallOpacity = 0
    },

    bannerDragActive (newValue, oldValue) {
      // Слушаем изменения свойства начала изменения высоты баннера
      const diff = newValue - oldValue
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

    checkBannerHeight() {
      // Свойство обновляет высоту баннера, если это требуется
      if (this.bannerHeight < this.bannerMinHeight) this.bannerHeight = this.bannerMinHeight
      if (this.bannerHeight > this.bannerMaxHeight) this.bannerHeight = this.bannerMaxHeight
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
