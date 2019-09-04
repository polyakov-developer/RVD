import "../css/main.scss";

// --- libraries ---
import Noty from 'noty';
import slick from "slick-carousel";
import Swiper from "swiper";
import "magnific-popup";
import lightGallery from "lightgallery";
import accordionjs from "accordionjs";
import device from 'current-device';
import scrollLock from 'scroll-lock';
import tabs from "tabs";
import Cookies from "js-cookie";

const HTML              = document.querySelector("html");
const BODY              = document.body;
const HEADBAR           = document.querySelector(".headbar");
const HEADER            = document.querySelector(".header");
const BURGER            = document.querySelector(".menu-trigger");
const MOBILE_NAVIGATION = document.querySelector(".headbar .navigation");
const SEARCH_TRIGGER    = document.getElementById("search-trigger");
const SEARCH_CLEAR      = document.querySelector("#search-bar .clear-query");

// --- authors functions ---
import { addEventsForCustomValidation } from "./validateForm";
import cart from "./cart";
import constructor from "./constructor";
import convertor from "./convertor";

let searchStateSwitch = function(){
    let searchTrigger = SEARCH_TRIGGER,
        searchBar     = document.getElementById("search-bar");

    if (searchTrigger.classList.contains("active")) {
        searchTrigger.classList.remove("active");
        searchBar.classList.remove("search-bar--visible");
        searchBar.classList.add("search-bar--hidden");
    } else {
        searchTrigger.classList.add("active");
        searchBar.classList.remove("search-bar--hidden");
        searchBar.classList.add("search-bar--visible");
    }
};

let clearSearchQuery = function() {
    if ($("#search-bar input").val() == "") {
        searchStateSwitch();    
    } else {
        $("#search-bar input").val("");
    }
}

let mobileMenuAction = function() {
    if (BURGER.classList.contains("active")) {
        BURGER.classList.remove("active");
        MOBILE_NAVIGATION.classList.remove("visible");
        // scrollLock.enablePageScroll();
        scrollLock.enablePageScroll(document.querySelector("body"));
    } else {
        BURGER.classList.add("active");
        MOBILE_NAVIGATION.classList.add("visible");
        // scrollLock.disablePageScroll();
        scrollLock.disablePageScroll(document.querySelector("body"));
        scrollLock.addScrollableSelector(".headbar .navigation");
    }
}

let checkSrollYPostion = window.onscroll = function() {
    let scrolled     = window.pageYOffset || document.documentElement.scrollTop,
        headerHeight = 200;

    if (scrolled >= headerHeight) {
        HEADBAR.classList.add("headbar--sticky");
    } else if (scrolled < headerHeight) {
        HEADBAR.classList.remove("headbar--sticky");
    }
}

$(function(){
    SEARCH_TRIGGER.addEventListener("click", searchStateSwitch, false);
    SEARCH_CLEAR.addEventListener("click", clearSearchQuery, false);
    BURGER.addEventListener("click", mobileMenuAction, false);

    // Проверка координаты Y для отображения headbar
    checkSrollYPostion();
    
    // Добавляет обработчики событий для отправки всех форм ".form-feedback"
    addEventsForCustomValidation();

    // Смена шаблона каталога (список, сетка)
    $(".layout-tiles").on("click", function(){
        if ( !$(this).hasClass("active") ) {
            let $tile             = $(this),
                $layout           = $($tile).data("layout"),
                $catalogueWrapper = $(".catalogue-items-wrapper");

            $(".layout-tiles").removeClass("active");
            $($tile).addClass("active");

            switch($layout) {
                case "grid":
                    $($catalogueWrapper).fadeOut(500, () => {
                        $($catalogueWrapper).removeClass("list").addClass("grid")
                    }).fadeIn();
                    break;
                case "list":
                    $($catalogueWrapper).fadeOut(500, () => {
                        $($catalogueWrapper).removeClass("grid").addClass("list")
                    }).fadeIn();
                    break;
            }

            Cookies.set('catalog_view', $layout, { expires: 7, path: '/' });
        }
    });

    // Обработчик для обычных чек-боксов
    $("input[type='checkbox'][name != 'terms-and-conditions']").on("click", function(){
        let label = $(this).parent();
        $(label).toggleClass("checked");
    });

    // Обработчик для чек-боксов форм
    $("input[type='checkbox'][name='terms-and-conditions']").on("click", function(){
        let label = $(this).parent(),
            btnSubmit = $(this).parents("form").find("input[type='submit']");

        if ($(label).hasClass("checked")) {
            $(label).removeClass("checked");
            $(btnSubmit).prop("disabled", true);
        } else {
            $(label).addClass("checked");
            $(btnSubmit).prop("disabled", false);
        }
    });

    // Обработчик наведения на карточку товара к каталоге
    if ($("html").hasClass("desktop")) {
        let $prevItemScrollTop = 0;
        $(".catalogue-items-wrapper.grid .catalogue__item").hover(function(){
            if ($prevItemScrollTop > 0 && $(this).offset().top != $prevItemScrollTop) {
                $(".catalogue-items-wrapper.grid .catalogue__item").css("z-index", "0");
            }
            $prevItemScrollTop = $(this).offset().top;
            $(this).css("z-index", "2");
        }, function(){
            setTimeout(() => {
                $(this).css("z-index", "0");
            }, 350);
        });
    }
});

