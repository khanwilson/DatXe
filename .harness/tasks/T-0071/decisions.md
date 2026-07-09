# Decisions: T-0071

## D-1: rating made optional in DriverInfo

Backend DriverAssignedPayload does not include a driver rating field. Made `rating?: number` optional in DriverInfo interface rather than requiring backend to add it. Default display uses `(driver.rating ?? 0).toFixed(1)`.

## D-2: driverAvatar and driverRating added as optional to DriverAssignedPayload

These fields are not in the current T-0068 backend contract. Added as optional (`?`) so the interface is forward-compatible when backend adds them, without breaking current DEV mock flow.

## D-3: tripId added as optional to DriverAssignedPayload

Backend may include tripId in the driver_assigned event as a convenience. Added as optional. activeTripId in Zustand is set from trip.status_changed payload (which always includes tripId) as the primary source.

## D-4: useTripSocket owns trip state, not ActiveTripScreen

Trip status, driverCoord, and driverInfo are all managed inside useTripSocket hook. ActiveTripScreen is a pure consumer. This matches the existing useTripSimulation pattern for easy drop-in replacement.

## D-5: DEV mock timing

runDevMock extended with timed synthetic events: DRIVER_EN_ROUTE at t+12s, DRIVER_ARRIVED at t+24s, IN_PROGRESS at t+29s, COMPLETED at t+60s. Location ticks every 2s during EN_ROUTE and IN_PROGRESS legs.
