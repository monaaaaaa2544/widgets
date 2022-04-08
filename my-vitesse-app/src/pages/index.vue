<script setup lang="ts">
interface BlockState {
    x: number;
    y: number;
    revealed: boolean;
    mine?: boolean;
    flagged?: boolean;
    adjacentMines: number;
}

const WIDTH = 10;
const HEIGHT = 10;
const state = reactive(
    Array.from({ length: HEIGHT }, (_, y) =>
        Array.from(
            { length: WIDTH },
            (_, x): BlockState => ({
                x,
                y,
                revealed: false,
                adjacentMines: 0,
            })
        )
    )
);

function generateMines() {
    for (const row of state) {
        for (const block of row) {
            block.mine = Math.random() < 0.3;
        }
    }
    updateNumbers();
}

const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
];

const numberColors = ['text-transparent', 'text-gray-500', 'text-green-500', 'text-blue-500', 'text-purple-500', 'text-orange-500', 'text-red-500', 'text-yellow-500', 'text-pink-500'];

function updateNumbers() {
    state.forEach((raw, y) => {
        state.forEach((block, x) => {
            if (state[y][x].mine === true) {
                state[y][x].adjacentMines = -1;
            }

            directions.forEach(([dx, dy]) => {
                const x2 = x + dx;
                const y2 = y + dy;

                // 边界判定
                if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT) {
                    return;
                }

                if (state[y2][x2].mine) {
                    state[y][x].adjacentMines += 1;
                }
            });
        });
    });
}

let mineGenerated = false;
function onClick(block: BlockState) {
    if (mineGenerated === false) {
        generateMines();
        mineGenerated = true;
    }

    block.revealed = true;

    if (block.mine) {
        state.forEach((row) => {
            row.forEach((block) => {
                block.revealed = true;
            });
        });
    }
}

function getBlockClass(block: BlockState) {
    if (!block.revealed) {
        return 'bg-gray-500/10';
    }

    return block.mine ? 'bg-red-500' : numberColors[block.adjacentMines];
}
</script>

<template>
    <div>
        MineSweeper
        <div p5>
            <div v-for="(row, y) in state" :key="y" flex="~" item-center justify-center>
                <button v-for="(block, x) in row" :key="x" w-10 h-10 hover="bg-gray/10" @click="onClick(block)" :class="getBlockClass(block)" border="1 gray-400/10" flex="~ gap-1" items-center justify-center>
                    <template v-if="block.revealed">
                        {{ block.mine ? '💣' : block.adjacentMines }}
                    </template>
                </button>
            </div>
        </div>
    </div>
</template>
