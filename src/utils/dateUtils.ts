export const formatDateYMD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getTomorrowDate = (): Date => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

export const getCutoffTime = (): Date => {
  const cutoff = new Date();
  cutoff.setHours(21, 0, 0, 0);
  return cutoff;
};

export const isCutoffPassed = (): boolean => {
  return new Date() > getCutoffTime();
};

export const getTimeUntilCutoff = (): { hours: number; minutes: number; seconds: number } => {
  const now = new Date();
  const cutoff = getCutoffTime();

  if (now > cutoff) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  const diff = cutoff.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return formatDateYMD(date) === formatDateYMD(today);
};
