<script setup lang="ts">
import { BlockState } from '~/types';
import { isDev } from '~/composables/storage';

defineProps<{ block: BlockState }>();

const emit = defineEmits<{
    (e: 'lrclick', event: MouseEvent): void;
}>();

const numberColors = ['text-transparent', 'text-gray-500', 'text-green-500', 'text-blue-500', 'text-purple-500', 'text-orange-500', 'text-red-500', 'text-yellow-500', 'text-pink-500'];

function getBlockClass(block: BlockState) {
    if (!block.revealed) {
        return 'bg-gray-500/10';
    }

    return block.mine ? 'bg-red-500' : numberColors[block.adjacentMines];
}
</script>

<template>
    <button w-10 h-10 hover="bg-gray/10" :class="getBlockClass(block)" border="1 gray-400/10" flex="~ gap-1" items-center justify-center>
        <template v-if="block.flagged">{{ 'flag' }}</template>
        <template v-else-if="block.revealed || isDev">
            {{ block.mine ? '💣' : block.adjacentMines }}
        </template>
    </button>
</template>
