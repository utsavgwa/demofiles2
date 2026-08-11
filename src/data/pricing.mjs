// Pricing page content. Fictional plans named after Dickens novels.
export const plans = [
  {
    name: 'Pickwick',
    price: 'Free',
    period: '',
    sessions: '3 one-hour sessions',
    features: [
      'Voice tutoring across every title',
      'Adapts to how your child reads',
      'Session summaries after every chapter',
      'Available at any hour',
    ],
    featured: false,
  },
  {
    name: 'Copperfield',
    price: '$49',
    period: '/month',
    sessions: '8 sessions monthly',
    features: [
      'Two reading sessions a week',
      'Everything in Pickwick',
      'Progress insights and parent dashboard',
      'Early access to new titles',
    ],
    featured: false,
  },
  {
    name: 'Great Expectations',
    price: '$199',
    period: '/month',
    sessions: 'Unlimited sessions',
    features: [
      'Unlimited reading sessions',
      'Everything in Copperfield',
      'Full skill map across the whole shelf',
      'Priority access to new features',
    ],
    featured: true,
  },
];

export const comparison = {
  title: 'A private tutor, and the alternative',
  columns: ['Private tutor', 'Boz Great Expectations'],
  rows: [
    { factor: 'Cost', human: '$1,000 / month', boz: '$199 / month' },
    { factor: 'Coverage', human: 'One or two set texts', boz: 'One tutor, every title' },
    { factor: 'Scheduling', human: 'Book days in advance', boz: 'Book minutes in advance' },
    { factor: 'Availability', human: 'A few evenings a week', boz: 'On call at any hour' },
    { factor: 'Method', human: 'Varies by tutor', boz: 'One documented method, applied every turn' },
  ],
};

export const pricingFaq = [
  {
    q: 'Which books does Boz cover?',
    a: 'Every title on the books page, from A Christmas Carol to the unfinished Edwin Drood, plus the essay and comprehension work that usually comes attached to them.',
  },
  {
    q: 'How is this different from a general chatbot?',
    a: 'A general chatbot optimises for finishing your child’s sentence. Boz optimises for your child finishing it themselves, and will decline to hand over an answer that is still worth struggling for.',
  },
  {
    q: 'What ages is it built for?',
    a: 'Roughly ages nine to eighteen. The same passage is taught differently to a nine-year-old meeting Fagin and a sixteen-year-old writing on narrative distance.',
  },
  {
    q: 'What happens to our data?',
    a: 'Session transcripts belong to the family, are never sold, and are never used to train a public model. This is a demonstration site, so in truth nothing is stored at all.',
  },
  {
    q: 'Can we cancel?',
    a: 'At any time, from the parent dashboard, without a telephone call or a letter to the Circumlocution Office.',
  },
  {
    q: 'What actually happens in a session?',
    a: 'Your child talks. Boz listens, asks, waits, draws on the shared page when a diagram helps, and writes a short summary of what was understood when the hour ends.',
  },
];

export const pricingIntro = {
  headline: 'Plans for every household',
  subhead: 'Start with three free one-hour sessions. No card, no clerk, no queue.',
};
