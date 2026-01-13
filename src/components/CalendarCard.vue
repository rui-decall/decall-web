<template>
    <!-- Status filters moved outside the card -->
    <div class="w-full flex flex-col gap-6 h-full pt-4">
        <!-- Status filters styled as pills -->
        <div class="flex items-center gap-3">
            <Button
                v-for="status in statusFilters"
                :key="status.value"
                :class="getStatusClasses(status)"
                variant="outline"
                size="sm"
                @click="toggleStatus(status)"
            >
                {{ status.label }} ({{ getStatusCount(status.value) }})
            </Button>
        </div>

        <!-- Calendar card -->
        <div class="w-full h-[calc(100dvh-10rem)] bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm">
            <div id="calendar" class="ec-dark h-full"></div>
        </div>

        <!-- Updated Event Details Dialog -->
        <Dialog :open="showDialog" @update:open="showDialog = $event">
            <DialogContent class="sm:max-w-[425px] bg-zinc-900 border border-white/20 text-white shadow-2xl p-0">
                <DialogHeader class="border-b border-white/20">
                    <div class="px-6 pt-6 pb-4">
                        <DialogTitle class="text-2xl font-bold text-white">Appointment Information</DialogTitle>
                        <DialogDescription class="text-white/50 text-sm">
                            Details about the scheduled appointment
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div class="px-6 py-6 space-y-6">
                    <!-- Status -->
                    <div class="space-y-1">
                        <Label class="text-white/50 text-sm">Status</Label>
                        <div class="flex items-center gap-2">
                            <Badge
                                :class="{
                                    'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30': selectedEvent?.status === 'confirmed',
                                    'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30': selectedEvent?.status === 'pending',
                                    'bg-red-500/20 text-red-300 hover:bg-red-500/30': selectedEvent?.status === 'cancelled',
                                    'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30': selectedEvent?.status === 'pending_cancel'
                                }"
                            >
                                {{ selectedEvent?.status }}


                            </Badge>
                        </div>
                    </div>

                    <!-- Phone Number -->
                    <!-- <div class="space-y-1">
                        <Label class="text-white/50 text-sm">Phone Number</Label>
                        <div class="flex items-center gap-2 text-white/90">
                            <Phone class="w-4 h-4 text-white/50" />
                            {{ selectedEvent?.phoneNumber }}
                        </div>
                    </div> -->



                    <!-- Date & Time -->
                    <div class="p-4 bg-zinc-950/50 rounded-lg border border-white/10 space-y-4">
                        <div class="space-y-1">
                            <Label class="text-white/50 text-sm">Date</Label>
                            <p class="text-white/90">{{ formatDate(selectedEvent?.start) }}</p>
                        </div>
                        <div class="space-y-1">
                            <Label class="text-white/50 text-sm">Time</Label>
                            <p class="text-white/90">
                                {{ formatTime(selectedEvent?.start) }} - {{ formatTime(selectedEvent?.end) }}
                            </p>
                        </div>
                        <div class="space-y-1">
                            <Label class="text-white/50 text-sm">Remark</Label>
                            <p class="text-white/90">{{ selectedEvent?.remark || 'No remark' }}</p>
                        </div>
                    </div>
                </div>

                <DialogFooter class="border-t border-white/20">
                    <div class="px-6 py-4">
                        <Button
                            @click="showDialog = false"
                            class="bg-zinc-800 border-white/20 hover:bg-zinc-700"
                        >
                            Close
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Calendar from '@event-calendar/core';
import TimeGrid from '@event-calendar/time-grid';
import DayGrid from '@event-calendar/day-grid';
import List from '@event-calendar/list';
import Interaction from '@event-calendar/interaction';
import { createClient } from '@supabase/supabase-js';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Phone, Link } from 'lucide-vue-next';

// Import required CSS
import '@event-calendar/core/index.css';

// Initialize Supabase client
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

console.log(143, supabaseUrl, supabaseAnonKey)
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const bookings = ref([]);
let calendar;

const showDialog = ref(false);
const selectedEvent = ref(null);

// Add status filters state
const statusFilters = ref([
    { label: 'Confirmed', value: 'confirmed', enabled: true },
    { label: 'Pending', value: 'pending', enabled: true },
    { label: 'Cancelled', value: 'cancelled', enabled: false },
    { label: 'Pending Cancel', value: 'pending_cancel', enabled: true }
]);

// Move status classes to a computed function for better organization
function getStatusClasses(status) {
    return {
        'bg-blue-500/10 text-blue-400 border-blue-500/50 hover:bg-blue-500/20': status.value === 'confirmed',
        'bg-orange-500/10 text-orange-400 border-orange-500/50 hover:bg-orange-500/20': status.value === 'pending',
        'bg-red-500/10 text-red-400 border-red-500/50 hover:bg-red-500/20': status.value === 'cancelled',
        'bg-gray-500/10 text-gray-400 border-gray-500/50 hover:bg-gray-500/20': status.value === 'pending_cancel',
        'opacity-40': !status.enabled,
        'rounded-full px-3 py-0.5 border transition-colors text-sm': true
    }
}

// Toggle status filter
function toggleStatus(status) {
    status.enabled = !status.enabled;
    updateCalendarEvents();
}

// Update calendar events based on filters
function updateCalendarEvents() {
    const enabledStatuses = statusFilters.value
        .filter(status => status.enabled)
        .map(status => status.value);

    console.log(bookings.value)
    console.log(enabledStatuses)
    const filteredEvents = bookings.value.filter(event =>
        enabledStatuses.includes(event.extendedProps.status)
    );

    console.log(filteredEvents)

    if (calendar) {
        calendar.setOption('events', filteredEvents);
    }
}

