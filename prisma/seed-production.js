const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const feeds = [
  // World News (权威、免费、全球视角)
  { name: 'BBC News (World)', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', category: 'world' },
  { name: 'Reuters (World)', url: 'https://www.reutersagency.com/feed/?best-topics=world&post_type=best', category: 'world' },
  { name: 'Al Jazeera (English)', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'world' },
  { name: 'Deutsche Welle (World)', url: 'https://rss.dw.com/xml/rss-en-all', category: 'world' },
  { name: 'Associated Press (AP)', url: 'https://apnews.com/hub/ap-top-news/index.rss', category: 'world' },

  // Technology (科技前沿)
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'tech' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'tech' },
  { name: 'Hacker News', url: 'https://news.ycombinator.com/rss', category: 'tech' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'tech' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'tech' },

  // Business & Finance (财经)
  { name: 'CNBC', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114', category: 'business' },
  { name: 'Quartz', url: 'https://qz.com/feed', category: 'business' },
  { name: 'Fortune', url: 'https://fortune.com/feed/', category: 'business' },

  // Science & Environment (科学与环境)
  { name: 'ScienceDaily', url: 'https://www.sciencedaily.com/rss/all.xml', category: 'science' },
  { name: 'NASA Breaking News', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', category: 'science' },
  { name: 'Nature', url: 'https://www.nature.com/nature.rss', category: 'science' }
];

async function main() {
  console.log(`Start adding ${feeds.length} feeds...`);
  
  for (const feed of feeds) {
    try {
      const exists = await prisma.feed.findUnique({
        where: { url: feed.url },
      });

      if (!exists) {
        await prisma.feed.create({
          data: feed,
        });
        console.log(`[Created] ${feed.name}`);
      } else {
        // Update category if changed
        if (exists.category !== feed.category) {
          await prisma.feed.update({
            where: { id: exists.id },
            data: { category: feed.category }
          });
          console.log(`[Updated] ${feed.name} category`);
        } else {
           console.log(`[Skipped] ${feed.name} (already exists)`);
        }
      }
    } catch (e) {
      console.error(`[Error] Failed to add ${feed.name}:`, e.message);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Done!');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
