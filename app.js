const product_container = document.querySelector('.product_container');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const product_card_box = document.querySelector('.product_card_box'); // Cart display area
const search_results = document.querySelector('.search_results'); // Search results display area
const totalPrice = document.querySelector('.totalPrice'); // Total price display
const productNoElements = document.querySelectorAll('.productNo'); // Select all productNo elements
let currentIndex = 0;
const itemsPerLoad = 4;
let products = [];
let cart = []; // Array to store cart items

// Helper function to find a product by ID in the products array
function findProductById(productId) {
    return products.find(product => product._id === productId);
}

async function fetchProducts() {
    try {
        const response = await fetch('https://jannabperfume-jannabperfume-963b35916771.herokuapp.com/api/products?limit=');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        products = data;
        displayProducts(); // Display the products after data is fetched
    } catch (error) {
        console.error('API Error:', error);
    }
}

// show products
function displayProducts() {
    const end = Math.min(currentIndex + itemsPerLoad, products.length);
    for (let i = currentIndex; i < end; i++) {
        const product = products[i];
        createProductBox(product);
    }
    currentIndex += itemsPerLoad;
}

function createProductBox(product) {
    const priceObj = product.price;
    const price = parseFloat(priceObj ? priceObj['$numberDecimal'] : '0');

    if (isNaN(price)) {
        console.error(`Invalid price for product ${product.name}:`, priceObj);
        return;
    }

    const discountObj = product.discount;
    const discount = parseFloat(discountObj ? discountObj['$numberDecimal'] : '0');

    if (isNaN(discount)) {
        console.error(`Invalid discount for product ${product.name}:`, discountObj);
        return;
    }

    const productBox = document.createElement('section');
    const productDate = new Date(product.date);
    const daysOld = (new Date() - productDate) / (1000 * 60 * 60 * 24);

    productBox.classList.add('product_box');
    productBox.innerHTML = `
        <div class="img_container">
            <img src="${product.img}" alt="${product.name}">
            <span class="discount" style="display: ${discount > 0 ? 'flex' : 'none'};">
                ${discount > 0 ? ` ${discount}%` : ''}
            </span>
            ${daysOld <= 7 ? '<span class="newPro" style="display: flex;">Yeni</span>' : ''}
        </div>
        <div class="name_container">
            <h2>${product.name}</h2>
        </div>
        <div class="product_footer">
            <div class="volume-select">
                <select class="volume-options">
                    <option value="15">15 ml - ${calculatePrice(price, discount, 15).toFixed(2)} ₼</option>
                    <option value="30">30 ml - ${calculatePrice(price, discount, 30).toFixed(2)} ₼</option>
                    <option value="50">50 ml - ${calculatePrice(price, discount, 50).toFixed(2)} ₼</option>
                </select>
            </div>
            <i class="fa-solid fa-cart-shopping add_to_card" style="color: white;" data-product-id="${product._id}"></i>
        </div>
    `;
    product_container.append(productBox);


    var img_container = document.querySelectorAll('.img_container');

    img_container.forEach(element => {
        element.addEventListener('click', () => {
            window.open(`details.html?id=${product._id}`, '_blank');
        });
    });


    // Attach event listeners *after* the product box is created
    const addToCardButtons = productBox.querySelectorAll('.add_to_card');
    const volumeOptions = productBox.querySelectorAll('.volume-options'); // Changed from volume_options
    addToCardButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedVolume = volumeOptions[0].value;
            const productId = button.dataset.productId;  // Get ID from the data attribute

            // Calculate the price based on the selected volume
            const priceObj = product.price;
            const price = parseFloat(priceObj ? priceObj['$numberDecimal'] : '0');
            const discountObj = product.discount;
            const discount = parseFloat(discountObj ? discountObj['$numberDecimal'] : '0');

            const volumePrice = calculatePrice(price, discount, parseFloat(selectedVolume));
            const productName = product.name;
            const productImg = product.img;

            const cartItem = {
                productId: productId,
                productName: productName,
                productImg: productImg,
                volume: selectedVolume,
                price: volumePrice,
            };

            addProductToCart(cartItem);
        });
    });
}

