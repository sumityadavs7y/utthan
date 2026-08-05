const FAQS = [
  {
    question: 'What does Utthan Foundation do?',
    answer:
      'Utthan Foundation is an NGO supporting education, healthcare, livelihood, shelters, and community welfare for underprivileged people, including children, elderly, and specially-abled individuals.'
  },
  {
    question: 'How can I donate to Utthan Foundation?',
    answer:
      'You can donate via UPI QR on our Donate page, bank transfer to our published account details, or online through Instamojo net banking. Every contribution supports active community programs.'
  },
  {
    question: 'Is my donation used transparently?',
    answer:
      'Yes. Funds are directed toward campaigns, education support, medical help, shelters, rescue work, and community programs. You can review campaigns, certificates, and impact updates on this website.'
  },
  {
    question: 'How can I volunteer or become a member?',
    answer:
      'Visit the Become a Member page, submit the volunteer form with your details, and our team will contact you about opportunities that match your skills and availability.'
  },
  {
    question: 'Where is Utthan Foundation based?',
    answer:
      'We are based in Lucknow, Uttar Pradesh, India, and work with communities across education, healthcare, and livelihood initiatives.'
  },
  {
    question: 'How can I contact the foundation?',
    answer:
      'Use the Contact page form, call our published phone number, or email us. We also share updates through our blog and social channels.'
  }
];

function buildFaqJsonLd(faqs = FAQS) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

module.exports = {
  FAQS,
  buildFaqJsonLd
};
