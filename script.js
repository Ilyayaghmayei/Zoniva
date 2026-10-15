/* =====================================================
   ZONIVA 2.0
   Main JavaScript
   Tools + Market Prices + Persian/English + Security
===================================================== */

"use strict";


/* =====================================================
   1. ابزارهای عمومی
===================================================== */

function toEnglishDigits(value) {
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

    return String(value ?? "")
        .replace(/[۰-۹]/g, d => persianDigits.indexOf(d))
        .replace(/[٠-٩]/g, d => arabicDigits.indexOf(d))
        .replace(/٫/g, ".")
        .replace(/٬/g, "")
        .replace(/،/g, ",");
}

function getNumber(id) {
    const element = document.getElementById(id);

    if (!element) return NaN;

    const value = toEnglishDigits(element.value)
        .replace(/[\s,]/g, "")
        .trim();

    return value === "" ? NaN : Number(value);
}

function formatNumber(value, digits = 2) {
    if (!Number.isFinite(value)) return "—";

    const language =
        typeof window.zonivaGetLanguage === "function"
            ? window.zonivaGetLanguage()
            : "fa";

    return new Intl.NumberFormat(
        language === "en" ? "en-US" : "fa-IR",
        {
            maximumFractionDigits: digits
        }
    ).format(value);
}

function showResult(id, message) {
    const element = document.getElementById(id);

    if (element) {
        // نمایش نتیجه با textContent به‌جای innerHTML
        element.textContent = String(message);
    }
}

function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);

    while (b) {
        [a, b] = [b, a % b];
    }

    return a || 1;
}


/* =====================================================
   2. ماشین‌حساب امن
   بدون eval و بدون Function
===================================================== */

function safeCalculateExpression(source) {
    const expression = toEnglishDigits(source)
        .replace(/[×]/g, "*")
        .replace(/[÷]/g, "/")
        .replace(/[−–]/g, "-")
        .trim();

    if (!expression) {
        throw new Error("empty");
    }

    // فقط اعداد، نقطه اعشار، عملگرها و پرانتزها
    if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
        throw new Error("invalid-characters");
    }

    // ساخت توکن‌های ریاضی
    const tokenPattern = /\d+(?:\.\d*)?|\.\d+|[()+*/-]/g;
    const tokens = expression.match(tokenPattern) || [];

    // بررسی می‌کنیم هیچ ورودی ناشناخته‌ای نادیده گرفته نشود.
    if (tokens.join("") !== expression.replace(/\s/g, "")) {
        throw new Error("invalid-expression");
    }

    let position = 0;

    function peek() {
        return tokens[position];
    }

    function consume() {
        return tokens[position++];
    }

    function parsePrimary() {
        const token = peek();

        if (token === undefined) {
            throw new Error("unexpected-end");
        }

        if (token === "(") {
            consume();

            const value = parseExpression();

            if (peek() !== ")") {
                throw new Error("missing-parenthesis");
            }

            consume();

            return value;
        }

        if (
            token === ")" ||
            token === "*" ||
            token === "/"
        ) {
            throw new Error("invalid-number");
        }

        if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)) {
            throw new Error("invalid-number");
        }

        consume();

        const number = Number(token);

        if (!Number.isFinite(number)) {
            throw new Error("invalid-number");
        }

        return number;
    }

    function parseUnary() {
        if (peek() === "+") {
            consume();
            return parseUnary();
        }

        if (peek() === "-") {
            consume();
            return -parseUnary();
        }

        return parsePrimary();
    }

    function parseTerm() {
        let value = parseUnary();

        while (peek() === "*" || peek() === "/") {
            const operator = consume();
            const right = parseUnary();

            if (operator === "*") {
                value *= right;
            } else {
                if (right === 0) {
                    throw new Error("division-by-zero");
                }

                value /= right;
            }

            if (!Number.isFinite(value)) {
                throw new Error("overflow");
            }
        }

        return value;
    }

    function parseExpression() {
        let value = parseTerm();

        while (peek() === "+" || peek() === "-") {
            const operator = consume();
            const right = parseTerm();

            if (operator === "+") {
                value += right;
            } else {
                value -= right;
            }

            if (!Number.isFinite(value)) {
                throw new Error("overflow");
            }
        }

        return value;
    }

    const result = parseExpression();

    if (position !== tokens.length) {
        throw new Error("unexpected-token");
    }

    if (!Number.isFinite(result)) {
        throw new Error("invalid-result");
    }

    return result;
}

function calculate() {
    const input = document.getElementById("calcInput");

    if (!input) return;

    try {
        const result = safeCalculateExpression(input.value);

        showResult("calcResult", formatNumber(result, 10));
    } catch (error) {
        const language = window.zonivaGetLanguage?.() || "fa";

        const messages = {
            empty: {
                fa: "لطفاً عبارت ریاضی را وارد کنید.",
                en: "Please enter a mathematical expression."
            },

            "invalid-characters": {
                fa: "عبارت شامل نویسه‌های غیرمجاز است.",
                en: "The expression contains invalid characters."
            },

            "division-by-zero": {
                fa: "تقسیم بر صفر تعریف نشده است.",
                en: "Division by zero is undefined."
            },

            overflow: {
                fa: "نتیجه خارج از محدوده قابل محاسبه است.",
                en: "The result is outside the supported range."
            }
        };

        const message =
            messages[error.message]?.[language] ||
            (
                language === "en"
                    ? "The mathematical expression is invalid."
                    : "عبارت ریاضی صحیح نیست."
            );

        showResult("calcResult", message);
    }
}


/* =====================================================
   3. مدیریت پنجره‌های ابزار
===================================================== */

function openTool(id) {
    const modal = document.getElementById(id);

    if (!modal) return;

    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    const focusable = modal.querySelector(
        "input:not([type=hidden]), textarea, select, button"
    );

    if (focusable) {
        setTimeout(() => focusable.focus(), 0);
    }
}

function closeTool(id) {
    const modal = document.getElementById(id);

    if (!modal) return;

    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");

    const openModals = Array.from(
        document.querySelectorAll(".modal, .tool-modal")
    ).some(item => getComputedStyle(item).display !== "none");

    if (!openModals) {
        document.body.style.overflow = "";
    }
}


/* =====================================================
   4. شمارش متن
===================================================== */

function updateTextCounts() {
    const input = document.getElementById("textInput");

    if (!input) return;

    const text = input.value;

    const words = text.trim()
        ? text.trim().split(/\s+/u).length
        : 0;

    showResult("wordCount", formatNumber(words, 0));

    showResult(
        "charCount",
        formatNumber(text.length, 0)
    );

    showResult(
        "charNoSpaceCount",
        formatNumber(text.replace(/\s/g, "").length, 0)
    );

    showResult(
        "lineCount",
        formatNumber(
            text.length ? text.split(/\r\n|\r|\n/).length : 0,
            0
        )
    );
}


/* =====================================================
   5. تبدیل واحد طول
===================================================== */

