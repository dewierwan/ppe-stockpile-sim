export interface Country {
  code: string;
  name: string;
  population: number;
}

// Cache for country data to avoid repeated API calls
let countriesCache: Country[] | null = null;

/**
 * Fetch country population data from World Bank API
 * API Documentation: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation
 */
export async function fetchCountries(): Promise<Country[]> {
  // Return cached data if available
  if (countriesCache) {
    return countriesCache;
  }

  try {
    // Fetch population data for all countries from World Bank API
    // Using the most recent year available (per_page=300 to get all countries)
    const response = await fetch(
      'https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&per_page=300&date=2023:2023'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch country data');
    }

    const data = await response.json();

    // World Bank API returns [metadata, data]
    const countryData = data[1];

    if (!countryData || !Array.isArray(countryData)) {
      throw new Error('Invalid data format from World Bank API');
    }

    // Process and filter the data
    const countries: Country[] = countryData
      .filter((item: any) => {
        // Filter out aggregates and regions, only keep actual countries
        return (
          item.value !== null &&
          item.value > 0 &&
          item.country &&
          item.country.value &&
          // Exclude aggregates (they don't have proper country codes)
          item.countryiso3code &&
          item.countryiso3code.length === 3
        );
      })
      .map((item: any) => ({
        code: item.countryiso3code,
        name: item.country.value,
        population: item.value,
      }))
      .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

    countriesCache = countries;
    return countries;
  } catch (error) {
    console.error('Error fetching countries:', error);

    // Fallback to a basic list if API fails
    return getFallbackCountries();
  }
}

/**
 * Fallback country list in case API fails
 * Using approximate 2023 population figures
 */
