import { validationField } from "./validateForm";
import scrollLock from 'scroll-lock';

const Noty = require('noty');

// Добавить событие на селектор .tpl-link-cart-add
let addEventOnBuyButton = function() {
    let arrButtons = document.getElementsByClassName("tpl-link-cart-add");

    for (let i = 0; i < arrButtons.length; i++) {
        arrButtons[i].addEventListener("click", clickOnButtonAddToCart, false);       
    }
}

// Добавить событие на селектор .tpl-link-cart-add-and-checkout
let addEventOnBuyOnClickButton = function() {
    let arrButtons = document.getElementsByClassName("tpl-link-cart-add-and-checkout");

    for (let i = 0; i < arrButtons.length; i++) {
        arrButtons[i].addEventListener("click", clickOnButtonBuyOnClick, false);       
    }
}

// Добавить событие на селектор .tpl-link-cart-remove
let addEventOnRemoveButton = function() {
    let arrButtons = document.getElementsByClassName("tpl-link-cart-remove");

    for (let i = 0; i < arrButtons.length; i++) {
        arrButtons[i].addEventListener("click", clickOnButtonRemoveFromCart, false);       
    }
}

// Добавить событие на кнопки "больше/меньше"
let addEventOnQtyButtons = function() {
    let arrButtons = document.getElementsByClassName("qty-button");

    for (let i = 0; i < arrButtons.length; i++) {
        arrButtons[i].addEventListener("click", clickButtonQty, false);       
    }
}

// Добавить событие на изменение кол-ва в input[name='qty']
let addEventOnQtyInput = function() {
    let arrInputQty = document.querySelectorAll("input.input-qty");

    for (let i = 0; i < arrInputQty.length; i++) {
        arrInputQty[i].addEventListener("keyup", changeQty, false);
    }
}

// Добавить обработчик на форму оформления заказа
let addEventOnFormOrder = function() {
    let formOrder = document.querySelector(".form-checkout");
    formOrder.addEventListener("submit", customSubmitFormOrder, false);
}

/**
 * Обработка ответа корзины
 * @param {Object} response - Содержимое корзины
 */ 
let processCartResponse = function(response) {
    let totalItems = response.TotalCount,
        totalItemsCost = response.TotalItemPriceF,
        $headerCartTotalItems = $("#cart .value"),
        $headerCartTotalItems__mobile = $("#cart-mobile .value"),
        $cartWrapper = $(".cart-wrapper"),
        $cartTotalCost = $(".total-cost .value", $cartWrapper),
        $cartTotalItems = $(".you-order .cart-quantity .value", $cartWrapper),
        strResult = "";

    if (totalItems < 1) {
        strResult = `
            <h2>Ваша корзина пуста</h2>
            <p>Самое время добавить нее что-нибудь</p>
            <div class="button-wrapper">
                <a class="button" href="/catalogue/">Перейти в каталог</a>
            </div>
        `;
        $headerCartTotalItems.html("Пока пусто :(");
        $headerCartTotalItems__mobile.html("");
        $headerCartTotalItems__mobile.removeClass("not-empty");
        $cartWrapper.html(strResult);
    } else {
        strResult = declOfNum(totalItems, ["товар", "товара", "товаров"]);
        $headerCartTotalItems.html(totalItems + " " + strResult);
        $headerCartTotalItems__mobile.html(totalItems);
        $headerCartTotalItems__mobile.addClass("not-empty");
        $cartTotalItems.html(totalItems);
        $cartTotalCost.html(totalItemsCost);
    }
}

/**
 * 
 * @param {HTMLElement} form - HTML форма товара
 */
let updateCart = function(form) {
    let formAction = form.action,
        formData   = $(form).serializeArray();

    $.ajax({
        type: "POST",
        url: formAction,
        data: formData,
        dataType: "JSON",
        success: function(response) {
            processCartResponse(response);
        },
        error: function(xhr, status, error) {
            console.log("xhr: ", xhr);
            console.log("status: ", status);
            console.log("error: ", error);
        }
    });
}

/**
 * Добавить в корзину
 * @param {Event} event - Событие «submit»
 */
let clickOnButtonAddToCart = function(event) {
    event.preventDefault();

    let btnSubmit  = this,
        form       = btnSubmit.form,
        formAction = form.action,
        formData   = $(form).serialize();

    btnSubmit.disabled = true;
    
    $.ajax({
        type: "POST",
        url: formAction,
        data: formData,
        dataType: "JSON",
        success: function(response) {
            processCartResponse(response);
            btnSubmit.disabled = false;
            showNoty("success", "Товар успешно добавлен в корзину");
        },
        error: function(xhr, status, error) {
            showNoty("error", "Произошла ошибка при добавлении в корзину. <br> Пожалуйста, повторите попытку позже");
            console.log("xhr: ", xhr);
            console.log("status: ", status);
            console.log("error: ", error);
        }
    });
}

