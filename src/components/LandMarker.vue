<template>
  <div class="rounded bg-color-blue-light webcam-container">
    <FButton v-if="!webcamRunning" label="start" class="start-button" @click="toggleWebcam" />
    <div id="liveView" class="videoView">
      <div style="width: fit-content; position: relative">
        <video class="rounded" ref="video" id="webcam" autoplay playsinline></video>
        <canvas
          ref="canvas"
          class="output_canvas"
          id="output_canvas"
          style="position: absolute; left: 0px; top: 0px"
        />
        <div v-if="webcamRunning" class="info-bar font-weight-bold">
          <span
            >Gender: <strong class="font-weight-bold">{{ gender }} </strong>
          </span>
          <span
            >Age: <strong class="font-weight-bold"> {{ age.toFixed() }}</strong>
          </span>
          <span
            >Emotion: <strong class="font-weight-bold"> {{ emotion }} </strong>
          </span>
        </div>
        <FButtonIcon
          v-if="webcamRunning"
          name="cross"
          color="red"
          label="stop"
          class="stop-button"
          @click="toggleWebcam"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FButton, FButtonIcon } from 'fari-component-library'
import { ref, onMounted, watchEffect, type Ref } from 'vue'
import * as vision from '@mediapipe/tasks-vision'
import * as faceapi from 'face-api.js'
import { loadModels } from '@/modules/ageGender'
import { hasGetUserMedia } from '@/modules/webcam'
import { detectEmotion } from '@/modules/emotionDetection'
import { drawLandmarks } from '@/modules/rendering'
import type { Emotion, Gender } from '@/types'

const { FaceLandmarker, FilesetResolver, DrawingUtils } = vision

let faceLandmarker: typeof FaceLandmarker | null = null
const webcamRunning = ref<boolean>(false)
let isLoaded = false
const videoBlendShapesHtml = ref<string>('')
const videoWidth = 780

const video = ref<HTMLVideoElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

const age = ref<number>(0)
const gender = ref<Gender>('')
const emotion = ref<Emotion>('Neutral')

const referenceDescriptors = ref<{ name: string; descriptor: Float32Array }[]>([])
const matchedPerson = ref<string>('')

// const referenceImages = ['carl.jpg', 'karen.jpg', 'oussama.jpg', 'mosa.jpg'] // Adjust as needed

const referenceImages = Object.keys(
  import.meta.glob('@/assets/faces/*.{jpg,jpeg,png}', { as: 'url', eager: true }),
).map((path) => path.split('/').pop())

async function loadReferenceDescriptors() {
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models')

  for (const imageName of referenceImages) {
    try {
      const img = await faceapi.fetchImage(`/faces/${imageName}`)
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (detection) {
        const name = imageName.split('.')[0] // Extract name from filename (e.g., 'carl')
        referenceDescriptors.value.push({ name, descriptor: detection.descriptor })
      } else {
        console.warn(`No face detected in ${imageName}`)
      }
    } catch (error) {
      console.error(`Error processing ${imageName}:`, error)
    }
  }
}

async function recognizeFace(video: HTMLVideoElement) {
  if (!referenceDescriptors.value.length) return

  const detection = await faceapi
    .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor()

  if (detection) {
    const webcamDescriptor = detection.descriptor
    let bestMatch = { name: '', distance: Infinity }

    referenceDescriptors.value.forEach(({ name, descriptor }) => {
      const distance = faceapi.euclideanDistance(webcamDescriptor, descriptor)
      if (distance < bestMatch.distance) {
        bestMatch = { name, distance }
      }
    })
    matchedPerson.value = bestMatch.name
    emit('match', bestMatch.name)
  }
}

const emit = defineEmits<{
  (e: 'update', value: { age: number; gender: Gender; emotion: Emotion }): void
  (e: 'update:shapes', value: { score: number; categoryName: string }[]): void
  (e: 'match', name: string): void
}>()

watchEffect(async () =>
  emit('update', {
    age: age.value,
    gender: gender.value,
    emotion: emotion.value,
  }),
)

async function createFaceLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
  )

  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
      delegate: 'GPU',
    },
    outputFaceBlendshapes: true,
    runningMode: 'VIDEO',
    numFaces: 1,
  })
  isLoaded = true
}

async function toggleWebcam() {
  if (!hasGetUserMedia()) {
    console.log('getUserMedia() is not supported by your browser')
    return
  }
  if (!faceLandmarker || !isLoaded) {
    console.log('Wait! faceLandmarker not loaded yet.')
    return
  }
  if (!faceapi.nets.ssdMobilenetv1.isLoaded || !faceapi.nets.ageGenderNet.isLoaded) {
    console.log('Wait! face-api.js models not loaded yet.')
    return
  }

  webcamRunning.value = !webcamRunning.value

  if (webcamRunning.value) {
    const constraints = { video: true }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    if (video.value) {
      video.value.srcObject = stream
      video.value.addEventListener('loadeddata', predictWebcam)
    }
  } else if (video.value && video.value.srcObject) {
    const stream = video.value.srcObject as MediaStream
    stream.getTracks().forEach((track) => track.stop())
    video.value.srcObject = null
  }
}

let results = undefined
let lastDetectionTime = 0
let lastAgeGenderTime = 0
const ageGenderInterval = 500
let lastFaceRecognitionTime = 0
const faceRecognitionInterval = 1000

