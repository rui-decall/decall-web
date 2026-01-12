# AI-Powered Social Commerce Booking System

A modern booking system that enables businesses to manage appointments and reservations through AI-powered communication channels, with seamless payment processing through Stripe and Coinbase Commerce.

## Overview

This system allows businesses to register their services and manage bookings while customers can secure appointments through multiple channels including:
- Phone calls with AI agents
- Web interface
- WhatsApp
- Social media platforms (future integration)

## Key Features

### For Businesses
- Easy registration and business profile management
- Service and pricing configuration
- Automated booking management through AI agents
- Multiple communication channel support
- Real-time availability management
- Payment tracking and reconciliation
- Deposit management
- Booking analytics and insights

### For Customers
- Multi-channel booking options
- AI-assisted booking experience
- Flexible payment options:
  - Traditional payments via Stripe
  - Cryptocurrency payments via Coinbase Commerce
- Real-time slot availability
- Booking management and history
- Automated reminders and notifications

## Payment Options

### Cryptocurrency Payments
- Powered by Coinbase Commerce
- Support for multiple cryptocurrencies
- Secure and fast transactions
- Automatic payment verification

### Traditional Payments
- Powered by Stripe
- Support for credit/debit cards
- International payment support
- Secure payment processing

## Future Roadmap

- Instagram integration for social commerce
- Additional social media platform support
- Enhanced AI capabilities
- Advanced analytics and reporting
- Mobile application
- Loyalty program integration
- Multi-language support

## Getting Started

[Add instructions for businesses to register and get started]

## Support

[Add support contact information]

## Contact

[Add contact information]


```sql
-- Users Table (for customers, staff, and business owners)
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20),
    full_name VARCHAR(255),
    password_hash VARCHAR(255),
    user_type ENUM('customer', 'business_owner', 'staff', 'admin'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Businesses Table (renamed from shops for clarity)
CREATE TABLE businesses (
    business_id UUID PRIMARY KEY,
    owner_id UUID REFERENCES users(user_id),
    name VARCHAR(255),
    description TEXT,
    address TEXT,
    contact_number VARCHAR(20),
    business_hours JSON, -- Store opening hours for each day
    status ENUM('active', 'inactive'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- -- Staff Table (new table for service providers)
-- CREATE TABLE staff (
--     staff_id UUID PRIMARY KEY,
--     user_id UUID REFERENCES users(user_id),
--     business_id UUID REFERENCES businesses(business_id),
--     position VARCHAR(255),
--     bio TEXT,
--     status ENUM('active', 'inactive', 'on_leave'),
--     working_hours JSON, -- Individual staff working hours
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP
-- );

-- Services Table
CREATE TABLE services (
    service_id UUID PRIMARY KEY,
    business_id UUID REFERENCES businesses(business_id),
    name VARCHAR(255),
    description TEXT,
    duration INTEGER, -- in minutes
    price DECIMAL(10,2),
    deposit_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- -- Staff Services Table (new table for staff-service relationships)
-- CREATE TABLE staff_services (
--     staff_service_id UUID PRIMARY KEY,
--     staff_id UUID REFERENCES staff(staff_id),
--     service_id UUID REFERENCES services(service_id),
--     price_adjustment DECIMAL(10,2), -- Optional: if staff has different pricing
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP
-- );

-- Slots Table
CREATE TABLE slots (
    slot_id UUID PRIMARY KEY,
    business_id UUID REFERENCES businesses(business_id),
    staff_id UUID REFERENCES staff(staff_id),
    service_id UUID REFERENCES services(service_id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status ENUM('available', 'booked', 'blocked'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Bookings Table
CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY,
    customer_id UUID REFERENCES users(user_id),
    business_id UUID REFERENCES businesses(business_id),
    staff_id UUID REFERENCES staff(staff_id),
    service_id UUID REFERENCES services(service_id),
    slot_id UUID REFERENCES slots(slot_id),
    booking_status ENUM('pending', 'confirmed', 'cancelled', 'completed'),
    booking_source ENUM('phone', 'web', 'whatsapp', 'instagram'),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Payments Table
CREATE TABLE payments (
    payment_id UUID PRIMARY KEY,
    booking_id UUID REFERENCES bookings(booking_id),
    amount DECIMAL(10,2),
    payment_type ENUM('crypto', 'stripe'),
    payment_provider ENUM('coinbase_commerce', 'stripe'),
    payment_status ENUM('pending', 'completed', 'failed', 'refunded'),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- AI Agents Table
-- CREATE TABLE ai_agents (
--     agent_id UUID PRIMARY KEY,
--     business_id UUID REFERENCES businesses(business_id),
--     name VARCHAR(255),
--     configuration JSON, -- Store agent-specific configuration
--     status ENUM('active', 'inactive'),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP
-- );

-- Communication Channels Table
CREATE TABLE communication_channels (
    channel_id UUID PRIMARY KEY,
    business_id UUID REFERENCES businesses(business_id),
    channel_type ENUM('phone', 'web', 'whatsapp', 'instagram'),
    configuration JSON, -- Store channel-specific configuration
    status ENUM('active', 'inactive'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
```