/**
 * Купить в 1 клик
 * @param {Event} event - Событие «submit»
 */
let clickOnButtonBuyOnClick = function(event) {
    event.preventDefault();

    let formID = this.getAttribute("data-form");

    $.magnificPopup.open({
        items: {
            src: "#" + formID,
        },
        type: 'inline',
        mainClass: "mfp-zoom-in",
        midClick: true,
        overflowY: 'auto',
        closeBtnInside: true,
        fixedContentPos: true,
        callbacks: {
            open: function() {
                scrollLock.disablePageScroll(document.querySelector("body"));
                scrollLock.addScrollableSelector(".mfp-wrap");
            },
            close: function() {
                scrollLock.enablePageScroll(document.querySelector("body"));
            }
        }
    });
}

/**
 * Удалить товар из корзины
 * @param {Event} event - событие «submit»
 */
let clickOnButtonRemoveFromCart = function(event) {
    event.preventDefault();

    let $btnSubmit = $(this),
        btnSubmit = this,
        itemID = btnSubmit.name,
        form = btnSubmit.form,
        formAction = form.action,
        formData = "&" + itemID + "=0&json=1",
        $productTableRow = $($btnSubmit).parents("tr");


    $.ajax({
        type: "POST",
        url: formAction,
        data: formData,
        dataType: "JSON",
        success: function(response) {
            processCartResponse(response);
            showNoty("success", "Товар успешно удален из корзины");
            $($productTableRow).remove();
        },
        error: function(xhr, status, error) {
            showNoty("error", "Произошла ошибка при удалении товара из корзины");
            console.log("xhr", xhr);
            console.log("status", status);
            console.log("error", error);
        }
    });
}

/**
 * Изменение значения в .input-qty
 * @param {Event} event       - Событие «change»
 * @param {HTMLElement} input - HTML елемент «input[name='qty']»
 * @param {Number} qty        - Количество товара
 */ 
let changeQty = function(event, input, qty) {
    let totalQuantity = 0;

    event = event || null;
    input = input || this;

    let form = input.form;

    let inputQtyFormBuyOneClick = document.querySelector("input[name=f_ItemQty]") || null;

    if (event) {
        let currentValue = parseInt(input.value);
        switch (true) {
            case (currentValue < 1 || isNaN(currentValue)):
                totalQuantity = 1;
                break;
            case currentValue > 99:
                totalQuantity = 99;
                break;
            default:
                totalQuantity = currentValue;
        }
    } else {
        totalQuantity = qty;
    }

    input.value = totalQuantity;

    if (inputQtyFormBuyOneClick !== null) {
        inputQtyFormBuyOneClick.setAttribute('value', totalQuantity);
    }

    if (window.location.pathname == "/cart/") updateCart(form);
}

/**
 * Обработчик клика по кнопкам "изменить кол-во"
 * @param {Event} event - Событие «submit»
 */
let clickButtonQty = function(event) {
    event.preventDefault();
    
    this.disabled = true;

    let typeButton = this.getAttribute("data-type"),
        inputQty   = this.parentNode.querySelector("input.input-qty"),
        quantity   = parseInt(inputQty.value);

    if (typeButton == "minus") {
        if (quantity > 1 && quantity <= 99) {
            quantity -= 1;
        } else if (quantity > 99) {
            quantity = 99;
        } else if (quantity < 1) {
            quantity = 1;
        }
    } else if (typeButton == "plus") {
        quantity = quantity < 99 ? quantity + 1 : 99;
    }

    changeQty(null, inputQty, quantity);

    this.disabled = false;
}

/**
 * Склонение по падежам
 * @param {Number} digit - Количество товаров
 * @param {Array} words[0] - «товар»  
 * @param {Array} words[1] - «товара»
 * @param {Array} words[2] - «товаров»
 */ 
let declOfNum = function(digit, words) {
    digit %= 100;
    
    if (digit > 19) digit %= 10;

    switch (true) {
        case (digit == 1):
            return words[0];
        case (digit >= 2 && digit <= 4):
            return words[1];
        default:
            return words[2];
    }
}

/**
 * Обработчик отправки формы оформления заказа
 * @param {Event} event - Событие «submit»
 */
let customSubmitFormOrder = function(event) {
    let form = this,
        elements = form.elements,
        errMsg = form.querySelector(".error-msg"),
        isContinue = true;

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

    if (isContinue == false) {
        event.preventDefault();
    }
}

/**
 * Показать сообщение пользователю
 * @param {String} _type - Тип сообщения (success/error)
 * @param {String} _text - Текст сообщения
 */
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

$(function(){
    try {
        addEventOnBuyButton();
        addEventOnBuyOnClickButton();
        addEventOnRemoveButton();
        addEventOnQtyButtons();
        addEventOnQtyInput();
        addEventOnFormOrder();
    } catch (e) {

    }
});