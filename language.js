/* ==========================================
   ZONIVA 2.0 — LANGUAGE SYSTEM
   Persian / English
   Saves language choice between pages
========================================== */

(() => {
    "use strict";

    const STORAGE_KEY = "zoniva-language";

    const translations = {
        // Browser titles
        "Zoniva | زونیوا": "Zoniva | Tools for everyone",
        "درباره ما | Zoniva": "About Us | Zoniva",
        "ابزارها | Zoniva 2.0": "Tools | Zoniva 2.0",

        // Navigation
        "خانه": "Home",
        "ابزارها": "Tools",
        "درباره ما": "About",
        "باز کردن منو": "Open menu",

        // Homepage
        "چرا Zoniva؟": "Why Zoniva?",
        "ابزارهای ساده، سریع و کاربردی برای انجام کارهای روزمره":
            "Simple, fast, and practical tools for everyday tasks",

        "سریع": "Fast",
        "ابزارها برای انجام سریع کارها طراحی شده‌اند.":
            "Our tools are designed to help you get things done faster.",

        "کاربردی": "Practical",
        "ابزارهایی که واقعاً در کارهای روزمره به درد می‌خورند.":
            "Useful tools for everyday tasks.",

        "ساده": "Simple",
        "بدون پیچیدگی؛ فقط وارد شو و از ابزار استفاده کن.":
            "No complications. Just open a tool and use it.",

        "Zoniva برای چه کسانی است؟": "Who is Zoniva for?",

        "برای دانش‌آموزان، دانشجویان و هر کسی که به ابزارهای کاربردی نیاز دارد.":
            "For school students, university students, and anyone who needs useful tools.",

        "دانش‌آموزان": "School Students",
        "ابزارهایی برای درس، مدرسه و پروژه‌ها.":
            "Tools for studying, schoolwork, and projects.",

        "دانشجویان": "University Students",
        "ابزارهایی برای ساده‌تر شدن کارهای دانشجویی.":
            "Tools to make university work easier.",

        "همه افراد": "Everyone",
        "ابزارهای ساده و کاربردی برای کارهای روزمره.":
            "Simple and useful tools for everyday life.",

        "آماده‌ای شروع کنی؟": "Ready to get started?",
        "وارد Zoniva شو و ابزار مناسب خودت رو پیدا کن.":
            "Explore Zoniva and find the right tools for you.",

        "ورود به ابزارها": "Explore Tools",

        "Zoniva مجموعه‌ای از ابزارهای ساده، سریع و کاربردی است که برای دانش‌آموزان طراحی شده است. ما تلاش می‌کنیم کارهای وقت‌گیر، مانند محاسبات و کارهای روزمره را تا حد امکان ساده‌تر کنیم.":
            "Zoniva is a collection of simple, fast, and practical tools designed for students. We aim to make time-consuming tasks, calculations, and everyday activities easier.",

        // About page
        "درباره Zoniva": "About Zoniva",

        "Zoniva یک مجموعه ابزار ساده، کاربردی و سریع است که برای کمک به انجام کارهای روزمره، آموزشی و دانش‌آموزی ساخته شده است.":
            "Zoniva is a collection of simple, practical, and fast tools designed to help with everyday activities, learning, and schoolwork.",

        "هدف ما": "Our Mission",

        "هدف Zoniva این است که ابزارهای کاربردی را بدون پیچیدگی و به ساده‌ترین شکل در اختیار کاربران قرار دهد.":
            "Zoniva aims to provide useful tools in the simplest way possible, without unnecessary complexity.",

        "برای دانش‌آموزان": "For Students",

        "بخشی از ابزارهای Zoniva برای درس، مدرسه، محاسبات و کارهای روزمره دانش‌آموزان طراحی شده‌اند.":
            "Some Zoniva tools are designed for schoolwork, calculations, and students' everyday tasks.",

        "برنامه‌نویس Zoniva": "Zoniva Developer",

        "Zoniva توسط": "Designed and developed by",

        "طراحی و توسعه داده شده است.": ".",

        "در حال توسعه": "Under Development",

        "Zoniva یک پروژه در حال توسعه است و قرار است در آینده ابزارهای بیشتری به آن اضافه شود.":
            "Zoniva is an ongoing project, and more tools are planned for future updates.",

        "کانال بله": "Bale Channel",

        "برای دنبال کردن اخبار، پروژه‌ها و آخرین فعالیت‌های Zoniva می‌توانید به کانال ما در بله بپیوندید.":
            "Follow Zoniva news, projects, and updates by joining our channel on Bale.",

        "ورود به کانال": "Join the Channel",

        // Tools page
        "ابزارهای Zoniva": "Zoniva Tools",

        "ابزارهایی کاربردی، سریع و ساده برای انجام کارهای روزمره؛ همه در یک پلتفرم و در دسترس شما.":
            "Practical, fast, and simple tools for everyday tasks, all in one convenient platform.",

        "جست‌وجو بین ابزارها...": "Search tools...",
        "جست‌وجوی ابزارها": "Search tools",

        "همه ابزارها": "All Tools",
        "ابزاری با این نام پیدا نشد.": "No matching tools found.",

        "شمارش متن": "Text Counter",
        "تعداد کلمات، حروف، کاراکترها و خطوط متن خود را محاسبه کنید.":
            "Count the words, characters, and lines in your text.",

        "ماشین حساب": "Calculator",
        "محاسبات ریاضی روزمره را به‌سادگی انجام دهید.":
            "Perform everyday mathematical calculations easily.",

        "تبدیل واحد": "Unit Converter",
        "تبدیل واحد طول": "Length Unit Converter",

        "واحدهای طول را به کیلومتر، متر، سانتی‌متر و میلی‌متر تبدیل کنید.":
            "Convert lengths between kilometers, meters, centimeters, and millimeters.",

        "محاسبه معدل": "Grade Average",
        "نمره‌های خود را وارد کنید و میانگین آن‌ها را به دست آورید.":
            "Enter your grades and calculate their average.",

        "تبدیل کسر و اعشار": "Fraction & Decimal Converter",
        "کسرها را به عدد اعشاری و اعداد اعشاری را به کسر تبدیل کنید.":
            "Convert fractions to decimals and decimals to fractions.",

        "ساخت رمز عبور": "Password Generator",
        "رمز تصادفی متناسب با نیاز خود بسازید.":
            "Generate a random password to suit your needs.",

        "رمز عبور": "Password",
        "رمز عبور تصادفی با حروف، اعداد و نمادها بسازید.":
            "Create a random password using letters, numbers, and symbols.",

        "توان و ریشه": "Powers & Roots",
        "توان اعداد و ریشه دوم آن‌ها را محاسبه کنید.":
            "Calculate powers and square roots.",

        "محاسبه اختلاف تاریخ": "Date Difference",

        "اختلاف دو تاریخ را بر اساس تعداد واقعی روزها محاسبه کنید.":
            "Calculate the number of days between two dates.",

        "ارز و طلا": "Currency & Gold",
        "تبدیل دلار و تومان و محاسبه ارزش تقریبی طلای ۱۸ عیار.":
            "Convert dollars and toman and estimate the value of 18K gold.",

        "باز کردن ابزار ←": "Open Tool →",

        // Text counter
        "متن خود را وارد کنید تا آمار آن نمایش داده شود.":
            "Enter your text to see its statistics.",

        "متن شما": "Your Text",
        "متن را اینجا بنویسید...": "Type your text here...",

        "تعداد کلمات:": "Words:",
        "تعداد حروف و کاراکترها:": "Characters:",
        "کاراکتر بدون فاصله:": "Characters without spaces:",
        "تعداد خطوط:": "Lines:",

        // Calculator
        "عبارت ریاضی خود را وارد کنید.":
            "Enter a mathematical expression.",

        "عبارت ریاضی": "Expression",
        "مثال: (12 + 8) * 2": "Example: (12 + 8) * 2",
        "محاسبه": "Calculate",

        "عملگرهای پایه پشتیبانی می‌شوند: + ، − ، × ، ÷ و پرانتز.":
            "Supported operators: +, −, ×, ÷, and parentheses.",

        // Unit converter
        "مقدار و واحد مبدأ و مقصد را انتخاب کنید.":
            "Enter a value and select the source and target units.",

        "مقدار": "Value",
        "مقدار را وارد کنید": "Enter a value",
        "تبدیل از": "Convert from",
        "تبدیل به": "Convert to",
        "میلی‌متر": "Millimeters",
        "سانتی‌متر": "Centimeters",
        "متر": "Meters",
        "کیلومتر": "Kilometers",
        "تبدیل واحد": "Convert Units",

        // Grades
        "نمره‌ها را با فاصله یا ویرگول از هم جدا کنید.":
            "Separate grades using spaces or commas.",

        "نمره‌ها از ۰ تا ۲۰": "Grades from 0 to 20",
        "مثال: 18, 19, 16.5, 20": "Example: 18, 19, 16.5, 20",
        "محاسبه معدل": "Calculate Average",

        "این ابزار میانگین ساده نمره‌ها را محاسبه می‌کند. برای معدل وزنی، ضریب هر درس باید جداگانه وارد شود.":
            "This tool calculates a simple average. For a weighted average, each subject's coefficient must be entered separately.",

        // Fractions
        "یک کسر مثل 3/4 یا یک عدد اعشاری وارد کنید.":
            "Enter a fraction such as 3/4 or a decimal number.",

        "کسر یا عدد": "Fraction or Number",
        "مثال: 3/4 یا 0.75": "Example: 3/4 or 0.75",
        "کسر به اعشار": "Fraction to Decimal",
        "اعشار به کسر": "Decimal to Fraction",

        // Password generator
        "طول رمز عبور": "Password Length",
        "حروف بزرگ انگلیسی": "Uppercase Letters",
        "حروف کوچک انگلیسی": "Lowercase Letters",
        "اعداد": "Numbers",
        "نمادهای خاص": "Special Symbols",
        "رمز ساخته‌شده": "Generated Password",
        "رمز شما اینجا نمایش داده می‌شود": "Your password will appear here",
        "ساخت رمز جدید": "Generate New Password",
        "کپی رمز": "Copy Password",

        // Powers and roots
        "برای اعداد صحیح بزرگ نیز می‌توانید از محاسبه توان استفاده کنید.":
            "You can also calculate powers of large integers.",

        "عدد پایه": "Base Number",
        "مثال: 12": "Example: 12",
        "توان": "Exponent",
        "مثال: 5": "Example: 5",
        "محاسبه توان": "Calculate Power",
        "محاسبه ریشه دوم": "Calculate Square Root",

        "محاسبات اعداد صحیح بزرگ ممکن است بسته به اندازه عدد، زمان و حافظه بیشتری نیاز داشته باشند.":
            "Calculations involving very large integers may require additional time and memory.",

        // Dates
        "دو تاریخ را انتخاب کنید تا اختلاف روزها و تفکیک تقویمی محاسبه شود.":
            "Select two dates to calculate the difference in days.",

        "تاریخ شروع": "Start Date",
        "تاریخ پایان": "End Date",
        "محاسبه اختلاف تاریخ": "Calculate Date Difference",

        "انتخاب تاریخ در این نسخه با تقویم میلادی مرورگر انجام می‌شود. تاریخ شمسی نیز در نتیجه نمایش داده می‌شود.":
            "This version uses your browser's Gregorian calendar for date selection.",

        // Currency and gold
        "نرخ‌های دریافت‌شده از منبع آنلاین را بررسی کنید و تبدیل انجام دهید.":
            "Check the online exchange rates and perform conversions.",

        "قیمت هر دلار به تومان": "Price per US Dollar (Toman)",
        "در حال دریافت نرخ...": "Loading rate...",
        "تبدیل دلار به تومان": "USD to Toman",
        "مقدار دلار": "Amount in USD",
        "مثال: 100": "Example: 100",
        "تبدیل به تومان": "Convert to Toman",

        "تبدیل تومان به دلار": "Toman to USD",
        "مبلغ به تومان": "Amount in Toman",
        "مثال: 1000000": "Example: 1,000,000",
        "تبدیل به دلار": "Convert to USD",

        "محاسبه ارزش طلای ۱۸ عیار": "Calculate 18K Gold Value",
        "قیمت هر گرم طلا به تومان": "Price per Gram of Gold (Toman)",
        "وزن طلا به گرم": "Gold Weight (grams)",
        "مثال: 2.5": "Example: 2.5",
        "محاسبه ارزش طلا": "Calculate Gold Value",

        "قیمت‌ها تقریبی هستند و ممکن است با بازار تفاوت داشته باشند. اجرت، مالیات و سود فروشنده در محاسبه طلا لحاظ نشده است.":
            "Prices are estimates and may differ from the market. Making charges, taxes, and seller fees are not included.",

        // Footer
        "ساخته‌شده با 💙 برای ساده‌تر کردن کارهای روزمره":
            "Made with 💙 to make everyday tasks easier."
    };

    const attributeTranslations = {
        "باز کردن منو": "Open menu",
        "بستن": "Close",
        "جست‌وجوی ابزارها": "Search tools",
        "جست‌وجو بین ابزارها...": "Search tools...",
        "متن را اینجا بنویسید...": "Type your text here...",
        "مثال: (12 + 8) * 2": "Example: (12 + 8) * 2",
        "مثال: 3/4 یا 0.75": "Example: 3/4 or 0.75",
        "در حال دریافت نرخ...": "Loading rate...",
        "مثلاً 3/4 یا 0.75": "Example: 3/4 or 0.75"
    };

    const originalTexts = new WeakMap();
    const originalAttributes = new WeakMap();

    let currentLanguage = "fa";
    let observer = null;

    function normalize(value) {
        return String(value).replace(/\s+/g, " ").trim();
    }

    function keepWhitespace(original, replacement) {
        const leading = original.match(/^\s*/)?.[0] || "";
        const trailing = original.match(/\s*$/)?.[0] || "";

        return leading + replacement + trailing;
    }

    function translateDynamicText(text, language) {
        const clean = normalize(text);

        if (language === "en") {
            if (translations[clean]) {
                return translations[clean];
            }

            // Tool messages
            if (/^معدل:\s*(.+?)\s*\|\s*تعداد نمره‌ها:\s*(.+)$/.test(clean)) {
                return clean.replace(
                    /^معدل:\s*(.+?)\s*\|\s*تعداد نمره‌ها:\s*(.+)$/,
                    "Average: $1 | Number of grades: $2"
                );
            }

            if (/^فاصله دو تاریخ:\s*(.+)\s*روز$/.test(clean)) {
                return clean.replace(
                    /^فاصله دو تاریخ:\s*(.+)\s*روز$/,
                    "Date difference: $1 days"
                );
            }

            if (/^قیمت‌ها دریافت شدند/.test(clean)) {
                return clean.replace(
                    /^قیمت‌ها دریافت شدند/,
                    "Market prices received"
                ).replace(
                    "آخرین به‌روزرسانی:",
                    "Last updated:"
                );
            }

            if (/^در حال دریافت قیمت دلار و طلا/.test(clean)) {
                return "Loading dollar and gold prices...";
            }

            if (/^دریافت خودکار قیمت ناموفق بود/.test(clean)) {
                return "Automatic price retrieval failed. Check your connection or the price source.";
            }

            if (/ تومان$/.test(clean)) {
                return clean.replace(/ تومان$/, " toman");
            }

            if (/ دلار$/.test(clean)) {
                return clean.replace(/ دلار$/, " USD");
            }

            return clean;
        }

        // Persian mode
        const reverseEntry = Object.entries(translations).find(
            ([persian, english]) => normalize(english) === clean
        );

        if (reverseEntry) {
            return reverseEntry[0];
        }

        if (/^Average:\s*(.+?)\s*\|\s*Number of grades:\s*(.+)$/.test(clean)) {
            return clean.replace(
                /^Average:\s*(.+?)\s*\|\s*Number of grades:\s*(.+)$/,
                "معدل: $1 | تعداد نمره‌ها: $2"
            );
        }

        if (/^Date difference:\s*(.+)\s*days$/.test(clean)) {
            return clean.replace(
                /^Date difference:\s*(.+)\s*days$/,
                "فاصله دو تاریخ: $1 روز"
            );
        }

        if (/^Market prices received/.test(clean)) {
            return clean.replace(
                /^Market prices received/,
                "قیمت‌ها دریافت شدند"
            ).replace(
                "Last updated:",
                "آخرین به‌روزرسانی:"
            );
        }

        if (/^Loading dollar and gold prices/.test(clean)) {
            return "در حال دریافت قیمت دلار و طلا...";
        }

        if (/^Automatic price retrieval failed/.test(clean)) {
            return "دریافت خودکار قیمت ناموفق بود؛ اتصال یا منبع قیمت را بررسی کنید.";
        }

        if (/ toman$/.test(clean)) {
            return clean.replace(/ toman$/, " تومان");
        }

        if (/ USD$/.test(clean)) {
            return clean.replace(/ USD$/, " دلار");
        }

        return clean;
    }

    function translateTextNode(node) {
        if (!node || !node.parentElement) return;

        const parent = node.parentElement;

        if (
            parent.closest("script, style, textarea, code, [data-language-toggle]")
        ) {
            return;
        }

        const value = node.nodeValue;

        if (!value || !normalize(value)) return;

        if (!originalTexts.has(node)) {
            originalTexts.set(node, value);
        }

        const original = originalTexts.get(node);

        let replacement;

        if (currentLanguage === "en") {
            replacement = translateDynamicText(original, "en");

            // Translate Persian digits to Western digits on English pages.
            replacement = replacement.replace(/[۰-۹]/g, digit =>
                "۰۱۲۳۴۵۶۷۸۹".indexOf(digit)
            );
        } else {
            replacement = translateDynamicText(original, "fa");

            replacement = replacement.replace(/[٠-٩]/g, digit =>
                "٠١٢٣٤٥٦٧٨٩".indexOf(digit)
            );
        }

        const finalValue = keepWhitespace(original, replacement);

        if (node.nodeValue !== finalValue) {
            node.nodeValue = finalValue;
        }
    }

    function translateAttributes(element) {
        const attributeNames = [
            "placeholder",
            "aria-label",
            "title",
            "alt"
        ];

        if (!originalAttributes.has(element)) {
            originalAttributes.set(element, {});
        }

        const saved = originalAttributes.get(element);

        attributeNames.forEach(name => {
            if (!element.hasAttribute(name)) return;

            if (!(name in saved)) {
                saved[name] = element.getAttribute(name);
            }

            const original = saved[name];

            if (currentLanguage === "en") {
                element.setAttribute(
                    name,
                    attributeTranslations[original] || original
                );
            } else {
                element.setAttribute(name, original);
            }
        });
    }

    function updateDocumentLanguage() {
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir =
            currentLanguage === "en" ? "ltr" : "rtl";

        document.body.style.direction =
            currentLanguage === "en" ? "ltr" : "rtl";

        document.body.style.fontFamily =
            currentLanguage === "en"
                ? "Arial, Helvetica, sans-serif"
                : "";

        const title = document.querySelector("title");

        if (title) {
            const originalTitle = title.dataset.originalTitle ||
                title.textContent;

            title.dataset.originalTitle = originalTitle;

            title.textContent =
                currentLanguage === "en"
                    ? (translations[normalize(originalTitle)] || originalTitle)
                    : originalTitle;
        }
    }

    function translatePage() {
        document.querySelectorAll("[data-language-toggle]").forEach(button => {
            button.textContent =
                currentLanguage === "en"
                    ? "🌐 فارسی"
                    : "🌐 English";

            button.setAttribute(
                "aria-label",
                currentLanguage === "en"
                    ? "Switch to Persian"
                    : "Switch to English"
            );
        });

        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
        );

        const textNodes = [];

        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        textNodes.forEach(translateTextNode);

        document.querySelectorAll(
            "input, textarea, select, button, img, a"
        ).forEach(translateAttributes);

        updateDocumentLanguage();
    }

    function setLanguage(language) {
        currentLanguage = language === "en" ? "en" : "fa";

        try {
            localStorage.setItem(STORAGE_KEY, currentLanguage);
        } catch (error) {
            console.warn("Zoniva: Could not save language preference.", error);
        }

        translatePage();
    }

    function init() {
        let savedLanguage = "fa";

        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved === "en" || saved === "fa") {
                savedLanguage = saved;
            }
        } catch (error) {
            console.warn("Zoniva: Could not read language preference.", error);
        }

        currentLanguage = savedLanguage;

        document.querySelectorAll("[data-language-toggle]").forEach(button => {
            button.addEventListener("click", () => {
                setLanguage(currentLanguage === "fa" ? "en" : "fa");
            });
        });

        translatePage();

        // Translate new tool results and status messages too.
        observer = new MutationObserver(records => {
            records.forEach(record => {
                if (record.type === "characterData") {
                    translateTextNode(record.target);
                }

                record.addedNodes?.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        translateTextNode(node);
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        const walker = document.createTreeWalker(
                            node,
                            NodeFilter.SHOW_TEXT
                        );

                        const nodes = [];

                        while (walker.nextNode()) {
                            nodes.push(walker.currentNode);
                        }

                        nodes.forEach(translateTextNode);

                        if (node.matches?.(
                            "input, textarea, select, button, img, a"
                        )) {
                            translateAttributes(node);
                        }

                        node.querySelectorAll?.(
                            "input, textarea, select, button, img, a"
                        ).forEach(translateAttributes);
                    }
                });
            });
        });

        observer.observe(document.body, {
            subtree: true,
            childList: true,
            characterData: true
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    // Accessible public methods for later integrations.
    window.zonivaSetLanguage = setLanguage;
    window.zonivaGetLanguage = () => currentLanguage;
})();