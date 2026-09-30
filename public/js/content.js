/*
 * Landing page content.
 * Edit the texts, images and contact details here — the page is rendered from this object.
 * Paths are relative to index.html.
 */
window.SITE_CONTENT = {
  site: {
    // Public URL of the deployed landing page — the single place it is defined.
    // Used by the email invite (button + logo links, and absolute image URLs).
    url: "https://conferences.buildalgo.co.il/"
  },

  meta: {
    title: "Pro Algorithm | הטמעת AI בעולם התכנון והאדריכלות",
    description:
      "בוקר אחד, שולחן אחד, ומספר מצומצם של בעלי חברות ומנהלים מהענף. הרצאה של מומחה על מה שכבר עובד בשטח — ואחריה שיחה פתוחה בין המשתתפים.",
    favicon: "assets/images/Icon-black.png",
  },

  decorations: {
    topRight: "assets/images/right-top-edge.jpeg",
    topLeft: "assets/images/left-top-edge.jpeg"
  },

  hero: {
    logo: { src: "assets/images/MAIN-LOGO.png", alt: "Pro Algorithm" },
    title: "הטמעת AI בעולם התכנון והאדריכלות",
    subtitle:
      "בוקר אחד, שולחן אחד, ומספר מצומצם של בעלי חברות ומנהלים מהענף. הרצאה של מומחה על מה שכבר עובד בשטח — ואחריה שיחה פתוחה בין המשתתפים."
  },

  // Displayed right-to-left in this order.
  // key ("place" | "time" | "date") lets the confirmation email find each value.
  details: [
    { key: "place", icon: "assets/images/place-icon.jpeg", label: "מיקום:", value: "מלחמת ששת הימים 10, חדרה" },
    { key: "time", icon: "assets/images/time-icon.jpeg", label: "שעה:", value: "10:00" },
    { key: "date", icon: "assets/images/date-icon.jpeg", label: "תאריך:", value: "19.10" }
  ],

  agenda: {
    title: "מה יהיה על השולחן",
    // Each point (number, gradient, shadow) is drawn with CSS, on the website and in the email invite.
    items: [
      {
        title: "פחות שעות על מפרטים, גיליונות מכר ורשימות",
        text: "מפרטים טכניים, גיליונות מכר ורשימות אלומיניום, מסגרות ונגרות: דוגמאות מפרויקטים שאנחנו כבר עובדים עליהם, וכמה שעות זה חוסך למשרד בפועל."
      },
      {
        title: "בדיקת תוכניות לפני שהטעות מגיעה לשטח",
        text: "בטיחות אש, ממדים ומדרגות: איך AI עובר על התוכניות ומסמן חריגות ואי-התאמות, לפני שהן חוזרות אליכם מהיועצים או מהאתר."
      },
      {
        title: "לנהל פרויקט בלי לטבוע במיילים ובמעקבים",
        text: "מהצד של המנהל: איך AI מרכז את ההתכתבות מול היועצים, עוקב אחרי מה שפתוח ומה שמתעכב, ומחזיר לכם שליטה על הפרויקט."
      }
    ]
  },

  // imageSide: "right" or "left" — which side of the row the photo sits on
  speakers: [
    {
      name: "ד”ר לוטם אלוש",
      role: "",
      image: "assets/images/lotem-bg.jpeg",
      imageSide: "right",
      talkTitle: "הרצאה על השפעות ה AI על עובדי התכנון",
      paragraphs: [
        "הבינה המלאכותית כבר משנה את הדרך שבה משרדי תכנון עובדים. בהרצאה נראה מה כבר עובד בשטח, אילו תפקידים ישתנו ואיך מכינים את הצוות כך שהשינוי יעבוד בשבילכם ולא נגדכם.",
        "בוקר אחד שייתן לכם יתרון של שנה, אנחנו לא מדברים על העתיד הרחוק. כלי AI כבר מפיקים שרטוטים, בודקים תקינה ומכינים כתבי כמויות במשרדים שנמצאים איתכם באותו שוק. ההבדל בין משרד שמוביל לבין משרד שנשאר מאחור לא יהיה הכלים, אלא האנשים שיודעים לעבוד איתם."
      ]
    },
    {
      name: "צח דבוש",
      role: "CTO פרו אלגוריתם",
      image: "assets/images/tzach-bg.jpeg",
      imageSide: "left",
      talkTitle: "הטמעת AI בתכנון: לא עוד כלי, אלא דרך עבודה חדשה",
      paragraphs: [
        "עולם התכנון והאדריכלות עובד כבר עשרות שנים באותה שיטה: הרבה שעות אדם, הרבה עבודה ידנית שחוזרת על עצמה, והרבה מקום לטעויות. הבינה המלאכותית משנה את המשוואה הזאת.",
        "היא לא מחליפה את האדריכל או את המהנדס. היא לוקחת מהם את העבודה השחורה, כדי שיוכלו להתמקד במה שבאמת דורש מקצוענות: תכנון, קבלת החלטות ויצירתיות."
      ]
    }
  ],

  rsvp: {
    sectionTitle: "שומרים לך מקום סביב השולחן",
    title: "אישור הגעה",
    subtitle: "מספר המקומות סביב השולחן מוגבל, לכן נשמח לדעת מראש מי מגיע.",
    dateLabel: "תאריך: 19.10",
    timeLabel: "שעה: 10:00",
    attendingYes: "כן, אגיע",
    attendingNo: "לא אוכל להגיע",
    fields: {
      name: "שם מלא *",
      company: "חברה / תפקיד",
      phone: "טלפון *",
      email: "אימייל *"
    },
    consent: "אשמח לקבל עדכונים על אירועים ותכנים נוספים של Pro Algorithm",
    submit: "שליחת אישור הגעה",
    // Where the form is POSTed as JSON. "/api/rsvp" is handled by server.js (npm start),
    // which emails the submission to notify.recipients below.
    // Set to "" to only show the confirmation message without sending anything.
    endpoint: "/api/rsvp",
    notify: {
      // Every RSVP submission is emailed to these addresses
      recipients: ["sales@pro-algo.com", "sharon@pro-algorithm.co.il", "tzach@pro-algorithm.co.il"],
      subjectYes: "אישור הגעה לכנס: {name}",
      subjectNo: "ביטול הגעה לכנס: {name}"
    },
    // Sent to the email the user entered — only when they confirmed attendance.
    // Placeholders: {name} {title} {place} {date} {time}
    confirmation: {
      subject: "נרשמת בהצלחה לכנס {title}",
      heading: "איזה כיף, נרשמת בהצלחה!",
      greeting: "שלום {name},",
      text: "שמחים לבשר שנרשמת לכנס {title}, שיתקיים ב{place}, בתאריך {date} בשעה {time}. שמרנו לך מקום סביב השולחן — נתראה שם!",
      placeLabel: "מיקום",
      dateLabel: "תאריך",
      timeLabel: "שעה",
      footer: "לשאלות ולשינויים אפשר ליצור איתנו קשר:"
    },
    messages: {
      successYes: "תודה! אישור ההגעה התקבל, נתראה סביב השולחן.",
      successNo: "תודה על העדכון! נשמח לראותך באירוע הבא.",
      error: "אירעה שגיאה בשליחה. נסו שוב או צרו קשר בטלפון.",
      nameRequired: "יש למלא שם מלא",
      phoneInvalid: "יש למלא מספר טלפון תקין",
      emailInvalid: "יש למלא כתובת אימייל תקינה"
    }
  },

  // Texts used only by the email invite (npm run email → email/invite-email.html)
  emailInvite: {
    subject: "הזמנה: הטמעת AI בעולם התכנון והאדריכלות",
    preheader: "בוקר אחד, שולחן אחד — הרצאה ושיחה פתוחה על הטמעת AI במשרדי תכנון. 19.10 בשעה 10:00, חדרה.",
    rsvpText: "מספר המקומות סביב השולחן מוגבל. אשרו הגעה בלחיצה על הכפתור ושריינו לכם מקום.",
    dateLabel: "תאריך",
    dateValue: "19.10",
    timeLabel: "שעה",
    timeValue: "10:00",
    button: "לאישור הגעה",
    // Anchor on the landing page the button jumps to
    buttonAnchor: "#rsvp"
  },

  contact: {
    title: "יצירת קשר",
    subtitle: "יש לכם שאלה על ההרצאה או על הטמעת AI במשרד שלכם? נשמח לדבר.",
    // icon: "phone" | "email" | "web"
    items: [
      { icon: "phone", label: "טלפון", value: "053-9462842", href: "tel:+972539462842" },
      { icon: "email", label: "אימייל", value: "sales@pro-algo.com", href: "mailto:sales@pro-algo.com" },
      { icon: "web", label: "אתר", value: "pro-algorithm.co.il", href: "https://pro-algorithm.co.il" }
    ]
  }
};
