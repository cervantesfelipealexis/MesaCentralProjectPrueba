// ===============================================
// 1. LÓGICA DEL CARRUSEL (Sólo para Index)
// ===============================================
let slideIndex = 1;

// Verificamos si existen slides antes de arrancar
const slidesExist = document.getElementsByClassName("carrusel-slide").length > 0;
if (slidesExist) {
    showSlides(slideIndex);
}

function plusSlides(n) {
    showSlides(slideIndex += n);
}
function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("carrusel-slide");
    let dots = document.getElementsByClassName("dot");
    
    // Si la función se llama en una página sin carrusel, salimos silenciosamente
    if (slides.length === 0) return;

    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    // El check definitivo antes de aplicar estilos
    if (slides[slideIndex - 1]) {
        slides[slideIndex - 1].style.display = "block";
    }
    if (dots[slideIndex - 1]) {
        dots[slideIndex - 1].className += " active";
    }
}

// ===============================================
// 2. LÓGICA DE PAGINACIÓN DE BASE DE DATOS (CSV)
// ===============================================
let allData = []; 
const rowsPerPage = 20;
let currentPage = 1;

let tableBody, prevButton, nextButton, pageSpan;
let dynamicDataPath = null; 

function displayTable(data, wrapper) {
    if (!wrapper) return;
    wrapper.innerHTML = ''; 

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row[0] || ''}</td>
            <td>${row[1] || ''}</td>
            <td>${row[2] || ''}</td>
            <td>${row[3] || ''}</td>
            <td>${row[4] || ''}</td>
            <td>${row[5] || ''}</td>
        `;
        wrapper.appendChild(tr);
    });
}

function setupPagination() {
    if (!pageSpan || !prevButton || !nextButton) return;
    const pageCount = Math.ceil(allData.length / rowsPerPage) || 1;
    
    pageSpan.textContent = `Página ${currentPage} de ${pageCount}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === pageCount || allData.length === 0;
}

function goToNextPage() {
    const pageCount = Math.ceil(allData.length / rowsPerPage);
    if (currentPage < pageCount) {
        currentPage++;
        displayTable(allData, tableBody);
        setupPagination();
    }
}

function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayTable(allData, tableBody);
        setupPagination();
    }
}

function loadData() {
    if (!dynamicDataPath) return;

    Papa.parse(dynamicDataPath, {
        download: true, 
        header: false, 
        skipEmptyLines: true,
        complete: function(results) {
            results.data.shift(); // Quitar encabezado
            allData = results.data;
            displayTable(allData, tableBody);
            setupPagination();
        },
        error: function(error) {
            console.error("Error CSV:", error);
            setupPagination();
        }
    });
}

// ===============================================
// 3. INICIALIZACIÓN (DOMContentLoaded)
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
    // A. Lógica de Bases de Datos
    const detailsSection = document.querySelector('.field-details-section');
    if (detailsSection) {
        dynamicDataPath = detailsSection.getAttribute('data-csv-path');
    }
    
    tableBody = document.getElementById('data-table-body');
    prevButton = document.getElementById('prev-btn');
    nextButton = document.getElementById('next-btn');
    pageSpan = document.getElementById('page-status');

    if (tableBody && prevButton && nextButton && pageSpan) {
        prevButton.addEventListener('click', goToPrevPage);
        nextButton.addEventListener('click', goToNextPage);
        loadData();
    }

    // B. Lógica de Feed de Enseñanza (JSON)
    const feedContainer = document.getElementById("teaching-feed");
    if (feedContainer) {
        fetch("enseñanza.json")
            .then(response => response.json())
            .then(data => {
                feedContainer.innerHTML = ''; 
                data.forEach(item => {
                    const card = `
                        <div class="activity-card">
                            <img src="${item.imagen}" alt="${item.titulo}">
                            <div class="card-content">
                                <span class="date" style="color: #D4AF37; font-weight: bold;">[ ${item.categoria} ] - ${item.fecha}</span>
                                <h3>${item.titulo}</h3>
                                <p class="description">${item.descripcion}</p>
                                <a href="${item.link}" class="read-more">Ver detalles</a>
                            </div>
                        </div>
                    `;
                    feedContainer.innerHTML += card;
                });
            })
            .catch(error => console.error("Error JSON:", error));
    }
});
