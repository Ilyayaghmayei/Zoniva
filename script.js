

const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

if (menuBtn && menu) {

    menuBtn.addEventListener("click", function () {
        menu.classList.toggle("active");
    });

}


const textInput = document.getElementById("textInput");
const wordCount = document.getElementById("wordCount");
const charCount = document.getElementById("charCount");

if (textInput && wordCount && charCount) {

    textInput.addEventListener("input", function () {

        const text = textInput.value;

        const characters = text.length;

        const words = text.trim() === ""
            ? 0
            : text.trim().split(/\s+/).length;

        charCount.textContent = characters;
        wordCount.textContent = words;

    });

}


const textToolBtn = document.getElementById("textToolBtn");
const textTool = document.getElementById("textTool");

if (textToolBtn && textTool) {

    textToolBtn.addEventListener("click", function () {
if (unitConverterTool) {
    unitConverterTool.style.display = "none";
}
    // بستن محاسبه‌گر
    if (calculatorTool) {
        calculatorTool.style.display = "none";
    }

    // باز کردن شمارش متن
    textTool.style.display = "block";

    textTool.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

});

}
// =========================
// Calculator Tool
// =========================

const calculatorBtn =
    document.getElementById("calculatorBtn");

const calculatorTool =
    document.getElementById("calculatorTool");

const calculatorDisplay =
    document.getElementById("calculatorDisplay");

const calculatorButtons =
    document.querySelectorAll(
        ".calculator-buttons button[data-value]"
    );

const clearCalculator =
    document.getElementById("clearCalculator");

const calculateResult =
    document.getElementById("calculateResult");


if (
    calculatorBtn &&
    calculatorTool &&
    calculatorDisplay
) {

   
calculatorBtn.addEventListener("click", function () {
if (unitConverterTool) {
    unitConverterTool.style.display = "none";
}
    // بستن شمارش متن
    if (textTool) {
        textTool.style.display = "none";
    }

    // باز کردن محاسبه‌گر
    calculatorTool.style.display = "block";

    calculatorTool.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

});

textToolBtn


    calculatorButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            calculatorDisplay.value +=
                button.dataset.value;

        });

    });


    clearCalculator.addEventListener("click", function () {

        calculatorDisplay.value = "";

    });


    calculateResult.addEventListener("click", function () {

        try {

            const result =
                Function(
                    "return " +
                    calculatorDisplay.value
                )();

            if (Number.isFinite(result)) {

                calculatorDisplay.value = result;

            } else {

                calculatorDisplay.value = "خطا";

            }

        } catch {

            calculatorDisplay.value = "خطا";

        }

    });

}
// =========================
// Unit Converter - Open Tool
// =========================

const unitConverterBtn =
    document.getElementById("unitConverterBtn");

const unitConverterTool =
    document.getElementById("unitConverterTool");


if (
    unitConverterBtn &&
    unitConverterTool
) {

    unitConverterBtn.addEventListener("click", function () {

        // بستن ابزارهای دیگر
        if (textTool) {
            textTool.style.display = "none";
        }

        if (calculatorTool) {
            calculatorTool.style.display = "none";
        }

        // باز کردن تبدیل واحد
        unitConverterTool.style.display = "block";

        unitConverterTool.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    });

}
// =========================
// Unit Converter - Calculation
// =========================

const unitInput = document.getElementById("unitInput");
const unitFrom = document.getElementById("unitFrom");
const unitTo = document.getElementById("unitTo");
const convertUnit = document.getElementById("convertUnit");
const unitResult = document.getElementById("unitResult");

if (unitInput && unitFrom && unitTo && convertUnit && unitResult) {

    convertUnit.addEventListener("click", function () {

        const value = Number(unitInput.value);

        if (unitInput.value.trim() === "") {
            unitResult.textContent = "لطفاً یک عدد وارد کن.";
            return;
        }

        const units = {
            km: 1000,
            m: 1,
            cm: 0.01
        };

        const result =
            value * units[unitFrom.value] / units[unitTo.value];

        const unitName =
            unitTo.options[unitTo.selectedIndex].text;

        unitResult.textContent =
            result + " " + unitName;

    });

}
// =========================
// Grade Calculator
// =========================

const gradeCalculatorBtn =
    document.getElementById("gradeCalculatorBtn");

const gradeCalculatorTool =
    document.getElementById("gradeCalculatorTool");

const gradeInput =
    document.getElementById("gradeInput");

const addGrade =
    document.getElementById("addGrade");

const gradesList =
    document.getElementById("gradesList");

const calculateAverage =
    document.getElementById("calculateAverage");

const averageResult =
    document.getElementById("averageResult");


let grades = [];


if (gradeCalculatorBtn && gradeCalculatorTool) {

    gradeCalculatorBtn.addEventListener("click", function () {

        // بستن ابزارهای قبلی

        if (textTool) {
            textTool.style.display = "none";
        }

        if (calculatorTool) {
            calculatorTool.style.display = "none";
        }

        if (unitConverterTool) {
            unitConverterTool.style.display = "none";
        }


        // باز کردن محاسبه معدل

        gradeCalculatorTool.style.display = "block";

        gradeCalculatorTool.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    });


    // اضافه کردن نمره

    if (addGrade && gradeInput && gradesList) {

        addGrade.addEventListener("click", function () {

            const grade = Number(gradeInput.value);


            if (
                gradeInput.value.trim() === "" ||
                !Number.isFinite(grade) ||
                grade < 0 ||
                grade > 20
            ) {

                gradesList.textContent =
                    "لطفاً نمره‌ای بین ۰ تا ۲۰ وارد کن.";

                return;

            }


            grades.push(grade);


            gradesList.textContent =
                "نمره‌های ثبت‌شده: " +
                grades.join(" ، ");


            gradeInput.value = "";

        });

    }


    // محاسبه معدل

    if (calculateAverage && averageResult) {

        calculateAverage.addEventListener("click", function () {

            if (grades.length === 0) {

                averageResult.textContent =
                    "اول حداقل یک نمره اضافه کن.";

                return;

            }


            const total =
                grades.reduce(
                    function (sum, grade) {
                        return sum + grade;
                    },
                    0
                );


            const average =
                total / grades.length;


            averageResult.textContent =
                "معدل شما: " +
                average.toFixed(2);

        });

    }

}


document.addEventListener("DOMContentLoaded", function () {

    const loadingScreen = document.getElementById("loadingScreen");

    if (!loadingScreen) return;

    setTimeout(function () {

        loadingScreen.style.opacity = "0";
        loadingScreen.style.visibility = "hidden";
        loadingScreen.style.pointerEvents = "none";

    }, 3000);

});
