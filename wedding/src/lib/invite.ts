// Personal invite links look like ...?to=Mary&and=Tom and greet the guests by name ("Mary & Tom, you're invited").
// The names are only used for the greeting; they never fill in the RSVP form.
export function invitedGreeting() {
  const params = new URLSearchParams(window.location.search);
  return [params.get('to'), params.get('and')]
    .map((n) => n?.trim().slice(0, 40) ?? '')
    .filter(Boolean)
    .join(' & ');
}

export function inviteLink(base: string, first: string, second: string) {
  const params = new URLSearchParams();
  if (first.trim()) params.set('to', first.trim());
  if (second.trim()) params.set(first.trim() ? 'and' : 'to', second.trim());
  const query = params.toString().replace(/\+/g, '%20');
  return query ? `${base}?${query}` : base;
}
