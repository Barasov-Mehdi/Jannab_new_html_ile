const product_container = document.querySelector('.product_container');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const product_card_box = document.querySelector('.product_card_box'); // Cart display area

let currentIndex = 0;
const itemsPerLoad = 4;
let products = [];

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

// create product boxs
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
        console.error(`Invalid price for product ${product.name}:`, discountObj);
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
                    <option>15 ml - ${(price * 15).toFixed(2)} ₼</option>
                    <option>30 ml - ${(price * 30).toFixed(2)} ₼</option>
                    <option>50 ml - ${(price * 50).toFixed(2)} ₼</option>
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
    addToCardButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.productId;  // Get ID from the data attribute
            const selectedProduct = products.find(product => product._id === productId); // Find the product in the array

            if (selectedProduct) {
                addProductToCart(selectedProduct); // Call function to add the product to the cart
            } else {
                console.warn("Product not found in data");
            }
        });
    });
}

// Function to add a product to the cart display
function addProductToCart(product) {
    const cartItem = document.createElement('div');
    cartItem.innerHTML = `
        <h3>${product.name}</h3>
        <p>Price: ${product.price['$numberDecimal']} ₼</p>
        <button class="remove_from_cart" data-product-id="${product._id}">Remove</button>
    `;
    product_card_box.appendChild(cartItem);

    // You'll also want to add the "remove from cart" functionality here
    const removeButton = cartItem.querySelector('.remove_from_cart');
    removeButton.addEventListener('click', () => {
        cartItem.remove(); // Remove the item from the display
        // Optionally, update cart data (e.g., in local storage or a cart array)
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
    product_container.innerHTML = ''; // Mevcut ürünleri sil
    const trendProducts = products.filter(product => product.bestSellers === true);
    loadMoreBtn.style.display = 'none'; // Butonu gizle
    if (trendProducts.length > 0) {
        trendProducts.forEach(createProductBox);
    } else {
        product_container.innerHTML = `<img class="notFound" src="./img/icons8-not-found-50.png" alt="Jannab Perfume">`;
    }
});

const woman = document.querySelector('.woman');
woman.addEventListener('click', () => {
    product_container.innerHTML = ''; // Mevcut ürünleri sil
    const trendProducts = products.filter(product => product.category === 'woman');
    loadMoreBtn.style.display = 'none'; // Butonu gizle
    if (trendProducts.length > 0) {
        trendProducts.forEach(createProductBox);
    } else {
        product_container.innerHTML = `<img class="notFound" src="./img/icons8-not-found-50.png" alt="Jannab Perfume">`;
    }
});

const man = document.querySelector('.man');
man.addEventListener('click', () => {
    product_container.innerHTML = ''; // Mevcut ürünleri sil
    const trendProducts = products.filter(product => product.category === 'man');
    loadMoreBtn.style.display = 'none'; // Butonu gizle
    if (trendProducts.length > 0) {
        trendProducts.forEach(createProductBox);
    } else {
        product_container.innerHTML = `<img class="notFound" src="./img/icons8-not-found-50.png" alt="Jannab Perfume">`;
    }
});

const unisex = document.querySelector('.unisex');
unisex.addEventListener('click', () => {
    product_container.innerHTML = ''; // Mevcut ürünleri sil
    const trendProducts = products.filter(product => product.category === 'unisex');
    loadMoreBtn.style.display = 'none'; // Butonu gizle
    if (trendProducts.length > 0) {
        trendProducts.forEach(createProductBox);
    } else {
        product_container.innerHTML = `<img class="notFound" src="./img/icons8-not-found-50.png" alt="Jannab Perfume">`;
    }
});

// discount
const discountProduct = document.querySelector('.discountProduct');
discountProduct.addEventListener('click', () => {
    product_container.innerHTML = ''; // Mevcut ürünleri sil
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
                    <option>15 ml - ${(price * 15).toFixed(2)} ₼</option>
                    <option>30 ml - ${(price * 30).toFixed(2)} ₼</option>
                    <option>50 ml - ${(price * 50).toFixed(2)} ₼</option>
                </select>
            </div>
            <i class="fa-solid fa-cart-shopping add_to_card" style="color: white;" data-product-id="${product._id}"></i>
        </div>
    `;

    search_results.append(search_box);
    var img_container = document.querySelectorAll('.open_detailsPage');

    img_container.forEach(element => {
        element.addEventListener('click', () => {
            window.open(`details.html?id=${product._id}`, '_blank');
        });
    });
}

var search_results = document.querySelector('.search_results');
function searchFunction() {
    var search_inp = document.querySelector('.search_inp');
    search_inp.addEventListener('input', () => {
        search_results.innerHTML = '';
        var searchValue = search_inp.value.trim().toUpperCase();

        const searchProducts = products.filter(product =>
            product.name.toUpperCase().includes(searchValue) // Allows partial matching
        );


        if (searchProducts.length > 0) {
            searchProducts.forEach(createSearchProductBox);
        } else {
            product_container.innerHTML = `<img class="notFound" src="./img/icons8-not-found-50.png" alt="Jannab Perfume">`;
        }
    });

} searchFunction();

const getAllProducts = document.querySelector('.getAllProducts');
getAllProducts.addEventListener('click', () => {
    product_container.innerHTML = ''; // Mevcut ürünleri sil
    products.filter(product => {
        const priceObj = product.price;
        const price = parseFloat(priceObj ? priceObj['$numberDecimal'] : '0');

        if (isNaN(price)) {
            console.error(`Invalid price for product ${product.name}:`, priceObj);
            return;
        }

        const discountObj = product.discount;
        const discount = parseFloat(discountObj ? discountObj['$numberDecimal'] : '0');

        if (isNaN(discount)) {
            console.error(`Invalid price for product ${product.name}:`, discountObj);
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
                        <option>15 ml - ${(price * 15).toFixed(2)} ₼</option>
                        <option>30 ml - ${(price * 30).toFixed(2)} ₼</option>
                        <option>50 ml - ${(price * 50).toFixed(2)} ₼</option>
                    </select>
                </div>
                <i class="fa-solid fa-cart-shopping add_to_card" style="color: white;"></i>
            </div>
        `;
        product_container.append(productBox);

        var img_container = document.querySelectorAll('.img_container');

        img_container.forEach(element => {
            element.addEventListener('click', () => {
                window.open(`details.html?id=${product._id}`, '_blank');
            });
        });

    });

});