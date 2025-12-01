// server/atp-verification.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

interface ATPProfileData {
  firstName: string;
  lastName: string;
  country: string;
  dateOfBirth: string;
  age: number;
  currentRanking: number | null;
  profileExists: boolean;
}

interface VerificationResult {
  verified: boolean;
  score: number;
  matches: {
    firstName: boolean;
    lastName: boolean;
    country: boolean;
    age: boolean;
  };
  atpData: ATPProfileData | null;
  discrepancies: string[];
}

/**
 * Scrape ATP profile and extract data
 */
export async function scrapeATPProfile(atpProfileUrl: string): Promise<ATPProfileData | null> {
  try {
    if (!atpProfileUrl.includes('atptour.com/en/players/')) {
      throw new Error('Invalid ATP profile URL');
    }

    const response = await axios.get(atpProfileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    // Extract name
    const fullName = $('.player-profile-hero-name').first().text().trim();
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Extract country
    const country = $('.player-flag-code').first().text().trim() || 
                   $('.player-profile-hero-nationality img').attr('alt') || '';

    // Extract age/DOB
    let dateOfBirth = '';
    let age = 0;
    
    $('.player-profile-hero-table').find('td').each((i, el) => {
      const text = $(el).text().trim();
      if (text.match(/\(\d{4}\.\d{2}\.\d{2}\)/)) {
        dateOfBirth = text.replace(/[()]/g, '').trim();
        const birthDate = new Date(dateOfBirth.replace(/\./g, '-'));
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
    });

    // Extract ranking (optional)
    let currentRanking: number | null = null;
    const rankingText = $('.player-profile-hero-table').find('td').filter((i, el) => {
      return $(el).text().includes('Rank');
    }).next().text().trim();
    
    if (rankingText && !isNaN(parseInt(rankingText))) {
      currentRanking = parseInt(rankingText);
    }

    return {
      firstName,
      lastName,
      country,
      dateOfBirth,
      age,
      currentRanking,
      profileExists: true
    };
  } catch (error) {
    console.error('ATP scraping error:', error);
    return null;
  }
}

/**
 * Verify player data against ATP profile
 */
export async function verifyPlayerAgainstATP(submittedData: {
  firstName: string;
  lastName: string;
  country: string;
  age: number;
  atpProfileUrl: string;
}): Promise<VerificationResult> {
  
  const atpData = await scrapeATPProfile(submittedData.atpProfileUrl);

  if (!atpData) {
    return {
      verified: false,
      score: 0,
      matches: { firstName: false, lastName: false, country: false, age: false },
      atpData: null,
      discrepancies: ['Could not fetch ATP profile']
    };
  }

  // Normalize for comparison
  const normalize = (str: string) => 
    str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  // Check matches
  const firstNameMatch = 
    normalize(submittedData.firstName) === normalize(atpData.firstName) ||
    normalize(submittedData.firstName).includes(normalize(atpData.firstName)) ||
    normalize(atpData.firstName).includes(normalize(submittedData.firstName));
  
  const lastNameMatch = 
    normalize(submittedData.lastName) === normalize(atpData.lastName) ||
    normalize(submittedData.lastName).includes(normalize(atpData.lastName)) ||
    normalize(atpData.lastName).includes(normalize(submittedData.lastName));

  const countryMatch = 
    normalize(submittedData.country) === normalize(atpData.country) ||
    submittedData.country.toUpperCase() === atpData.country.toUpperCase();

  // Age: allow ±1 year
  const ageMatch = Math.abs(submittedData.age - atpData.age) <= 1;

  // Calculate score
  let score = 0;
  if (firstNameMatch) score += 25;
  if (lastNameMatch) score += 25;
  if (countryMatch) score += 25;
  if (ageMatch) score += 25;

  // Collect discrepancies
  const discrepancies: string[] = [];
  if (!firstNameMatch) {
    discrepancies.push(`First name: "${submittedData.firstName}" vs ATP "${atpData.firstName}"`);
  }
  if (!lastNameMatch) {
    discrepancies.push(`Last name: "${submittedData.lastName}" vs ATP "${atpData.lastName}"`);
  }
  if (!countryMatch) {
    discrepancies.push(`Country: "${submittedData.country}" vs ATP "${atpData.country}"`);
  }
  if (!ageMatch) {
    discrepancies.push(`Age: ${submittedData.age} vs ATP ${atpData.age}`);
  }

  const verified = score >= 75;

  return {
    verified,
    score,
    matches: { firstName: firstNameMatch, lastName: lastNameMatch, country: countryMatch, age: ageMatch },
    atpData,
    discrepancies
  };
}