async function fetchBookings() {
    try {
        const { data, error } = await supabase
            .from('appointment_view')
            .select('*');

        if (error) throw error;

        const events = data.map(booking => ({
            id: booking.id,
            title: `${booking.customer_name ? booking.customer_name : 'User'}`,
            start: `${booking.booking_date}T${booking.from_time}`,
            end: `${booking.booking_date}T${booking.to_time}`,
            backgroundColor: booking.status === 'confirmed' ? 'rgba(59, 130, 246, 0.8)' : booking.status === 'pending' ? 'rgba(251, 146, 60, 0.8)' : booking.status === 'cancelled' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(75, 85, 99, 0.8)',
            extendedProps: {
                status: booking.status,
                // phoneNumber: booking.users.phone_number,
                remark: booking?.remark,
                receipt: booking?.cb_commerce_logs?.data?.id ? `https://commerce.coinbase.com/pay/${booking?.cb_commerce_logs?.data?.id}/receipt` : null,
                cancelReceipt: booking?.cancelled_tx ? `https://basescan.org/tx/${booking?.cancelled_tx}` : null,
            },
        }));

        console.log(215, events)

        bookings.value = events;
        updateCalendarEvents(); // Update with filters instead of setting directly

        return events;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
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
                table: 'appointments'
            },
            (payload) => {
                console.log('Booking change received:', payload);
                // Refresh bookings when any change occurs
                fetchBookings();
            }
        )
        .subscribe();
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function getStatusCount(statusValue) {
    return bookings.value.filter(event =>
        event.extendedProps.status === statusValue
    ).length;
}

onMounted(async () => {
    // First fetch the bookings and get transformed events
    const events = await fetchBookings();

    // Filter events based on initial status filters before creating calendar
    const enabledStatuses = statusFilters.value
        .filter(status => status.enabled)
        .map(status => status.value);

    const filteredEvents = events.filter(event =>
        enabledStatuses.includes(event.extendedProps.status)
    );

    // Initialize the calendar with the filtered events
    calendar = new Calendar({
        target: document.getElementById('calendar'),
        props: {
            plugins: [TimeGrid, DayGrid, List, Interaction],
            options: {
                view: 'timeGridWeek',
                height: '100%',
                headerToolbar: {
                    start: 'prev,next today',
                    center: 'title',
                    end: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                },
                events: filteredEvents, // Use filtered events instead of all events
                nowIndicator: true,
                editable: false,          // Prevents dragging/resizing
                selectable: false,        // Disable date/time selection
                selectMirror: false,      // Disable selection preview
                dayMaxEvents: true,
                eventStartEditable: false, // Disable event dragging
                eventDurationEditable: false, // Disable event resizing
                eventResizableFromStart: false, // Disable resize from start
                dragScroll: false,        // Disable drag-to-scroll
                // Handle event clicks
                eventClick: (info) => {
                    selectedEvent.value = {
                        ...info.event.extendedProps,
                        start: info.event.start,
                        end: info.event.end
                    };
                    showDialog.value = true;
                }

            }
        }
    });

    // Subscribe to real-time updates
    subscribeToBookings();
});
</script>

<style>
/* Calendar theme updates */
.ec {
    --ec-bg-color: transparent;
    --ec-border-color: rgba(255, 255, 255, 0.1);
    --ec-today-bg-color: rgba(255, 255, 255, 0.03);
    --ec-event-bg-color: rgba(59, 130, 246, 0.8);
    --ec-event-border-color: transparent;
    --ec-selection-bg-color: rgba(59, 130, 246, 0.2);
    --ec-text-color: rgba(255, 255, 255, 0.9);
    --ec-toolbar-text-color: rgba(255, 255, 255, 0.7);
    font-family: inherit;
    height: 100% !important;
    padding: 0.75rem;
}

/* Toolbar buttons styling */
.ec .ec-toolbar {
    padding: 0.5rem 1rem;
    margin-bottom: 0.5rem;
}

.ec .ec-toolbar button {
    color: rgba(255, 255, 255, 0.7);
    border-color: rgba(255, 255, 255, 0.1);
    border-radius: 0.375rem;
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    transition: all 0.2s;
}

.ec .ec-toolbar button:hover {
    background-color: rgba(255, 255, 255, 0.05);
}

.ec .ec-toolbar button.ec-active {
    background-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
}

/* Calendar header styling */
.ec .ec-header {
    border-color: rgba(255, 255, 255, 0.1);
    background: var(--ec-bg-color);
    position: sticky;
    top: 0;
    z-index: 1;
}

.ec .ec-header th {
    padding: 0.5rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
}

/* Scrollbar styling */
.ec ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.ec ::-webkit-scrollbar-track {
    background: transparent;
}

.ec ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.ec ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
}

/* Grid styling */
.ec-time-grid, .ec-day-grid, .ec-list {
    max-height: 100%;
    overflow: auto;
}

.ec-header {
    background: var(--ec-bg-color);
    position: sticky;
    top: 0;
    z-index: 1;
}

/* Event styling */
.ec-event {
    border-radius: 4px;
    padding: 2px 4px;
}

/* Today highlight */
.ec-today {
    background-color: rgba(255, 255, 255, 0.03) !important;
}

/* Add these dialog-specific styles */
.dialog-content {
    background: rgba(24, 24, 27, 0.9); /* zinc-900 with some transparency */
    border-color: rgba(255, 255, 255, 0.2);
}

.dialog-overlay {
    background: rgba(0, 0, 0, 0.7);
}

/* Override default dialog animations if needed */
.dialog-overlay[data-state='open'],
.dialog-content[data-state='open'] {
    animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

.dialog-content[data-state='open'] {
    animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes overlayShow {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes contentShow {
    from {
        opacity: 0;
        transform: translate(-50%, -48%) scale(0.96);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}
</style>
