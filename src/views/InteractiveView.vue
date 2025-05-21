<template>
  <div class="app bg-color-blue">
    <FDemoAppBar @exit="router.push('/')" />
    <div class="wrapper">
      <Landmarker @update="updatePanelData" @update:shapes="updateBlendShapes" />
      <div class="carousel-container">
        <Carousel v-model="currentSlide" :items-to-show="1" :wrap-around="true">
          <Slide key="info">
            <InfoPanel v-bind="panelData" />
          </Slide>
          <Slide key="data">
            <DataPanel :shapes="blendShapes" />
          </Slide>
          <template #addons>
            <Navigation />
            <Pagination />
          </template>
        </Carousel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FDemoAppBar } from 'fari-component-library'
import Landmarker from '@/components/LandMarker.vue'
import InfoPanel from '@/components/InfoPanel.vue'
import DataPanel from '@/components/DataPanel.vue'
import { useRouter } from 'vue-router'
import { Carousel, Slide, Navigation, Pagination } from 'vue3-carousel'
import type { Emotion, Gender } from '@/types'
import 'vue3-carousel/carousel.css'
const router = useRouter()

const panelData = ref<{ age: number; gender: Gender; emotion: Emotion }>({})
const blendShapes = ref([])

const currentSlide = ref(0)

const updatePanelData = (val: { age: number; gender: Gender; emotion: Emotion }) =>
  (panelData.value = val)

const updateBlendShapes = (shapes) => (blendShapes.value = shapes)
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.wrapper {
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  margin: auto 0;
}

.carousel-container {
  width: 50%; /* Adjust based on your layout needs */
}

.carousel__slide {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