function convertUnit() {
    const value = getNumber("unitInput");

    const from = document.getElementById("unitFrom");
    const to = document.getElementById("unitTo");

    if (!from || !to) return;

    const language = window.zonivaGetLanguage?.() || "fa";

    if (!Number.isFinite(value)) {
        return showResult(
            "unitResult",
            language === "en"
                ? "Please enter a valid number."
                : "لطفاً یک عدد معتبر وارد کنید."
        );
    }

    const factors = {
        mm: 0.001,
        cm: 0.01,
        m: 1,
        km: 1000
    };

    if (
        !Object.hasOwn(factors, from.value) ||
        !Object.hasOwn(factors, to.value)
    ) {
        return showResult(
            "unitResult",
            language === "en"
                ? "Please select valid units."
                : "واحدهای انتخاب‌شده معتبر نیستند."
        );
    }

    const result =
        value * factors[from.value] / factors[to.value];

    showResult("unitResult", formatNumber(result, 8));
}


/* =====================================================
   6. محاسبه معدل
===================================================== */

function calculateGrade() {
    const input = document.getElementById("gradeInput");

    if (!input) return;

    const language = window.zonivaGetLanguage?.() || "fa";

    const raw = toEnglishDigits(input.value).trim();

    if (!raw) {
        return showResult(
            "gradeResult",
            language === "en"
                ? "Please enter your grades."
                : "لطفاً نمره‌ها را وارد کنید."
        );
    }

    const grades = raw
        .split(/[\s,;،؛]+/)
        .filter(Boolean)
        .map(Number);

    if (
        grades.some(value =>
            !Number.isFinite(value) ||
            value < 0 ||
            value > 20
        )
    ) {
        return showResult(
            "gradeResult",
            language === "en"
                ? "Grades must be between 0 and 20."
                : "نمره‌ها باید عددی بین صفر تا ۲۰ باشند."
        );
    }

    const average = grades.reduce(
        (sum, value) => sum + value,
        0
    ) / grades.length;

    showResult(
        "gradeResult",
        language === "en"
            ? `Average: ${formatNumber(average, 2)} | Number of grades: ${formatNumber(grades.length, 0)}`
            : `معدل: ${formatNumber(average, 2)} | تعداد نمره‌ها: ${formatNumber(grades.length, 0)}`
    );
}


/* =====================================================
   7. تبدیل کسر و اعشار
===================================================== */

function fractionToDecimal() {
    const input = document.getElementById("fractionInput");

    if (!input) return;

    const language = window.zonivaGetLanguage?.() || "fa";

    const value = toEnglishDigits(input.value)
        .replace(/\s/g, "");

    const match = value.match(/^(-?\d+)\/(-?\d+)$/);

    if (!match) {
        return showResult(
            "fractionResult",
            language === "en"
                ? "Enter a fraction in the form 3/4."
                : "کسر را به شکل ۳/۴ وارد کنید."
        );
    }

    const numerator = Number(match[1]);
    const denominator = Number(match[2]);

    if (!Number.isFinite(numerator) ||
        !Number.isFinite(denominator)) {
        return showResult(
            "fractionResult",
            language === "en"
                ? "The fraction is invalid."
                : "کسر واردشده معتبر نیست."
        );
    }

    if (denominator === 0) {
        return showResult(
            "fractionResult",
            language === "en"
                ? "The denominator cannot be zero."
                : "مخرج کسر نمی‌تواند صفر باشد."
        );
    }

    showResult(
        "fractionResult",
        formatNumber(numerator / denominator, 12)
    );
}

function decimalToFraction() {
    const input = document.getElementById("fractionInput");

    if (!input) return;

    const language = window.zonivaGetLanguage?.() || "fa";

    const value = toEnglishDigits(input.value)
        .replace(/\s/g, "");

    if (!/^-?\d+(\.\d+)?$/.test(value)) {
        return showResult(
            "fractionResult",
            language === "en"
                ? "Please enter a valid decimal number."
                : "لطفاً یک عدد اعشاری معتبر وارد کنید."
        );
    }

    const number = Number(value);
    const decimals = (value.split(".")[1] || "").length;

    if (!Number.isFinite(number) || decimals > 9) {
        return showResult(
            "fractionResult",
            language === "en"
                ? "Use a finite number with no more than 9 decimal places."
                : "یک عدد معتبر با حداکثر ۹ رقم اعشار وارد کنید."
        );
    }

    const denominator = 10 ** decimals;
    const numerator = Math.round(number * denominator);
    const divisor = gcd(numerator, denominator);

    showResult(
        "fractionResult",
        `${numerator / divisor}/${denominator / divisor}`
    );
}


/* =====================================================
   8. ساخت رمز عبور امن
===================================================== */

function secureRandomInt(max) {
    if (
        !window.crypto ||
        typeof window.crypto.getRandomValues !== "function"
    ) {
        throw new Error("secure-random-unavailable");
    }

    const array = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / max) * max;

    let value;

    do {
        window.crypto.getRandomValues(array);
        value = array[0];
    } while (value >= limit);

    return value % max;
}

function generatePassword() {
    const length = getNumber("passwordLength");

    const upper = document.getElementById("passwordUpper");
    const lower = document.getElementById("passwordLower");
    const numbers = document.getElementById("passwordNumbers");
    const symbols = document.getElementById("passwordSymbols");

    const output = document.getElementById("passwordResult");

    if (!output) return;

    const language = window.zonivaGetLanguage?.() || "fa";

    if (
        !Number.isInteger(length) ||
        length < 1 ||
        length > 256
    ) {
        return showResult(
            "passwordMessage",
            language === "en"
                ? "Password length must be between 1 and 256."
                : "طول رمز باید بین ۱ تا ۲۵۶ باشد."
        );
    }

    const groups = [];

    if (upper?.checked) {
        groups.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    }

    if (lower?.checked) {
        groups.push("abcdefghijklmnopqrstuvwxyz");
    }

    if (numbers?.checked) {
        groups.push("0123456789");
    }

    if (symbols?.checked) {
        groups.push("!@#$%^&*()-_=+[]{};:,.?");
    }

    if (!groups.length) {
        return showResult(
            "passwordMessage",
            language === "en"
                ? "Select at least one character group."
                : "حداقل یک نوع کاراکتر را انتخاب کنید."
        );
    }

    if (length < groups.length) {
        return showResult(
            "passwordMessage",
            language === "en"
                ? "The selected groups require a longer password."
                : "طول رمز برای گزینه‌های انتخاب‌شده کافی نیست."
        );
    }

    try {
        const allCharacters = groups.join("");

        const characters = groups.map(group =>
            group[secureRandomInt(group.length)]
        );

        while (characters.length < length) {
            characters.push(
                allCharacters[secureRandomInt(allCharacters.length)]
            );
        }

        // مخلوط‌کردن ترتیب نویسه‌ها
        for (let i = characters.length - 1; i > 0; i--) {
            const j = secureRandomInt(i + 1);

            [characters[i], characters[j]] =
                [characters[j], characters[i]];
        }

        output.value = characters.join("");

        showResult(
            "passwordMessage",
            language === "en"
                ? "Password generated successfully."
                : "رمز عبور ساخته شد."
        );

    } catch {
        showResult(
            "passwordMessage",
            language === "en"
                ? "Secure password generation is unavailable in this browser."
                : "تولید رمز امن در این مرورگر در دسترس نیست."
        );
    }
}

