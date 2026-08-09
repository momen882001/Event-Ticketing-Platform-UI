export const URLs = {
  apiBaseUrl: 'http://localhost:8082/api/',

  // auth
  login: 'auth/login',
  register: 'auth/register',

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
};
