<template>
  <div class="tb-vision">
    <div
      v-if="useDebugMode"
      style="position: absolute; bottom: 0; left: 0; background: red; color: white;font-family: Arial;"
    >
      <span>{{smallBannerModeText}}</span>
      <br />
      <span>Banner height: {{this.bannerHeight.toFixed(0)}}</span>
    </div>
    <div class="tb-vision-holder" v-resize="onResize">
      <a
        href="#"
        class="tb-vision-whole-link"
        v-touch:tap="onClickLink"
        v-touch:moving="onBannerMove"
        v-touch:end="onBannerUp"
      ></a>
      <div class="tb-vision-wrapper" :style="inlineStylesForBanner">
        <div
          v-show="showSmallBanner"
          ref="tb-vision--small-wrapper"
          class="tb-vision-part tb-vision--small"
          :style="inlineSmallOpacity"
        >
          <iframe
            v-if="useHtmlModeSmall"
            :src="bannerSmallHtmlPrepared"
            width="728px"
            :style="{ marginLeft: iframeMargin + 'px' }"
            :height="bannerMinHeight"
            scrolling="no"
          ></iframe>

          <img
            v-if="!useHtmlModeSmall"
            ref="tb-vision--small"
            :src="bannerSmallSrc"
            alt
            id="tb-vision--small"
          />
        </div>
        <div
          v-show="showBigBanner"
          ref="tb-vision--big-wrapper"
          class="tb-vision-part tb-vision--big"
          :style="inlineBigOpacity"
        >
          <iframe
            v-if="useHtmlModeBig"
            :src="bannerBigHtmlPrepared"
            width="728px"
            :style="{ marginLeft: iframeMargin + 'px' }"
            :height="bannerMaxHeight"
            scrolling="no"
          ></iframe>
          <img
            v-if="!useHtmlModeBig"
            ref="tb-vision--big"
            :src="this.bannerBigSrc"
            alt
            id="tb-vision--big"
          />
        </div>
      </div>
    </div>

    <div
      class="tb-vision-button"
      v-touch:tap="onBannerTap"
      v-touch:moving="onBannerMove"
      v-touch:end="onBannerUp"
    >
      <span>Свернуть</span>
    </div>
  </div>
</template>

