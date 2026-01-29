// Date utilities for HabitFlow

/**
 * 今日の日付をYYYY-MM-DD形式で取得
 */
export function getToday(): string {
  return formatDate(new Date());
}

/**
 * DateオブジェクトをYYYY-MM-DD形式に変換
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 日付文字列をDateオブジェクトに変換
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * 過去N日間の日付配列を取得
 */
export function getPastDays(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(formatDate(date));
  }

  return dates;
}

/**
 * 曜日を取得（短縮形）
 */
export function getDayOfWeek(dateStr: string): string {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const date = parseDate(dateStr);
  return days[date.getDay()];
}

/**
 * 日付を日本語形式で表示（M/D）
 */
export function formatDateShort(dateStr: string): string {
  const date = parseDate(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * ストリーク（連続日数）を計算
 */
export function calculateStreak(
  completedDates: string[],
  today: string = getToday()
): number {
  if (completedDates.length === 0) return 0;

  // 日付をソート（新しい順）
  const sortedDates = [...completedDates].sort((a, b) => b.localeCompare(a));

  // 今日または昨日から開始されているか確認
  const todayDate = parseDate(today);
  const yesterday = new Date(todayDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  // 最新の完了日が今日か昨日でなければストリークは0
  if (sortedDates[0] !== today && sortedDates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let currentDate = sortedDates[0] === today ? todayDate : yesterday;
  const dateSet = new Set(completedDates);

  while (dateSet.has(formatDate(currentDate))) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}

/**
 * 週間の達成率を計算
 */
export function calculateWeeklyRate(
  totalHabits: number,
  completedCount: number
): number {
  if (totalHabits === 0) return 0;
  return Math.round((completedCount / totalHabits) * 100);
}
