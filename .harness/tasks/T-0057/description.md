# Task T-0057: Rework Ride Booking Flow

## Objective
Redesign the ride booking flow in the app_user project to improve user experience and add new features similar to Grab's interface.

## Requirements

### Home Screen Redesign
1. Add a search input view at the top similar to Grab's design for easier animation later
2. Tapping this search view should navigate to SearchDestinationScreen
3. Below the search view, add horizontal sliding services (e.g., book ride, grocery shopping, delivery)
   - Items should be small circular icons sliding horizontally
4. Below that, add a "Order Now" slide with banners from partner companies
   - Items should be rectangular with rounded corners
   - Full screen width, height ratio 1:2
   - Use carousel component
5. Below that, add a list of nearby services/restaurants in 2-column grid layout
   - Each item should be a vertical rectangle with:
     - Description image of the establishment
     - Name of the establishment with stars and distance

### Search Destination Screen Enhancement
1. Top section should have user's current location (pickup/delivery point) with ability to change location
2. Below that, an input search field (already exists but needs enhancement)
3. Search should show list of locations/establishments (existing functionality)
4. Add location changing feature:
   - Tapping on current location opens another search screen
   - This screen has an input field and saved places
   - Search works same as SearchDestinationScreen
   - After selecting location, return to SearchDestinationScreen with updated location

### Booking Route Flow
1. When tapping destination in SearchDestinationScreen, open BookingRoute screen
2. This screen is similar to HomeScreen after selecting destination
3. Map should zoom out to show entire route from pickup to destination without modal obstruction
4. After selecting vehicle type in RouteBookingModal, send order to server for nearby drivers

## Technical Details
- Focus only on app_user project
- Enhance existing screens rather than creating completely new ones where possible
- Maintain existing navigation patterns
- Ensure smooth transitions between screens