async function predictWebcam() {
  if (!video.value || !canvas.value || !webcamRunning.value) return

  const radio = video.value.videoHeight / video.value.videoWidth
  video.value.style.width = `${videoWidth}px`
  video.value.style.height = `${videoWidth * radio}px`
  canvas.value.style.width = `${videoWidth}px`
  canvas.value.style.height = `${videoWidth * radio}px`
  canvas.value.width = video.value.videoWidth
  canvas.value.height = video.value.videoHeight

  const startTimeMs = performance.now()
  const now = performance.now()

  lastDetectionTime = now

  results = await faceLandmarker.detectForVideo(video.value, startTimeMs)
  drawResults()

  if (results?.faceLandmarks?.length > 0 && now - lastAgeGenderTime >= ageGenderInterval) {
    await detectAgeAndGender(video.value, results)
    lastAgeGenderTime = now
  }
  if (now - lastFaceRecognitionTime >= faceRecognitionInterval) {
    await recognizeFace(video.value)
    lastFaceRecognitionTime = now
  }
  if (webcamRunning.value) requestAnimationFrame(predictWebcam)
}

function drawResults() {
  if (!canvas.value || !results) return

  const ctx = canvas.value.getContext('2d')!
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  const drawingUtils = new DrawingUtils(ctx)
  if (results.faceLandmarks?.length)
    for (const landmarks of results.faceLandmarks) {
      drawLandmarks(drawingUtils, landmarks)
    }

  drawBlendShapes(videoBlendShapesHtml, results.faceBlendshapes)
}

function drawBlendShapes(target: Ref<string>, blendShapes: any[]) {
  if (!blendShapes.length) return
  emotion.value = detectEmotion(blendShapes[0].categories)
}

onMounted(async () => {
  await createFaceLandmarker()
  await loadModels()
  await createFaceLandmarker()
  await loadReferenceDescriptors()
  if (canvas.value)
    canvas.value.getContext('2d')!.clearRect(0, 0, canvas.value.width, canvas.value.height)
})

const initParams = {
  modelUri: '/models',
  option: new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
}

const predictions = ref([])

async function detectAgeAndGender(video, results) {
  const detections = await faceapi.detectAllFaces(video, initParams.option).withAgeAndGender()

  if (detections.length > 0) {
    age.value = detections[0].age
    gender.value = detections[0].gender
    predictions.value = detections.map((d) => ({
      age: d.age,
      gender: d.gender,
      genderProbability: d.gender === 'male' ? d.genderProbability : 1 - d.genderProbability,
    }))
  } else {
    age.value = 0
    gender.value = ''
    predictions.value = []
  }
  const { faceBlendshapes } = results
  if (!faceBlendshapes || !faceBlendshapes.length) return

  emit('update:shapes', faceBlendshapes[0].categories)
}
</script>

<style scoped>
.invisible {
  display: none;
}

@import '@material';

.webcam-container {
  width: 780px;
  position: relative;
  height: fit-content;
  min-height: 500px;
}

.start-button {
  position: absolute;
  z-index: 2;
  bottom: 45%;
  right: 43%;
}
.stop-button {
  position: absolute;
  z-index: 2;
  top: 1rem;
  right: 1rem;
}

.info-bar {
  position: absolute;
  left: 12rem;
  bottom: -3rem;
  display: flex;
  gap: 2rem;
  padding: 0 2rem;
  font-size: 1.3rem;
  font-weight: 800;
}

body {
  font-family: helvetica, arial, sans-serif;
  margin: 2em;
  color: #3d3d3d;
  --mdc-theme-primary: #007f8b;
  --mdc-theme-on-primary: #f1f3f4;
}

h1 {
  font-style: italic;
  color: #ff6f00;
  color: #007f8b;
}

h2 {
  clear: both;
}

em {
  font-weight: bold;
}

video {
  clear: both;
  display: block;
  transform: rotateY(180deg);
  -webkit-transform: rotateY(180deg);
  -moz-transform: rotateY(180deg);
}

section {
  opacity: 1;
  transition: opacity 500ms ease-in-out;
}

header,
footer {
  clear: both;
}

.invisible {
  opacity: 0.2;
}

.note {
  font-style: italic;
  font-size: 130%;
}

.videoView,
.detectOnClick,
.blend-shapes {
  position: relative;
  float: left;
  cursor: pointer;
}

.videoView p,
.detectOnClick p {
  position: absolute;
  padding: 5px;
  background-color: #007f8b;
  color: #fff;
  border: 1px dashed rgba(255, 255, 255, 0.7);
  z-index: 2;
  font-size: 12px;
  margin: 0;
}

.highlighter {
  background: rgba(0, 255, 0, 0.25);
  border: 1px dashed #fff;
  z-index: 1;
  position: absolute;
}

.canvas {
  z-index: 1;
  position: absolute;
  pointer-events: none;
}

.output_canvas {
  transform: rotateY(180deg);
  -webkit-transform: rotateY(180deg);
  -moz-transform: rotateY(180deg);
}

.detectOnClick {
  z-index: 0;
}

.detectOnClick img {
  width: 100%;
}

:deep(.blend-shapes-item) {
  display: flex;
  align-items: center;
  height: 20px;
}

:deep(.blend-shapes-label) {
  display: flex;
  width: 120px;
  justify-content: flex-end;
  align-items: center;
  margin-right: 4px;
}

:deep(.blend-shapes-value) {
  display: flex;
  height: 16px;
  align-items: center;
  background-color: #007f8b;
}
</style>
