<script setup lang="ts">
interface BlockState {
    x: number;
    y: number;
    revealed: boolean;
    mine?: boolean;
    flagged?: boolean;
    adjacentMines: number;
}

const WIDTH = 3;
const HEIGHT = 3;
const state = ref(
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

function generateMines(initial: BlockState) {
    for (const row of state.value) {
        for (const block of row) {
            if (block.x === initial.x && block.y === initial.y) {
                continue;
            }
            block.mine = Math.random() < 0.1;
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
    state.value.forEach((raw) => {
        raw.forEach((block) => {
            if (block.mine) {
                return;
            }
            getSiblings(block).forEach((b) => {
                if (b.mine) {
                    block.adjacentMines += 1;
                }
            });
        });
    });
}

function getSiblings(block: BlockState) {
    return directions
        .map(([dx, dy]) => {
            const x2 = block.x + dx;
            const y2 = block.y + dy;

            // 边界判定
            if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT) {
                return undefined;
            }

            return state.value[y2][x2];
        })
        .filter(Boolean) as BlockState[];
}

function expendZero(block: BlockState) {
    if (block.adjacentMines > 0) {
        return;
    }

    // 已经探索过的不再探索
    getSiblings(block).forEach((b) => {
        if (b.adjacentMines > 0) {
            return;
        }
        if (b.revealed) {
            return;
        }
        b.revealed = true;
        expendZero(b);
    });
}

let mineGenerated = false;
let dev = true;
function onClick(block: BlockState) {
    if (!mineGenerated) {
        generateMines(block);
        mineGenerated = true;
    }

    block.revealed = true;

    // 如果是雷，结束游戏
    if (block.mine) {
        state.value.forEach((row) => {
            row.forEach((b) => {
                b.revealed = true;
            });
        });
    }

    // 如果是0，探索周围
    expendZero(block);
}

function onRightClick(block: BlockState) {
    if (block.revealed) {
        return;
    }

    block.flagged = !block.flagged;
}

watch(state, checkGameState, { deep: true });

function checkGameState() {
    if (!mineGenerated) {
        return;
    } else {
        const blocks = state.value.flat();

        if (blocks.every((b) => b.revealed || b.flagged)) {
            if (blocks.some((b) => b.flagged && !b.mine)) {
                alert('You cheat!');
            } else if (blocks.some((b) => !b.flagged && b.mine)) {
                alert('Game over!');
            } else {
                alert('You win!');
            }
        }
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
                <button
                    v-for="(block, x) in row"
                    :key="x"
                    w-10
                    h-10
                    hover="bg-gray/10"
                    @click="onClick(block)"
                    @contextmenu.prevent="onRightClick(block)"
                    :class="getBlockClass(block)"
                    border="1 gray-400/10"
                    flex="~ gap-1"
                    items-center
                    justify-center
                >
                    <template v-if="block.flagged">{{ 'flag' }}</template>
                    <template v-else-if="block.revealed || dev">
                        {{ block.mine ? '💣' : block.adjacentMines }}
                    </template>
                </button>
            </div>
        </div>
    </div>
</template>
