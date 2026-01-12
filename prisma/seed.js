const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const feeds = [
    { name: 'BBC News (World)', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'world' },
    { name: 'New York Times (World)', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', category: 'world' },
    { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'tech' },
    { name: 'Hacker News', url: 'https://news.ycombinator.com/rss', category: 'tech' },
    { name: 'CNBC', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114', category: 'business' },
  ];

  for (const feed of feeds) {
    const exists = await prisma.feed.findUnique({
      where: { url: feed.url },
    });

    if (!exists) {
      await prisma.feed.create({
        data: feed,
      });
      process.stdout.write(`Created feed: ${feed.name}\n`);
      continue;
    }

    if (exists.category !== feed.category) {
      await prisma.feed.update({
        where: { id: exists.id },
        data: { category: feed.category },
      });
      process.stdout.write(`Updated category for feed: ${feed.name}\n`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    process.stderr.write(String(e) + '\n');
    await prisma.$disconnect();
    process.exit(1);
  });