<script>
import { TimelineLite, TweenLite } from "gsap";
export default {
  name: "expandableBanner",

  data() {
    return {
      goUrl: "",
      useDebugMode: false, // Использовать или нет режим отладки. В этом режиме в нижней части экрана появляется секция с различной отладочной информацией.
      useHtmlModeSmall: true, // Использовать или нет HTML режим для баннера (малого)
      useHtmlModeBig: true, // Использовать или нет HTML режим для баннера (большого)
      bannerSmallSrc: "",
      bannerBigSrc: "",
      bannerSmallHtml: "",
      bannerBigHtml: "",
      bannerMinHeight: 160, // Минимальная высота баннера (равняется высоте малого подбаннера).
      bannerMaxHeight: 350, // Максимальная  высота баннера (равняется высоте большого подбаннера).
      bannerHeight: 160, // Изначальная высота баннера (равняется малому подбаннеру).
      bannerBackground: "#e8cda7", // Цвет фона для всего баннера
      bannerSmallBackground: "transparent", // Цвет фона для малого подбаннера
      bannerBigBackground: "transparent", // Цвет фона для большого подбаннера
      bannerDragActive: false, // Свойство, показывающее, что мы начали свайпить баннер.
      yPos: 0, // Свойство хранит координаты пальца при свайпе.
      bannerSmallOpacity: 1, // Начальная прзрачность малого подбаннера.
      bannerBigOpacity: 0, // Начальная прозрачность большого подбаннера.
      direction: "none", // Свойство хранит направление, в котором растягивается баннер: вниз (раскрываем) или вверх (схлопываем).
      bigPartTriggerValue: 0.2, // Свойство хранит расстояние до максимальной высоты баннера (в %), с которого начнет показываться большой подбаннер.
      smallBannerMode: true, // При начальной загрузке баннер находится в режиме показа малого подбаннера
      iframeMargin: 0,
      bannerWidth: 728 // ширина баннера (большой и малый)
    };
  },

  created() {
    this.applyUserOptions();
    this.bannerHeight = this.bannerMinHeight; // Изначальная высота баннера (равняется малому подбаннеру).
  },

  methods: {
    applyUserOptions() {
      // Метод копирует значения, которые переданы прямо в html при рендеринге, если такие есть.
      if (Object.keys(window.initialData).length > 0) {
        Object.keys(window.initialData).map(el => {
          this[el] = window.initialData[el];
        });
      }
    },

    onResize({ width }) {
      this.iframeMargin = this.calcIframeMargin(width);
    },

    calcIframeMargin(w) {
      const delta = this.bannerWidth - w;
      return (delta / 2) * -1;
    },

    onBannerTap() {
      // Метод вызывается, когда мы тапнули по кнопке или мелкому подбаннеру
      // Если мы тапнули по большому подбаннеру, то редиректим на страницу рекламодателя
      if (this.bannerHeight <= this.bannerMinHeight)
        this.increaseBannerHightToMax();
      if (this.bannerHeight === this.bannerMaxHeight)
        this.reduceBannerHightToMin();
    },

    onClickLink() {
      // Метод вызывается, когда мы кликнули по основной ссылке. Разворачиваем до большого размера баннер или переходим по ссылке, в зависимости от режима, в каком находится баннер.
      if (this.smallBannerMode) {
        this.increaseBannerHightToMax();
      } else {
        window.open(this.goUrl, "_blank");
      }
    },

    onBannerDown(event) {
      this.yPos =
        event.targetTouches !== undefined
          ? event.targetTouches[0].clientY
          : event.target.$$touchObj.startY;
      if (this.yPos > 0) this.bannerDragActive = true;
    },

    onBannerUp() {
      // Метод вызывается, когда мы отпустили кнопку или мелкий подбаннер
      if (!this.bannerDragActive) return;
      this.bannerDragActive = false;
      this.yPos = 0;
    },

    onBannerMove(event) {
      // Метод вызывается, когда мы двигаем пальцем по тачскрину
      if (event.targetTouches !== undefined) {
        if (this.bannerHeight === this.bannerMinHeight)
          this.yPos = this.bannerMinHeight;
        if (!this.bannerDragActive) this.bannerDragActive = true;

        // Получаем текущую координату y при движении пальцем по тачскрину
        let currentY = event.targetTouches[0].clientY;

        // Получаем разность в пикселях между предыдущей координатой y и текущей
        let diff = currentY - this.yPos;

        // Обновляем координаты пальца при свайпе
        this.yPos = currentY;

        // Высчитываем новую высоту баннера
        this.bannerHeight += diff;

        // Обновляем значение прозрачности для малого подбаннера
        this.getOpacityForSmallBannerPart(diff);

        // Обновляем значение прозрачности для большого подбаннера
        this.getOpacityForBigBannerPart(diff);

        // Ограничим изменение высоты баннера
        this.checkBannerHeight();
      }
    },

    getOpacityForSmallBannerPart(diff) {
      // Метод обновляет значение прозрачности для малого подбаннера
      let opacityDiff = (diff * (100 / this.bannerMovingSize)) / 100;
      this.bannerSmallOpacity -= opacityDiff;
      if (this.bannerSmallOpacity < 0) this.bannerSmallOpacity = 0;
      if (this.bannerSmallOpacity > 1) this.bannerSmallOpacity = 1;
    },

    getOpacityForBigBannerPart(diff) {
      // Метод обновляет значение прозрачности для большого подбаннера
      if (this.showBigBanner) {
        if (this.bannerHeight >= this.bannerMaxHeight) {
          this.bannerBigOpacity = 1;
        } else {
          if (this.bigPartTriggerValue < 1) {
            let opacityDiff =
              (diff *
                (100 / (this.bannerMovingSize * this.bigPartTriggerValue))) /
              100;
            this.bannerBigOpacity += opacityDiff;
          }
          if (this.bannerBigOpacity < 0) this.bannerBigOpacity = 0;
          if (this.bannerBigOpacity > 1) this.bannerBigOpacity = 1;
        }
      }
    },

    checkBannerHeight() {
      // Свойство обновляет высоту баннера, если это требуется
      if (this.bannerHeight < this.bannerMinHeight) {
        this.bannerHeight = this.bannerMinHeight;
      }
      if (this.bannerHeight > this.bannerMaxHeight) {
        this.bannerHeight = this.bannerMaxHeight;
      }
    },

    increaseBannerHightToMax() {
      this.$refs["tb-vision--big-wrapper"].style["display"] = "block";
      const tl = new TimelineLite();
      tl.addLabel("startBigBannerShowing", "+=0.1")
        .to(this.$data, 0.5, {
          bannerHeight: this.bannerMaxHeight,
          bannerSmallOpacity: 0
        })
        .to(this.$data, 0.3, { bannerBigOpacity: 1 }, "startBigBannerShowing");
    },

    reduceBannerHightToMin() {
      TweenLite.to(this.$data, 0.5, {
        bannerHeight: this.bannerMinHeight,
        bannerSmallOpacity: 1
      });
    },

    utf8_to_b64(str) {
      // btoa
      return window.btoa(unescape(encodeURIComponent(str)));
    },

    b64_to_utf8(str) {
      // atob
      return decodeURIComponent(escape(window.atob(str)));
    }
  },
  mounted() {
    this.$nextTick(() => {
      const containerWidth = document.querySelector(".tb-vision-holder")
        .offsetWidth;
      this.iframeMargin = this.iframeMargin = this.calcIframeMargin(
        containerWidth
      );
    });
  },

  watch: {
    bannerHeight(newValue, oldValue) {
      // Слушаем изменения свойства высоты баннера
      if (
        this.bannerDragActive &&
        (newValue === this.bannerMinHeight || newValue === this.bannerMaxHeight)
      ) {
        this.yPos = 0;
        this.bannerDragActive = false;
      }

      // Добавим оверлей
      if (
        newValue > this.bannerMinHeight &&
        oldValue === this.bannerMinHeight
      ) {
        // Выполним только один раз, когда высота начинает увеличиваться
        document.querySelector("body").classList.add("active");
        // Принудительно проскроливаем страницу, чтобы скрылся залипающий херед (частный случай, нет необходимости пока выносить в параметры)
        window.parent.scrollTo(0, 45);

        // Проверим наличие функции adfox для расхлопа фрейма
        if (typeof window.expandBanner === "function") {
          window.expandBanner();
        }
      }

      // Удалим оверлей
      if (
        newValue < this.bannerMaxHeight &&
        oldValue === this.bannerMaxHeight
      ) {
        // Выполним только один раз, когда высота стала меньше максимальной высоты
        document.querySelector("body").classList.remove("active");
        // Принудительно проскроливаем страницу, чтобы скрылся залипающий херед (частный случай, нет необходимости пока выносить в параметры)
        window.parent.scrollTo(0, 45);
      }

      if (newValue === this.bannerMinHeight) {
        if (typeof window.collapseBanner === "function") {
          window.collapseBanner();
        }
      }

      // Обновим значение переменной, в которую пишем, какой банер показан в данный момент
      if (newValue === this.bannerMinHeight) this.smallBannerMode = true;
      if (newValue === this.bannerMaxHeight) this.smallBannerMode = false;

      // Определяем направление изменения высоты баннера
      this.direction = newValue > oldValue ? "down" : "up";

      // Уводим в ноль прозрачность малого подбаннера на очень маленьких значениях прозрачности, чтобы не было прыжков этой самой прозрачности (артефакт)
      if (
        this.direction === "down" &&
        this.bannerSmallOpacity <= 0.1 &&
        this.bannerSmallOpacity !== 0
      )
        this.bannerSmallOpacity = 0;
    },

    bannerDragActive(newValue) {
      if (
        !newValue &&
        this.bannerHeight !== this.bannerMinHeight &&
        this.bannerHeight !== this.bannerMaxHeight
      ) {
        if (this.direction === "down") this.increaseBannerHightToMax();
        if (this.direction === "up") this.reduceBannerHightToMin();
      }
    }
  },

  computed: {
    inlineStylesForBanner() {
      // Свойство возвращает инлайн стиль для изменения высоты баннера
      return `height: ${this.bannerHeight}px; background: ${this.bannerBackground}`;
    },

    inlineSmallOpacity() {
      // Свойство возвращает инлайн стиль для обновления прозрачности малого подбаннера
      return `opacity: ${this.bannerSmallOpacity}; background: ${this.bannerSmallBackground}`;
    },

    inlineBigOpacity() {
      // Свойство возвращает инлайн стиль для обновления прозрачности большого подбаннера
      return `opacity: ${this.bannerBigOpacity}; background: ${this.bannerBigBackground}`;
    },

    showBigBanner() {
      // Свойство, которое показывает, нужно ли показывать большой подбаннер
      return (
        this.bannerHeight >=
        this.bannerMaxHeight - this.bannerMaxHeight * this.bigPartTriggerValue
      );
    },

    showSmallBanner() {
      // Свойство, которое показывает, нужно ли показывать малый подбаннер
      return this.bannerHeight < this.bannerMaxHeight;
    },

    bannerMovingSize() {
      // Свойство, которое возвращает диапазон (в пикселях), в котором изменяется высота баннера
      return this.bannerMaxHeight - this.bannerMinHeight;
    },

    smallBannerModeText() {
      // Свойство, которое возвращает текст для отладки, чтобы видеть, какой баннер показан в данный момент, что видит приложение
      return !this.smallBannerMode
        ? "Large banner shown"
        : "Small banner shown";
    },

    bannerBigHtmlPrepared() {
      // Свойство, которое для большого баннера декодирует переданную base64 строку, заменяет протокол '//' на 'https://' и кодирует обратно в base64, чтобы передать
      // как значение в атрибут src iframe
      let result = this.b64_to_utf8(this.bannerBigHtml);
      if (result !== "") {
        result = `data:text/html;base64,${this.utf8_to_b64(
          result.replace(
            /(<head>)/g,
            '$1<base href="https://banners.adfox.ru/>"/>'
          )
        )}`;
      } else {
        this.useHtmlModeBig = false;
      }
      return result;
    },

    bannerSmallHtmlPrepared() {
      // Свойство, которое для малого баннера декодирует переданную base64 строку, заменяет протокол '//' на 'https://' и кодирует обратно в base64, чтобы передать
      // как значение в атрибут src iframe
      let result = this.b64_to_utf8(this.bannerSmallHtml);
      if (result !== "") {
        result = `data:text/html;base64,${this.utf8_to_b64(
          result.replace(
            /(<head>)/g,
            '$1<base href="https://banners.adfox.ru/>"/>'
          )
        )}`;
      } else {
        this.useHtmlModeSmall = false;
      }
      return result;
    }
  }
};
</script>
