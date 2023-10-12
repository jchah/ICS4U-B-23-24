document.addEventListener("DOMContentLoaded", function () {
    // Array of image sources
    const imageSources = {
        modern: [
        ],
        traditional: [
        ],
        apartments: [
        ],
    };

    for (let i = 1; i <= 12; i++) {
        imageSources.modern[i - 1] = "img/modern" + i + ".jpg";
        imageSources.traditional[i - 1] = "img/trad" + i + ".jpg";
        imageSources.apartments[i - 1] = "img/ap" + i + ".jpg";
    }

    const pageName = window.location.pathname.split('/').pop().split('.')[0];

    const pageImages = imageSources[pageName];


    const imageGrid = document.querySelector(".image-grid");

    // Loop through image sources and create image containers
    pageImages.forEach((src, index) => {
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("image-container");

        const image = document.createElement("img");
        image.src = src;
        image.alt = `Image ${index + 1}`;

        const priceOverlay = document.createElement("div");
        priceOverlay.classList.add("price-overlay");
        let randPrice = Math.floor(Math.random() * (5000000 - 1000000 + 1) + 1000000)
        priceOverlay.textContent = "$" + randPrice;

        const button = document.createElement("button");
        button.textContent = "Contact Seller";

        // Append image, price overlay, and button to the image container
        imageContainer.appendChild(image);
        imageContainer.appendChild(priceOverlay);
        imageContainer.appendChild(button);

        // Append the image container to the image grid
        imageGrid.appendChild(imageContainer);
    });
});