"use strict";


window.addEventListener("load", function () {
    let preloader = document.getElementById("preloader");
    if (preloader) {
        preloader.style.display = "none";
        document.body.style.overflow = "visible";
    }
});

const navbar = document.querySelector(".navbar"),
      navOffCanvasBtn = document.querySelectorAll(".offcanvas-nav-btn"),
      navOffCanvas = document.querySelector(".navbar:not(.navbar-clone) .offcanvas-nav");

let bsOffCanvas;

function toggleOffCanvas() {
    if (bsOffCanvas) {
        bsOffCanvas._isShown ? bsOffCanvas.hide() : bsOffCanvas.show();
    }
}

if (navOffCanvas) {
    bsOffCanvas = new bootstrap.Offcanvas(navOffCanvas, { scroll: true });
    navOffCanvasBtn.forEach(btn => btn.addEventListener("click", toggleOffCanvas));
}

window.addEventListener("scroll", function () {
    let stickyHeight = document.querySelector(".sticky-height"),
        headerNav = document.querySelector(".header-nav-wrapper"),
        headerTop = document.querySelector(".header-top");

    if (headerNav) {
        let navHeight = headerNav.offsetHeight,
            topHeight = headerTop ? headerTop.offsetHeight : 0,
            scrollThreshold = topHeight + 200;

        if (window.scrollY > scrollThreshold) {
            headerNav.classList.add("scroll-on");
            if (stickyHeight) stickyHeight.style.height = navHeight + "px";
        } else {
            headerNav.classList.remove("scroll-on");
            if (stickyHeight) stickyHeight.style.height = "0";
        }
    }
});

// Back to top button functionality
const backToTop = document.querySelector(".back-top");
if (backToTop) {
    window.addEventListener("scroll", function () {
        window.scrollY >= 800 ? backToTop.classList.add("back-top-show") : backToTop.classList.remove("back-top-show");
    });
    backToTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// Lightbox initialization
const lightbox = GLightbox({
    touchNavigation: true,
    loop: true,
    selector: ".cover-video,.play-btn",
    autoplayVideos: true
});

// Review Slider
new Swiper(".review-slider", {
    loop: true,
    slidesPerView: 1,
    autoplay: true
});

// Tooltip initialization
document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(tooltip => {
    new bootstrap.Tooltip(tooltip);
});

// Course Preview Hide on Scroll
const coursePreview = document.querySelector(".course-preview");
if (coursePreview) {
    window.addEventListener("scroll", function () {
        coursePreview.style.display = window.scrollY > 250 ? "none" : "block";
    });
}

// Price Range Slider
const priceRange = document.getElementById("priceRange");
if (priceRange) {
    noUiSlider.create(priceRange, {
        connect: true,
        start: [10, 150],
        range: { min: 10, max: 250 }
    });

    const priceValue = document.getElementById("priceRange-value");
    if (priceValue) {
        priceRange.noUiSlider.on("update", function (values) {
            priceValue.innerHTML = values.join(" - ");
        });
    }
}
