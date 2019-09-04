import Selectric from "selectric";

const additionalRequirements = document.getElementById("additional-requirements");
const Noty = require("noty");

let arrFormulaFields = document.querySelectorAll(".formula-field__input"),
	arrConstructorSelects = document.querySelectorAll(".field select"),
	arrConstructorInputs = document.querySelectorAll(".field:not(.additional) > input"),
	arrConstructorCheckboxes = document.querySelectorAll(".field.additional label.checkbox"),
	buttonAddRequest = document.querySelector(".add-to-request"),
	arrayToRequest = {};

let arrConstructorFields = {
	"Property_Diameter": {
		nextProperty: "Property_Pressure",
		prefix: "РВД-",
		parentProperties: null
	},
	"Property_Pressure": {
		nextProperty: "Property_Length",
		prefix: "P",
		parentProperties: [
			"Property_Diameter"
		]
	},
	"Property_Length": {
		nextProperty: "Property_FitingStandart",
		prefix: "L",
		parentProperties: null
	},
	"Property_FitingStandart": {
		nextProperty: "Property_CapheadExecution",
		prefix: null,
		parentProperties: [
			"Property_Diameter"
		]
	},
	"Property_CapheadExecution": {
		nextProperty: "Property_Thread",
		prefix: null,
		parentProperties: [
			"Property_Diameter",
			"Property_FitingStandart"
		]
	},
	"Property_Thread": {
		nextProperty: "Property_BendingAngle",
		prefix: null,
		parentProperties: [
			"Property_Diameter",
			"Property_FitingStandart",
			"Property_CapheadExecution"
		]
	},
	"Property_BendingAngle": {
		nextProperty: "Property_FitingStandart",
		prefix: null,
		parentProperties: [
			"Property_Diameter",
			"Property_FitingStandart",
			"Property_CapheadExecution",
			"Property_Thread"
		]
	}
};

$(function () {
	try {
		addEventToConstructorInputs();
		addEventToConstructorCheckboxes();
		addEventToButtonRequest();
		addEventToOrderButtons();

		if ( !document.querySelector(".selectric") ) {
			$('select').selectric({
				disableOnMobile: false,
				nativeOnMobile: false,
			});
		}
		
	} catch (ex) { }
});

$('.constructor select').on("selectric-change", function (event, element, selectric) {
	handlerChangeFieldValue(null, element);
});

// #Add events

let addEventToConstructorInputs = function () {
	for (let i = 0; i < arrConstructorInputs.length; i++) {
		arrConstructorInputs[i].addEventListener("change", handlerChangeFieldValue, false);
	}
}

let addEventToConstructorCheckboxes = function () {
	for (let i = 0; i < arrConstructorCheckboxes.length; i++) {
		arrConstructorCheckboxes[i].addEventListener("click", handlerCheckboxClick, false);
	}
}

let addEventToButtonRequest = function () {
	buttonAddRequest.addEventListener("click", function () {
		writeDataToOrderItem();
	}, false);
}

let addEventToOrderButtons = function () {
	let arrActionButtons = document.querySelectorAll(".total-order__item button");

	for (let i = 0; i < arrActionButtons.length; i++) {
		arrActionButtons[i].addEventListener("click", handlerActionButtonsTotalOrder, false);
	}
}

// #Functions

let handlerChangeFieldValue = function (event, element) {
	/**
	 * curElem - текущий изменяемый элемент (DOM)
	 * curPropName - имя текущего элемента (Массив)
	 * nextElemName - имя зависимого поля от текущего (DOM)
	 * nextPropName - имя зависимого поля от текущего (Массив)
	 * nextPropParents - от каких полей зависит (Массив)
	 * _parentProperties - массив родителей для запроса на сервер
	 * */

	let curElem = element || this,
		curPropName = curElem.getAttribute("data-property"),
		nextElemName = curElem.getAttribute("data-next-property"),
		nextPropName,
		nextPropParents,
		formulaFieldElem = document.getElementById(curElem.name),
		prefix = arrConstructorFields[curPropName].prefix || "",
		_parentProperties = {};

	// Очистить значения всех полей, идущих после изменяемого
	/*let testArr = Object.keys(arrConstructorFields),
		index = testArr.indexOf(curPropName) + 1;

	for (index; index < testArr.length; index++) {
		var arrElems = document.querySelectorAll("[data-property='" + testArr[index] + "']");

		for (let i = 0; i < arrElems.length; i++) {
			
			if (arrElems[i].tagName == "SELECT") {
				arrElems[i].selectedIndex = 0;
			} else {
				arrElems[i].value = "";
				arrElems[i].text = "";
			}

			arrElems[i].disabled = true;
		}

		$("select").selectric("refresh");
	}*/

	// Если у изменяемого элемента, есть зависимый
	if (nextElemName) {
		nextPropName = arrConstructorFields[curPropName].nextProperty;
		nextPropParents = arrConstructorFields[nextPropName].parentProperties;

		if (nextPropParents !== null && nextPropParents.length > 0) {
			for (let i = 0; i < nextPropParents.length; i++) {
				_parentProperties[nextPropParents[i]] = document.querySelector("[data-property='" + nextPropParents[i] + "']").value;
			}
		}

		arrayToRequest = {
			property: nextPropName,
			parentProperties: _parentProperties,
			htmlElemName: nextElemName
		}
	
		ajaxRequest(arrayToRequest);

	} else {
		document.querySelector(".add-to-request").disabled = false;
	}

	// Запишем в поле формулы значение измененного поля
	formulaFieldElem.value = formulaFieldElem.text = prefix + curElem.value;
}