async function copyPassword() {
    const input = document.getElementById("passwordResult");

    if (!input || !input.value) {
        return showResult(
            "passwordMessage",
            window.zonivaGetLanguage?.() === "en"
                ? "Generate a password first."
                : "ابتدا رمز عبور بسازید."
        );
    }

    const language = window.zonivaGetLanguage?.() || "fa";

    try {
        await navigator.clipboard.writeText(input.value);

        showResult(
            "passwordMessage",
            language === "en"
                ? "Password copied."
                : "رمز عبور کپی شد."
        );

    } catch {
        input.focus();
        input.select();

        const copied = document.execCommand("copy");

        showResult(
            "passwordMessage",
            copied
                ? (
                    language === "en"
                        ? "Password copied."
                        : "رمز عبور کپی شد."
                )
                : (
                    language === "en"
                        ? "Copy failed. Please copy the password manually."
                        : "کپی خودکار انجام نشد؛ رمز را دستی کپی کنید."
                )
        );
    }
}


/* =====================================================
   9. توان و ریشه دوم
===================================================== */

function calculatePower() {
    const base = getNumber("powerNumber");
    const exponent = getNumber("powerExponent");

    const language = window.zonivaGetLanguage?.() || "fa";

    if (
        !Number.isFinite(base) ||
        !Number.isFinite(exponent)
    ) {
        return showResult(
            "powerResult",
            language === "en"
                ? "Please enter a valid base and exponent."
                : "لطفاً عدد و توان معتبر وارد کنید."
        );
    }

    const result = Math.pow(base, exponent);

    if (!Number.isFinite(result)) {
        return showResult(
            "powerResult",
            language === "en"
                ? "The result cannot be represented."
                : "نتیجه قابل محاسبه نیست."
        );
    }

    showResult("powerResult", formatNumber(result, 10));
}

function calculateRoot() {
    const value = getNumber("powerNumber");

    const language = window.zonivaGetLanguage?.() || "fa";

    if (!Number.isFinite(value)) {
        return showResult(
            "powerResult",
            language === "en"
                ? "Please enter a valid number."
                : "لطفاً یک عدد معتبر وارد کنید."
        );
    }

    if (value < 0) {
        return showResult(
            "powerResult",
            language === "en"
                ? "A negative number has no real square root."
                : "ریشه دوم عدد منفی در اعداد حقیقی تعریف نشده است."
        );
    }

    showResult("powerResult", formatNumber(Math.sqrt(value), 10));
}


/* =====================================================
   10. اختلاف تاریخ
===================================================== */

function calculateDateDifference() {
    const startValue =
        document.getElementById("startDate")?.value;

    const endValue =
        document.getElementById("endDate")?.value;

    const language = window.zonivaGetLanguage?.() || "fa";

    if (!startValue || !endValue) {
        return showResult(
            "dateResult",
            language === "en"
                ? "Select both dates."
                : "هر دو تاریخ را انتخاب کنید."
        );
    }

    const start = new Date(startValue + "T00:00:00Z");
    const end = new Date(endValue + "T00:00:00Z");

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        return showResult(
            "dateResult",
            language === "en"
                ? "One of the dates is invalid."
                : "یکی از تاریخ‌ها معتبر نیست."
        );
    }

    const days = Math.round(
        Math.abs(end.getTime() - start.getTime()) / 86400000
    );

    showResult(
        "dateResult",
        language === "en"
            ? `Date difference: ${formatNumber(days, 0)} days`
            : `فاصله دو تاریخ: ${formatNumber(days, 0)} روز`
    );
}


/* =====================================================
   11. دریافت قیمت دلار و طلای ۱۸ عیار
===================================================== */

const ZONIVA_MARKET_URLS = [
    "https://raw.githubusercontent.com/iran-market/iran-market.github.io/main/data/popular.json",
    "https://cdn.jsdelivr.net/gh/iran-market/iran-market.github.io@main/data/popular.json"
];

let zonivaFetchingPrices = false;