// Function to calculate the discounted price
function calculatePrice(basePrice, discountPercentage, volume) {
    const discountedPrice = basePrice * (1 - (discountPercentage / 100));
    return discountedPrice * volume;
}

// Function to add a product to the cart display
function addProductToCart(cartItem) {
    // Check if the item is already in the cart
    const existingCartItem = cart.find(item => item.productId === cartItem.productId && item.volume === cartItem.volume);

    if (existingCartItem) {
        // If the item exists, you can update the quantity (if you have quantity) or show a message
        console.warn("This item is already in the cart"); // Or update quantity
        return;
    }

    cart.push(cartItem); // Add item to the cart array
    const cartProduct = document.createElement('div');
    cartProduct.classList.add('cart-item'); // Add class for styling if needed
    cartProduct.innerHTML = `
        <div class="card_img_name">
        <img src="${cartItem.productImg}" alt="${cartItem.productName}">
        <h3>${cartItem.productName} (${cartItem.volume}ml)</h3>
        </div>
        <div class="card_price_remove">
        
        <i class="fa-solid fa-xmark remove_from_cart"  data-product-id="${cartItem.productId}" data-volume="${cartItem.volume}"></i>
        </div>
        `;
    product_card_box.appendChild(cartProduct);
    {/* <p>Price: ${cartItem.price.toFixed(2)} ₼</p> */ }
    // Add remove functionality
    const removeButton = cartProduct.querySelector('.remove_from_cart');
    removeButton.addEventListener('click', () => {
        const productIdToRemove = removeButton.dataset.productId;
        const volumeToRemove = removeButton.dataset.volume;

        // Remove from cart array
        cart = cart.filter(item => !(item.productId === productIdToRemove && item.volume === volumeToRemove));
        cartProduct.remove(); // Remove from display
        updateProductNo(); // Update productNo after removal
        updateTotalPrice(); // Update total *after* removing an item
    });
    updateProductNo(); // Update productNo after addition
    updateTotalPrice(); // Update the total after adding an item
}

// Function to update the total price display
function updateTotalPrice() {
    let total = 0;
    cart.forEach(item => {
        total += item.price; // Sum the prices of items in the cart
    });
    totalPrice.innerHTML = total.toFixed(2) + " ₼"; // Display the total, formatted to 2 decimal places and currency symbol
}

// Function to update the product number display
function updateProductNo() {
    productNoElements.forEach(element => {
        element.textContent = cart.length;
    });
}

// load more
loadMoreBtn.addEventListener('click', () => {
    if (currentIndex < products.length) {
        displayProducts();
    } else {
        loadMoreBtn.style.display = 'none';
    }
});

const trend = document.querySelector('.trend');
trend.addEventListener('click', () => {
    product_container.innerHTML = '';
    const trendProducts = products.filter(product => product.bestSellers === true);
    loadMoreBtn.style.display = 'none';
    if (trendProducts.length > 0) {
        trendProducts.forEach(createProductBox);
    } else {
        product_container.innerHTML = `<img class="notFound" src="./img/icons8-not-found-50.png" alt="Jannab Perfume">`;
    }
});

const woman = document.querySelector('.woman');
woman.addEventListener('click', () => {
    product_container.innerHTML = '';
    const trendProducts = products.filter(product => product.category === 'woman');
    loadMoreBtn.style.display = 'none';
    if (trendProducts.length > 0) {
        trendProducts.forEach(createProductBox);
    } else {
        product_container.innerHTML = `<img class="notFound" src="./img/icons8-not-found-50.png" alt="Jannab Perfume">`;
    }
});

