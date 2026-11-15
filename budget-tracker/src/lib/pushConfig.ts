/**
 * Public half of the push signing key pair. Safe to commit: browsers need it to subscribe. The private half
 * lives only in the repo's VAPID_PRIVATE_KEY secret, where the reminder sender reads it.
 */
export const VAPID_PUBLIC_KEY = 'BBnC5goTPEB2_dNZF1IgoukjZ3ZoYd7jk22Fq-duaJ9R96D2X-1zEF2IEPZ2iwNRBmytbnEFjrNBfnbyUIW3i_E';