async function fetchMarketJSON(url) {
    const controller = new AbortController();

    const timer = setTimeout(() => {
        controller.abort();
    }, 12000);

    try {
        const response = await fetch(url, {
            cache: "no-store",
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        return await response.json();

    } finally {
        clearTimeout(timer);
    }
}

async function fetchMarketPrices() {
    if (zonivaFetchingPrices) return;

    const status = document.getElementById("ratesUpdated");

    // در صفحه‌هایی که ابزار ارز وجود ندارد، درخواست شبکه ارسال نکن.
    if (
        !status &&
        !document.getElementById("dollarRate")
    ) {
        return;
    }

    zonivaFetchingPrices = true;

    const language = window.zonivaGetLanguage?.() || "fa";

    if (status) {
        status.textContent =
            language === "en"
                ? "Loading dollar and gold prices..."
                : "در حال دریافت قیمت دلار و طلا...";
    }

    try {
        let payload = null;
        let lastError = null;

        for (const url of ZONIVA_MARKET_URLS) {
            try {
                payload = await fetchMarketJSON(url);
                break;
            } catch (error) {
                lastError = error;
            }
        }

        if (!payload) {
            throw lastError || new Error("market-source-unavailable");
        }

        const items = Array.isArray(payload.data)
            ? payload.data
            : [];

        const dollarItem = items.find(
            item => item && item.symbol === "USD_IRR_FREE"
        );

        const goldItem = items.find(
            item => item && item.symbol === "GOLD_18K_IRR"
        );

        if (!dollarItem || !goldItem) {
            throw new Error("market-symbols-not-found");
        }

        const dollar = Number(dollarItem.price);
        const gold = Number(goldItem.price);

        if (
            !Number.isFinite(dollar) ||
            dollar <= 0 ||
            !Number.isFinite(gold) ||
            gold <= 0
        ) {
            throw new Error("invalid-market-price");
        }

        if (
            dollarItem.stale === true ||
            goldItem.stale === true
        ) {
            throw new Error("stale-market-data");
        }

        const dollarInput = document.getElementById("dollarRate");
        const goldInput = document.getElementById("goldPrice");

        if (dollarInput) {
            dollarInput.value = String(dollar);
        }

        if (goldInput) {
            goldInput.value = String(gold);
        }

        const updated =
            payload.generated_at_tehran ||
            payload.generated_at_jalali ||
            payload.generated_at ||
            payload.updated_at ||
            "";

        if (status) {
            status.textContent =
                language === "en"
                    ? "Market prices received" +
                      (updated ? " | Last updated: " + updated : "")
                    : "قیمت‌ها دریافت شدند" +
                      (updated ? " | آخرین به‌روزرسانی: " + updated : "");
        }

        if (document.getElementById("currencyAmount")?.value) {
            convertDollar();
        }

        if (document.getElementById("tomanAmount")?.value) {
            convertToman();
        }

        if (document.getElementById("goldWeight")?.value) {
            calculateGold();
        }

        console.info("Zoniva: Market prices received.", {
            dollar,
            gold,
            updated
        });

    } catch (error) {
        console.error("Zoniva market price error:", error);

        if (status) {
            status.textContent =
                language === "en"
                    ? "Automatic price retrieval failed. Check your connection or the price source."
                    : "دریافت خودکار قیمت ناموفق بود؛ اتصال یا منبع قیمت را بررسی کنید.";
        }

    } finally {
        zonivaFetchingPrices = false;
    }
}


/* =====================================================
   12. تبدیل دلار به تومان
===================================================== */

function convertDollar() {
    const rate = getNumber("dollarRate");
    const amount = getNumber("currencyAmount");

    const language = window.zonivaGetLanguage?.() || "fa";

    if (!Number.isFinite(amount) || amount < 0) {
        return showResult(
            "dollarResult",
            language === "en"
                ? "Please enter a valid dollar amount."
                : "مقدار دلار را درست وارد کنید."
        );
    }

    if (!Number.isFinite(rate) || rate <= 0) {
        return showResult(
            "dollarResult",
            language === "en"
                ? "The dollar rate has not been received yet."
                : "قیمت دلار هنوز دریافت نشده است."
        );
    }

    const result = formatNumber(amount * rate, 0);

    showResult(
        "dollarResult",
        language === "en"
            ? `${result} toman`
            : `${result} تومان`
    );
}


/* =====================================================
   13. تبدیل تومان به دلار
===================================================== */

function convertToman() {
    const rate = getNumber("dollarRate");
    const amount = getNumber("tomanAmount");

    const language = window.zonivaGetLanguage?.() || "fa";

    if (!Number.isFinite(amount) || amount < 0) {
        return showResult(
            "tomanResult",
            language === "en"
                ? "Please enter a valid Toman amount."
                : "مبلغ تومان را درست وارد کنید."
        );
    }

    if (!Number.isFinite(rate) || rate <= 0) {
        return showResult(
            "tomanResult",
            language === "en"
                ? "The dollar rate has not been received yet."
                : "قیمت دلار هنوز دریافت نشده است."
        );
    }

    const result = formatNumber(amount / rate, 4);

    showResult(
        "tomanResult",
        language === "en"
            ? `${result} USD`
            : `${result} دلار`
    );
}


/* =====================================================
   14. محاسبه ارزش طلا
===================================================== */

function calculateGold() {
    const price = getNumber("goldPrice");
    const weight = getNumber("goldWeight");

    const language = window.zonivaGetLanguage?.() || "fa";

    if (!Number.isFinite(weight) || weight < 0) {
        return showResult(
            "goldResult",
            language === "en"
                ? "Please enter a valid gold weight."
                : "وزن طلا را درست وارد کنید."
        );
    }

    if (!Number.isFinite(price) || price <= 0) {
        return showResult(
            "goldResult",
            language === "en"
                ? "The 18K gold price has not been received yet."
                : "قیمت طلای ۱۸ عیار هنوز دریافت نشده است."
        );
    }

    const result = formatNumber(price * weight, 0);

    showResult(
        "goldResult",
        language === "en"
            ? `${result} toman`
            : `${result} تومان`
    );
}


/* =====================================================
   15. ترجمه فارسی و انگلیسی
===================================================== */

const ZONIVA_TRANSLATIONS = {
    "خانه": "Home",
    "ابزارها": "Tools",
    "درباره ما": "About",
    "باز کردن منو": "Open menu",

    "چرا Zoniva؟": "Why Zoniva?",
    "سریع": "Fast",
    "کاربردی": "Practical",
    "ساده": "Simple",

    "ابزارها برای انجام سریع کارها طراحی شده‌اند.":
        "Our tools are designed to help you get things done faster.",

    "ابزارهایی که واقعاً در کارهای روزمره به درد می‌خورند.":
        "Useful tools for everyday tasks.",

    "بدون پیچیدگی؛ فقط وارد شو و از ابزار استفاده کن.":
        "No complications. Just open a tool and use it.",

    "Zoniva برای چه کسانی است؟":
        "Who is Zoniva for?",

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

    "درباره Zoniva": "About Zoniva",

    "Zoniva یک مجموعه ابزار ساده، کاربردی و سریع است که برای کمک به انجام کارهای روزمره، آموزشی و دانش‌آموزی ساخته شده است.":
        "Zoniva is a collection of simple, practical, and fast tools designed to help with everyday activities, learning, and schoolwork.",

    "هدف ما": "Our Mission",

    "هدف Zoniva این است که ابزارهای کاربردی را بدون پیچیدگی و به ساده‌ترین شکل در اختیار کاربران قرار دهد.":
        "Zoniva aims to provide useful tools in the simplest way possible, without unnecessary complexity.",

    "بخشی از ابزارهای Zoniva برای درس، مدرسه، محاسبات و کارهای روزمره دانش‌آموزان طراحی شده‌اند.":
        "Some Zoniva tools are designed for schoolwork, calculations, and students' everyday tasks.",

    "برای دانش‌آموزان": "For Students",
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

    "متن خود را وارد کنید تا آمار آن نمایش داده شود.":
        "Enter your text to see its statistics.",

    "متن شما": "Your Text",
    "متن را اینجا بنویسید...": "Type your text here...",
    "تعداد کلمات:": "Words:",
    "تعداد حروف و کاراکترها:": "Characters:",
    "کاراکتر بدون فاصله:": "Characters without spaces:",
    "تعداد خطوط:": "Lines:",

    "ماشین حساب": "Calculator",
    "محاسبات ریاضی روزمره را به‌سادگی انجام دهید.":
        "Perform everyday mathematical calculations easily.",

    "عبارت ریاضی خود را وارد کنید.":
        "Enter a mathematical expression.",

    "عبارت ریاضی": "Expression",
    "محاسبه": "Calculate",

    "عملگرهای پایه پشتیبانی می‌شوند: + ، − ، × ، ÷ و پرانتز.":
        "Supported operators: +, −, ×, ÷, and parentheses.",

    "تبدیل واحد": "Unit Converter",
    "تبدیل واحد طول": "Length Unit Converter",

    "واحدهای طول را به کیلومتر، متر، سانتی‌متر و میلی‌متر تبدیل کنید.":
        "Convert lengths between kilometers, meters, centimeters, and millimeters.",

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
    "تبدیل واحد طول": "Length Unit Converter",

    "محاسبه معدل": "Grade Average",

    "نمره‌های خود را وارد کنید و میانگین آن‌ها را به دست آورید.":
        "Enter your grades and calculate their average.",

    "نمره‌ها را با فاصله یا ویرگول از هم جدا کنید.":
        "Separate grades using spaces or commas.",

    "نمره‌ها از ۰ تا ۲۰": "Grades from 0 to 20",
    "محاسبه معدل": "Calculate Average",

    "این ابزار میانگین ساده نمره‌ها را محاسبه می‌کند. برای معدل وزنی، ضریب هر درس باید جداگانه وارد شود.":
        "This tool calculates a simple average. For a weighted average, each subject's coefficient must be entered separately.",

    "تبدیل کسر و اعشار": "Fraction & Decimal Converter",

    "کسرها را به عدد اعشاری و اعداد اعشاری را به کسر تبدیل کنید.":
        "Convert fractions to decimals and decimals to fractions.",

    "یک کسر مثل 3/4 یا یک عدد اعشاری وارد کنید.":
        "Enter a fraction such as 3/4 or a decimal number.",

    "کسر یا عدد": "Fraction or Number",
    "کسر به اعشار": "Fraction to Decimal",
    "اعشار به کسر": "Decimal to Fraction",

    "ساخت رمز عبور": "Password Generator",
    "رمز تصادفی با حروف، اعداد و نمادها بسازید.":
        "Create a random password using letters, numbers, and symbols.",

    "طول رمز عبور": "Password Length",
    "حروف بزرگ انگلیسی": "Uppercase Letters",
    "حروف کوچک انگلیسی": "Lowercase Letters",
    "اعداد": "Numbers",
    "نمادهای خاص": "Special Symbols",
    "رمز ساخته‌شده": "Generated Password",
    "رمز شما اینجا نمایش داده می‌شود": "Your password will appear here",
    "ساخت رمز جدید": "Generate New Password",
    "کپی رمز": "Copy Password",

    "توان و ریشه": "Powers & Roots",
    "توان اعداد و ریشه دوم آن‌ها را محاسبه کنید.":
        "Calculate powers and square roots.",

    "برای اعداد صحیح بزرگ نیز می‌توانید از محاسبه توان استفاده کنید.":
        "You can also calculate powers of large integers.",

    "عدد پایه": "Base Number",
    "توان": "Exponent",
    "محاسبه توان": "Calculate Power",
    "محاسبه ریشه دوم": "Calculate Square Root",

    "محاسبات اعداد صحیح بزرگ ممکن است بسته به اندازه عدد، زمان و حافظه بیشتری نیاز داشته باشند.":
        "Calculations involving very large integers may require additional time and memory.",

    "محاسبه اختلاف تاریخ": "Date Difference",

    "اختلاف دو تاریخ را بر اساس تعداد واقعی روزها محاسبه کنید.":
        "Calculate the number of days between two dates.",

    "دو تاریخ را انتخاب کنید تا اختلاف روزها و تفکیک تقویمی محاسبه شود.":
        "Select two dates to calculate the difference in days.",

    "تاریخ شروع": "Start Date",
    "تاریخ پایان": "End Date",

    "انتخاب تاریخ در این نسخه با تقویم میلادی مرورگر انجام می‌شود. تاریخ شمسی نیز در نتیجه نمایش داده می‌شود.":
        "This version uses your browser's Gregorian calendar for date selection.",

    "ارز و طلا": "Currency & Gold",
    "تبدیل دلار و تومان و محاسبه ارزش تقریبی طلای ۱۸ عیار.":
        "Convert dollars and toman and estimate the value of 18K gold.",

    "نرخ‌های دریافت‌شده از منبع آنلاین را بررسی کنید و تبدیل انجام دهید.":
        "Check the online exchange rates and perform conversions.",

    "قیمت هر دلار به تومان": "Price per US Dollar (Toman)",
    "در حال دریافت نرخ...": "Loading rate...",
    "تبدیل دلار به تومان": "USD to Toman",
    "مقدار دلار": "Amount in USD",
    "تبدیل به تومان": "Convert to Toman",
    "تبدیل تومان به دلار": "Toman to USD",
    "مبلغ به تومان": "Amount in Toman",
    "تبدیل به دلار": "Convert to USD",
    "محاسبه ارزش طلای ۱۸ عیار": "Calculate 18K Gold Value",
    "قیمت هر گرم طلا به تومان": "Price per Gram of Gold (Toman)",
    "وزن طلا به گرم": "Gold Weight (grams)",
    "محاسبه ارزش طلا": "Calculate Gold Value",

    "قیمت‌ها تقریبی هستند و ممکن است با بازار تفاوت داشته باشند. اجرت، مالیات و سود فروشنده در محاسبه طلا لحاظ نشده است.":
        "Prices are estimates and may differ from the market. Making charges, taxes, and seller fees are not included.",

    "ساخته‌شده با 💙 برای ساده‌تر کردن کارهای روزمره":
        "Made with 💙 to make everyday tasks easier.",

    "ZONIVA 2.0": "ZONIVA 2.0",

    "ابزارهایی کاربردی، سریع و ساده برای انجام کارهای روزمره؛ همه در یک پلتفرم و در دسترس شما.":
        "Practical, fast, and simple tools for everyday tasks, all in one convenient platform."
};


/* =====================================================
   16. ویژگی‌های قابل ترجمه
===================================================== */

const ZONIVA_ATTRIBUTE_TRANSLATIONS = {
    "باز کردن منو": "Open menu",
    "بستن": "Close",
    "جست‌وجوی ابزارها": "Search tools",
    "جست‌وجو بین ابزارها...": "Search tools...",
    "متن را اینجا بنویسید...": "Type your text here...",
    "مثال: (12 + 8) * 2": "Example: (12 + 8) * 2",
    "مثال: 3/4 یا 0.75": "Example: 3/4 or 0.75",
    "در حال دریافت نرخ...": "Loading rate..."
};


/* =====================================================
   17. موتور تغییر زبان
===================================================== */

(function setupZonivaLanguage() {
    const STORAGE_KEY = "zoniva-language";

    let currentLanguage = "fa";

    const originalText = new WeakMap();
    const originalAttributes = new WeakMap();

    function normalize(value) {
        return String(value).replace(/\s+/g, " ").trim();
    }

    function findPersianTranslation(englishText) {
        const wanted = normalize(englishText);

        return Object.entries(ZONIVA_TRANSLATIONS).find(
            ([persian, english]) => normalize(english) === wanted
        )?.[0];
    }

    function translateValue(original, language) {
        const clean = normalize(original);

        if (language === "fa") {
            return original;
        }

        if (Object.hasOwn(ZONIVA_TRANSLATIONS, clean)) {
            return ZONIVA_TRANSLATIONS[clean];
        }

        // ترجمه پیام‌های پویا
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
            return clean
                .replace(/^قیمت‌ها دریافت شدند/, "Market prices received")
                .replace("آخرین به‌روزرسانی:", "Last updated:");
        }

        const englishTranslation = findPersianTranslation(clean);

        if (englishTranslation) {
            return englishTranslation;
        }

        // ترجمه اعداد فارسی به اعداد انگلیسی در حالت English
        return original.replace(/[۰-۹]/g, digit =>
            "۰۱۲۳۴۵۶۷۸۹".indexOf(digit)
        );
    }

    function translateTextNode(node) {
        if (
            !node ||
            !node.parentElement ||
            node.parentElement.closest(
                "script, style, textarea, code, [data-language-toggle]"
            )
        ) {
            return;
        }

        if (!originalText.has(node)) {
            originalText.set(node, node.nodeValue);
        }

        const original = originalText.get(node);

        if (!original || !normalize(original)) return;

        let replacement;

        if (currentLanguage === "en") {
            replacement = translateValue(original, "en");
        } else {
            replacement = original;
        }

        if (node.nodeValue !== replacement) {
            node.nodeValue = replacement;
        }
    }

    function translateAttributes(element) {
        const names = [
            "placeholder",
            "aria-label",
            "title",
            "alt"
        ];

        if (!originalAttributes.has(element)) {
            originalAttributes.set(element, {});
        }

        const saved = originalAttributes.get(element);

        names.forEach(name => {
            if (!element.hasAttribute(name)) return;

            if (!(name in saved)) {
                saved[name] = element.getAttribute(name);
            }

            const original = saved[name];

            if (currentLanguage === "en") {
                element.setAttribute(
                    name,
                    ZONIVA_ATTRIBUTE_TRANSLATIONS[original] || original
                );
            } else {
                element.setAttribute(name, original);
            }
        });
    }

    function updateToggleButtons() {
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
    }

    function ensureLanguageButton() {
        // صفحات دارای هدر عمومی
        const header = document.querySelector(".header");

        if (header && !header.querySelector("[data-language-toggle]")) {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "language-toggle";
            button.dataset.languageToggle = "true";
            button.textContent = "🌐 English";

            const menu = header.querySelector(".menu");

            if (menu) {
                header.appendChild(button);
            } else {
                header.appendChild(button);
            }
        }

        // صفحه ابزارها، که هدر متفاوتی دارد
        const toolsHero = document.querySelector(".tools-hero");

        if (
            toolsHero &&
            !toolsHero.querySelector("[data-language-toggle]")
        ) {
            const row = document.createElement("div");

            row.className = "tools-language-row";

            const button = document.createElement("button");

            button.type = "button";
            button.className = "language-toggle";
            button.dataset.languageToggle = "true";
            button.textContent = "🌐 English";

            row.appendChild(button);
            toolsHero.prepend(row);
        }
    }

    function applyLanguage(language) {
        currentLanguage = language === "en" ? "en" : "fa";

        try {
            localStorage.setItem(STORAGE_KEY, currentLanguage);
        } catch (error) {
            console.warn(
                "Zoniva: Could not save language preference.",
                error
            );
        }

        // تنظیم جهت صفحه
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir =
            currentLanguage === "en" ? "ltr" : "rtl";

        document.body.style.direction =
            currentLanguage === "en" ? "ltr" : "rtl";

        document.body.style.fontFamily =
            currentLanguage === "en"
                ? "Arial, Helvetica, sans-serif"
                : "";

        // عنوان صفحه
        const title = document.querySelector("title");

        if (title) {
            if (!title.dataset.originalTitle) {
                title.dataset.originalTitle = title.textContent;
            }

            const originalTitle = title.dataset.originalTitle;

            if (currentLanguage === "en") {
                title.textContent =
                    ZONIVA_TRANSLATIONS[normalize(originalTitle)] ||
                    originalTitle;
            } else {
                title.textContent = originalTitle;
            }
        }

        // ترجمه متن‌های صفحه
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
        );

        const nodes = [];

        while (walker.nextNode()) {
            nodes.push(walker.currentNode);
        }

        nodes.forEach(translateTextNode);

        document.querySelectorAll(
            "input, textarea, select, button, img, a"
        ).forEach(translateAttributes);

        updateToggleButtons();
        updateLanguageStyles();
    }

    function updateLanguageStyles() {
        let style = document.getElementById("zoniva-language-styles");

        if (!style) {
            style = document.createElement("style");
            style.id = "zoniva-language-styles";

            style.textContent = `
                .language-toggle {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    min-height: 42px;
                    padding: 10px 14px;
                    border: 1px solid rgba(105,195,255,.4);
                    border-radius: 12px;
                    color: #c6e8ff;
                    background: rgba(22,131,255,.13);
                    font-family: inherit;
                    font-size: 13px;
                    font-weight: 700;
                    white-space: nowrap;
                    cursor: pointer;
                    transition: background .2s ease,
                                border-color .2s ease,
                                box-shadow .2s ease;
                }

                .language-toggle:hover {
                    background: rgba(22,131,255,.25);
                    border-color: #69c3ff;
                    box-shadow: 0 0 18px rgba(22,131,255,.2);
                }

                .language-toggle:focus-visible {
                    outline: 2px solid #69c3ff;
                    outline-offset: 3px;
                }

                .tools-language-row {
                    display: flex;
                    justify-content: flex-end;
                    width: 100%;
                    margin-bottom: 12px;
                }

                @media (max-width: 700px) {
                    .language-toggle {
                        min-height: 39px;
                        padding: 8px 10px;
                        font-size: 12px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .language-toggle {
                        transition: none;
                    }
                }
            `;

            document.head.appendChild(style);
        }
    }

    function initLanguageSystem() {
        ensureLanguageButton();

        let savedLanguage = "fa";

        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved === "fa" || saved === "en") {
                savedLanguage = saved;
            }
        } catch (error) {
            console.warn(
                "Zoniva: Could not read language preference.",
                error
            );
        }

        document.querySelectorAll("[data-language-toggle]").forEach(button => {
            button.addEventListener("click", () => {
                applyLanguage(
                    currentLanguage === "fa" ? "en" : "fa"
                );
            });
        });

        applyLanguage(savedLanguage);

        // نظارت بر نتایج جدید ابزارها
        const observer = new MutationObserver(records => {
            records.forEach(record => {
                if (record.type === "characterData") {
                    translateTextNode(record.target);
                }

                record.addedNodes?.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        translateTextNode(node);
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.matches?.("[data-language-toggle]")) {
                            node.textContent =
                                currentLanguage === "en"
                                    ? "🌐 فارسی"
                                    : "🌐 English";
                        }

                        const walker = document.createTreeWalker(
                            node,
                            NodeFilter.SHOW_TEXT
                        );

                        const addedTextNodes = [];

                        while (walker.nextNode()) {
                            addedTextNodes.push(walker.currentNode);
                        }

                        addedTextNodes.forEach(translateTextNode);

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

    window.zonivaSetLanguage = applyLanguage;
    window.zonivaGetLanguage = () => currentLanguage;

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initLanguageSystem,
            { once: true }
        );
    } else {
        initLanguageSystem();
    }
})();