const man = document.querySelector('.man');
man.addEventListener('click', () => {
    product_container.innerHTML = '';
    const trendProducts = products.filter(product => product.category === 'man');
    loadMoreBtn.style.display = 'none';
    if (trendProducts.length > 0) {
        trendProducts.forEach(createProductBox);
    } else {
        product_container.innerHTML = `<img class="notFound" src="./img/icons8-not-found-50.png" alt="Jannab Perfume">`;
    }
});

const unisex = document.querySelector('.unisex');
unisex.addEventListener('click', () => {
    product_container.innerHTML = '';
    const trendProducts = products.filter(product => product.category === 'unisex');
    loadMoreBtn.style.display = 'none';
    if (trendProducts.length > 0) {
        trendProducts.forEach(createProductBox);
    } else {
        product_container.innerHTML = `<img class="notFound" src="./img/icons8-not-found-50.png" alt="Jannab Perfume">`;
    }
});

// discount
const discountProduct = document.querySelector('.discountProduct');
discountProduct.addEventListener('click', () => {
    product_container.innerHTML = '';
    const isDiscountProducts = products.filter(product => product.isDiscounted === true);


    if (isDiscountProducts.length > 0) {
        isDiscountProducts.forEach(createProductBox);
        loadMoreBtn.style.display = 'none';

    } else {
        product_container.innerHTML = `<img class="notFound" src="./img/icons8-not-found-50.png" alt="Jannab Perfume">`;
        loadMoreBtn.style.display = 'none'; // Butonu gizle
    }
});

// new product
const newProductsBtn = document.querySelector('.newProducts');
const newPro = document.querySelector('.newPro');
newProductsBtn.addEventListener('click', () => {
    product_container.innerHTML = '';
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    const newProducts = products.filter(product => {
        loadMoreBtn.style.display = 'none';
        if (!product.date) return false;
        const productDate = new Date(product.date);
        return productDate > tenDaysAgo;
    });


    if (newProducts.length > 0) {
        newProducts.forEach(createProductBox);
    } else {
        product_container.innerHTML = `<img class="notFound" src="./img/icons8-not-found-50.png" alt="Jannab Perfume">`;
        loadMoreBtn.style.display = 'none';
    }
});

fetchProducts(); // Start fetching products


function showSearchBox() {
    var search_btn = document.querySelectorAll('.search_btn');
    var search = document.querySelector('.search');
    var close_search = document.querySelector('.close_search');
    var slider_box = document.querySelector('.slider_box');
    var search_inp = document.querySelector('.search_inp');

    search_btn.forEach(e => {
        e.addEventListener('click', (() => {
            if (search.style.display === 'none') {
                search.style.display = 'flex'
                search_inp.focus();
            } else {
                search.style.display = 'none'
            }
        }));
    });

    close_search.addEventListener('click', () => {
        search.style.display = 'none'
    });
    slider_box.addEventListener('click', () => {
        search.style.display = 'none'
    });


};
showSearchBox();

