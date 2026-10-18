// Everything guests see lives here. Edit this file to change the site's wording.
// Lines marked TODO are placeholders that still need your real details.

export const wedding = {
  couple: ['Jamie', 'Hannah'] as const,
  // Local time of the ceremony. Used for the date line and the countdown.
  date: '2027-09-12T13:00:00',
  rsvpBy: '2027-02-28',
  town: 'Wokingham, Berkshire',

  venue: {
    name: 'Cantley House Hotel',
    address: ['Milton Road', 'Wokingham', 'RG40 1JY'],
    notes: 'Free parking on site. The ceremony and reception are in the same place, so there is no travelling in between.',
  },

  schedule: [
    { time: '12:00pm', title: 'Guests arrive', detail: 'Find a seat and say hello.' },
    { time: '1:00pm', title: 'Ceremony', detail: 'Please be seated by ten to one.' },
    { time: '1:45pm', title: 'Drinks and canapés', detail: 'Photos on the lawn, weather permitting.' },
    { time: '4:00pm', title: 'Dinner and speeches', detail: 'Tell us about dietary needs in your RSVP.' },
    { time: '7:00pm', title: 'First dance and party', detail: 'Bring your dancing shoes.' },
    { time: '8:00pm', title: 'Evening snacks', detail: 'Some light food options.' },
    { time: '12:00am', title: 'Carriages', detail: 'Book your ride home ahead of time, as taxis get busy late at night.' },
  ],

  travel: [
    { title: 'By car', body: 'Use the postcode above in your sat nav. There is plenty of parking, and cars can stay overnight.' },
    { title: 'By train', body: 'Wokingham station is about a mile away, around five minutes by taxi, with direct trains from London Waterloo and Reading.' },
  ],

  stay: [
    {
      name: 'Cantley House Hotel',
      distance: 'The venue itself',
      note:
        "The easiest option: no travel home at the end of the night. Rooms are limited and allocated by us. If we haven't let you know you have a room, please find alternative options or ask us if there is space.\n\nYou can book the night before yourself with our preferential rate if you wish.",
    },
    { name: 'Premier Inn Wokingham Town Centre', distance: 'About a mile away', note: 'A good-value option in the town centre, a few minutes from the venue by taxi.', url: 'https://www.premierinn.com/gb/en/hotels/england/berkshire/wokingham/wokingham-town-centre.html' },
  ],

  dressCode: {
    title: 'Classic wedding attire',
    body: "Suits and dresses. You know how to dress for a wedding. Just look your best and ready to have fun.\n\nThere will be parts of the day outside, and it's September in England… so be prepared for anything.",
  },

  gifts:
    'Having you there is the best gift. If you would like to give something, a contribution towards our honeymoon would be lovely, and there will be a card box on the day.',

  faq: [
    { q: 'Can I bring a plus-one?', a: 'Your invitation says how many seats we have saved for you. If you are not sure, just ask us.' },
    { q: 'Are children invited?', a: 'We love your little ones, but this is an adults-only celebration, apart from children who we have specifically invited.' },
    { q: 'Can I take photos?', a: 'We are having an unplugged ceremony, so please keep phones away until we are married. After that, snap away.' },
    { q: 'What if I need to change my RSVP?', a: 'Send the form again with your new answer. We will use the most recent one.' },
  ],
};