/* =====================================================
   18. منوی موبایل و آماده‌سازی ابزارها
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // شمارش زنده متن
    const textInput = document.getElementById("textInput");

    if (textInput) {
        textInput.addEventListener("input", updateTextCounts);
        updateTextCounts();
    }

    // بستن پنجره‌ها با کلیک روی پس‌زمینه
    document.querySelectorAll(".modal, .tool-modal").forEach(modal => {
        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeTool(modal.id);
            }
        });
    });

    // بستن پنجره‌ها با Escape
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            document.querySelectorAll(".modal, .tool-modal").forEach(modal => {
                if (getComputedStyle(modal).display !== "none") {
                    closeTool(modal.id);
                }
            });
        }
    });

    // منوی موبایل
    const menuButton = document.getElementById("menuBtn");
    const menu = document.getElementById("menu");
    const menuOverlay = document.getElementById("menuOverlay");

    if (menuButton && menu) {
        menuButton.addEventListener("click", () => {
            const isOpen = menu.classList.toggle("active");

            menuButton.setAttribute("aria-expanded", String(isOpen));

            if (menuOverlay) {
                menuOverlay.classList.toggle("active", isOpen);
            }
        });

        menu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                menu.classList.remove("active");
                menuButton.setAttribute("aria-expanded", "false");

                if (menuOverlay) {
                    menuOverlay.classList.remove("active");
                }
            });
        });

        if (menuOverlay) {
            menuOverlay.addEventListener("click", () => {
                menu.classList.remove("active");
                menuButton.setAttribute("aria-expanded", "false");
                menuOverlay.classList.remove("active");
            });
        }
    }

    // دریافت قیمت فقط در صفحه‌ای که ابزار ارز وجود دارد.
    if (
        document.getElementById("ratesUpdated") ||
        document.getElementById("dollarRate")
    ) {
        fetchMarketPrices();

        setInterval(fetchMarketPrices, 30 * 60 * 1000);
    }
});/* =====================================================
   ZONIVA 2.0 — EXTENDED TRANSLATIONS PATCH
   Additional Persian / English translations
===================================================== */

