<script setup lang="ts">
import MineBlock from '~/components/MineBlock.vue';
import { isDev, toggleDev } from '~/composables/storage';
import { GamePlay } from '~/composables/logic';

const play = new GamePlay(9, 9, 10);

useStorage('vuesweeper-state', play.state);
const state = $computed(() => play.board);

function newGame(difficulty: 'easy' | 'medium' | 'hard') {
    switch (difficulty) {
        case 'easy':
            play.reset(9, 9, 10);
            break;
        case 'medium':
            play.reset(16, 16, 40);
            break;
        case 'hard':
            play.reset(16, 30, 99);
            break;
    }
}

watch(state, play.checkGameState, { deep: true });
</script>

<template>
    <div>
        MineSweeper
        <div flex="~ gap1" justify-center p4>
            <button btn @click="toggleDev()">{{ isDev ? 'Dev' : 'Normal' }}</button>
            <button btn @click="play.reset()">New Game</button>
            <button btn @click="newGame('easy')">Easy</button>
            <button btn @click="newGame('medium')">Medium</button>
            <button btn @click="newGame('hard')">Hard</button>
        </div>
        <div p5>
            <div v-for="(row, y) in state" :key="y" flex="~" item-center justify-center>
                <MineBlock v-for="(block, x) in row" :key="x" @click="play.onClick(block)" @contextmenu.prevent="play.onRightClick(block)" :block="block"></MineBlock>
            </div>
        </div>
    </div>
</template>
