import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { getTimeUntilCutoff, isCutoffPassed } from '../../utils/dateUtils';

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilCutoff());
  const [isPassed, setIsPassed] = useState(isCutoffPassed());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilCutoff());
      setIsPassed(isCutoffPassed());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isPassed) {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
        <Clock className="w-5 h-5" />
        <span className="font-semibold">Selection Closed</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-lg">
      <Clock className="w-5 h-5 animate-pulse" />
      <span className="font-semibold">
        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
      <span className="text-sm text-gray-600">until cutoff</span>
    </div>
  );
}
