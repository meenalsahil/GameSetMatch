// server/atp-verification.ts - With extensive logging
import * as cheerio from 'cheerio';
export async function scrapeATPProfile(atpProfileUrl) {
    try {
        console.log('\n=== ATP SCRAPE START ===');
        console.log('URL:', atpProfileUrl);
        if (!atpProfileUrl.includes('atptour.com/en/players/')) {
            throw new Error('Invalid ATP profile URL');
        }
        const response = await fetch(atpProfileUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-US,en;q=0.9',
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const html = await response.text();
        console.log('HTML length:', html.length);
        console.log('HTML sample:', html.substring(0, 200));
        const $ = cheerio.load(html);
        // Extract name - log every attempt
        let fullName = '';
        console.log('\n--- NAME EXTRACTION ---');
        const nameAttempts = [
            { selector: '.player-profile-hero-name', value: $('.player-profile-hero-name').text().trim() },
            { selector: 'h1.player-profile-hero-name', value: $('h1.player-profile-hero-name').text().trim() },
            { selector: 'h1', value: $('h1').first().text().trim() },
            { selector: 'meta[property="og:title"]', value: $('meta[property="og:title"]').attr('content') || '' },
            { selector: 'title', value: $('title').text().replace(' | Overview | ATP Tour | Tennis', '').trim() },
        ];
        for (const attempt of nameAttempts) {
            console.log(`${attempt.selector}: "${attempt.value}"`);
            if (attempt.value && !fullName) {
                fullName = attempt.value;
            }
        }
        console.log('FINAL NAME:', fullName);
        if (!fullName) {
            throw new Error('Could not extract name');
        }
        const nameParts = fullName.split(' ').filter(p => p.length > 0);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        // Extract country
        console.log('\n--- COUNTRY EXTRACTION ---');
        let country = '';
        const countryAttempts = [
            { selector: '.player-flag-code', value: $('.player-flag-code').text().trim() },
            { selector: '.country-item', value: $('.country-item').text().trim() },
            { selector: 'img alt in hero', value: $('.player-profile-hero img[alt]').attr('alt') || '' },
        ];
        // Check all elements for country data
        $('*').each((i, el) => {
            const text = $(el).text().trim();
            if (text === 'United States' || text === 'USA' || text === 'United Kingdom' || text === 'UK') {
                const tagName = el.tagName || el.name || 'unknown';
                const className = $(el).attr('class') || 'no-class';
                const info = `${tagName}.${className} = "${text}"`;
                console.log('Found country in:', info);
                if (!country && (text === 'United States' || text === 'USA')) {
                    country = text;
                }
            }
        });
        for (const attempt of countryAttempts) {
            console.log(`${attempt.selector}: "${attempt.value}"`);
            if (attempt.value && !country) {
                country = attempt.value;
            }
        }
        console.log('FINAL COUNTRY:', country);
        // Extract age
        console.log('\n--- AGE EXTRACTION ---');
        let age = 0;
        let dateOfBirth = '';
        // Look for age patterns
        $('*').each((i, el) => {
            const text = $(el).text().trim();
            const agePattern = text.match(/^(\d{2})\s*\((\d{4})\.(\d{2})\.(\d{2})\)/);
            if (agePattern) {
                const tagName = el.tagName || el.name || 'unknown';
                const className = $(el).attr('class') || 'no-class';
                console.log('Found age pattern:', text, 'in', tagName, className);
                age = parseInt(agePattern[1]);
                dateOfBirth = `${agePattern[2]}.${agePattern[3]}.${agePattern[4]}`;
            }
        });
        // Check table
        $('tr').each((i, el) => {
            const cells = $(el).find('td');
            if (cells.length >= 2) {
                const label = $(cells[0]).text().trim();
                const value = $(cells[1]).text().trim();
                console.log(`Table: ${label} = ${value}`);
                if (label.toLowerCase().includes('age') && !age) {
                    const ageNum = parseInt(value.match(/\d+/)?.[0] || '0');
                    if (ageNum > 0)
                        age = ageNum;
                }
            }
        });
        console.log('FINAL AGE:', age);
        // Extract ranking
        console.log('\n--- RANKING EXTRACTION ---');
        let currentRanking = null;
        $('.stat-value, .data-number, .rank-number').each((i, el) => {
            const text = $(el).text().trim();
            console.log('Potential ranking:', text);
            const rankNum = parseInt(text.replace(/[^0-9]/g, ''));
            if (!isNaN(rankNum) && rankNum > 0 && rankNum < 2000 && !currentRanking) {
                currentRanking = rankNum;
            }
        });
        console.log('FINAL RANKING:', currentRanking);
        console.log('\n=== SCRAPE RESULT ===');
        const result = {
            firstName,
            lastName,
            country: country || 'Unknown',
            dateOfBirth,
            age,
            currentRanking,
            profileExists: true
        };
        console.log(JSON.stringify(result, null, 2));
        console.log('=== ATP SCRAPE END ===\n');
        return result;
    }
    catch (error) {
        console.error('❌ ATP scraping error:', error);
        return null;
    }
}
export async function verifyPlayerAgainstATP(submittedData) {
    const atpData = await scrapeATPProfile(submittedData.atpProfileUrl);
    if (!atpData) {
        return {
            verified: false,
            score: 0,
            matches: { firstName: false, lastName: false, country: false, age: false },
            atpData: null,
            discrepancies: ['Could not fetch ATP profile - check logs']
        };
    }
    const normalize = (str) => str.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .trim();
    const firstNameMatch = normalize(submittedData.firstName) === normalize(atpData.firstName) ||
        normalize(submittedData.firstName).includes(normalize(atpData.firstName)) ||
        normalize(atpData.firstName).includes(normalize(submittedData.firstName));
    const lastNameMatch = normalize(submittedData.lastName) === normalize(atpData.lastName) ||
        normalize(submittedData.lastName).includes(normalize(atpData.lastName)) ||
        normalize(atpData.lastName).includes(normalize(submittedData.lastName));
    const normalizedSubmittedCountry = normalize(submittedData.country);
    const normalizedAtpCountry = normalize(atpData.country);
    const countryMatch = normalizedSubmittedCountry === normalizedAtpCountry ||
        normalizedSubmittedCountry.includes(normalizedAtpCountry) ||
        normalizedAtpCountry.includes(normalizedSubmittedCountry) ||
        (normalizedSubmittedCountry === 'usa' && normalizedAtpCountry.includes('united states')) ||
        (normalizedSubmittedCountry.includes('united states') && normalizedAtpCountry === 'usa');
    const ageMatch = atpData.age > 0 && Math.abs(submittedData.age - atpData.age) <= 1;
    let score = 0;
    if (firstNameMatch)
        score += 25;
    if (lastNameMatch)
        score += 25;
    if (countryMatch)
        score += 25;
    if (ageMatch)
        score += 25;
    const discrepancies = [];
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
    console.log('VERIFICATION:', { score, verified, firstNameMatch, lastNameMatch, countryMatch, ageMatch });
    return {
        verified,
        score,
        matches: { firstName: firstNameMatch, lastName: lastNameMatch, country: countryMatch, age: ageMatch },
        atpData,
        discrepancies
    };
}
