



<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
const el=ref<HTMLCanvasElement>()
const ctx=computed(()=> el.value?.getContext('2d'))

const WIDTH=600
const HEIGHT=600

interface Point{
  x: number
  y: number
}

interface Branch{
  start: Point
  length: number
  theta: number
}

function init(){
  ctx.value!.strokeStyle='black'

  step({
    start: {x: WIDTH/2, y: 0},
    length: 200*Math.random(),
    theta: Math.PI/4,
  })

}

const pendingTasks: Function[] =[]

function step(b: Branch, depth=0) {
  const end=getEndPoint(b)
  drawBranch(b)

  if (depth < 6 || Math.random()<0.2){
    pendingTasks.push(()=>step({
        start: end,
        length: b.length+(Math.random()-0.5)*15, 
        theta: b.theta-0.6*Math.random(),
      }, depth+1))
  }

  if (depth < 6 || Math.random()<0.4){
    pendingTasks.push(()=>step({
        start: end,
        length: b.length+(Math.random()-0.5)*15, 
        theta: b.theta+0.4*Math.random(),
      }, depth+1))
  }
}

function frame(){
  const tasks: Function[]=[...pendingTasks]
  tasks.forEach(fn => fn())
}

let framesCount=0
function startFrame(){
  requestAnimationFrame(()=>{
    framesCount+=1
    if (framesCount % 12 === 0){
      frame()
    }
    if (framesCount<100){
      startFrame()
    }

  })
}

startFrame()


function getEndPoint(b: Branch){
  return {
    x: b.start.x + b.length*Math.cos(b.theta),
    y: b.start.y + b.length*Math.sin(b.theta),
  }
}

function drawBranch(l: Branch){
  lineTo(l.start, getEndPoint(l))
}

onMounted(()=>{
   init()
})


function lineTo(p1: Point, p2: Point){
  ctx.value?.beginPath()
  ctx.value?.beginPath();
  ctx.value?.moveTo(p1.x, p1.y)
  ctx.value?.lineTo(p2.x, p2.y) 
  ctx.value?.stroke()
}
</script>

<template id="app">
    <canvas ref="el" width="600" height="600"></canvas>
</template>
