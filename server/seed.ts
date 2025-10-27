import { db } from './db.js';
import { players } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    console.log('Seeding database...\n');
    
    // Create admin account
    const userEmail = 'sudhirmalin@gmail.com';
    const existing = await db.select().from(players).where(eq(players.email, userEmail));
    if (existing.length > 0) {
      await db.delete(players).where(eq(players.email, userEmail));
    }
    
    const userHash = await bcrypt.hash('admin123', 10);
    await db.insert(players).values({
      email: userEmail,
      passwordHash: userHash,
      fullName: 'Sudhir Malin',
      age: 30,
      country: 'India',
      location: 'India',
      ranking: 'N/A',
      specialization: 'Platform Admin',
      bio: 'Platform Administrator',
      fundingGoals: 'N/A',
      isAdmin: true,
      approvalStatus: 'approved',
      published: false
    });
    
    console.log('✓ Admin account created');
    
    // Create sample players
    const samplePlayers = [
      {
        email: 'player1@example.com',
        fullName: 'Alex Rodriguez',
        age: 22,
        country: 'Spain',
        location: 'Barcelona, Spain',
        ranking: 'ATP 250',
        specialization: 'Singles - Clay Court',
        bio: 'Professional tennis player specializing in clay court tournaments.',
        fundingGoals: 'Travel and accommodation for European tour'
      },
      {
        email: 'player2@example.com',
        fullName: 'Maria Santos',
        age: 20,
        country: 'Brazil',
        location: 'Rio de Janeiro, Brazil',
        ranking: 'ITF 500',
        specialization: 'Singles - Hard Court',
        bio: 'Rising star in South American tennis circuit.',
        fundingGoals: 'Training equipment and tournament fees'
      },
      {
        email: 'player3@example.com',
        fullName: 'James Chen',
        age: 24,
        country: 'USA',
        location: 'Los Angeles, USA',
        ranking: 'Challenger 150',
        specialization: 'Doubles',
        bio: 'Experienced doubles player in North American circuit.',
        fundingGoals: 'Travel costs and coaching fees'
      },
      {
        email: 'player4@example.com',
        fullName: 'Sophie Martin',
        age: 19,
        country: 'France',
        location: 'Paris, France',
        ranking: 'ITF 300',
        specialization: 'Singles - Grass Court',
        bio: 'Young talent focusing on grass court tournaments.',
        fundingGoals: 'Tennis equipment and tournament travel'
      }
    ];
    
    for (const player of samplePlayers) {
      const existing = await db.select().from(players).where(eq(players.email, player.email));
      if (existing.length > 0) {
        await db.delete(players).where(eq(players.email, player.email));
      }
      const hash = await bcrypt.hash('player123', 10);
      await db.insert(players).values({
        ...player,
        passwordHash: hash,
        published: true,
        featured: true,
        approvalStatus: 'approved',
        isAdmin: false
      });
    }
    
    console.log('✓ Sample players created\n');
    console.log('==========================================');
    console.log('Sign in with:');
    console.log('  Email: sudhirmalin@gmail.com');
    console.log('  Password: admin123');
    console.log('==========================================');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
