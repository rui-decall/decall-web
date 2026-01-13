<template>
  <section class="flex flex-col gap-8 w-full">
    <div class="flex flex-col items-center gap-3 mb-6 text-center max-w-7xl mx-auto w-full">
      <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xl">3</div>
      <h2 class="text-2xl font-semibold">View Calendar</h2>
    </div>

    <!-- Calendar - Full Width -->
    <div class="flex flex-col w-full">
      <div class="max-w-7xl mx-auto w-full mb-6">
        <h3 class="text-lg font-medium mb-2">Appointment Calendar</h3>
        <p class="text-white/70">This is Ojisan Barber Salon's calendar. Appointments here are made by users via AI agents.</p>
      </div>

      <!-- Embedded Calendar Component - Full Width and Height -->
      <div class="w-full h-full min-h-[600px] flex items-center justify-center">
        <CalendarCard @calendar-loaded="trackCalendarView" />
      </div>
    </div>
  </section>
</template>

<script setup>
import CalendarCard from '../CalendarCard.vue'
import posthog from 'posthog-js'

// Track when calendar is viewed
const trackCalendarView = () => {
  posthog.capture('calendar_viewed')
}
</script>
