import { useEffect, useRef, useCallback } from 'react';
import { useStreak } from './useStreak';

const STREAK_RISK_HOUR = 20; // 8 PM
const REMINDER_CHECK_INTERVAL = 60000; // Check every minute

export function useNotifications() {
  const { currentStreak } = useStreak();
  const hasShownRiskRef = useRef(false);
  const reminderIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevStreakRef = useRef(currentStreak);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }, []);

  // Send a notification
  const sendNotification = useCallback((title: string, body: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      new Notification(title, {
        body,
        icon: '/logo.jpg',
        badge: '/icons/icon-72x72.png',
        tag: 'gabay-streak',

      });
    } catch {
      // Silently fail
    }
  }, []);

  // Check if streak is at risk (user hasn't studied today and it's past risk hour)
  const checkStreakRisk = useCallback(() => {
    if (hasShownRiskRef.current) return;
    if (currentStreak === 0) return;

    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA');

    // Check if user has studied today by looking at localStorage or through streak hook
    const hasStudiedToday = localStorage.getItem('gabay_studied_today') === todayStr;

    if (!hasStudiedToday && now.getHours() >= STREAK_RISK_HOUR) {
      sendNotification(
        '?? Streak at Risk!',
        `You haven't studied today! Your ${currentStreak}-day streak will break. One question is all it takes!`
      );
      hasShownRiskRef.current = true;
    }
  }, [currentStreak, sendNotification]);

  // Start reminder listener (checks periodically for scheduled time)
  const startReminderCheck = useCallback((reminderTime: string) => {
    if (reminderIntervalRef.current) {
      clearInterval(reminderIntervalRef.current);
    }

    reminderIntervalRef.current = setInterval(() => {
      const now = new Date();
      const [hoursStr = '19', minutesStr = '0'] = (reminderTime || '19:00').split(':');
      const hours = Number(hoursStr);
      const minutes = Number(minutesStr);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const targetMinutes = hours * 60 + minutes;

      // Send reminder within the check interval window
      if (Math.abs(currentMinutes - targetMinutes) <= 1) {
        const todayStr = now.toLocaleDateString('en-CA');
        const hasStudiedToday = localStorage.getItem('gabay_studied_today') === todayStr;

        if (!hasStudiedToday) {
          sendNotification(
            '?? Time to Study!',
            currentStreak > 0
              ? `You have a ${currentStreak}-day streak to protect! Keep it going! ??`
              : 'Start your study streak today! One question is all it takes. ??'
          );
        }
      }
    }, REMINDER_CHECK_INTERVAL);
  }, [currentStreak, sendNotification]);

  // Stop reminder check
  const stopReminderCheck = useCallback(() => {
    if (reminderIntervalRef.current) {
      clearInterval(reminderIntervalRef.current);
      reminderIntervalRef.current = null;
    }
  }, []);

  // Auto-start reminder check on mount
  useEffect(() => {
    const savedTime = localStorage.getItem('gabay_reminder_time');
    if (savedTime) {
      startReminderCheck(savedTime);
    }

    return () => stopReminderCheck();
  }, [startReminderCheck, stopReminderCheck]);

  // Track streak changes for milestone detection
  useEffect(() => {
    if (currentStreak > prevStreakRef.current) {
      hasShownRiskRef.current = false; // Reset risk alert on new study day
    }
    prevStreakRef.current = currentStreak;
  }, [currentStreak]);

  // Mark today as studied (called when user completes a study session or QOTD)
  const markStudiedToday = useCallback(() => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    localStorage.setItem('gabay_studied_today', todayStr);
    hasShownRiskRef.current = false;
  }, []);

  return {
    requestPermission,
    sendNotification,
    startReminderCheck,
    stopReminderCheck,
    checkStreakRisk,
    markStudiedToday,
  };
}
