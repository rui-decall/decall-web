<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <button @click="previousWeek" class="nav-button">&lt; Previous</button>
      <h2>{{ formatDateRange(weekStart, weekEnd) }}</h2>
      <button @click="nextWeek" class="nav-button">Next &gt;</button>
    </div>

    <div class="calendar-grid">
      <div class="time-column">
        <div class="time-header">Time</div>
        <div v-for="time in timeSlots" :key="time" class="time-slot">
          {{ formatTime(time) }}
        </div>
      </div>

      <div v-for="date in weekDates" :key="date.toISOString()" class="day-column">
        <div class="day-header">
          {{ formatDate(date) }}
        </div>
        <div
          v-for="time in timeSlots"
          :key="`${date.toISOString()}-${time}`"
          class="slot"
          :class="getSlotClass(date, time)"
        >
          <template v-if="getBooking(date, time)">
            <div class="booking-info">
              <!-- <strong>{{ getBooking(date, time).users.phone_number }}</strong> -->
              <div class="booking-status" :class="getBooking(date, time).status">
                {{ getBooking(date, time).status }}
              </div>
            </div>
          </template>
          <template v-else>
            Available
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Booking {
  id: string
  booking_date: string
  from_time: string
  to_time: string
  status: string
  users: {
    id: string
    phone_number: string
    created_at: string
  }
}

const currentWeekStart = ref(getWeekStart(new Date()))
const bookings = ref<Booking[]>([])

// Generate time slots from 8 AM to 11 PM
const timeSlots = computed(() => {
  return Array.from({ length: 16 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });
})

const weekStart = computed(() => currentWeekStart.value)
const weekEnd = computed(() => {
  const end = new Date(weekStart.value)
  end.setDate(end.getDate() + 6)
  return end
})

const weekDates = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart.value)
    date.setDate(date.getDate() + i)
    return date
  })
})

function getWeekStart(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d
}

function previousWeek() {
  const newStart = new Date(currentWeekStart.value)
  newStart.setDate(newStart.getDate() - 7)
  currentWeekStart.value = newStart
  fetchBookings()
}

function nextWeek() {
  const newStart = new Date(currentWeekStart.value)
  newStart.setDate(newStart.getDate() + 7)
  currentWeekStart.value = newStart
  fetchBookings()
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

function formatTime(time: string) {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function formatDateRange(start: Date, end: Date) {
  return `2025 ${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} - ${start.toLocaleDateString('en-US', { month: 'long' })} ${end.getDate()}`
}

function getBooking(date: Date, time: string) {
  return bookings.value.find(booking => {
    const bookingDate = new Date(booking.booking_date).toDateString()
    const currentDate = date.toDateString()

    // Convert time slot to match the format from database
    const slotTime = time // e.g. "10:00"
    const bookingFromTime = booking.from_time // e.g. "10:00:00"

    return bookingDate === currentDate &&
           slotTime === bookingFromTime.slice(0, 5) // Compare only HH:MM part
  })
}

function getSlotClass(date: Date, time: string) {
  const booking = getBooking(date, time)
  return {
    'booked': booking?.status === 'confirmed',
    'available': !booking || booking.status !== 'confirmed'
  }
}

async function fetchBookings() {
  try {
    const { data, error } = await supabase
      .from('appointment_view')
      .select('*')
      .not('status', 'eq', 'cancelled')
      // .gte('date', weekStart.value.toISOString().split('T')[0])
      // .lte('date', weekEnd.value.toISOString().split('T')[0])

    if (error) throw error
    console.log('fetchBookings', data)
    bookings.value = data
  } catch (error) {
    console.error('Error fetching bookings:', error)
  }
}

function subscribeToBookings() {
  supabase
    .channel('bookings_channel')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'bookings'
      },
      (payload) => {
        console.log('Change received!', payload)
        // Refresh bookings when any change occurs
        fetchBookings()
      }
    )
    .subscribe()
}

onMounted(() => {
  fetchBookings()
})
</script>

<style scoped>
.calendar-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 2rem 0;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.nav-button {
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.nav-button:hover {
  background: #e0e0e0;
}

.calendar-grid {
  display: flex;
  overflow-x: auto;
}

.time-column {
  min-width: 100px;
  border-right: 1px solid #eee;
}

.day-column {
  flex: 1;
  min-width: 150px;
}

.time-header, .day-header {
  padding: 1rem;
  background: #f8f9fa;
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.time-slot {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  height: 60px;
  display: flex;
  align-items: center;
}

.slot {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  border-right: 1px solid #eee;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.available {
  background: #f8fff8;
  color: #666;
}

.booked {
  background: #e3f2fd;
  color: #1976d2;
}

.booking-info {
  font-size: 0.9rem;
  width: 100%;
  padding: 0.5rem;
  border-radius: 6px;
  text-align: center;
}

.booking-info strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c5282;
  font-size: 0.95rem;
}

.booking-status {
  font-size: 0.8rem;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 0.25rem;
  text-transform: capitalize;
}

.booking-status.confirmed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.booking-status.pending {
  background-color: #fff3e0;
  color: #ef6c00;
}

.booking-status.cancelled {
  background-color: #ffebee;
  color: #c62828;
}
</style>
