<template>
  <div class="portrait-container rounded p-md">
    <div
      v-for="(img, idx) in images"
      :key="idx"
      class="portrait-wrapper"
      :class="{ selected: img.name === selected }"
    >
      <div class="label">{{ img.label }}</div>
      <img :src="img.src" :alt="img.label" class="portrait" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ selected: string | null }>()

const imageModules = import.meta.glob('@/assets/faces/*.jpg', { eager: true })

const images = Object.entries(imageModules).map(([path, mod]) => {
  const fileName = path.split('/').pop()!.replace('.jpg', '')
  const capitalized = fileName.charAt(0).toUpperCase() + fileName.slice(1)
  return {
    src: mod.default,
    name: fileName,
    label: capitalized,
  }
})
</script>

<style scoped lang="scss">
.portrait-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 50%;
  background-color: #2e4fbf;
  background-image: radial-gradient(#4393de 1px, transparent 1px);
  background-size: 10px 10px;
}

.portrait-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem;
  border: 2px solid transparent;
  border-radius: 14px;
  transition: border-color 0.3s ease;
  position: relative;
}

.portrait-wrapper.selected {
  border-color: #64d8bf;
}

.label {
  background-color: rgba(46, 79, 191, 0.7); /* #2E4FBF at 70% */
  color: white;
  padding: 4px 8px;
  font-weight: bold;
  text-align: center;
  min-width: 6rem;
  position: absolute;
  bottom: 0;
  width: 103%;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
}

.portrait-wrapper.selected .label {
  background-color: #64d8bf;
}

.portrait {
  width: 6rem;
  height: 6rem;
  border-radius: 14px;
  object-fit: cover;
  object-position: top;
}
</style>
