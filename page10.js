/* ===== Страница 10 =====
   Часть 1: пояснения. List и Detail (модальное окно), данные из processes.json
   Часть 2: комментарии. CRUD (создать, прочитать, изменить, удалить), данные из comments.json */


/* ==================== ЧАСТЬ 1. LIST И DETAIL ==================== */

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


/* ==================== ЧАСТЬ 2. КОММЕНТАРИИ (CRUD) ====================
   Все комментарии анонимные: автору автоматически даётся имя «Аноним N».
   Данные читаются из comments.json, а добавление, изменение и удаление работают
   с массивом localComments. Записать в сам JSON-файл браузер не может,
   поэтому после перезагрузки страницы список вернётся к исходному. */

const COMMENTS_URL = 'comments.json';

const commentForm = document.getElementById('commentForm');
const commentIdInput = document.getElementById('commentId');
const commentTextInput = document.getElementById('commentText');
const commentSubmitBtn = document.getElementById('commentSubmit');
const commentCancelBtn = document.getElementById('commentCancel');
const commentsRefreshBtn = document.getElementById('commentsRefresh');
const commentsContainer = document.getElementById('commentsContainer');
const commentsCount = document.getElementById('commentsCount');
const commentError = document.getElementById('commentError');
const commentStatus = document.getElementById('commentStatus');

let localComments = [];

/* Экранирование HTML, чтобы в комментарий нельзя было вставить код */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatDate(iso) {
    const date = new Date(iso);
    if (isNaN(date)) return '';
    return date.toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });
}

/* READ: загрузка комментариев из JSON */
async function fetchComments() {
    try {
        const response = await fetch(COMMENTS_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        localComments = await response.json();
        renderComments();
        return true;
    } catch (error) {
        console.error('Ошибка загрузки комментариев:', error);
        localComments = [];
        commentsContainer.innerHTML = '<p class="comments-empty">Не удалось загрузить комментарии. Откройте сайт через сервер (Live Server или GitHub Pages).</p>';
        commentsCount.textContent = '';
        return false;
    }
}

/* READ: вывод списка */
function renderComments() {
    commentsContainer.innerHTML = '';
    commentsCount.textContent = `Комментариев: ${localComments.length}`;

    if (localComments.length === 0) {
        commentsContainer.innerHTML = '<p class="comments-empty">Комментариев пока нет. Будьте первым.</p>';
        return;
    }

    localComments.forEach(comment => {
        const item = document.createElement('article');
        item.className = 'comment';
        item.innerHTML = `
            <div class="comment-head">
                <strong class="comment-author">${escapeHtml(comment.author)}</strong>
                <time class="comment-date" datetime="${escapeHtml(comment.date)}">${escapeHtml(formatDate(comment.date))}</time>
                ${comment.edited ? '<span class="comment-edited">изменено</span>' : ''}
            </div>
            <p class="comment-text">${escapeHtml(comment.text)}</p>
            <div class="comment-actions">
                <button type="button" class="btn btn-small" data-action="edit" data-id="${comment.id}">Редактировать</button>
                <button type="button" class="btn btn-small btn-danger" data-action="delete" data-id="${comment.id}">Удалить</button>
            </div>
        `;
        commentsContainer.appendChild(item);
    });
}

/* Проверка текста комментария */
function validateComment(text) {
    if (text.length < 3 || text.length > 300) {
        return 'Комментарий должен быть от 3 до 300 символов.';
    }
    return '';
}

/* CREATE и UPDATE: отправка формы */
commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    commentStatus.textContent = '';

    const id = commentIdInput.value;
    const text = commentTextInput.value.trim();

    const error = validateComment(text);
    commentError.textContent = error;
    if (error) return;

    if (id) {
        // UPDATE
        const comment = localComments.find(c => c.id === Number(id));
        if (!comment) {
            commentError.textContent = 'Комментарий не найден. Возможно, он уже удалён.';
            resetCommentForm();
            return;
        }
        comment.text = text;
        comment.edited = true;
        resetCommentForm();
        renderComments();
        commentStatus.textContent = 'Комментарий обновлён.';
    } else {
        // CREATE
        const newId = localComments.length
            ? Math.max(...localComments.map(c => c.id)) + 1
            : 1;
        const newComment = {
            id: newId,
            author: `Аноним ${newId}`,
            text,
            date: new Date().toISOString(),
            edited: false
        };
        localComments.unshift(newComment);
        resetCommentForm();
        renderComments();
        commentStatus.textContent = 'Комментарий добавлен.';
    }
});

/* Кнопки «Редактировать» и «Удалить» (делегирование событий) */
commentsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.action === 'edit') prepareCommentUpdate(id);
    if (btn.dataset.action === 'delete') deleteComment(id);
});

/* UPDATE: подготовка формы к изменению */
function prepareCommentUpdate(id) {
    const comment = localComments.find(c => c.id === id);
    if (!comment) return;

    commentIdInput.value = comment.id;
    commentTextInput.value = comment.text;

    commentSubmitBtn.textContent = 'Сохранить изменения';
    commentCancelBtn.hidden = false;
    commentError.textContent = '';
    commentStatus.textContent = `Редактирование комментария: ${comment.author}.`;
    commentForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    commentTextInput.focus();
}

/* DELETE */
function deleteComment(id) {
    if (!confirm('Удалить этот комментарий?')) return;

    localComments = localComments.filter(c => c.id !== id);
    if (commentIdInput.value === String(id)) resetCommentForm();
    renderComments();
    commentStatus.textContent = 'Комментарий удалён.';
}

function resetCommentForm() {
    commentIdInput.value = '';
    commentForm.reset();
    commentSubmitBtn.textContent = 'Добавить комментарий';
    commentCancelBtn.hidden = true;
    commentError.textContent = '';
}

commentCancelBtn.addEventListener('click', () => {
    resetCommentForm();
    commentStatus.textContent = '';
});

/* Обновить все комментарии: заново загрузить список из JSON */
commentsRefreshBtn.addEventListener('click', async () => {
    resetCommentForm();
    commentStatus.textContent = 'Загрузка…';
    const ok = await fetchComments();
    commentStatus.textContent = ok ? 'Список комментариев обновлён.' : '';
});


/* ==================== ЗАПУСК ==================== */

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    fetchComments();
});