let updateConstructorField = function(response) {
	let currentPropertyElem = document.querySelector("[name='" + arrayToRequest.htmlElemName + "']");

	// Если с результат сервера не пустой, запишем данные
	if (response) {
		currentPropertyElem.innerHTML = "";

		let defaultOption = document.createElement("option");

		defaultOption.value = "";
		defaultOption.text = "Выбрать";
		defaultOption.selected = defaultOption.disabled = true;

		currentPropertyElem.appendChild(defaultOption);
		
		for (let key in response) {
			if (response.hasOwnProperty(key)) {
				let option = document.createElement("option");
				
				option.value = option.text = response[key];

				currentPropertyElem.appendChild(option);
			}
		}
	}

	// Разблокируем поле
	currentPropertyElem.disabled = false;

	$('select').selectric('refresh');
}

let handlerCheckboxClick = function () {
	let arrAdditionalRequirements = document.querySelectorAll("input[name='additional-requirements[]']:checked"),
		resultString = [];

	for (let i = 0; i < arrAdditionalRequirements.length; i++) {
		resultString.push(arrAdditionalRequirements[i].value);
	}

	resultString = resultString.join(", ");

	additionalRequirements.value = resultString;
}

let createNewOrderItem = function () {
	let totalOrder = document.querySelector(".total-order"),
		numberOfItem = totalOrder.childElementCount + 1,
		newOrderItem = document.createElement("div"),
		pattern = `<div class="number">` + numberOfItem + `.</div>
						<div class="field-wrapper">
							<input type="text" class="required" name="f_OrderItem[Formula][]" placeholder="Формула">
							<input type="text" class="required" name="f_OrderItem[Quantity][]" placeholder="Кол-во">
							<input type="text" class="required" name="f_OrderItem[ExtraInfo][]" placeholder="Доп. информация">
						</div>
						<div class="buttons">
							<button class="add"></button>
							<button class="remove"></button>
						</div>`;

	newOrderItem.setAttribute("class", "total-order__item");
	newOrderItem.innerHTML = pattern;

	totalOrder.appendChild(newOrderItem);
	addEventToOrderButtons();

	return newOrderItem;
}

let writeDataToOrderItem = function () {
	let arrTotalOrderItems = document.querySelector(".total-order").children,
		additionalInfo = additionalRequirements.value,
		formula = "",
		elemToWrite = null,
		isContinue = true;

	for (let i = 0; i < arrFormulaFields.length; i++) {
		if (arrFormulaFields[i].value != "") {
			formula += arrFormulaFields[i].value + " ";
		} else {
			continue;
		}
	}

	for (let i = 0; i < arrTotalOrderItems.length; i++) {
		let curOrderItem = arrTotalOrderItems[i].querySelectorAll("input[name='f_OrderItem[Formula][]']");

		for (let j = 0; j < curOrderItem.length; j++) {
			if (curOrderItem[j].value == "") {
				elemToWrite = arrTotalOrderItems[i];
				isContinue = false;
				break;
			} else {
				continue;
			}
		}

		if (isContinue == false) break;
	}

	if ((elemToWrite == null) && (formula != "" || additionalInfo != "")) {
		elemToWrite = createNewOrderItem();
	}

	elemToWrite.querySelector("input[name='f_OrderItem[Formula][]']").value = formula;
	elemToWrite.querySelector("input[name='f_OrderItem[ExtraInfo][]']").value = additionalInfo;

	clearConstructor();
}

let clearConstructor = function () {
	for (let i = 0; i < arrFormulaFields.length; i++) {
		arrFormulaFields[i].value = "";
	}

	for (let i = 0; i < arrConstructorSelects.length; i++) {
		arrConstructorSelects[i].selectedIndex = 0;

		if (arrConstructorSelects[i].classList.contains("not-disabled") == false)
			arrConstructorSelects[i].disabled = true;
	}

	for (let i = 0; i < arrConstructorInputs.length; i++) {
		arrConstructorInputs[i].value = "";

		if (arrConstructorInputs[i].classList.contains("not-disabled") == false)
			arrConstructorInputs[i].disabled = true;
	}

	for (let i = 0; i < arrConstructorCheckboxes.length; i++) {
		arrConstructorCheckboxes[i].classList.remove("checked");
		arrConstructorCheckboxes[i].querySelector("input[type='checkbox']").checked = false;
	}

	additionalRequirements.value = "";

	document.querySelector("[name='inside-diameter']").disabled = false;
	
	$("select").selectric("refresh");
}

let handlerActionButtonsTotalOrder = function (event) {
	event.preventDefault();

	let curBtn = this,
		action = curBtn.getAttribute("class");

	if (action == "add") {
		createNewOrderItem();
	} else if (action == "remove") {
		curBtn.closest(".total-order__item").remove();
		updateNumberOfOrderItems();
	}
}

let updateNumberOfOrderItems = function () {
	let totalOrderItems = document.querySelector(".total-order").children;

	for (let i = 0; i < totalOrderItems.length; i++) {
		let number = totalOrderItems[i].querySelector(".number");

		number.innerHTML = i + 1 + ".";
	}
}

let createNotyfi = function (_type, _text) {
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

// #Ajax

let ajaxRequest = function(dataArray) {
	var action = "http://rvd.alkondev.ru/constructor/";

	$.ajax({
		method: "POST",
		url: action || window.location.href + "?isNaked=1",
		dataType: "JSON",
		data: dataArray,
		success: (response) => {
			updateConstructorField(response);
		},
		error: (jqXHR, textStatus, errorThrown) => {
			createNotyfi("error", "Произошла ошибка на сервере");

			console.log("jqXHR: ", jqXHR);
			console.log("textStatus: ", textStatus);
			console.log("errorThrown: ", errorThrown);
		}
	})
}