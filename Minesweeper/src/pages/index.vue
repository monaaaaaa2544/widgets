<script setup lang="ts">
import MineBlock from '~/components/MineBlock.vue';
import { isDev, toggleDev } from '~/composables/storage';
import { GamePlay } from '~/composables/logic';

const play = new GamePlay(9, 9, 10);

const now = $(useNow());
const timerMS = $computed(() => Math.round(((play.state.value.endMS ?? +now) - (play.state.value.startMS ?? +now)) / 1000));

const mineRest = $computed(() => {
    if (!play.state.value.mineGenerated) return play.mines;
    return play.blocks.reduce((a, b) => a - (b.flagged ? 1 : 0), play.mines);
});

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

// watch(state, play.checkGameState, { deep: true });
watchEffect(() => {
    play.checkGameState();
});
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

        <div flex="~ gap-10" justify-center>
            <div font-mono text-2xl flex="~ gap-1" items-center>
                <div i-carbon-timer />
                {{ timerMS }}
            </div>
            <div font-mono text-2xl flex="~ gap-1" items-center>
                <div i-mdi-mine />
                {{ mineRest }}
            </div>
        </div>

        <div p5>
            <div v-for="(row, y) in state" :key="y" flex="~" item-center justify-center>
                <MineBlock v-for="(block, x) in row" :key="x" @click="play.onClick(block)" @dblclick="play.autoExpand(block)" @contextmenu.prevent="play.onRightClick(block)" :block="block"> </MineBlock>
            </div>
        </div>

        <Confetti :passed="play.state.value.status === 'won'"></Confetti>
    </div>
</template>
