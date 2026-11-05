/*
 * Overrides for the Zoom session at /zoom.
 * The page uses everything in content.js and replaces only what differs here.
 * The server loads this file too, so RSVP emails from /zoom carry the same details.
 */
(function (C) {
  C.eventKey = "zoom";
  // Tells the team which session an RSVP belongs to (notification email + Make)
  C.eventName = C.hero.title + " (זום)";

  C.meta.description =
    "בוקר אחד בזום, עם מספר מצומצם של בעלי חברות ומנהלים מהענף. הרצאה של מומחה על מה שכבר עובד בשטח — ואחריה שיחה פתוחה בין המשתתפים.";
  C.hero.subtitle =
    "לאור ההצלחה של הכנס הקודם, אנחנו מקיימים מפגש נוסף בזום: בוקר אחד, עם מספר מצומצם של בעלי חברות ומנהלים מהענף. הרצאה של מומחה על מה שכבר עובד בשטח — ואחריה שיחה פתוחה בין המשתתפים.";

  var values = { place: "זום", time: "10:00", date: "26.11" };
  C.details.forEach(function (d) {
    d.value = values[d.key];
    if (d.key === "date") d.icon = "assets/images/date-icon-26.jpeg";
  });

  C.rsvp.sectionTitle = "שומרים לך מקום במפגש";
  C.rsvp.subtitle = "מספר המקומות במפגש מוגבל, לכן נשמח לדעת מראש מי מגיע.";
  C.rsvp.dateLabel = "תאריך: 26.11";
  C.rsvp.timeLabel = "שעה: 10:00";
  C.rsvp.messages.successYes = "תודה! אישור ההגעה התקבל, קישור ההצטרפות לזום יישלח אליך לפני המפגש.";
  C.rsvp.confirmation.text =
    "שמחים לבשר שנרשמת לכנס {title}, שיתקיים ב{place}, בתאריך {date} בשעה {time}. קישור ההצטרפות יישלח אליך לפני המפגש — נתראה שם!";
})(window.SITE_CONTENT);
