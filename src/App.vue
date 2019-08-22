<template>
  <div class="tb-vision">
    <div class="tb-vision-holder">
      <div class="tb-vision-wrapper" :style="inlineHeight">
        <div
          v-show="showSmallBanner"
          ref="tb-vision--small-wrapper"
          class="tb-vision-part tb-vision--small"
          :style="inlineSmallOpacity"
          v-touch:tap.prevent="onBannerTap"
          v-touch:moving="onBannerMove"
          v-touch:end="onBannerUp"
        >
          <img ref="tb-vision--small" :src="require(`${bannerSmallSrc}`)" alt="" id="tb-vision--small"/>
        </div>
        <div
          v-show="showBigBanner"
          ref="tb-vision--big-wrapper"
          class="tb-vision-part tb-vision--big"
          :style="inlineBigOpacity"
        >
          <a :href="this.goUrl" @click.prevent="onClickLink"><img ref="tb-vision--big" :src="require(`${this.bannerBigSrc}`)" alt="" id="tb-vision--big"></a>
        </div>
      </div>
    </div>
    
      <div
        class="tb-vision-button"
        v-touch:tap="onBannerTap"
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
      bannerMinHeight: this.minHeight || 160, // Минимальная высота баннера (равняется высоте малого подбаннера).
      bannerMaxHeight: this.maxHeight || 600, // Максимальная  высота баннера (равняется высоте большого подбаннера).
      bannerHeight: this.minHeight || 160, // Изначальная высота баннера (равняется малому подбаннеру).
      bannerDragActive: false, // Свойство, показывающее, что мы начали свайпить баннер.
      yPos: 0, // Свойство хранит координаты пальца при свайпе.
      bannerSmallOpacity: 1, // Начальная прзрачность малого подбаннера.
      bannerBigOpacity: 0, // Начальная прозрачность большого подбаннера.
      direction: 'none', // Свойство хранит направление, в котором растягивается баннер: вниз (раскрываем) или вверх (схлопываем).
      bigPartTriggerValue: 0.2, // Свойство хранит расстояние до максимальной высоты баннера (в %), с которого начнет показываться большой подбаннер.
    }
  },

  methods: {
    onBannerTap () {
      // Метод вызывается, когда мы тапнули по кнопке или мелкому подбаннеру
      // Если мы тапнули по большому подбаннеру, то редиректим на страницу рекламодателя
      if (this.bannerHeight === this.bannerMinHeight) this.increaseBannerHightToMax()
      if (this.bannerHeight === this.bannerMaxHeight) this.reduceBannerHightToMin()
    },

    onClickLink () {
      // Метод вызывается, когда мы кликнули по ссылке в большом подбаннере
      window.open(this.goUrl,'_blank')
    },

    onBannerDown (event) {
      this.yPos = event.targetTouches !== undefined? event.targetTouches[0].clientY : event.target.$$touchObj.startY
      if (this.yPos > 0) this.bannerDragActive = true
    },
    
    onBannerUp () {
      // Метод вызывается, когда мы отпустили кнопку или мелкий подбаннер
      if (!this.bannerDragActive) return
      this.bannerDragActive = false
      this.yPos = 0
    },
    
    onBannerMove (event) {
      // Метод вызывается, когда мы двигаем пальцем по тачскрину      
      if (event.targetTouches !== undefined) {
        if (this.bannerHeight === this.bannerMinHeight) this.yPos = this.bannerMinHeight
        if (!this.bannerDragActive) this.bannerDragActive = true
        
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
    
    beforeDestroy() {
      window.removeEventListener('resize', this.updateBannerSize)
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

    increaseBannerHightToMax () {
      this.$refs['tb-vision--big-wrapper'].style['display'] = 'block'
      const tl = new TimelineLite()
      tl
        .addLabel('startBigBannerShowing', '+=0.1')
        .to(this.$data, 0.5, {bannerHeight: this.bannerMaxHeight, bannerSmallOpacity: 0})
        .to(this.$data, 0.3, {bannerBigOpacity: 1,}, 'startBigBannerShowing')
    },

    reduceBannerHightToMin () {
      TweenLite.to(this.$data, 0.5, {
        bannerHeight: this.bannerMinHeight,
        bannerSmallOpacity: 1,
      });
    },
  },

  watch: {
    bannerHeight (newValue, oldValue) {
      // Слушаем изменения свойства высоты баннера
      if (this.bannerDragActive && (newValue === this.bannerMinHeight || newValue === this.bannerMaxHeight)) {
        this.yPos = 0
        this.bannerDragActive = false
      }

      // Добавим оверлей
      if (newValue > this.bannerMinHeight && oldValue === this.bannerMinHeight) {
        // Выполним только один раз, когда высота начинает увеличиваться
        document.querySelector('body').classList.add('active')
        
        // Проверим наличие функции adfox для расхлопа фрейма
        if (typeof window.expandBanner === "function") { 
          window.expandBanner()
        }
      }

      // Удалим оверлей
      if (newValue === this.bannerMinHeight) {
        // Выполним только один раз, когда высота стала равна максимальной высоте
        document.querySelector('body').classList.remove('active')
        
        // Проверим наличие функции adfox для расхлопа фрейма
        if (typeof window.collapseBanner === "function") { 
          window.collapseBanner()
        }
      }

      // Определяем направление изменения высоты баннера
      this.direction = newValue > oldValue? 'down' : 'up'

      // Уводим в ноль прозрачность малого подбаннера на очень маленьких значениях прозрачности, чтобы не было прыжков этой самой прозрачности (артефакт)
      if (this.direction === 'down' && this.bannerSmallOpacity <= 0.1 && this.bannerSmallOpacity !== 0)
        this.bannerSmallOpacity = 0
    },

    bannerDragActive (newValue, oldValue) {
      if (!newValue && (this.bannerHeight !== this.bannerMinHeight) && (this.bannerHeight !== this.bannerMaxHeight)) {
        if (this.direction === 'down') this.increaseBannerHightToMax()
        if (this.direction === 'up') this.reduceBannerHightToMin()
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
