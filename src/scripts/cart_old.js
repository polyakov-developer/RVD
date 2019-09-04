// Получить данные корзины из localStorage
let getCartData = function() {
    return JSON.parse(localStorage.getItem("cart"));
}

// Записать данные корзины в localStorage
let setCartData = function(obj) {
    localStorage.setItem("cart", JSON.stringify(obj));
    updateCart();
}

// Обновить корзину на сервере
let updateCartOnServer = function() {
    let cartData = JSON.stringify(getCartData);

    $.ajax({
        url: "/",
        type: "POST",
        data: cartData,
        success: function(data) {
            console.log(data);
        },
        error: function(jqXHR, status, desc) {
            console.log("status: ", status);
            console.log("error: ", desc);
        }
    });
}

// Обновить корзину
let updateCart = function() {
    let cartValue  = document.querySelector(".cart .value"),
        cartData   = getCartData(),
        cartLength = Object.keys(cartData).length,
        totalItems = cartLength >= 1 ? declOfNum(Object.keys(cartData).length) : "Пока пусто :(";

    cartValue.innerHTML = totalItems;
}

// Добавить в корзину
let addToCart = function(event) {
    event.preventDefault();

    this.disabled = true;

    let form = this.parentNode,
        formData = new FormData(form);

    console.log(form);

    /*let arrCart = getCartData() || {},
        itemID  = this.getAttribute("data-id"),
        itemName = this.getAttribute("data-name"),
        itemQty = parseInt(this.getAttribute("data-qty")),
        itemUnits = this.getAttribute("data-units"),
        itemClassID = this.getAttribute("data-class-id"),
        itemInner = this.getAttribute("data-inner");

    if (arrCart.hasOwnProperty(itemID)) {
        let currentQty = parseInt(arrCart[itemID].qty),
            totalQty   = itemInner ? itemQty : currentQty + itemQty;

        arrCart[itemID].qty = totalQty > 99 ? 99 : totalQty;
    } else {
        arrCart[itemID] = {
            "name": itemName,
            "qty": itemQty,
            "class_id": itemClassID,
            "units": itemUnits,
        }
    }*/

    // setCartData(arrCart);

    this.disabled = false;
}

// Удалить из корзины
let removeFromCart = function() {
    this.disabled = true;

    let itemID      = this.getAttribute("data-id"),
        itemClassID = this.getAttribute("data-class-id"),
        cartData    = getCartData();

    delete cartData[itemID];

    setCartData(cartData);
}

// Изменить кол-во
let changeQty = function(event, input, qty) {
    let buttonBuy     = document.querySelector(".tpl-link-cart-add") || null,
        totalQuantity = 0;

    event = event || null;
    input = input || this;

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

    if (buttonBuy) buttonBuy.setAttribute("data-qty", totalQuantity);
}

// Обработчик клика по кнопкам кол-ва
let clickButtonQty = function() {
    this.disabled = true;

    let typeButton = this.getAttribute("data-type"),
        inputQty   = this.parentNode.querySelector("input[name='qty']"),
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

// Склонение по падежам
let declOfNum = function(digit) {
    digit %= 100;
    
    if (digit > 19) digit %= 10;

    switch (true) {
        case (digit == 1):
            return digit + " товар";
        case (digit >= 2 && digit <= 4):
            return digit + " товара";
        default:
            return digit + " товаров";
    }
}

// Добавить событие на кнопку "купить"
let addEventOnBuyButtons = function() {
    let arrButtons = document.getElementsByClassName("tpl-link-cart-add");

    for (let i = 0; i < arrButtons.length; i++) {
        arrButtons[i].addEventListener("click", addToCart, false);       
    }
}

// Добавить событие на кнопку "удалить из корзины"
let addEventOnRemoveButton = function() {
    let arrButtons = document.getElementsByClassName("tpl-link-cart-remove");

    for (let i = 0; i < arrButtons.length; i++) {
        arrButtons[i].addEventListener("click", removeFromCart, false);       
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
    let arrInputQty = document.querySelectorAll("input[name='qty']");

    for (let i = 0; i < arrInputQty.length; i++) {
        arrInputQty[i].addEventListener("keyup", changeQty, false);
    }
}

$(function(){
    addEventOnBuyButtons();
    addEventOnRemoveButton();
    addEventOnQtyButtons();
    addEventOnQtyInput();
});