(function () {
    "use strict";

    const extraTranslations = {
        /* Navigation */
        "خانه": "Home",
        "ابزارها": "Tools",
        "درباره ما": "About",
        "باز کردن منو": "Open menu",

        /* Homepage */
        "چرا Zoniva؟": "Why Zoniva?",
        "سریع": "Fast",
        "کاربردی": "Practical",
        "ساده": "Simple",

        "ابزارها برای انجام سریع کارها طراحی شده‌اند.":
            "Our tools help you get things done faster.",

        "ابزارهایی که واقعاً در کارهای روزمره به درد می‌خورند.":
            "Useful tools for everyday tasks.",

        "بدون پیچیدگی؛ فقط وارد شو و از ابزار استفاده کن.":
            "No complications. Just open a tool and use it.",

        "Zoniva برای چه کسانی است؟":
            "Who is Zoniva for?",

        "برای دانش‌آموزان، دانشجویان و هر کسی که به ابزارهای کاربردی نیاز دارد.":
            "For students and anyone who needs useful tools.",

        "دانش‌آموزان": "School Students",
        "دانشجویان": "University Students",
        "همه افراد": "Everyone",

        "ابزارهایی برای درس، مدرسه و پروژه‌ها.":
            "Tools for studying, schoolwork, and projects.",

        "ابزارهایی برای ساده‌تر شدن کارهای دانشجویی.":
            "Tools to make university work easier.",

        "ابزارهای ساده و کاربردی برای کارهای روزمره.":
            "Simple and useful tools for everyday life.",

        "آماده‌ای شروع کنی؟": "Ready to get started?",

        "وارد Zoniva شو و ابزار مناسب خودت رو پیدا کن.":
            "Explore Zoniva and find the right tools for you.",

        "ورود به ابزارها": "Explore Tools",

        "Zoniva مجموعه‌ای از ابزارهای ساده، سریع و کاربردی است که برای دانش‌آموزان طراحی شده است. ما تلاش می‌کنیم کارهای وقت‌گیر، مانند محاسبات و کارهای روزمره را تا حد امکان ساده‌تر کنیم.":
            "Zoniva is a collection of simple, fast, and useful tools designed for students. We aim to make calculations and everyday tasks easier.",

        /* About page */
        "درباره Zoniva": "About Zoniva",

        "Zoniva یک مجموعه ابزار ساده، کاربردی و سریع است که برای کمک به انجام کارهای روزمره، آموزشی و دانش‌آموزی ساخته شده است.":
            "Zoniva is a collection of simple, fast, and practical tools for everyday activities, learning, and schoolwork.",

        "هدف ما": "Our Mission",

        "هدف Zoniva این است که ابزارهای کاربردی را بدون پیچیدگی و به ساده‌ترین شکل در اختیار کاربران قرار دهد.":
            "Our goal is to provide useful tools in the simplest way possible.",

        "برای دانش‌آموزان": "For Students",

        "بخشی از ابزارهای Zoniva برای درس، مدرسه، محاسبات و کارهای روزمره دانش‌آموزان طراحی شده‌اند.":
            "Some Zoniva tools are designed for schoolwork, calculations, and everyday student tasks.",

        "برنامه‌نویس Zoniva": "Zoniva Developer",
        "Zoniva توسط": "Designed and developed by",
        "طراحی و توسعه داده شده است.": ".",

        "در حال توسعه": "Under Development",

        "Zoniva یک پروژه در حال توسعه است و قرار است در آینده ابزارهای بیشتری به آن اضافه شود.":
            "Zoniva is an ongoing project, and more tools are planned for future updates.",

        "کانال بله": "Bale Channel",

        "برای دنبال کردن اخبار، پروژه‌ها و آخرین فعالیت‌های Zoniva می‌توانید به کانال ما در بله بپیوندید.":
            "Follow Zoniva news, projects, and updates by joining our Bale channel.",

        "ورود به کانال": "Join the Channel",

        /* Tool cards */
        "ابزارهای Zoniva": "Zoniva Tools",
        "همه ابزارها": "All Tools",
        "باز کردن ابزار ←": "Open Tool →",
        "ابزاری با این نام پیدا نشد.": "No matching tools found.",

        "ابزارهایی کاربردی، سریع و ساده برای انجام کارهای روزمره؛ همه در یک پلتفرم و در دسترس شما.":
            "Practical, fast, and simple tools for everyday tasks, all in one place.",

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

        /* Text counter */
        "متن خود را وارد کنید تا آمار آن نمایش داده شود.":
            "Enter your text to see its statistics.",

        "متن شما": "Your Text",
        "متن را اینجا بنویسید...": "Type your text here...",

        "تعداد کلمات:": "Words:",
        "تعداد حروف و کاراکترها:": "Characters:",
        "کاراکتر بدون فاصله:": "Characters without spaces:",
        "تعداد خطوط:": "Lines:",

        /* Calculator */
        "عبارت ریاضی خود را وارد کنید.":
            "Enter a mathematical expression.",

        "عبارت ریاضی": "Expression",
        "محاسبه": "Calculate",

        "عملگرهای پایه پشتیبانی می‌شوند: + ، − ، × ، ÷ و پرانتز.":
            "Supported operators: +, −, ×, ÷, and parentheses.",

        /* Unit converter */
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
        "تبدیل واحد طول": "Length Unit Converter",

        /* Grades */
        "نمره‌ها را با فاصله یا ویرگول از هم جدا کنید.":
            "Separate grades with spaces or commas.",

        "نمره‌ها از ۰ تا ۲۰": "Grades from 0 to 20",

        "این ابزار میانگین ساده نمره‌ها را محاسبه می‌کند. برای معدل وزنی، ضریب هر درس باید جداگانه وارد شود.":
            "This tool calculates a simple average. For a weighted average, enter each subject's coefficient separately.",

        /* Fractions */
        "یک کسر مثل 3/4 یا یک عدد اعشاری وارد کنید.":
            "Enter a fraction such as 3/4 or a decimal number.",

        "کسر یا عدد": "Fraction or Number",
        "کسر به اعشار": "Fraction to Decimal",
        "اعشار به کسر": "Decimal to Fraction",

        /* Password */
        "طول رمز عبور": "Password Length",
        "حروف بزرگ انگلیسی": "Uppercase Letters",
        "حروف کوچک انگلیسی": "Lowercase Letters",
        "اعداد": "Numbers",
        "نمادهای خاص": "Special Symbols",

        "رمز ساخته‌شده": "Generated Password",
        "رمز شما اینجا نمایش داده می‌شود": "Your password will appear here",

        "ساخت رمز جدید": "Generate New Password",
        "کپی رمز": "Copy Password",

        /* Powers */
        "برای اعداد صحیح بزرگ نیز می‌توانید از محاسبه توان استفاده کنید.":
            "You can also calculate powers of large integers.",

        "عدد پایه": "Base Number",
        "توان": "Exponent",
        "محاسبه توان": "Calculate Power",
        "محاسبه ریشه دوم": "Calculate Square Root",

        "محاسبات اعداد صحیح بزرگ ممکن است بسته به اندازه عدد، زمان و حافظه بیشتری نیاز داشته باشند.":
            "Calculations involving very large integers may require extra time and memory.",

        /* Date */
        "دو تاریخ را انتخاب کنید تا اختلاف روزها و تفکیک تقویمی محاسبه شود.":
            "Select two dates to calculate the difference in days.",

        "تاریخ شروع": "Start Date",
        "تاریخ پایان": "End Date",

        "انتخاب تاریخ در این نسخه با تقویم میلادی مرورگر انجام می‌شود. تاریخ شمسی نیز در نتیجه نمایش داده می‌شود.":
            "This version uses your browser's Gregorian calendar for date selection.",

        /* Currency */
        "نرخ‌های دریافت‌شده از منبع آنلاین را بررسی کنید و تبدیل انجام دهید.":
            "Check the online exchange rates and perform conversions.",

        "قیمت هر دلار به تومان": "Price per US Dollar (Toman)",
        "در حال دریافت نرخ...": "Loading rate...",

        "تبدیل دلار به تومان": "USD to Toman",
        "مقدار دلار": "Amount in USD",
        "تبدیل به تومان": "Convert to Toman",

        "تبدیل تومان به دلار": "Toman to USD",
        "مبلغ به تومان": "Amount in Toman",
        "تبدیل به دلار": "Convert to USD",

        "محاسبه ارزش طلای ۱۸ عیار": "Calculate 18K Gold Value",
        "قیمت هر گرم طلا به تومان": "Price per Gram of Gold (Toman)",
        "وزن طلا به گرم": "Gold Weight (grams)",
        "محاسبه ارزش طلا": "Calculate Gold Value",

        "قیمت‌ها تقریبی هستند و ممکن است با بازار تفاوت داشته باشند. اجرت، مالیات و سود فروشنده در محاسبه طلا لحاظ نشده است.":
            "Prices are estimates and may differ from the market. Making charges, taxes, and seller fees are not included.",

        /* Footer */
        "ساخته‌شده با 💙 برای ساده‌تر کردن کارهای روزمره":
            "Made with 💙 to make everyday tasks easier.",

        /* Common tool errors */
        "لطفاً عبارت ریاضی را وارد کنید.":
            "Please enter a mathematical expression.",

        "عبارت شامل نویسه‌های غیرمجاز است.":
            "The expression contains invalid characters.",

        "عبارت ریاضی صحیح نیست.":
            "The mathematical expression is invalid.",

        "لطفاً یک عدد معتبر وارد کنید.":
            "Please enter a valid number.",

        "واحدهای انتخاب‌شده معتبر نیستند.":
            "The selected units are invalid.",

        "لطفاً نمره‌ها را وارد کنید.":
            "Please enter your grades.",

        "نمره‌ها باید عددی بین صفر تا ۲۰ باشند.":
            "Grades must be between 0 and 20.",

        "کسر را به شکل ۳/۴ وارد کنید.":
            "Enter a fraction in the form 3/4.",

        "کسر واردشده معتبر نیست.":
            "The entered fraction is invalid.",

        "مخرج کسر نمی‌تواند صفر باشد.":
            "The denominator cannot be zero.",

        "لطفاً یک عدد اعشاری معتبر وارد کنید.":
            "Please enter a valid decimal number.",

        "یک عدد معتبر با حداکثر ۹ رقم اعشار وارد کنید.":
            "Enter a valid number with no more than 9 decimal places.",

        "طول رمز باید بین ۱ تا ۲۵۶ باشد.":
            "Password length must be between 1 and 256.",

        "حداقل یک نوع کاراکتر را انتخاب کنید.":
            "Select at least one character group.",

        "طول رمز برای گزینه‌های انتخاب‌شده کافی نیست.":
            "The selected character groups require a longer password.",

        "رمز عبور ساخته شد.":
            "Password generated successfully.",

        "ابتدا رمز عبور بسازید.":
            "Generate a password first.",

        "رمز عبور کپی شد.":
            "Password copied.",

        "کپی خودکار انجام نشد؛ رمز را دستی کپی کنید.":
            "Automatic copying failed. Please copy it manually.",

        "لطفاً عدد و توان معتبر وارد کنید.":
            "Please enter a valid base and exponent.",

        "نتیجه قابل محاسبه نیست.":
            "The result cannot be represented.",

        "لطفاً یک عدد معتبر وارد کنید.":
            "Please enter a valid number.",

        "ریشه دوم عدد منفی در اعداد حقیقی تعریف نشده است.":
            "A negative number has no real square root.",

        "هر دو تاریخ را انتخاب کنید.":
            "Select both dates.",

        "یکی از تاریخ‌ها معتبر نیست.":
            "One of the dates is invalid.",

        "قیمت دلار هنوز دریافت نشده است.":
            "The dollar rate has not been received yet.",

        "قیمت طلای ۱۸ عیار هنوز دریافت نشده است.":
            "The 18K gold price has not been received yet.",

        "مقدار دلار را درست وارد کنید.":
            "Please enter a valid dollar amount.",

        "مبلغ تومان را درست وارد کنید.":
            "Please enter a valid Toman amount.",

        "وزن طلا را درست وارد کنید.":
            "Please enter a valid gold weight.",

        "در حال دریافت قیمت دلار و طلا...":
            "Loading dollar and gold prices...",

        "دریافت خودکار قیمت ناموفق بود؛ اتصال یا منبع قیمت را بررسی کنید.":
            "Automatic price retrieval failed. Check your connection or the price source.",

        "قیمت‌ها دریافت شدند":
            "Market prices received"
    };

    const extraAttributeTranslations = {
        "باز کردن منو": "Open menu",
        "بستن": "Close",
        "جست‌وجوی ابزارها": "Search tools",
        "جست‌وجو بین ابزارها...": "Search tools...",
        "متن را اینجا بنویسید...": "Type your text here...",
        "در حال دریافت نرخ...": "Loading rate..."
    };

    // گسترش دیکشنری موجود بدون حذف کدهای فعلی
    if (typeof ZONIVA_TRANSLATIONS !== "undefined") {
        Object.assign(ZONIVA_TRANSLATIONS, extraTranslations);
    }

    if (typeof ZONIVA_ATTRIBUTE_TRANSLATIONS !== "undefined") {
        Object.assign(
            ZONIVA_ATTRIBUTE_TRANSLATIONS,
            extraAttributeTranslations
        );
    }

    function refreshLanguage() {
        if (
            typeof window.zonivaSetLanguage === "function" &&
            typeof window.zonivaGetLanguage === "function"
        ) {
            window.zonivaSetLanguage(
                window.zonivaGetLanguage()
            );
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            refreshLanguage,
            { once: true }
        );
    } else {
        refreshLanguage();
    }
})();/* ==========================================
   ZONIVA 2.0 — FIX MISSING TRANSLATIONS
========================================== */

