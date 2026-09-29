/*
 * Landing page content.
 * Edit the texts, images and contact details here — the page is rendered from this object.
 * Paths are relative to index.html.
 */
window.SITE_CONTENT = {
  meta: {
    title: "Pro Algorithm | הטמעת AI בעולם התכנון והאדריכלות",
    description:
      "ערב אחד, שולחן אחד, ומספר מצומצם של בעלי חברות ומנהלים מהענף. הרצאה של מומחה על מה שכבר עובד בשטח — ואחריה שיחה פתוחה בין המשתתפים.",
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
      "ערב אחד, שולחן אחד, ומספר מצומצם של בעלי חברות ומנהלים מהענף. הרצאה של מומחה על מה שכבר עובד בשטח — ואחריה שיחה פתוחה בין המשתתפים."
  },

  // Displayed right-to-left in this order
  details: [
    { icon: "assets/images/place-icon.jpeg", label: "מיקום:", value: "מלחמת ששת הימים 10, חדרה" },
    { icon: "assets/images/time-icon.jpeg", label: "שעה:", value: "10:00" },
    { icon: "assets/images/date-icon.jpeg", label: "תאריך:", value: "19.10" }
  ],

  agenda: {
    title: "מה יהיה על השולחן",
    items: [
      {
        image: "assets/images/point-1.jpeg",
        title: "איפה AI חוסך בהוצאות בפרויקט",
        text: "תמחור והצעות מחיר, לוחות זמנים, בקרת ביצוע בשטח ותקשורת עם קבלני משנה — מה מיושם כבר היום, ובאיזה סדר גודל של חיסכון."
      },
      {
        image: "assets/images/point-2.jpeg",
        title: "מה נדרש מהארגון כדי שזה יעבוד",
        text: "נתונים, תהליכים ואנשים: למה פיילוטים נתקעים אחרי חודשיים, ומה מבדיל הטמעה שנשארת מהטמעה שנשכחת."
      },
      {
        image: "assets/images/point-3.jpeg",
        title: "מאיפה מתחילים בשנה הקרובה",
        text: "סדר עדיפויות מעשי: מה לעשות ברבעון הקרוב, מה לדחות, ומה לא שווה את ההשקעה בכלל."
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
        "ערב אחד שייתן לכם יתרון של שנה, אנחנו לא מדברים על העתיד הרחוק. כלי AI כבר מפיקים שרטוטים, בודקים תקינה ומכינים כתבי כמויות במשרדים שנמצאים איתכם באותו שוק. ההבדל בין משרד שמוביל לבין משרד שנשאר מאחור לא יהיה הכלים, אלא האנשים שיודעים לעבוד איתם."
      ]
    },
    {
      name: "צח דבוש",
      role: "מנכ”ל פרו אלגוריתם",
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
      phone: "טלפון *"
    },
    consent: "אשמח לקבל עדכונים על אירועים ותכנים נוספים של Pro Algorithm",
    submit: "שליחת אישור הגעה",
    // Optional: URL that receives the form as a JSON POST (e.g. a Make/Zapier webhook).
    // Leave empty to only show the confirmation message.
    endpoint: "",
    messages: {
      successYes: "תודה! אישור ההגעה התקבל, נתראה סביב השולחן.",
      successNo: "תודה על העדכון! נשמח לראותך באירוע הבא.",
      error: "אירעה שגיאה בשליחה. נסו שוב או צרו קשר בטלפון.",
      nameRequired: "יש למלא שם מלא",
      phoneInvalid: "יש למלא מספר טלפון תקין"
    }
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
