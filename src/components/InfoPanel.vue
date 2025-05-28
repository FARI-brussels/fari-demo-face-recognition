<template>
  <div class="container rounded bg-color-primary p-l">
    <div class="category">
      <div
        v-for="item in genderItems"
        :key="item.emoji"
        class="emoji-container"
        :class="{ selected: item.emoji === genderEmoji }"
      >
        <div
          class="emoji bg-color-blue-light"
          :class="{ 'emoji-selected': item.emoji === genderEmoji }"
        >
          {{ item.emoji }}
        </div>
        <span class="emoji-label">{{ item.label }}</span>
      </div>
    </div>

    <div class="category">
      <div
        v-for="item in gender === 'male' ? maleAgeItems : femaleAgeItems"
        :key="item.emoji"
        class="emoji-container"
        :class="{ selected: item.emoji === ageEmoji }"
      >
        <div
          class="emoji bg-color-blue-light"
          :class="{ 'emoji-selected': item.emoji === ageEmoji }"
        >
          {{ item.emoji }}
        </div>
        <span class="emoji-label">{{ item.label }}</span>
      </div>
    </div>

    <div class="category">
      <div
        v-for="item in emotionItems"
        :key="item.emoji"
        class="emoji-container"
        :class="{ selected: item.emoji === emotionEmoji }"
      >
        <div
          class="emoji bg-color-blue-light"
          :class="{ 'emoji-selected': item.emoji === emotionEmoji }"
        >
          {{ item.emoji }}
        </div>
        <span class="emoji-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Emotion, Gender } from '@/types'

interface Props {
  age: number
  gender: Gender
  emotion: Emotion
}
const { age, gender, emotion } = defineProps<Props>()

const genderItems = [
  { emoji: '👨🏼', label: 'Male' },
  { emoji: '👩🏻', label: 'Female' },
] as const

const maleAgeItems = [
  { emoji: '👦🏼', label: '0-20' },
  { emoji: '👨🏼', label: '20-40' },
  { emoji: '👨🏼‍🦳', label: '40-60' },
  { emoji: '👴🏼', label: '60+' },
] as const

const femaleAgeItems = [
  { emoji: '👧🏻', label: '0-20' },
  { emoji: '👩🏻', label: '20-40' },
  { emoji: '👩🏻‍🦳', label: '40-60' },
  { emoji: '👵🏻', label: '60+' },
] as const

const emotionItems = [
  { emoji: '😄', label: 'Happy' },
  { emoji: '☹️', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😮', label: 'Fearful' },
  { emoji: '😲', label: 'Surprised' },
  { emoji: '😐', label: 'Neutral' },
] as const

const genderEmoji = computed(() => (gender === 'male' ? '👨🏼' : '👩🏻'))

const ageEmoji = computed(() => {
  const isMale = gender === 'male'
  if (age <= 20) return isMale ? '👦🏼' : '👧🏻'
  if (age <= 40) return isMale ? '👨🏼' : '👩🏻'
  if (age <= 60) return isMale ? '👨🏼‍🦳' : '👩🏻‍🦳'
  return isMale ? '👴🏼' : '👵🏻'
})

const emotionEmoji = computed(() => {
  const emotionMap: Record<Emotion, string> = {
    Happiness: '😄',
    Sadness: '☹️',
    Anger: '😡',
    Fear: '😮',
    Surprise: '😲',
    Neutral: '😐',
  }
  return emotionMap[emotion] || ''
})
</script>

<style scoped lang="scss">
.container {
  width: 55rem;
  height: 40rem;
}

.emoji-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.3;
  transition: opacity 0.3s ease;
  box-sizing: border-box;
}

.emoji-container.selected {
  opacity: 1;
  font-weight: 700;
}

.emoji {
  border-radius: 999px;
  padding: 0rem 1.1rem;
  font-size: 3.5rem;
  border: 2px solid transparent;
}

.emoji-selected {
  box-sizing: border-box;
  border: 2px solid #64d8bf;
  .emoji-label {
    font-weight: 700;
  }
}

.emoji-label {
  font-size: 0.9rem;
  color: white;
  text-align: center;
}

.category {
  display: flex;
  gap: 2rem;
}
</style>
