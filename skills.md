# TherapiesMaroc – Project Overview

**TherapiesMaroc** is a web platform designed to facilitate connections between mental health professionals (therapists) and patients (clients) in Morocco. The platform handles therapy session scheduling, booking requests, secure payments, file sharing, and post-session reviews.

## Core Roles & Permissions

The platform is built on a shared dual-role authentication system:
- **Clients**: Users seeking therapy. They can browse available schedules, send booking requests, complete secure payments, leave reviews for therapists, and download files shared with them.
- **Therapists**: Mental health professionals. They can define their specialization, set their schedule/availability, approve or decline patient session requests, and securely share files/documents with specific clients.

## Key Features & Workflows

1. **Scheduling & Booking Flow**:
   - Therapists create available physical or online time slots (`Schedules`).
   - Clients browse and submit a `BookingRequest` for a specific schedule slot.
   - A single schedule slot can receive multiple requests, but the therapist selects and accepts only one. The schedule is then definitively assigned to that client.
2. **Payments System**:
   - Once a booking request is accepted, the client can securely pay for the session. The payment is directly linked to the finalized schedule.
3. **Session Reviews**:
   - Clients can reflect on completed sessions and leave detailed reviews (rating + comments) about their therapist's service.
4. **Patient File Management**:
   - Therapists can upload and manage documents, notes, or resources. These files are securely shared with targeted individual clients who can securely view and download them.

## Technical Architecture

- **Backend**: Laravel (PHP) acting as a robust API layer.
- **Database**: Relational Database handled via Laravel's Eloquent ORM. Features a highly optimized schema with tight referential integrity constraints to map complex interactions between schedules, clients, and payments.
- **Frontend**: React (Separate application consuming the Laravel API).