// --- initialize plugins ---

// --- BEGIN Slick ---
let heroSlider = $('#hero-slider').slick({
    autoplay: true,
    autoplaySpeed: 5000,
    dots: true,
    infinite: true,
    nextArrow: `<div class="next-arrow slider-arrow"><svg width="34" height="18" viewBox="0 0 34 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 9L32 9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M25 16L32 9L25 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`,
    prevArrow: `<div class="prev-arrow slider-arrow"><svg width="34" height="18" viewBox="0 0 34 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path d="M32 9H2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 16L2 9L9 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg></div>`,
    slidesToShow: 1,
    speed: 300,
    responsive: [
        {
            breakpoint: 681,
            settings: {
                arrows: false,
            }
        },
    ]
});

heroSlider.on("beforeChange", function(event, slick, currentSlide, nextSlide) {
    let prevColorTheme = slick.$slides[currentSlide].querySelector(".slide").getAttribute("data-color-theme"),
        nextColorTheme = slick.$slides[nextSlide].querySelector(".slide").getAttribute("data-color-theme");
        
    HEADER.classList.remove("header--" + prevColorTheme);
    HEADER.classList.add("header--" + nextColorTheme);
});

let productCardSliderTop = $(".product-card .images .slider.slider-top").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    dots: false,
    swipe: false,
    fade: true,
    asNavFor: '.slider-nav',
    responsive: [
        {
            breakpoint: 1025,
            settings: {
                arrows: false,
                swipe: true,
            }
        },
    ]
});

var productCardSliderNav = $(".product-card .images .slider.slider-nav").slick({
    slidesToShow: 4,
    slidesToScroll: 1,
    asNavFor: '.slider-top',
    arrows: false,
    dots: false,
    centerMode: false,
    centerPadding: "8px",
    swipe: false,
    focusOnSelect: true,
    responsive: [
        {
            breakpoint: 769,
            settings: {
                slidesToShow: 5
            }
        },
        {
            breakpoint: 421,
            settings: {
                slidesToShow: 3
            }
        }
    ]
});
// --- END Slick ---

// --- BEGIN Swiper ---
let ourPartnersSlider = new Swiper(".slider-our-partners", {
    autoplay: {
        delay: 2000,
        disableOnInteraction: false
    },
    loop: true,
    spaceBetween: 20,
    navigation: {
        prevEl: '.our-partners-block .slider-arrow.prev-arrow',
        nextEl: '.our-partners-block .slider-arrow.next-arrow',
    },
});

let specialOffersHTMLElem = document.querySelector(".slider-special-offers");
let specialOffersSlider = new Swiper(specialOffersHTMLElem, {
    loop: true,
    navigation: {
        prevEl: '.special-offers .slider-arrow.prev-arrow',
        nextEl: '.special-offers .slider-arrow.next-arrow',
    },
    slidesPerGroup: 1,
    slidesPerView: 4,
    loopFillGroupWithBlank: true,
    spaceBetween: 20,
    breakpoints: {
        420: {
            slidesPerView: 1,
            pagination: {
                el: '.special-offers .swiper-pagination',
                clickable: true,
            },
        },
        768: {
            slidesPerView: 2,
        },
        980: {
            slidesPerView: 3,
        }
    }
});

let similarGoodsSlider = new Swiper(".slider-similar-goods", {
    loop: true,
    navigation: {
        prevEl: '.similar-goods .slider-arrow.prev-arrow',
        nextEl: '.similar-goods .slider-arrow.next-arrow',
    },
    slidesPerGroup: 1,
    slidesPerView: 3,
    spaceBetween: 20,
    breakpoints: {
        420: {
            slidesPerView: 1,
            pagination: {
                el: '.similar-goods .swiper-pagination',
                clickable: true,
            },
        },
        768: {
            slidesPerView: 2,
        }
    }
});
// --- END Swiper ---

let vacancyAccordion = $(function() {
    $("#vacancy-accordion").accordionjs({
        activeIndex: false,
        closeAble: true,
    });
});

let filterAccordion = $(function() {
    $("#filter-accordion").accordionjs({
        activeIndex: false,
    });
});

let productCardLightgallery = $(function(){
    $("#product-card-lightgallery").lightGallery({
        selector: ".slider .slide a"
    });
});

let sertificatesLightgallery = $(function(){
    $("#sertificates-gallery").lightGallery({
        selector: ".sertificates__item a"
    });
});

let popupVideo = $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
    disableOn: 200,
    type: 'iframe',
    mainClass: 'mfp-fade',
    removalDelay: 160,
});


// --- Табы для внутряка товара ---
let tabContainer = document.querySelector(".tab-container");

if (tabContainer) {
    tabs(tabContainer);
}

window.onload = function() {
    $("#page-fader").addClass("page-load");

    setTimeout(() => {
        $("#page-fader").remove();
    }, 600);
}