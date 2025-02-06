const apiUrl = 'https://jannabperfume-jannabperfume-963b35916771.herokuapp.com/api/products?limit=';
const product_container = document.querySelector('.product_container');
const loadMoreBtn = document.getElementById('loadMoreBtn');

let currentIndex = 0;
const itemsPerLoad = 4;
let products = [];

// Ürünleri API'den çek
async function fetchProducts() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        products = data; // API'den gelen ürünleri globale kaydediyoruz
        displayProducts(); // İlk ürünleri göster
    } catch (error) {
        console.error('API Error:', error);
    }
}

// Ürünleri göster
function displayProducts() {
    const end = Math.min(currentIndex + itemsPerLoad, products.length);
    for (let i = currentIndex; i < end; i++) {
        const product = products[i];
        createProductBox(product);
    }
    currentIndex += itemsPerLoad;
}

// Ürün kutusunu oluştur
function createProductBox(product) {
    const priceObj = product.price;
    const price = parseFloat(priceObj ? priceObj['$numberDecimal'] : '0');

    if (isNaN(price)) {
        console.error(`Invalid price for product ${product.name}:`, priceObj);
        return; // Fiyat geçersizse bu ürünü atla
    }

    const discountObj = product.discount;
    const discount = parseFloat(discountObj ? discountObj['$numberDecimal'] : '0');

    if (isNaN(discount)) {
        console.error(`Invalid price for product ${product.name}:`, discountObj);
        return; // Fiyat geçersizse bu ürünü atla
    }

    const productBox = document.createElement('section');
    productBox.classList.add('product_box');
    productBox.innerHTML = `
        <a href="#" class="open_detailsPage">
            <div class="img_container">
                <img src="${product.img}" alt="${product.name}">
                <span class="discount" style="display: ${discount > 0 ? 'flex' : 'none'};">
                    ${discount > 0 ? ` ${discount}%` : ''}
                </span>
                <span class="new">Yeni</span>
            </div>
        </a>
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
            <i class="fa-solid fa-cart-shopping" style="color: white;"></i>
        </div>
    `;
    product_container.append(productBox);
}

// "Daha fazla yükle" butonuna tıklandığında daha fazla ürün göster
loadMoreBtn.addEventListener('click', () => {
    if (currentIndex < products.length) {
        displayProducts();
    } else {
        loadMoreBtn.style.display = 'none'; // Daha fazla ürün yoksa butonu gizle
    }
});

// Trend ürünleri göster
const trend = document.querySelector('.trend');
trend.addEventListener('click', () => {
    product_container.innerHTML = ''; // Mevcut ürünleri sil
    const trendProducts = products.filter(product => product.bestSellers === true);

    if (trendProducts.length > 0) {
        trendProducts.forEach(createProductBox);
    } else {
        product_container.innerHTML = `<img class="notFound" src="./img/icons8-not-found-50.png" alt="Jannab Perfume">`;
    }
});

// İndirimli ürünleri göster
const discountProduct = document.querySelector('.discountProduct'); // Doğru isimlendirme
discountProduct.addEventListener('click', () => {
    product_container.innerHTML = ''; // Mevcut ürünleri sil
    const isDiscountProducts = products.filter(product => product.isDiscounted === true);
    

    if (isDiscountProducts.length > 0) {
        isDiscountProducts.forEach(createProductBox);
    } else {
        product_container.innerHTML = `<img class="notFound" src="./img/icons8-not-found-50.png" alt="Jannab Perfume">`;
        loadMoreBtn.style.display = 'none'; // Butonu gizle
    }
});

fetchProducts();