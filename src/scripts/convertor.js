import Selectric from "selectric";

const value_1    = document.getElementById("value-1");
const value_2    = document.getElementById("value-2");
const measure_1  = document.getElementsByName("measure-1")[0];
const measure_2  = document.getElementsByName("measure-2")[0];

let measureList = {
        "bar": {
            name_eng: "bar",
            name_rus: "бар",
            description: "Бар",
            values: {
                "mpa": 0.1,
                "atm": 0.986923267,
                "kgf": 1.019716102,
                "psi": 14.503423697
            }
        },
        "mpa": {
            name_eng: "mpa",
            name_rus: "Мпа",
            description: "мега Паскаль",
            values: {
                "bar": 10,
                "atm": 9.869232667,
                "kgf": 10.19716213,
                "psi": 145.037737797
            }
        },
        "atm": {
            name_eng: "atm",
            name_rus: "атм",
            description: "физическая атмосфера",
            values: {
                "bar": 1.01325,
                "mpa": 0.101325011,
                "kgf": 1.033227453,
                "psi": 14.696
            }
        },
        "kgf": {
            name_eng: "kgf",
            name_rus: "кГс/см²",
            description: "килограмм-силы на квадратный сантиметр",
            values: {
                "bar": 0.980665,
                "mpa": 0.0980665,
                "atm": 0.967841105,
                "psi": 14.223343314
            }
        },
        "psi": {
            name_eng: "psi",
            name_rus: "фунт/дюйм²",
            description: "фунт-сила на квадратный дюйм",
            values: {
                "bar": 0.068949237,
                "mpa": 0.006894924,
                "atm": 0.068045727,
                "kgf": 0.070308647
            }
        }
    },
    arrMeasure = document.querySelectorAll(".measure"),
    regexp = /^(\d*\.)?\d+$/;

function calculate(valueFrom, valueTo, measureFrom, measureTo) {
    if (regexp.test(valueFrom.value) == false) {
        return;
    }

    if (measureFrom.value == measureTo.value)
        measureTo.value = Object.keys(measureList[measureFrom.value].values)[0];

    let calculate = measureList[measureFrom.value].values[measureTo.value];

    valueTo.value = parseInt( (parseFloat(valueFrom.value) * calculate) * 100 ) / 100;
}

function createHTMLOptions() {
    for (let i = 0; i < arrMeasure.length; i++) {
        arrMeasure[i].innerHTML = "";

        for (let key in measureList) {
            let option = arrMeasure[i].appendChild(document.createElement("option"));
            
            option.value = measureList[key].name_eng;
            option.text  = measureList[key].name_rus;
            option.title = measureList[key].description;
        }
    }
}

function addEvents() {
    value_1.addEventListener("change", function() {
        calculate(value_1, value_2, measure_1, measure_2);
    }, false);

    value_2.addEventListener("change", function() {
        calculate(value_2, value_1, measure_2, measure_1);
    }, false);

    value_1.addEventListener("keyup", function() {
        calculate(value_1, value_2, measure_1, measure_2);
    }, false);

    value_2.addEventListener("keyup", function() {
        calculate(value_2, value_1, measure_2, measure_1);
    }, false);

    measure_1.addEventListener("change", function() {
        calculate(value_1, value_2, measure_1, measure_2);
    }, false);

    measure_2.addEventListener("change", function() {
        calculate(value_1, value_2, measure_1, measure_2);
    }, false);
}

function startConvertor() {
    createHTMLOptions();

    try {
        addEvents();
        calculate(value_1, value_2, measure_1, measure_2);
    } catch (ex) {}
}

$(function() {
    startConvertor();

    if ( !document.querySelector(".selectric") ) {
        $('.tpl-variable-part select').selectric({
            disableOnMobile: false,
            nativeOnMobile: false,
        });

        $('.convertor select').selectric({
            disableOnMobile: false,
            nativeOnMobile: false,
            onChange: function() {
                calculate(value_1, value_2, measure_1, measure_2);
            }
        });
    }
});