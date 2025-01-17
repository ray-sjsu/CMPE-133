export const isOpenNow = (openingHours) => {
    if (!openingHours?.periods || openingHours.periods.length === 0) {
      return false;
    }
  
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday, 6 is Saturday
    const currentTime = parseInt(
      now.toTimeString().slice(0, 2) + now.toTimeString().slice(3, 5)
    );
  
  
    for (const period of openingHours.periods) {
      const openDay = period?.open?.day;
      const closeDay = period?.close?.day;
      const openTime = parseInt(period?.open?.time);
      const closeTime = parseInt(period?.close?.time);
    
      if (openDay === undefined || closeDay === undefined || openTime === undefined || closeTime === undefined) {
        continue;
      }
  
      // Handle same-day closing
      if (openDay === currentDay) {
        if (closeDay === currentDay) {
          if (openTime <= currentTime && currentTime < closeTime) {
            return true;
          }
        } else {
          // Handle overnight closing
          if (openTime <= currentTime || currentTime < closeTime) {
            return true;
          }
        }
      }
  
      // Handle cases where the place is open overnight and the current time is past midnight
      if (closeDay === currentDay && currentTime < closeTime) {
        return true;
      }
    }
  
    return false;
  };
  