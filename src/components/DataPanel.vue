<template>
  <div class="container rounded bg-color-primary p-l">
    <ul class="blend-shapes-list">
      <li v-for="(expression, key) in facialExpression" :key="key" class="blend-shapes-item">
        <span class="blend-shapes-label">{{ expression.label }}</span>
        <div class="blend-shapes-bar-container">
          <div
            class="blend-shapes-bar"
            :style="{
              width: `${expression.score * 100}%`,
              backgroundColor: lerpColor('#4393DE', '#64D8BF', expression.score),
            }"
          ></div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Shape } from '@/types'

type Props = {
  shapes: Shape[]
}
const props = defineProps<Props>()

const facialExpression = ref({
  eyeSquintLeft: {
    label: 'Left eye squinting:',
    score: 0,
  },
  eyeSquintRight: {
    label: 'Right eye squinting:',
    score: 0,
  },
  browDownLeft: {
    label: 'Left brow down:',
    score: 0,
  },
  browDownRight: {
    label: 'Right brow down:',
    score: 0,
  },
  mouthSmileLeft: {
    label: 'Smile left:',
    score: 0,
  },
  mouthSmileRight: {
    label: 'Smile right:',
    score: 0,
  },
  mouthPucker: {
    label: 'Mouth puckering:',
    score: 0,
  },
  jawOpen: {
    label: 'Jaw open:',
    score: 0,
  },
})

watch(
  () => props.shapes,
  (newShapes) => {
    newShapes.forEach((shape: any) => {
      if (facialExpression.value.hasOwnProperty(shape.categoryName))
        facialExpression.value[shape.categoryName].score = shape.score
    })
  },
  { deep: true },
)

function lerpColor(color1: string, color2: string, factor: number): string {
  // Ensure factor is between 0 and 1
  factor = Math.max(0, Math.min(1, factor))

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
  }

  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)

  // Linear interpolation for each RGB component
  const r = Math.round(c1.r + (c2.r - c1.r) * factor)
  const g = Math.round(c1.g + (c2.g - c1.g) * factor)
  const b = Math.round(c1.b + (c2.b - c1.b) * factor)

  // Convert back to hex
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0')}`
}
</script>

<style scoped lang="scss">
.container {
  width: 55rem;
  height: 40rem;
}

.blend-shapes-list {
  list-style: none;
  width: 100%;
  flex-direction: column;
  justify-content: space-evenly;
  padding: 0;
  margin: 0;
  height: 100%;
  display: flex;
}

.blend-shapes-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.blend-shapes-label {
  width: 150px;
  color: white;
  font-size: 0.9rem;
}

.blend-shapes-bar-container {
  flex: 1;
  height: 20px;
  background-color: #183e91;
  border-radius: 14px;
  overflow: hidden;
}

.blend-shapes-bar {
  height: 100%;
  transition:
    width 0.3s ease,
    background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 5px;
  box-sizing: border-box;
  border-radius: 14px;
}

.blend-shapes-value {
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
}
</style>
