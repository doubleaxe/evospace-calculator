<script setup lang="ts">
import {injectSettings} from '@/scripts/settings';
import {ref, unref} from 'vue';
import {
    injectBlueprintModel,
    type BlueprintItemModel,
    type RecipeIOModel,
    BlueprintItemState,
} from '@/scripts/model/store';
import type ElementDraggable from '../element-draggable.vue';
import type {ReadonlyPointType} from '@/scripts/geometry';

const settings = injectSettings();
const blueprintModel = injectBlueprintModel();
const draggableElement = ref<InstanceType<typeof ElementDraggable> | null>(null);
const draggingSource = ref<RecipeIOModel | null>(null);
let draggingTarget: RecipeIOModel | undefined = undefined;
let hoveringItem: BlueprintItemModel | undefined = undefined;

const clearHoveringItem = () => {
    if(hoveringItem) {
        hoveringItem.calculateLinkState();
        hoveringItem = undefined;
    }
};

const dropItem = () => {
    const _draggingSource = unref(draggingSource);
    if(_draggingSource && hoveringItem) {
        if(hoveringItem.stateColor !== BlueprintItemState.CannotLinkTarget) {
            hoveringItem.createLink(_draggingSource);
        }
    }
    clearHoveringItem();
    blueprintModel.clearTempLinks();
};

const requestDragBegin = (item?: RecipeIOModel) => {
    unref(draggableElement)?.requestDragBegin(!!item);
    if(item) {
        draggingSource.value = item;
    }
};

const dragShown = (screenXY: ReadonlyPointType) => {
    const _draggingSource = unref(draggingSource);
    if(!_draggingSource)
        return;
    const clientXY = blueprintModel.screenToClient(screenXY);
    draggingTarget = _draggingSource.tempClone(true);
    draggingTarget.rect.assignPoint(clientXY);
    blueprintModel.createTempLink(_draggingSource, draggingTarget);
};

const updateLink = (screenXY: ReadonlyPointType) => {
    if(!draggingTarget)
        return false;
    const clientXY = blueprintModel.screenToClient(screenXY, {isPassive: true});
    draggingTarget.rect.assignPoint(clientXY);
    return true;
};

const processTargetItem = (screenXY: ReadonlyPointType) => {
    const elements = document.elementsFromPoint(screenXY.x, screenXY.y);
    let item: BlueprintItemModel | undefined;
    elements.find((element) => {
        const itemId = element.getAttribute('data-item-id');
        if(itemId) {
            item = blueprintModel.items.get(itemId);
            if(item)
                return true;
        }
    });
    if(!item) {
        clearHoveringItem();
        return;
    }
    const _draggingSource = unref(draggingSource);
    if((item === hoveringItem) || (item === _draggingSource?.ownerItem)) {
        return;
    }
    clearHoveringItem();
    hoveringItem = item;
    hoveringItem.calculateLinkState(_draggingSource);
};

const dragMove = (screenXY: ReadonlyPointType) => {
    if(!updateLink(screenXY))
        return;
    processTargetItem(screenXY);
};

const requestDragForce = () => {
    unref(draggableElement)?.requestDragForce();
};

defineExpose({
    requestDragBegin,
    requestDragForce,
});
</script>

<template>
    <element-draggable
        ref="draggableElement"
        :width="settings.iconSize"
        :height="settings.iconSize"
        @drag-shown="dragShown"
        @drag-move="dragMove"
        @drop="dropItem"
    >
        <v-sheet :class="['rounded', 'elevation-' + settings.draggingElevation]">
            <icon-component :image="draggingSource?.image || ''" />
        </v-sheet>
    </element-draggable>
</template>