<template>
    <div class="w-full h-[calc(100dvh-200px)] max-h-[70vh] bg-white/10 rounded-2xl border border-white/20 flex flex-col overflow-hidden">
        <div class="flex-1 p-6 overflow-hidden">
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
                                    'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30': selectedEvent?.status === 'pending'
                                }"
                            >
                                {{ selectedEvent?.status }}
                            </Badge>
                        </div>
                    </div>

                    <!-- Phone Number -->
                    <div class="space-y-1">
                        <Label class="text-white/50 text-sm">Phone Number</Label>
                        <div class="flex items-center gap-2 text-white/90">
                            <Phone class="w-4 h-4 text-white/50" />
                            {{ selectedEvent?.phoneNumber }}
                        </div>
                    </div>

                    <!-- Receipt -->
                    <div class="space-y-1">
                        <Label class="text-white/50 text-sm">Receipt</Label>
                        <div class="flex items-center gap-2 text-white/90">
                            <Link class="w-4 h-4 text-white/50" />
                            <a :href="selectedEvent?.receipt" target="_blank">Payment Receipt</a>
                        </div>


                    </div>


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

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const bookings = ref([]);
let calendar;

const showDialog = ref(false);
const selectedEvent = ref(null);

async function fetchBookings() {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*, users(*)')
            .not('status', 'eq', 'cancelled');

        if (error) throw error;
        console.log('Fetched bookings:', data);
        
        // Transform bookings into calendar events
        const events = data.map(booking => ({
            id: booking.id,
            title: `Call with ${booking.users.phone_number}`,
            start: `${booking.booking_date}T${booking.from_time}`,
            end: `${booking.booking_date}T${booking.to_time}`,
            backgroundColor: booking.status === 'confirmed' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(251, 146, 60, 0.8)',
            extendedProps: {
                status: booking.status,
                phoneNumber: booking.users.phone_number,
                remark: booking?.remark,
                receipt: `https://commerce.coinbase.com/pay/${booking?.cb_commerce_logs?.data?.id}/receipt`,
            },
        }));

        // Store transformed events
        bookings.value = events; // Changed to store the transformed events
        console.log('events', events);
        
        // Update calendar if it exists
        if (calendar) {
            calendar.setOption('events', events);
        }
        
        return events; // Return the transformed events
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
                table: 'bookings'
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

onMounted(async () => {
    // First fetch the bookings and get transformed events
    const events = await fetchBookings();

    // Initialize the calendar with the fetched events
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
                events: events,
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
/* Override calendar styles to match your theme */
.ec {
    --ec-bg-color: transparent;
    --ec-border-color: rgba(255, 255, 255, 0.2);
    --ec-today-bg-color: rgba(255, 255, 255, 0.05);
    --ec-event-bg-color: rgba(59, 130, 246, 0.8);
    --ec-event-border-color: transparent;
    --ec-selection-bg-color: rgba(59, 130, 246, 0.2);
    --ec-text-color: rgba(255, 255, 255, 0.9);
    --ec-toolbar-text-color: rgba(255, 255, 255, 0.7);
    font-family: inherit;
}

.ec .ec-toolbar button {
    color: rgba(255, 255, 255, 0.7);
    border-color: rgba(255, 255, 255, 0.2);
}

.ec .ec-toolbar button:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.ec .ec-toolbar button.ec-active {
    background-color: rgba(255, 255, 255, 0.2);
}

/* Make scrollbars match theme */
.ec ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.ec ::-webkit-scrollbar-track {
    background: transparent;
}

.ec ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
}

.ec ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
}

/* Add these new styles to handle overflow */
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

.ec-toolbar {
    background: var(--ec-bg-color);
    position: sticky;
    top: 0;
    z-index: 2;
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