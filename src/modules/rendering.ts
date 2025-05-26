import {
  DrawingUtils,
  FaceLandmarker,
  type FaceLandmarkerResult,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision'
import { type Ref } from 'vue'
import type { BlendShapes } from '@/types'

export function drawResults(
  canvasRef: Ref<HTMLCanvasElement | null>,
  results: FaceLandmarkerResult | undefined,
  updateBlendShapes: (blendShapes: BlendShapes) => void,
): void {
  if (!canvasRef.value || !results) return

  const ctx = canvasRef.value.getContext('2d')!
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  const drawingUtils = new DrawingUtils(ctx)
  if (results.faceLandmarks?.length) {
    for (const landmarks of results.faceLandmarks) {
      drawLandmarks(drawingUtils, landmarks)
    }
  }

  drawBlendShapes(updateBlendShapes, results.faceBlendshapes || [])
}

export function drawLandmarks(drawingUtils: DrawingUtils, landmarks: NormalizedLandmark[]): void {
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
    color: '#C0C0C070',
    lineWidth: 1,
  })
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, {
    color: '#FF3030',
  })
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, {
    color: '#FF3030',
  })
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, {
    color: '#30FF30',
  })
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, {
    color: '#30FF30',
  })
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, {
    color: '#E0E0E0',
  })
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
    color: '#E0E0E0',
  })
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, {
    color: '#FF3030',
  })
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, {
    color: '#30FF30',
  })
}

function drawBlendShapes(
  updateBlendShapes: (blendShapes: BlendShapes) => void,
  blendShapes: BlendShapes,
): void {
  if (!blendShapes.length) return

  let htmlMaker = ''
  blendShapes[0].categories.forEach((shape) => {
    htmlMaker += `
      <li class="blend-shapes-item">
        <span class="blend-shapes-label">${shape.displayName || shape.categoryName}</span>
        <span class="blend-shapes-value" style="width: calc(${+shape.score * 100}% - 120px)">
          ${(+shape.score).toFixed(4)}
        </span>
      </li>
    `
  })
  updateBlendShapes([htmlMaker])
}
