export const CHECK_IN_FEELINGS = [
  { score: 1, label: 'Rough' },
  { score: 2, label: 'Meh' },
  { score: 3, label: 'Okay' },
  { score: 4, label: 'Good' },
  { score: 5, label: 'Amazing' }
] as const;

export function getCheckInFeelingLabel(score: number) {
  return (
    CHECK_IN_FEELINGS.find((feeling) => feeling.score === score)?.label ?? 'Okay'
  );
}
