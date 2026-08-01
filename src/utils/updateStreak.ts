import User from "../models/user.model";

export const updateStreak = async (userId: string): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastRead = user.lastReadDate ? new Date(user.lastReadDate) : null;
  if (lastRead) lastRead.setHours(0, 0, 0, 0);

  if (lastRead?.getTime() === today.getTime()) return;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = lastRead?.getTime() === yesterday.getTime();

  const newStreak = isYesterday ? (user.currentStreak as number) + 1 : 1;

  await User.findByIdAndUpdate(userId, {
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, user.longestStreak as number),
    lastReadDate: today,
  });
};
