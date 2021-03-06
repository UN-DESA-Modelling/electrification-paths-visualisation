window._g = {
  data_address: null,

  all_countries: [],

  target_countries: [],

  grids: [],

  first_load: true,

  // Region to be displayed this will be populated from the
  // url /?region=SOMEWHERE parameter
  //
  region: null,

  // Country to be displayed this will be populated from the
  // url /?iso3=SOMEWHERE parameter
  //
  country: null,

  current_grid: {
    technology: null,
    population_2030: null,
    lcoe: null
  },

  country_arrangement: null,

  scenario: {
    diesel_price: null,
    tier: 0,
  },

  current_cost: 3,
  current_tier: 3,
  current_diesel: 'nps'
}
