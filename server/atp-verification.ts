// server/atp-verification.ts - FIXED VERSION with correct selectors
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

    const response = await fetch(atpProfileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    console.log('🔍 Starting ATP scrape...');

    // Extract full name from the hero section
    let fullName = '';
    
    // Try multiple selectors for the name
    fullName = $('.player-profile-hero-name .first-name').text().trim() + ' ' + 
               $('.player-profile-hero-name .last-name').text().trim();
    
    if (!fullName.trim()) {
      fullName = $('.player-profile-hero-name').text().trim();
    }
    
    if (!fullName.trim()) {
      fullName = $('h1.player-profile-hero-name').text().trim();
    }

    if (!fullName.trim()) {
      // Try to get from meta tags
      fullName = $('meta[property="og:title"]').attr('content') || '';
      fullName = fullName.replace(' | Overview | ATP Tour | Tennis', '').trim();
    }

    console.log('📛 Found name:', fullName);

    const nameParts = fullName.split(' ').filter(p => p.length > 0);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Extract country - try multiple approaches
    let country = '';
    
    // Try flag code
    country = $('.player-flag-code').text().trim();
    
    if (!country) {
      // Try nationality section
      country = $('.player-profile-hero-nationality').text().trim();
    }
    
    if (!country) {
      // Try from table
      $('td').each((i, el) => {
        const text = $(el).text().trim();
        if (text === 'Country') {
          country = $(el).next('td').text().trim();
        }
      });
    }

    console.log('🌍 Found country:', country);

    // Extract age and date of birth
    let dateOfBirth = '';
    let age = 0;
    
    // Look for age in multiple places
    $('.table-big-value').each((i, el) => {
      const text = $(el).text().trim();
      // Look for pattern like "28 (1997.08.28)" or "28"
      const ageMatch = text.match(/^(\d{2})\s*\((\d{4})\.(\d{2})\.(\d{2})\)/);
      if (ageMatch) {
        age = parseInt(ageMatch[1]);
        dateOfBirth = `${ageMatch[2]}.${ageMatch[3]}.${ageMatch[4]}`;
        console.log('🎂 Found age from hero:', age, dateOfBirth);
      }
    });

    // If not found, try table format
    if (!age) {
      $('td').each((i, el) => {
        const label = $(el).text().trim();
        if (label === 'Age' || label.includes('Age')) {
          const value = $(el).next('td').text().trim();
          const ageMatch = value.match(/(\d{2})/);
          if (ageMatch) {
            age = parseInt(ageMatch[1]);
            console.log('🎂 Found age from table:', age);
          }
        }
        
        if (label === 'Born' || label.includes('Born')) {
          const value = $(el).next('td').text().trim();
          const dobMatch = value.match(/(\d{4})\.(\d{2})\.(\d{2})/);
          if (dobMatch) {
            dateOfBirth = `${dobMatch[1]}.${dobMatch[2]}.${dobMatch[3]}`;
            // Calculate age from DOB
            const birthDate = new Date(parseInt(dobMatch[1]), parseInt(dobMatch[2]) - 1, parseInt(dobMatch[3]));
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            console.log('🎂 Calculated age from DOB:', age);
          }
        }
      });
    }

    // Extract ranking
    let currentRanking: number | null = null;
    
    // Try singles ranking from hero stats
    $('.stat-value').each((i, el) => {
      const parent = $(el).parent();
      if (parent.find('.stat-label').text().includes('Rank')) {
        const rankText = $(el).text().trim();
        const rankNum = parseInt(rankText.replace(/[^0-9]/g, ''));
        if (!isNaN(rankNum)) {
          currentRanking = rankNum;
          console.log('🏆 Found ranking:', currentRanking);
        }
      }
    });

    console.log('✅ Scrape complete:', { firstName, lastName, country, age, currentRanking });

    if (!firstName || !lastName) {
      throw new Error('Could not extract player name from ATP profile');
    }

    return {
      firstName,
      lastName,
      country: country || 'Unknown',
      dateOfBirth,
      age: age || 0,
      currentRanking,
      profileExists: true
    };
  } catch (error) {
    console.error('❌ ATP scraping error:', error);
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
      .replace(/[^a-z0-9\s]/g, '')
      .trim();

  console.log('🔍 Comparing:', {
    submitted: {
      firstName: submittedData.firstName,
      lastName: submittedData.lastName,
      country: submittedData.country,
      age: submittedData.age
    },
    atp: {
      firstName: atpData.firstName,
      lastName: atpData.lastName,
      country: atpData.country,
      age: atpData.age
    }
  });

  // Check matches with more flexible matching
  const firstNameMatch = 
    normalize(submittedData.firstName) === normalize(atpData.firstName) ||
    normalize(submittedData.firstName).includes(normalize(atpData.firstName)) ||
    normalize(atpData.firstName).includes(normalize(submittedData.firstName));
  
  const lastNameMatch = 
    normalize(submittedData.lastName) === normalize(atpData.lastName) ||
    normalize(submittedData.lastName).includes(normalize(atpData.lastName)) ||
    normalize(atpData.lastName).includes(normalize(submittedData.lastName));

  // Country matching - handle variations
  const normalizedSubmittedCountry = normalize(submittedData.country);
  const normalizedAtpCountry = normalize(atpData.country);
  
  const countryMatch = 
    normalizedSubmittedCountry === normalizedAtpCountry ||
    normalizedSubmittedCountry.includes(normalizedAtpCountry) ||
    normalizedAtpCountry.includes(normalizedSubmittedCountry) ||
    // Handle common variations
    (normalizedSubmittedCountry === 'usa' && normalizedAtpCountry.includes('united states')) ||
    (normalizedSubmittedCountry.includes('united states') && normalizedAtpCountry === 'usa') ||
    (normalizedSubmittedCountry === 'uk' && normalizedAtpCountry.includes('united kingdom')) ||
    (normalizedSubmittedCountry.includes('united kingdom') && normalizedAtpCountry === 'uk');

  // Age: allow ±1 year tolerance
  const ageMatch = atpData.age > 0 && Math.abs(submittedData.age - atpData.age) <= 1;

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

  console.log('📊 Verification result:', {
    score,
    verified,
    matches: { firstNameMatch, lastNameMatch, countryMatch, ageMatch },
    discrepancies
  });

  return {
    verified,
    score,
    matches: { firstName: firstNameMatch, lastName: lastNameMatch, country: countryMatch, age: ageMatch },
    atpData,
    discrepancies
  };
}