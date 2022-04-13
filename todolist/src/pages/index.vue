<script setup lang="ts">
interface TodoItem {
    // 定义 todo 事项类型
    msg: string; // 要做的事
    done: boolean; // 是否完成
}

let todoMsg = $ref<string>('');
let l = $ref<TodoItem[]>([
    // 定义 todo 列表，初始化一些数据
    { msg: '', done: false },
]);
let lists = useStorage('lists', l);

let hasDown = $computed(() => lists.value.filter((item) => item.done).length); // 已经做了的事项列表

const isAllDone = $computed<boolean>({
    // 所有的事项是否完成，双向绑定到全选按钮
    get() {
        // isAllDone 的获取方法，用于双向绑定数据
        return hasDown === lists.value.length;
    },
    set(value: boolean) {
        // isAllDone 的更改方法，用于实现全选 和 取消全选功能
        lists.value.forEach((item) => {
            item.done = value;
        });
    },
});

function add() {
    console.log('asdf');
    // 新增事项
    if (todoMsg) {
        // 有值才新增
        lists.value.push({
            msg: todoMsg,
            done: false,
        });
        todoMsg = ''; // 新增完了，输入框的值清空
    }
}

const deleteItem = (index: number) => {
    // 删除事项
    lists.value.splice(index, 1);
};

const clearHasDone = () => {
    // 清理所有已完成的事项
    lists.value = lists.value.filter((item) => !item.done);
};
</script>

<template>
    <div>
        <div class="flex flex-col items-center">
            <div mb-10>
                <input
                    id="input"
                    v-model="todoMsg"
                    placeholder="请输入待做事项"
                    type="text"
                    autocomplete="false"
                    p="x-4 y-2"
                    w="250px"
                    text="center"
                    bg="transparent"
                    border="~ rounded gray-200 dark:gray-700"
                    outline="none active:none"
                    @keydown.enter="add"
                />

                <button class="m-1 text-sm btn" p="x-4 y-2" :disabled="!todoMsg" @click="add">添加</button>
                <button class="m-1 text-sm btn" p="x-4 y-2" @click="clearHasDone">清除</button>
            </div>

            <div class="flex flex-row justify-between" p="x-2 y-2" m-1 w="180px">
                <input type="checkbox" m-1 v-model="isAllDone" class="mr-2" />
                <span class="text-sm">全选</span>
                <span>{{ hasDown }} / {{ lists.length }}</span>
            </div>

            <div class="flex flex-row justify-between" p="x-4 y-2" m-1 w="200px" border="1 gray-200 rounded" v-for="(item, index) in lists" :key="index">
                <input type="checkbox" m-1 v-model="item.done" />
                <span v-text="item.msg"></span>
                <span @click="deleteItem(index)">❎</span>
            </div>
        </div>
    </div>
</template>
