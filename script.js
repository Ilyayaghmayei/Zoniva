// =========================
// Mobile Menu
// =========================

const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

if (menuBtn && menu) {

    menuBtn.addEventListener("click", function () {

        menu.classList.toggle("active");

    });

}


// =========================
// Text Counter
// =========================

const textInput = document.getElementById("textInput");
const wordCount = document.getElementById("wordCount");
const charCount = document.getElementById("charCount");

if (textInput && wordCount && charCount) {

    textInput.addEventListener("input", function () {

        const text = textInput.value;

        const characters = text.length;

        const words =
            text.trim() === ""
                ? 0
                : text.trim().split(/\s+/).length;

        charCount.textContent = characters;
        wordCount.textContent = words;

    });

}


// =========================
// Open / Close Tools
// =========================

function openTool(toolId) {

    const tool = document.getElementById(toolId);

    if (tool) {

        tool.classList.add("active");

    }

}


function closeTool(toolId) {

    const tool = document.getElementById(toolId);

    if (tool) {

        tool.classList.remove("active");

    }

}


// =========================
// Calculator
// =========================

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


if (calculatorDisplay) {

    calculatorButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            calculatorDisplay.value +=
                button.dataset.value;

        });

    });


    if (clearCalculator) {

        clearCalculator.addEventListener("click", function () {

            calculatorDisplay.value = "";

        });

    }


    if (calculateResult) {

        calculateResult.addEventListener("click", function () {

            const expression =
                calculatorDisplay.value;

            if (expression.trim() === "") {

                return;

            }


            try {

                const result =
                    Function(
                        "return " + expression
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

}


// =========================
// Unit Converter
// =========================

const unitInput =
    document.getElementById("unitInput");

const unitFrom =
    document.getElementById("unitFrom");

const unitTo =
    document.getElementById("unitTo");

const convertUnit =
    document.getElementById("convertUnit");

const unitResult =
    document.getElementById("unitResult");


if (
    unitInput &&
    unitFrom &&
    unitTo &&
    convertUnit &&
    unitResult
) {

    convertUnit.addEventListener("click", function () {

        if (unitInput.value.trim() === "") {

            unitResult.textContent =
                "لطفاً یک عدد وارد کن.";

            return;

        }


        const value =
            Number(unitInput.value);


        const units = {

            km: 1000,

            m: 1,

            cm: 0.01

        };


        const result =
            value *
            units[unitFrom.value] /
            units[unitTo.value];


        const unitName =
            unitTo.options[
                unitTo.selectedIndex
            ].text;


        unitResult.textContent =
            result + " " + unitName;

    });

}


// =========================
// Grade Calculator
// =========================

constgradeInput =
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


if (
    gradeInput &&
    addGrade &&
    gradesList
) {

    addGrade.addEventListener("click", function () {

        const grade =
            Number(gradeInput.value);


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


if (
    calculateAverage &&
    averageResult
) {

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


// =========================
// Fraction → Decimal
// =========================

function fractionToDecimal() {

    const input =
        document
            .getElementById("fractionInput")
            .value
            .trim();


    const result =
        document.getElementById("fractionResult");


    const parts =
        input.split("/");


    if (parts.length !== 2) {

        result.textContent =
            "لطفاً یک کسر مثل 3/4 وارد کنید.";

        return;

    }


    const numerator =
        Number(parts[0]);


    const denominator =
        Number(parts[1]);


    if (
        isNaN(numerator) ||
        isNaN(denominator) ||
        denominator === 0
    ) {

        result.textContent =
            "کسر وارد شده معتبر نیست.";

        return;

    }


    result.textContent =
        "نتیجه: " +
        (numerator / denominator);

}


// =========================
// Decimal → Fraction
// =========================

function decimalToFraction() {

    const input =
        document
            .getElementById("fractionInput")
            .value
            .trim();


    const result =
        document.getElementById("fractionResult");


    const number =
        Number(input);


    if (isNaN(number)) {

        result.textContent =
            "لطفاً یک عدد اعشاری معتبر وارد کنید.";

        return;

    }


    if (Number.isInteger(number)) {

        result.textContent =
            "نتیجه: " +
            number +
            "/1";

        return;

    }


    const decimalPart =
        input.split(".")[1];


    const decimalPlaces =
        decimalPart
            ? decimalPart.length
            : 0;


    const denominator =
        Math.pow(10, decimalPlaces);


    let numerator =
        Math.round(
            number * denominator
        );


    function gcd(a, b) {

        while (b !== 0) {

            const temp = b;

            b = a % b;

            a = temp;

        }

        return Math.abs(a);

    }


    const divisor =
        gcd(
            numerator,
            denominator
        );


    numerator =
        numerator / divisor;


    const simplifiedDenominator =
        denominator / divisor;


    result.textContent =
        "نتیجه: " +
        numerator +
        "/" +
        simplifiedDenominator;

}

// =========================
// Loading Screen
// =========================

window.addEventListener("load", function () {

    const loadingScreen =
        document.getElementById("loadingScreen");

    if (!loadingScreen) {
        return;
    }

    setTimeout(function () {

        loadingScreen.style.opacity = "0";
        loadingScreen.style.visibility = "hidden";
        loadingScreen.style.pointerEvents = "none";

        setTimeout(function () {

            loadingScreen.style.display = "none";

        }, 400);

    }, 3000);

});
