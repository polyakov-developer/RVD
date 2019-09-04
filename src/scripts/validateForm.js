const Noty = require('noty');
const Inputmask = require('inputmask');
const recaptchaPuclibKey = "6LcGLZMUAAAAAF9exzAYT02l4VUafetc5s1BV72v";

let isContinue = true;

export function addEventsForCustomValidation() {
    let arrForms = document.querySelectorAll("form.form-ajax");

    for (let i = 0; i < arrForms.length; i++) {
        let currentForm = arrForms[i],
            elements = currentForm.elements;

        for (let i = 0; i < elements.length; i++) {
            if (elements[i].classList.contains("required")) {
                elements[i].addEventListener("focusout", validationField, false);
                elements[i].addEventListener("keyup", validationField, false);
            }
        }
        
        currentForm.addEventListener("submit", сustomSubmitForm, false);
    }
};

let сustomSubmitForm = function(event) {
    event.preventDefault();

    let form = this,
        elements = form.elements,
        errMsg = form.querySelector(".error-msg");

    for (let i = 0; i < elements.length; i++) {
        if (validationField(null, elements[i]) == false) {
            isContinue = false;

            if (errMsg) {
                errMsg.innerHTML = "Заполните все обязательные поля";
                errMsg.classList.add("error-msg--visible");

                setTimeout(function(){
                    errMsg.innerHTML = "";
                    errMsg.classList.remove("error-msg--visible");
                }, 2000);
            }

            break;
        }
    }

    if (isContinue) {
        let formData        = new FormData(form),
            formAction      = form.getAttribute("action"),
            formSuccessMsg  = form.querySelector(".success-message"),
            recaptchaAction = "/netcat/add";

        grecaptcha.ready(function() {
            grecaptcha
            .execute(recaptchaPuclibKey, {action: recaptchaAction})
            .then(function(token){
                formData.append('token', token);
                formData.append('action', recaptchaAction);
                
                $.ajax({
                    url: formAction,
                    type: "POST",
                    data: formData,
                    dataType: "JSON",
                    contentType: false,
                    cache: false,
                    processData: false,
                    success: function (data) {
                        switch (data["status"]) {
                            case "error": 
                                form.reset();
                                showNoty("error", data["message"]);
                                break;
                            case "success":
                                try { formSuccessMsg.classList.add("success-message--visible"); }
                                catch (e) {}
                                form.reset();
                                showNoty("success", data["message"]);
                                break;
                        }
                    },
                    error: function (xhr, status, desc) {
                        showNoty("error", "Во время отправки произошла ошибка. Пожалуйста, передайте нам следующую информацию: <br>" + "Статус ошибки: " + status + "<br>" + "Описание ошибки: " + desc);
                    }
                });
            });
        });
    }
};

export function validationField(event, _field) {
    let field = event ? event.target : _field;

    if (field.getAttribute("type") !== "checkbox" && field.value === "" && field.classList.contains("required")) {
        isContinue = false;
        field.classList.add("invalid");
        return false;
    } else {
        isContinue = true;
        field.classList.remove("invalid");
        return true;
    }
}

let showNoty = function(_type, _text) {
    new Noty({
        theme: "metroui",
        layout: "bottomLeft",
        animation: {
            open: 'animated bounceInLeft',
            close: 'animated bounceOutLeft'
        },
        text: _text,
        type: _type,
        timeout: 3000
    }).show();
}

$(() => {
    let arrInputTel = document.querySelectorAll("input[type='tel'], input[name='f_Phone'], input[name='f_Telephone']"),
        arrInputEmail = document.querySelectorAll("input[name='email'], input[name='f_Email']"),
        im_tel = new Inputmask("+7 (999) 999-99-99", {
            positionCaretOnClick: "radixFocus",
            showMaskOnHover: false,
            clearIncomplete: true,
        }),
        im_email = new Inputmask("*{1,20}[.*{1,20}][.*{1,20}][.*{1,20}]@*{1,20}[.*{2,6}][.*{1,2}]", {
            onBeforePaste: function (pastedValue, opts) {
                pastedValue = pastedValue.toLowerCase();
                return pastedValue.replace("mailto:", "");
            },
            definitions: {
                '*': {
                    validator: "[0-9A-Za-z!#$%&'*+/=?^_`{|}~\-]",
                    casing: "lower",
                }
            },
            positionCaretOnClick: "radixFocus",
            showMaskOnHover: false,
            clearIncomplete: true,
        });

    for (let i = 0; i < arrInputTel.length; i++) {
        im_tel.mask(arrInputTel[i]);
    }

    for (let i = 0; i < arrInputEmail.length; i++) {
        arrInputEmail[i].type = "text";
        im_email.mask(arrInputEmail[i]);
    }
});