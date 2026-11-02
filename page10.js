/* ===== Страница 10: пояснения. List и Detail (модальное окно) ===== */

const DATA_URL = 'processes.json';
const productGrid = document.getElementById('product-grid');
const detailSection = document.getElementById('detail-section');
const detailCard = document.getElementById('detail-card');
const closeBtn = document.getElementById('close-btn');

let productsData = [];


async function loadProducts() {
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

        productsData = await response.json();
        renderProductsList(productsData);
    } catch (error) {
        console.error('Ошибка JSON',error);
        productGrid.innerHTML = '<p style="color: red;">Error!</p>'
    }
}

function renderProductsList(products) {
    productGrid.innerHTML = '';

    products.forEach(product =>{
        const card = document.createElement('div');
        card.className = 'product-card';
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `${product.name}: подробнее`);
        card.innerHTML = `
        <img class="product-img" src="${product.image}" alt="${product.name}" loading="lazy">
        <div class="product-info">
            <span class="product-tag">${product.category}</span>
            <h3 class="product-title">${product.name}</h3>
            <p class="product-summary">${product.summary}</p>
        </div>
        `;
        card.addEventListener('click', () => showProductDetail(product.id));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showProductDetail(product.id);
            }
        });
        productGrid.appendChild(card);
    });
}

/*Detail*/ 

function showProductDetail(product_id) {
    const product = productsData.find(p => p.id === product_id);
    if (!product) return;

    const specsList = Object.entries(product.specs)
    .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
    .join('');

    detailCard.innerHTML = `
    <div class="detail-layout">
    <span class="product-tag">${product.category}</span>
    <h2>${product.name}</h2>
    <img src="${product.image}" alt="${product.name}" class="detail-img">
    <p class="detail-desc">${product.description}</p>
    <div class="detail-specs">
        <strong>Подробности</strong>
        <ul>${specsList}</ul>
    </div>
    <p class="detail-stage">Упоминается: <a href="${product.page}">${product.stage}</a></p>
    </div>
    `;

    detailSection.classList.remove('hidden');
}

function closeDetail() {
    detailSection.classList.add('hidden');
}

closeBtn.addEventListener('click', closeDetail);
detailSection.addEventListener('click', (e) => {
    if (e.target === detailSection) closeDetail();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetail();
});

document.addEventListener('DOMContentLoaded', loadProducts);
