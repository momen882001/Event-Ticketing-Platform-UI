export const URLs = {
  apiBaseUrl: '/api/',
  wsEndpoint: 'http://localhost:8082/ws',
  eventsUpdatesTopic: '/topic/events/updates',

  // auth
  login: 'auth/login',
  register: 'auth/register',
  resetPassword: 'users/password',

  // categories
  getAllCategories: 'categories',
  getAllCategoriesPaginated: 'categories/paged',
  createCategory: 'categories',
  updateCategory: 'categories/:id',

  // venues
  getAllVenues: 'venues',
  getAllVenuesByCategoryId: 'venues/category/:categoryId',
  getAllVenuesPaginated: 'venues/paged',
  getVenueById: 'venues/:id',
  createVenue: 'venues',
  updateVenue: 'venues/:id',

  // users
  getAllUsers: 'users',

  // events
  getAllEvents: 'events',
  getAllEventsPaginated: 'events/paged',
  createEvent: 'events',
  getEventById: 'events/:id',
  deleteEventById: 'events/:id',
  cancelEventById: 'events/:id/cancel',
  updateEvent: 'events/:id',

  // bookings
  createBooking: 'bookings',
  getBookingById: 'bookings/:id',
  getAllBookings: 'bookings',
  cancelBookingById: 'bookings/:id/cancel',

  // tickets
  getAllTicketsByBookingId: 'tickets/booking/:bookingId',
  getTicketById: 'tickets/:id',
  checkInTicket: 'tickets/:ticketCode/check-in',
};
