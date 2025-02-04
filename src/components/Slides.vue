<template>
    <section class="w-full h-full flex justify-center items-center relative">
        <Flicking 
            ref="flickingRef"
            :options="{ align: 'center', circular: true, preventClickOnDrag: true, dragThreshold: 10 }" 
            class="w-full h-full"
            @ready="onFlickingReady"
            @changed="onSlideChanged"
        >
            <div 
                :key="1" 
                class="panel h-full w-full max-w-xl p-4 flex justify-center items-center transition-opacity duration-300"
                :class="[activeTab === 'register' ? 'opacity-100' : 'opacity-20 pointer-events-none']"
            >
                <AccountCard />
            </div>
            <div 
                :key="2" 
                class="panel h-full w-full max-w-xl flex justify-center items-center transition-opacity duration-300"
                :class="[activeTab === 'call' ? 'opacity-100' : 'opacity-20 pointer-events-none']"
            >
                <CallCard />
            </div>
            <div 
                :key="3" 
                class="panel h-full w-[calc(100dvw-100px)] px-12 flex justify-center items-center transition-opacity duration-300"
                :class="[activeTab === 'calendar' ? 'opacity-100' : 'opacity-20 pointer-events-none']"
            >
                <CalendarCard />
            </div>
        </Flicking>
    </section>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useStore } from '@nanostores/vue'
import Flicking from "@egjs/vue3-flicking"
import "@egjs/vue3-flicking/dist/flicking.css"
import AccountCard from './AccountCard.vue'
import CallCard from './CallCard.vue'
import CalendarCard from './CalendarCard.vue'
import { $activeTab, setActiveTab } from '../stores/ui'

const flickingRef = ref(null)
const activeTab = useStore($activeTab)

const tabToIndex = {
    'register': 0,
    'call': 1,
    'calendar': 2
}

// Reverse mapping for index to tab
const indexToTab = {
    0: 'register',
    1: 'call',
    2: 'calendar'
}

const onFlickingReady = () => {
    // Initial slide to active tab
    const index = tabToIndex[activeTab.value]
    if (index !== undefined) {
        flickingRef.value?.moveTo(index)
    }
}

// Handle slide changes
const onSlideChanged = (e) => {
    const newIndex = e.index
    const newTab = indexToTab[newIndex]
    if (newTab && newTab !== activeTab.value) {
        setActiveTab(newTab)
    }
}

// Watch for active tab changes
watch(activeTab, (newTab) => {
    const index = tabToIndex[newTab]
    if (index !== undefined && flickingRef.value) {
        flickingRef.value.moveTo(index)
    }
})
</script>