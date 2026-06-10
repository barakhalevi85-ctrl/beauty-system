import { HebrewCalendar, HDate, Location, Event } from '@hebcal/core';

export function getHebrewDateAndHolidays(date: Date) {
  // Convert standard JS date to HDate
  const hdate = new HDate(date);
  
  // Format the Hebrew date (e.g., "י״ד בסיוון תשפ״ד")
  const hebrewDateStr = hdate.renderGematriya();
  
  // Fetch holidays for the current Hebrew year
  // You can optimize this by caching, but doing it per date is fine for small ranges
  const options = {
    year: hdate.getFullYear(),
    isHebrewYear: true,
    il: true, // Israeli holidays
  };
  const events = HebrewCalendar.calendar(options);
  
  // Find events matching this exact Hebrew date
  const todaysEvents = events.filter((ev: Event) => ev.getDate().isSameDate(hdate));
  
  const holidayNames = todaysEvents
    .map((ev: Event) => ev.render('he'))
    // filter out things like "Erev Rosh Hashana" if we only want main holidays, or just keep them all
    .filter(Boolean);

  return {
    hebrewDateStr,
    holidays: holidayNames
  };
}
