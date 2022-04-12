<script setup lang="ts">
import { BlockState } from '~/types';
import { isDev } from '~/composables/storage';

defineProps<{ block: BlockState }>();

const emit = defineEmits<{
    (e: 'lrclick', event: MouseEvent): void;
}>();

function whichButtons(e: MouseEvent) {
    if (e.buttons === 3) {
        emit('lrclick', e);
    }
}

const numberColors = ['text-transparent', 'text-gray-500', 'text-green-500', 'text-blue-500', 'text-purple-500', 'text-orange-500', 'text-red-500', 'text-yellow-500', 'text-pink-500'];

function getBlockClass(block: BlockState) {
    if (!block.revealed) {
        return 'bg-gray-500/10 hover:bg-gray-500/20';
    }

    if (block.flagged) return 'bg-gray-500/10';

    return block.mine ? 'bg-red-500/50' : numberColors[block.adjacentMines];
}
</script>

<template>
    <button min-w-8 min-h-8 hover="bg-gray/10" :class="getBlockClass(block)" m="1px" border="1 gray-400/10" flex="~ gap-2" items-center justify-center @click="whichButtons">
        <template v-if="block.flagged">{{ 'flag' }} </template>
        <template v-else-if="block.revealed || isDev">
            {{ block.mine ? '💣' : block.adjacentMines }}
        </template>
    </button>
</template>