function getFallbackCountries(): Country[] {
  const fallback = [
    { code: 'USA', name: 'United States', population: 340_000_000 },
    { code: 'CHN', name: 'China', population: 1_425_000_000 },
    { code: 'IND', name: 'India', population: 1_428_000_000 },
    { code: 'IDN', name: 'Indonesia', population: 277_000_000 },
    { code: 'PAK', name: 'Pakistan', population: 240_000_000 },
    { code: 'BRA', name: 'Brazil', population: 216_000_000 },
    { code: 'NGA', name: 'Nigeria', population: 223_000_000 },
    { code: 'BGD', name: 'Bangladesh', population: 173_000_000 },
    { code: 'RUS', name: 'Russia', population: 144_000_000 },
    { code: 'MEX', name: 'Mexico', population: 128_000_000 },
    { code: 'JPN', name: 'Japan', population: 123_000_000 },
    { code: 'ETH', name: 'Ethiopia', population: 126_000_000 },
    { code: 'PHL', name: 'Philippines', population: 117_000_000 },
    { code: 'EGY', name: 'Egypt', population: 112_000_000 },
    { code: 'VNM', name: 'Vietnam', population: 98_000_000 },
    { code: 'COD', name: 'Congo (Democratic Republic)', population: 102_000_000 },
    { code: 'TUR', name: 'Turkey', population: 85_000_000 },
    { code: 'IRN', name: 'Iran', population: 89_000_000 },
    { code: 'DEU', name: 'Germany', population: 84_000_000 },
    { code: 'THA', name: 'Thailand', population: 71_000_000 },
    { code: 'GBR', name: 'United Kingdom', population: 67_000_000 },
    { code: 'FRA', name: 'France', population: 68_000_000 },
    { code: 'ITA', name: 'Italy', population: 59_000_000 },
    { code: 'ZAF', name: 'South Africa', population: 60_000_000 },
    { code: 'TZA', name: 'Tanzania', population: 67_000_000 },
    { code: 'MMR', name: 'Myanmar', population: 54_000_000 },
    { code: 'KEN', name: 'Kenya', population: 55_000_000 },
    { code: 'KOR', name: 'South Korea', population: 52_000_000 },
    { code: 'COL', name: 'Colombia', population: 52_000_000 },
    { code: 'ESP', name: 'Spain', population: 48_000_000 },
    { code: 'ARG', name: 'Argentina', population: 46_000_000 },
    { code: 'UGA', name: 'Uganda', population: 48_000_000 },
    { code: 'DZA', name: 'Algeria', population: 45_000_000 },
    { code: 'SDN', name: 'Sudan', population: 48_000_000 },
    { code: 'UKR', name: 'Ukraine', population: 38_000_000 },
    { code: 'IRQ', name: 'Iraq', population: 45_000_000 },
    { code: 'AFG', name: 'Afghanistan', population: 42_000_000 },
    { code: 'POL', name: 'Poland', population: 37_000_000 },
    { code: 'CAN', name: 'Canada', population: 39_000_000 },
    { code: 'MAR', name: 'Morocco', population: 37_000_000 },
    { code: 'SAU', name: 'Saudi Arabia', population: 36_000_000 },
    { code: 'UZB', name: 'Uzbekistan', population: 35_000_000 },
    { code: 'PER', name: 'Peru', population: 34_000_000 },
    { code: 'AUS', name: 'Australia', population: 26_000_000 },
    { code: 'MYS', name: 'Malaysia', population: 34_000_000 },
    { code: 'AGO', name: 'Angola', population: 36_000_000 },
    { code: 'MOZ', name: 'Mozambique', population: 33_000_000 },
    { code: 'GHA', name: 'Ghana', population: 34_000_000 },
    { code: 'YEM', name: 'Yemen', population: 34_000_000 },
    { code: 'NPL', name: 'Nepal', population: 30_000_000 },
    { code: 'VEN', name: 'Venezuela', population: 28_000_000 },
    { code: 'MDG', name: 'Madagascar', population: 30_000_000 },
    { code: 'CMR', name: 'Cameroon', population: 28_000_000 },
    { code: 'CIV', name: "Côte d'Ivoire", population: 28_000_000 },
    { code: 'NER', name: 'Niger', population: 27_000_000 },
    { code: 'AUS', name: 'Australia', population: 26_000_000 },
    { code: 'PRK', name: 'North Korea', population: 26_000_000 },
    { code: 'TWN', name: 'Taiwan', population: 23_000_000 },
    { code: 'MLI', name: 'Mali', population: 23_000_000 },
    { code: 'BFA', name: 'Burkina Faso', population: 23_000_000 },
    { code: 'SYR', name: 'Syria', population: 23_000_000 },
    { code: 'LKA', name: 'Sri Lanka', population: 22_000_000 },
    { code: 'MWI', name: 'Malawi', population: 20_000_000 },
    { code: 'ZMB', name: 'Zambia', population: 20_000_000 },
    { code: 'ROU', name: 'Romania', population: 19_000_000 },
    { code: 'CHL', name: 'Chile', population: 19_000_000 },
    { code: 'KAZ', name: 'Kazakhstan', population: 19_000_000 },
    { code: 'TCD', name: 'Chad', population: 18_000_000 },
    { code: 'ECU', name: 'Ecuador', population: 18_000_000 },
    { code: 'NLD', name: 'Netherlands', population: 17_000_000 },
    { code: 'SEN', name: 'Senegal', population: 18_000_000 },
    { code: 'SOM', name: 'Somalia', population: 18_000_000 },
    { code: 'GTM', name: 'Guatemala', population: 18_000_000 },
    { code: 'BEL', name: 'Belgium', population: 11_000_000 },
    { code: 'CZE', name: 'Czech Republic', population: 10_000_000 },
    { code: 'GRC', name: 'Greece', population: 10_000_000 },
    { code: 'PRT', name: 'Portugal', population: 10_000_000 },
    { code: 'SWE', name: 'Sweden', population: 10_000_000 },
    { code: 'AUT', name: 'Austria', population: 9_000_000 },
    { code: 'CHE', name: 'Switzerland', population: 9_000_000 },
    { code: 'NZL', name: 'New Zealand', population: 5_000_000 },
    { code: 'IRL', name: 'Ireland', population: 5_000_000 },
    { code: 'NOR', name: 'Norway', population: 5_000_000 },
    { code: 'DNK', name: 'Denmark', population: 6_000_000 },
    { code: 'FIN', name: 'Finland', population: 5_000_000 },
    { code: 'SGP', name: 'Singapore', population: 6_000_000 },
  ].sort((a, b) => a.name.localeCompare(b.name));

  countriesCache = fallback;
  return fallback;
}
