# PitchLink Host

A mobile application for football pitch owners to manage their business.

## Features

- **Authentication**: Secure login and registration system
- **Pitch Management**: Add, edit, and delete football pitches
- **Booking System**: Manual and automatic booking management
- **Payment Processing**: Track payments and revenue
- **Analytics Dashboard**: View key metrics and insights
- **Local Data Persistence**: All data stored locally on device

## Technical Specifications

- Built with Expo Router for navigation
- State management with Zustand
- Data fetching with React Query (planned)
- Local storage with AsyncStorage
- Icons from Lucide React Native
- Responsive design with SafeAreaContext

## App Structure

1. **Dashboard Page** (Home tab)
   - Today's overview with key metrics
   - Quick actions for common tasks
   - Recent activity feed
   - Pull-to-refresh functionality

2. **Pitches Page** (Facilities tab)
   - Grid/list view of all pitches
   - Ability to add new pitches
   - Pitch details view
   - Status indicators (available/booked/maintenance)

3. **Bookings Page** (Bookings tab)
   - List of all bookings
   - Filter options (today, upcoming, pending)
   - Add manual booking button
   - Booking details view with status

4. **Payments Page** (Payments tab)
   - Revenue tracking and analytics
   - Payment history
   - Outstanding payments

5. **Profile Page** (Profile tab)
   - Owner profile information
   - Account settings
   - Change password functionality
   - Sign out option

## Color Scheme

- Primary Green: #00FF88 (for accents, buttons, active states)
- Dark Mode: #0A0A0A (background), #1E1E1E (cards), #FFFFFF (text)
- Light Mode: #F8F9FA (background), #FFFFFF (cards), #000000 (text)

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npx expo start
   ```

3. Follow the instructions to run on iOS, Android, or web.

## Dependencies

- Expo Router
- Zustand
- React Query (planned)
- AsyncStorage
- Lucide React Native
- SafeAreaContext