function createSearchProductBox(product) {
    const priceObj = product.price;
    const price = parseFloat(priceObj ? priceObj['$numberDecimal'] : '0');

    if (isNaN(price)) {
        console.error(`Invalid price for product ${product.name}:`, priceObj);
        return;
    }

    const discountObj = product.discount;
    const discount = parseFloat(discountObj ? discountObj['$numberDecimal'] : '0');

    if (isNaN(discount)) {
        console.error(`Invalid discount for product ${product.name}:`, discountObj);
        return;
    }

    const search_box = document.createElement('section');
    search_box.classList.add('search_box');
    search_box.innerHTML = `
        <a href="#" target="_blank" class="open_detailsPage">
            <div class="img_container">
                <img src="${product.img}" alt="${product.name}">
            </div>
        
        <div class="name_container">
            <h2>${product.name}</h2>
        </div>
        </a>
        <div class="product_footer">
            <div class="volume-select">
                <select class="volume-options">
                    <option value="15">15 ml - ${calculatePrice(price, discount, 15).toFixed(2)} ₼</option>
                    <option value="30">30 ml - ${calculatePrice(price, discount, 30).toFixed(2)} ₼</option>
                    <option value="50">50 ml - ${calculatePrice(price, discount, 50).toFixed(2)} ₼</option>
                </select>
            </div>
            <i class="fa-solid fa-cart-shopping add_to_card" data-product-id="${product._id}"></i>
        </div>
    `;

    search_results.append(search_box);

    var img_container = document.querySelectorAll('.open_detailsPage');

    img_container.forEach(element => {
        element.addEventListener('click', () => {
            window.open(`details.html?id=${product._id}`, '_blank');
        });
    });

    // Add event listeners *after* the search box is created
    const addToCardButtons = search_box.querySelectorAll('.add_to_card');
    const volumeOptions = search_box.querySelectorAll('.volume-options'); // Changed from volume_options
    addToCardButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedVolume = volumeOptions[0].value;
            const productId = button.dataset.productId;  // Get ID from the data attribute

            // Calculate the price based on the selected volume
            const priceObj = product.price;
            const price = parseFloat(priceObj ? priceObj['$numberDecimal'] : '0');
            const discountObj = product.discount;
            const discount = parseFloat(discountObj ? discountObj['$numberDecimal'] : '0');

            const volumePrice = calculatePrice(price, discount, parseFloat(selectedVolume));
            const productName = product.name;

            const cartItem = {
                productId: productId,
                productName: productName,
                volume: selectedVolume,
                price: volumePrice,
            };

            addProductToCart(cartItem); // Call the function to add the product
        });
    });
}

function searchFunction() {
    var search_inp = document.querySelector('.search_inp');
    search_inp.addEventListener('input', () => {
        search_results.innerHTML = '';
        var searchValue = search_inp.value.trim().toUpperCase();

        if (searchValue.length > 0) {
            const searchProducts = products.filter(product =>
                product.name.toUpperCase().includes(searchValue) // Allows partial matching
            );

            if (searchProducts.length > 0) {
                searchProducts.forEach(createSearchProductBox);
            } else {
                search_results.innerHTML = `<img class="notFound" src="./img/icons8-not-found-50.png" alt="Jannab Perfume">`;
            }
        }
    });
}
searchFunction();

const getAllProducts = document.querySelector('.getAllProducts');
getAllProducts.addEventListener('click', () => {
    product_container.innerHTML = '';
    displayProducts();
    loadMoreBtn.style.display = ''; // Show load more button
});

// Initial total price update (when the page loads)
updateProductNo(); // Initial product number update
updateTotalPrice(); // Initial total price update

var close_bucket_box = document.querySelector('.close_bucket_box');
var bucket_box = document.querySelector('.bucket_box');
close_bucket_box.addEventListener('click', () => {
    bucket_box.style.display = 'none';
})

var show_product_card = document.querySelectorAll('.show_product_card');

show_product_card.forEach(element => {
    element.addEventListener('click', () => {
        bucket_box.style.display = 'flex';
    })
});


function initializeSlider() {
    var imgArrLarge = ["./img/IMG_7812.JPG", "./img/IMG_7855.JPG"]; // Geniş ekranlar için
    var imgArrSmall = ["./img/IMG_7816.JPG", "./img/IMG_7827.JPG"]; // Dar ekranlar için
    var slider_show = document.querySelector('.slider_img'); // Doğru seçim
    var imgArr = [];
    var i = 0;

    function updateImageArray() {
        imgArr = window.innerWidth <= 775 ? imgArrSmall : imgArrLarge;
        slider_show.src = imgArr[0]; // İlk resmi göster
        i = 0; // Reset index
    }

    function changeImage() {
        if (imgArr.length === 0) return; // Dizinin dolu olduğundan emin ol
        i = (i + 1) % imgArr.length;
        slider_show.src = imgArr[i];
    }

    updateImageArray(); // Başlangıçta diziyi ayarla
    setInterval(changeImage, 3000); // Resimleri değiştir
    window.addEventListener('resize', updateImageArray); // Boyut değiştiğinde güncelle
}
initializeSlider();
