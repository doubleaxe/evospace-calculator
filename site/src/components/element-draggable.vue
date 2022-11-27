<script setup lang="ts">
import {watch, ref, unref, nextTick} from 'vue';
import {useTimeoutFn, useDraggable, useMouse} from '@vueuse/core';

const props = defineProps<{
    activating: boolean,
    width: number,
    height: number,
}>();
const emit = defineEmits<{
    (e: 'drop', position: {x: number, y: number}): void
}>();

//we use separate props because when element is hidden - its position doesn't update
const activateDraggable = ref(false);
const showDraggable = ref(false);
const element = ref<HTMLElement | null>(null);
const {x: pageX, y: pageY} = useMouse();

const {style, x: elementX, y: elementY} = useDraggable(element, {
    onEnd: (position) => {
        activateDraggable.value = false;
        showDraggable.value = false;
        emit('drop', position);
    }
});

const startDragging = () => {
    activateDraggable.value = true;
    elementX.value = unref(pageX) - (unref(props.width) >> 1);
    elementY.value = unref(pageY) - (unref(props.height) >> 1);
    nextTick(() => {
        const mouseDown = new Event('pointerdown');
        Object.assign(mouseDown, {pageX: unref(pageX), pageY: unref(pageY)});
        element.value?.dispatchEvent(mouseDown);
    });
};

const {start: startActivate, stop: stopActivate} = useTimeoutFn(() => {
    showDraggable.value = true;
}, 300, {immediate: false});

watch(() => props.activating, (activating) => {
    //start dragging immediatelly, but show dragged element a bit later.
    //if user does simple click dragged element won't be shown.
    //if user drags - dragged element will track position even if it shown later.
    if(activating) {
        startDragging();
    }
    activating ? startActivate() : stopActivate();
});
</script>

<template>
    <div v-show="activateDraggable" ref="element" :style="style" class="draggable-producer">
        <div :class="{'draggable-transparent': !showDraggable}">
            <slot />
        </div>
    </div>
</template>

<style scoped>
.draggable-producer {
    position: fixed;
}
.draggable-transparent {
    opacity: 0;
}
</style>