Object.assign(ZONIVA_TRANSLATIONS, {
    "ابزارهای": "Tools ",
    "ابزارهای ساده، سریع و کاربردی برای انجام کارهای روزمره":
        "Simple, fast, and practical tools for everyday tasks",

    "ابزارهایی کاربردی، سریع و ساده برای انجام کارهای روزمره؛ همه در یک پلتفرم و در دسترس شما.":
        "Practical, fast, and simple tools for everyday tasks, all in one place.",

    "ابزارهای کاربردی": "Useful tools",
    "ابزارهای ساده": "Simple tools",
    "ابزارهای سریع": "Fast tools",

    "همه ابزارها": "All Tools",
    "ابزار مناسب خودت رو پیدا کن.": "Find the right tools for you.",
    "بدون پیچیدگی": "Without complications",

    "ابزارهایی برای درس، مدرسه و پروژه‌ها.":
        "Tools for studying, schoolwork, and projects.",

    "ابزارهای ساده و کاربردی برای کارهای روزمره.":
        "Simple and practical tools for everyday tasks."
});

// اجرای مجدد ترجمه با زبان انتخاب‌شده
if (
    typeof window.zonivaSetLanguage === "function" &&
    typeof window.zonivaGetLanguage === "function"
) {
    window.zonivaSetLanguage(window.zonivaGetLanguage());
}