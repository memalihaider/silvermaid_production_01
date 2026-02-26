import { BlogPost } from './types/blog'

// Blog categories for filtering
const BLOG_CATEGORIES = [
  { id: 1, name: 'Cleaning Tips', slug: 'cleaning-tips' },
  { id: 2, name: 'How-To Guides', slug: 'how-to' },
  { id: 3, name: 'Industry News', slug: 'industry-news' },
  { id: 4, name: 'Home Care', slug: 'home-care' },
  { id: 5, name: 'Deep Cleaning', slug: 'deep-cleaning' },
  { id: 6, name: 'Customer Stories', slug: 'customer-stories' },
] as const

export { BLOG_CATEGORIES }
export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: '10 Essential Deep Cleaning Tips for Your Dubai Villa',
    slug: '10-essential-deep-cleaning-tips-dubai-villa',
    excerpt: 'Discover professional deep cleaning techniques that will transform your villa into a pristine sanctuary. Learn how to tackle stubborn stains and dust.',
    content: `Deep cleaning goes far beyond regular vacuuming and dusting. In Dubai's hot and dusty climate, maintaining a spotless villa requires professional-grade techniques and equipment.

Here are our top 10 essential deep cleaning tips:

1. Start from Top to Bottom
Always begin with ceiling fans and light fixtures, working your way down to the floors. This ensures dust and debris settle on already-cleaned surfaces.

2. Use Microfiber Cloths
Microfiber cloths trap dust and particles more effectively than traditional cotton cloths. They're perfect for furniture and surfaces.

3. Don't Forget Behind Appliances
Refrigerators, ovens, and washing machines accumulate dust and grime. Pull them out and clean thoroughly.

4. Steam Clean Upholstery
Steam cleaning penetrates deep into fabric fibers, removing allergens and stubborn dirt that regular vacuuming can't reach.

5. Tackle Grout with a Brush
Mix baking soda and water into a paste, apply to grout lines, and scrub with a stiff brush for sparkling tiles.

6. Clean Window Tracks
Window tracks collect dirt, pollen, and debris. Use a small brush and vacuum to remove accumulated grime.

7. Sanitize Kitchen Appliances
Clean inside your oven, microwave, and refrigerator using appropriate cleaning solutions for each appliance type.

8. Deep Clean Carpets
Rent or hire professional carpet cleaning equipment to extract dirt from deep within carpet fibers.

9. Wash Baseboards and Door Frames
These often-neglected areas collect significant dust. Wipe them down with a damp microfiber cloth.

10. Disinfect High-Touch Surfaces
Door handles, light switches, and remote controls harbor germs. Use appropriate disinfectants regularly.

Professional deep cleaning should be done quarterly in Dubai's climate to maintain optimal hygiene standards.`,
    author: 'Ahmad Hassan',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    category: 'cleaning-tips',
    image: 'https://images.unsplash.com/photo-1559688169-64efad69fbc1?auto=format&fit=crop&q=80&w=800',
    featured: true,
    publishedAt: '2024-01-15',
    updatedAt: '2024-01-15',
    readTime: 6,
    views: 1245
  },
  {
    id: '2',
    title: 'The Science Behind Professional Carpet Cleaning',
    slug: 'science-professional-carpet-cleaning',
    excerpt: 'Understand how professional carpet cleaning machines and solutions work to remove deep-seated dirt and allergens from your carpets.',
    content: `Professional carpet cleaning is a science. Understanding the chemistry and physics involved can help you appreciate why professional services are worth the investment.

The Process Explained:

When professional carpet cleaners arrive, they typically use hot water extraction (HWE) or steam cleaning methods. This process involves:

1. Pre-treatment: A specialized solution is applied to break down dirt particles and lift stains from the carpet fibers.

2. Hot water extraction: High-pressure hot water is injected into the carpet and then extracted along with the dirt, solution, and moisture.

3. Post-treatment: Additional conditioning solutions may be applied to protect the carpet and maintain its appearance.

Why Professional Equipment Matters:

Consumer-grade carpet cleaning machines remove only about 60-70% of water and dirt. Professional equipment can extract up to 95%, resulting in faster drying times (6-12 hours instead of 24-48 hours) and significantly cleaner carpets.

The Chemistry:

Professional cleaning solutions contain surfactants that surround dirt particles, allowing them to be suspended in water and removed. These are much more effective than household cleaners and are safe for your family and pets when properly applied and rinsed.

Frequency Recommendation:

For average household traffic, professional carpet cleaning should be done every 12-18 months. High-traffic areas may need more frequent cleaning to maintain appearance and extend carpet lifespan.`,
    author: 'Sarah Ali',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    category: 'how-to',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800',
    featured: true,
    publishedAt: '2024-01-10',
    updatedAt: '2024-01-10',
    readTime: 5,
    views: 892
  },
  {
    id: '3',
    title: 'Silver Maid Achieves Premium Service Certification',
    slug: 'silver-maid-premium-certification',
    excerpt: 'We are proud to announce that Silver Maid has received International Premium Cleaning Service Certification, reinforcing our commitment to excellence.',
    content: `We are thrilled to announce that Silver Maid has successfully achieved the International Premium Cleaning Service Certification (IPCSC). This prestigious recognition reflects our unwavering commitment to providing world-class cleaning services across the UAE.

What This Means for Our Clients:

1. Quality Assurance: Every service is held to international standards for safety, efficacy, and customer satisfaction.

2. Professional Training: All our staff undergo rigorous training programs and must pass comprehensive competency assessments.

3. Equipment Standards: We maintain and regularly update our equipment to meet the highest industry standards.

4. Customer Protection: All services are backed by our satisfaction guarantee and comprehensive insurance coverage.

The Certification Process:

Achieving this certification required months of documentation, training, and inspection by independent auditors. Our team members completed specialized courses in:
- Advanced cleaning techniques
- Health and safety protocols
- Customer service excellence
- Environmental responsibility

Our Commitment Moving Forward:

This certification is not an end point but a beginning. We continue to invest in our people, our equipment, and our processes to maintain these standards and exceed customer expectations.

Thank you for trusting Silver Maid with your cleaning needs. We are honored to serve you with certified excellence.`,
    author: 'Management Team',
    authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    category: 'industry-news',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    featured: true,
    publishedAt: '2024-01-05',
    updatedAt: '2024-01-05',
    readTime: 4,
    views: 2156
  },
  {
    id: '4',
    title: 'How to Remove Wine Stains from Carpets and Upholstery',
    slug: 'remove-wine-stains-carpet-upholstery',
    excerpt: 'Accidents happen! Learn the most effective techniques to remove wine stains from your precious carpets and furniture without causing damage.',
    content: `Wine stains can seem like a disaster, but with the right approach, you can remove them effectively. Here's our professional guide:

Immediate Steps (Within Minutes):

1. Blot, Don't Rub: Use a clean white cloth to blot up excess wine. Rubbing will spread the stain deeper into fibers.

2. Cold Water Rinse: Pour a small amount of cold water and continue blotting. Never use hot water, as heat sets protein-based stains.

3. Absorb Moisture: Use paper towels or a clean cloth to absorb as much liquid as possible.

For Fresh Stains:

Mix one tablespoon of liquid dishwashing detergent, one tablespoon of white vinegar, and two cups of warm water.

1. Apply the solution to the stain
2. Let it sit for 5 minutes
3. Blot with a clean cloth
4. Repeat if necessary
5. Rinse with clean water
6. Blot dry

For Set-In Stains:

Use hydrogen peroxide (test on hidden area first):
1. Apply 3% hydrogen peroxide to the stain
2. Cover with a cloth and let sit for 5-10 minutes
3. Blot thoroughly
4. Repeat if needed

Professional Recommendation:

For valuable carpets or persistent stains, professional cleaning is recommended. Our technicians have specialized enzymatic cleaners and equipment to handle stubborn wine stains safely.

Prevention Tips:

- Use coasters for glasses
- Keep cleaning supplies nearby for immediate action
- Consider stain-resistant treatments for carpets and upholstery

Act quickly and you'll be amazed at how well wine stains can be removed!`,
    author: 'Maria Santos',
    authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100',
    category: 'cleaning-tips',
    image: 'https://images.unsplash.com/photo-1563970150-9f324e77d092?auto=format&fit=crop&q=80&w=800',
    featured: false,
    publishedAt: '2023-12-28',
    updatedAt: '2023-12-28',
    readTime: 5,
    views: 567
  }
]
