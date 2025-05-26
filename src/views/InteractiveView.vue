<template>
  <div class="app bg-color-blue">
    <FDemoAppBar @exit="router.push('/')" />
    <div class="wrapper">
      <Landmarker
        @update="updatePanelData"
        @update:shapes="updateBlendShapes"
        @match="selectMatched"
      />

      <div v-if="activeMenu === 'detect'" class="carousel-container">
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
      <PortraitPanel v-else-if="activeMenu === 'compare'" :selected="selectedName" />
    </div>

    <div class="norms">
      <div class="segmented-control">
        <button
          v-for="{ label, value } in menu"
          :key="label"
          :class="{ 'segmented-option': true, selected: activeMenu === value }"
          @click="activeMenu = value"
        >
          {{ label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FDemoAppBar } from 'fari-component-library'
import Landmarker from '@/components/LandMarker.vue'
import InfoPanel from '@/components/InfoPanel.vue'
import PortraitPanel from '@/components/PortraitPanel.vue'
import DataPanel from '@/components/DataPanel.vue'
import { useRouter } from 'vue-router'
import { Carousel, Slide, Navigation, Pagination } from 'vue3-carousel'
import type { Emotion, Gender } from '@/types'
import 'vue3-carousel/carousel.css'
export type Norms = 'detect' | 'compare'

const router = useRouter()

const panelData = ref<{ age: number; gender: Gender; emotion: Emotion }>({})
const blendShapes = ref([])

const currentSlide = ref(0)

const updatePanelData = (val: { age: number; gender: Gender; emotion: Emotion }) =>
  (panelData.value = val)

const updateBlendShapes = (shapes) => (blendShapes.value = shapes)

const selectedName = ref<string | null>(null)
const selectMatched = (matched: string) => (selectedName.value = matched)

const activeMenu = ref<Norms>('compare')

const menu = computed(() => [
  { label: 'Detect', value: 'detect' as Norms },
  { label: 'Compare', value: 'compare' as Norms },
])
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
  width: 50%;
}

.carousel__slide {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.norms {
  position: absolute;
  z-index: 20000;
  bottom: 8%;
  left: 43%;
}

.segmented-control {
  display: flex;
}

.segmented-option {
  cursor: pointer;
  padding: 8px 16px;
  border: 1px solid #ccc;
  background-color: #2f519c;
  font-weight: bold;
  transition: background-color 0.3s ease;
  color: white;
  border: 1px solid #4a8fcd;
  &:first-child {
    border-top-left-radius: 25px;
    border-bottom-left-radius: 25px;
  }
  &:last-child {
    border-top-right-radius: 25px;
    border-bottom-right-radius: 25px;
  }

  &.selected {
    background-color: #4a8fcd;
  }
}
</style>
