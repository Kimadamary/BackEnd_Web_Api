let allNewsData = [];
let currentCategory = 'all';
let searchQuery = ''; // Переменная для хранения текста поиска

const CATEGORIES = {
    all: { title: 'Все новости', icon: '1' },
    technology: { title: 'Технологии', icon: '0', keywords: ['tech', 'digitimes', 'iphone', 'apple', 'android', 'компьютер', 'смартфон', 'ai', 'ии', 'nvidia', 'программ'] },
    sport: { title: 'Спорт', icon: '20', keywords: ['спорт', 'футбол', 'хоккей', 'матч', 'чемпион', 'турнир', 'сборная'] },
    science: { title: 'Наука', icon: '29', keywords: ['science', 'наук', 'учен', 'исследован', 'космос', 'планета', 'открыт', 'эксперимент'] },
    business: { title: 'Экономика', icon: '20', keywords: ['cnbc', 'bloomberg', 'reuters', 'экономик', 'бизнес', 'рынок', 'инвестиц', 'акции', 'курс', 'банк'] }
};

function preprocessText(text) {
    if (!text) return []; // Исправлено: теперь всегда возвращаем массив

    return text
        .toLowerCase()
        // 1. Очистка: убираем знаки препинания и лишние символы
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        // 2. Токенизация: разбиваем на массив слов по пробелам
        .split(/\s+/)
        // 3. Нормализация (упрощенная): оставляем только основу слова (минимум 3 символа)
        .map(word => word.length > 4 ? word.substring(0, word.length - 2) : word)
        .filter(word => word.length > 0);
}

function detectCategory(article, sourceName) {
    const text = `${article.title} ${article.description} ${sourceName}`.toLowerCase();
    for (const [key, data] of Object.entries(CATEGORIES)) {
        if (data.keywords?.some(word => text.includes(word))) {
            return key;
        }
    }
    return 'technology';
}

async function loadNews() {
    try {
        
        const data = NEWS_DATA;

        allNewsData = Object.entries(data).flatMap(([sourceName, articles]) =>
            Array.isArray(articles) ? articles.map(article => ({
                ...article,
                sourceName,
                category: detectCategory(article, sourceName)
            })) : []
        );

        allNewsData.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        renderNews();
        setupNavButtons();
        setupSearch(); 
    } catch (error) {
        console.error(error);
        const container = document.querySelector('.news-list');
        if (container) {
            container.innerHTML = `<p class="error">Ошибка: ${error.message}</p>`;
        }
    }
}
// Новая функция настройки поиска
function setupSearch() {
    const searchInput = document.getElementById('news-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        // Предобрабатываем поисковый запрос пользователя
        const searchWords = preprocessText(e.target.value);

        // Если поле пустое, сбрасываем поиск
        if (searchWords.length === 0) {
            searchQuery = '';
            renderNews();
            return;
        }

        // Сохраняем обработанные слова для фильтрации
        searchQuery = searchWords;
        renderNews();
    });
}

function renderNews() {
    const container = document.querySelector('.news-list');
    const titleElem = document.getElementById('category-title');
    if (!container) return;

    if (titleElem) titleElem.textContent = CATEGORIES[currentCategory]?.title || 'Новости';

    // ФИЛЬТРАЦИЯ: Учитываем и категорию, и поиск одновременно
    const filtered = allNewsData.filter(article => {
        const matchesCategory = currentCategory === 'all' || article.category === currentCategory;

        // Если поиск пустой, проверяем только категорию
        if (!searchQuery || searchQuery.length === 0) return matchesCategory;

        // Предобрабатываем текст новости
        const articleWords = preprocessText(`${article.title} ${article.description}`);

        // Проверяем, есть ли хотя бы одно слово из поиска в тексте новости
        const matchesSearch = searchQuery.every(searchWord =>
            articleWords.some(articleWord => articleWord.includes(searchWord))
        );

        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<p>Ничего не найдено</p>';
        return;
    }

    container.innerHTML = filtered.map(article => {
        const { title, url, urlToImage, publishedAt, description, category, sourceName } = article;
        const date = publishedAt ? new Date(publishedAt).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
        }) : 'Дата неизвестна';

        const imgSrc = (urlToImage && urlToImage !== 'null')
            ? urlToImage
            : `https://picsum.photos/id/${CATEGORIES[category]?.icon || 1}/220/160`;

        const shortDesc = description?.length > 200
            ? description.substring(0, 200) + '...'
            : (description || 'Описание отсутствует');

        return `
            <article class="news-card">
                <img src="${imgSrc}" alt="${title}" loading="lazy">
                <div class="news-content">
                    <span class="category-tag">${CATEGORIES[category].title}</span>
                    <h3><a href="${url}" target="_blank">${title}</a></h3>
                    <p class="meta">${sourceName} • ${date}</p>
                    <p class="desc">${shortDesc}</p>
                </div>
            </article>
        `;
    }).join('');
}

function setupNavButtons() {
    // ИСПРАВЛЕНО: Находим кнопки переключения только внутри тега nav!
    const buttons = document.querySelectorAll('nav .nav-btn');
    buttons.forEach(btn => {
        btn.onclick = () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderNews();               // При смене категории поиск тоже сохранится
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    });
}

// Замени порт 7145 на свой, если он отличается при запуске Web API!
const API_BASE_URL = 'https://empty-hairs-invent.loca.lt/api/users';

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// Закрытие модалки при клике вне её области
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Проверка сессии при загрузке страницы
function checkAuth() {
    const savedUser = localStorage.getItem('username');
    const guestZone = document.getElementById('guest-zone');
    const userZone = document.getElementById('user-zone');
    const greeting = document.getElementById('user-greeting');

    if (savedUser) {
        if (guestZone) guestZone.style.display = 'none';
        if (userZone) userZone.style.display = 'flex';
        if (greeting) greeting.textContent = `Привет, ${savedUser}!`;
    } else {
        if (guestZone) guestZone.style.display = 'flex';
        if (userZone) userZone.style.display = 'none';
    }
}

// Выход из аккаунта
function logout() {
    localStorage.removeItem('username');
    checkAuth();
}

// РЕГИСТРАЦИЯ
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const passwordHash = document.getElementById('reg-password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, passwordHash })
            });

            if (response.ok) {
                alert('Регистрация успешна! Теперь вы можете войти.');
                closeModal('register-modal');
                openModal('login-modal');
                e.target.reset();
            } else {
                const errorText = await response.text();
                alert(`Ошибка регистрации: ${errorText}`);
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            alert('Не удалось связаться с сервером. Убедитесь, что бэкенд запущен.');
        }
    });
}

// ВХОД
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const passwordHash = document.getElementById('login-password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, passwordHash })
            });

            if (response.ok) {
                const data = await response.json();
                alert('Вход успешно выполнен!');

                // Сохраняем имя пользователя в браузере
                localStorage.setItem('username', data.username);

                closeModal('login-modal');
                checkAuth();
                e.target.reset();
            } else {
                const errorText = await response.text();
                alert(`Ошибка: ${errorText}`);
            }
        } catch (error) {
            console.error('Ошибка сети:', error);
            alert('Не удалось связаться с сервером. Убедитесь, что бэкенд запущен.');
        }
    });
}

// Запускаем проверку авторизации при старте страницы
checkAuth();
loadNews();