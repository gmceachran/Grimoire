import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create roles
  console.log('Creating roles...')
  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Regular user with access to create and manage their own content'
    }
  })

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrator with full access to the platform'
    }
  })

  console.log('✅ Roles created')

  // Create admin user
  console.log('Creating admin user...')
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@grimoire.com' },
    update: {},
    create: {
      email: 'admin@grimoire.com',
      password_hash: hashedPassword,
      display_name: 'Admin User',
      status: 'VERIFIED',
      email_verified_at: new Date(),
      user_roles: {
        create: {
          role_id: adminRole.id
        }
      }
    }
  })

  console.log('✅ Admin user created')

  // Create sample user
  console.log('Creating sample user...')
  const sampleUser = await prisma.user.upsert({
    where: { email: 'user@grimoire.com' },
    update: {},
    create: {
      email: 'user@grimoire.com',
      password_hash: await bcrypt.hash('user123', 12),
      display_name: 'Sample User',
      status: 'VERIFIED',
      email_verified_at: new Date(),
      user_roles: {
        create: {
          role_id: userRole.id
        }
      }
    }
  })

  console.log('✅ Sample user created')

  // Create sample library and content
  console.log('Creating sample content...')
  const library = await prisma.library.create({
    data: {
      name: 'My Fantasy World',
      description: 'A sample fantasy world for testing',
      user_id: sampleUser.id
    }
  })

  const book = await prisma.book.create({
    data: {
      title: 'The Chronicles of Eldoria',
      description: 'The main story of my fantasy world',
      library_id: library.id,
      user_id: sampleUser.id
    }
  })

  const chapter = await prisma.chapter.create({
    data: {
      title: 'Chapter 1: The Beginning',
      content: 'This is the beginning of our story...',
      book_id: book.id,
      user_id: sampleUser.id
    }
  })

  // Create sample world entries
  await prisma.worldEntry.createMany({
    data: [
      {
        title: 'Aelindra the Wise',
        content: 'A powerful elven mage who serves as the guardian of the ancient forest.',
        type: 'CHARACTER',
        chapter_id: chapter.id,
        user_id: sampleUser.id
      },
      {
        title: 'The Crystal City',
        content: 'A magnificent city built entirely of crystal, home to the light elves.',
        type: 'PLACE',
        chapter_id: chapter.id,
        user_id: sampleUser.id
      },
      {
        title: 'The Dragon\'s Tear',
        content: 'A legendary gem that grants its wielder the power to control fire.',
        type: 'OBJECT',
        chapter_id: chapter.id,
        user_id: sampleUser.id
      }
    ]
  })

  // Create sample map
  const map = await prisma.map.create({
    data: {
      title: 'Eldoria Map',
      description: 'The main map of the fantasy world',
      image_url: '/sample-maps/eldoria.jpg',
      library_id: library.id,
      user_id: sampleUser.id
    }
  })

  // Create sample map pins
  await prisma.mapPin.createMany({
    data: [
      {
        title: 'Crystal City',
        description: 'The capital of the light elves',
        x_coordinate: 250.5,
        y_coordinate: 180.2,
        map_id: map.id,
        user_id: sampleUser.id
      },
      {
        title: 'Ancient Forest',
        description: 'Home of Aelindra the Wise',
        x_coordinate: 150.0,
        y_coordinate: 300.7,
        map_id: map.id,
        user_id: sampleUser.id
      }
    ]
  })

  // Create sample timeline
  const timeline = await prisma.timeline.create({
    data: {
      title: 'Eldoria History',
      description: 'The major events in Eldoria\'s history',
      book_id: book.id,
      user_id: sampleUser.id
    }
  })

  // Create sample timeline events
  await prisma.timelineEvent.createMany({
    data: [
      {
        title: 'The Founding of Crystal City',
        description: 'The light elves establish their capital in the crystal mountains.',
        event_date: new Date('1200-01-01'),
        timeline_id: timeline.id,
        user_id: sampleUser.id
      },
      {
        title: 'The Great Dragon War',
        description: 'A massive conflict between dragons and mortals.',
        event_date: new Date('1350-06-15'),
        timeline_id: timeline.id,
        user_id: sampleUser.id
      },
      {
        title: 'Aelindra\'s Awakening',
        description: 'The wise elven mage discovers her true power.',
        event_date: new Date('1420-03-22'),
        timeline_id: timeline.id,
        user_id: sampleUser.id
      }
    ]
  })

  console.log('✅ Sample content created')

  console.log('🎉 Database seed completed successfully!')
  console.log('')
  console.log('Created:')
  console.log('- Admin user: admin@grimoire.com (password: admin123)')
  console.log('- Sample user: user@grimoire.com (password: user123)')
  console.log('- Sample library with book, chapter, and world entries')
  console.log('- Sample map with pins')
  console.log('- Sample timeline with events')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
