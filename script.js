document.addEventListener('DOMContentLoaded', function() {
    // --- 1. DECLARE ALL DOM VARIABLES ---
    const header = document.getElementById('main-header');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const heroSection = document.querySelector('.hero');
    const heroVideo = document.querySelector('.hero-video');
    const heroOverlay = document.querySelector('[data-layer="overlay"]');
    
    // --- Variavel do Modal ---
    const journeyCards = document.querySelectorAll('.journey-card');
    const modal = document.getElementById('journey-modal');
    const modalBody = document.getElementById('modal-body');
    
    // --- Variavel do Panel ---
    const memoryItems = document.querySelectorAll('.memory-item');
    const panel = document.getElementById('mapa-panel');
    const panelCloseBtn = panel ? panel.querySelector('.panel-close-btn') : null;
    const panelAudio = document.getElementById('panel-audio-source');
    
    // --- Variavel do Scroll ---
    const memoryItemsToAnimate = document.querySelectorAll('.memory-item');

    let galleryInterval;
    let currentAudio = null; 
    let resumeTimeout; 
    let currentPanelAudio = null;

    // --- 2.  DEFINA TODAS AS FUNCTIONS ---

   // --- SUBSTITUA A FUNÇÃO handleHeroScroll POR ESTA ---
function handleHeroScroll() {
    if (!heroSection || !heroVideo) return; 

    // Calcula a altura disponível para o scroll da animação
    const scrollableHeight = heroSection.offsetHeight - window.innerHeight;
    
    // Proteção: Se a seção for pequena demais, abre o vídeo direto
    if (scrollableHeight <= 0) {
        heroVideo.style.clipPath = 'inset(0%)';
        if (heroOverlay) heroOverlay.style.clipPath = 'inset(0%)';
        return;
    }

    let progress = window.scrollY / scrollableHeight;

    // --- CORREÇÃO 1: FORÇAR O FINAL ---
    // Se chegou em 98% do caminho, considera 100% para não sobrar bordas
    if (progress > 0.98) progress = 1;
    if (progress < 0) progress = 0;

    // --- CORREÇÃO 2: VALORES CENTRALIZADOS ---
    // Antes estava (25 top / 74 bottom). Isso criava uma tira no topo.
    // Agora vamos usar valores simétricos para abrir do CENTRO.
    const startInsetY = 40; // Começa com 40% de corte em cima e embaixo
    const startInsetX = 15; // Começa com 15% de corte nos lados

    const currentInsetY = startInsetY * (1 - progress);
    const currentInsetX = startInsetX * (1 - progress);

    // Aplica o recorte
    if (progress === 1) {
         heroVideo.style.clipPath = 'inset(0% 0% 0% 0%)';
         if (heroOverlay) heroOverlay.style.clipPath = 'inset(0% 0% 0% 0%)';
    } else {
         heroVideo.style.clipPath = `inset(${currentInsetY}% ${currentInsetX}% ${currentInsetY}% ${currentInsetX}%)`;
         
         if (heroOverlay) {
            // O overlay (borda) abre um pouquinho mais rápido para dar o efeito
            const overlayY = Math.max(0, currentInsetY - 0.5); 
            const overlayX = Math.max(0, currentInsetX - 0.5); 
            heroOverlay.style.clipPath = `inset(${overlayY}% ${overlayX}% ${overlayY}% ${overlayX}%)`;
        }
    }
}

// --- SUBSTITUA A FUNÇÃO handleScroll POR ESTA ---
function handleScroll() {
    if (!heroSection || !header) return; 

    const heroAnimationEnd = heroSection.offsetHeight - window.innerHeight;
    const scrollY = window.scrollY;

    // --- Lógica das Cores do MENU (Header) ---
    // Ajustado para garantir legibilidade
    if (scrollY > heroAnimationEnd - 50) { 
        // PASSO 3: Fim da animação -> Fundo sólido (creme), texto escuro/azul
        header.classList.add('scrolled');
        header.classList.remove('is-revealing');
    } else if (scrollY > 50) { 
        // PASSO 2: Durante o vídeo -> Fundo transparente, texto BRANCO
        header.classList.remove('scrolled');
        header.classList.add('is-revealing'); 
    } else {
        // PASSO 1: Início -> Fundo transparente, texto azul original
        header.classList.remove('scrolled');
        header.classList.remove('is-revealing');
    }
    
    // --- Lógica da ANIMAÇÃO DO VÍDEO ---
    if (scrollY < heroAnimationEnd) {
        // Durante o scroll
        if(heroVideo) {
            heroVideo.style.zIndex = '0'; // Vídeo fica no nível base
            heroVideo.style.position = 'fixed'; // Garante que fique fixo
            heroVideo.style.top = '0';
        }
        handleHeroScroll();
    } else {
        // Passou da animação
        if(heroVideo) {
            heroVideo.style.clipPath = `inset(0% 0%)`;
            heroVideo.style.zIndex = '-1'; // Joga para trás para não cobrir o conteúdo seguinte
            heroVideo.style.position = 'absolute'; // Destrava o vídeo (opcional, depende do seu layout)
            heroVideo.style.top = 'auto';
            heroVideo.style.bottom = '0';
        }
        if(heroOverlay) heroOverlay.style.clipPath = `inset(0% 0%)`;
    }
}
    
    // --- 3. ADICIONAR LISTENERS DE EVENTO E EXECUTAR FUNÇÕES INICIAIS ---
    
    window.addEventListener('scroll', handleScroll);
    handleHeroScroll(); // Executar ao carregar
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    function handleMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    function animateCursor() {
        if (!cursorDot || !cursorOutline) return;
        outlineX += (mouseX - outlineX) * 0.1;
        outlineY += (mouseY - outlineY) * 0.1;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
        cursorOutline.style.left = outlineX + 'px';
        cursorOutline.style.top = outlineY + 'px';
        requestAnimationFrame(animateCursor);
    }

    document.querySelectorAll('a, .journey-card, .memory-item, button, .control-btn, .nav-arrow').forEach(link => {
        link.addEventListener('mouseenter', () => {
            if(cursorOutline) cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });
        link.addEventListener('mouseleave', () => {
            if(cursorOutline) cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });
    
    window.addEventListener('mousemove', handleMouseMove);
    requestAnimationFrame(animateCursor); 

    // Lógica do Modal com Layout Dinâmico 
    journeyCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.dataset.title;

            /* Redirecionamento para a página LUGARES */
            if (title === '(lugares)') {
                window.location.href = 'lugares.html'; 
                return;
            }
            
            /*  Redirecionamento para a página SONS */
            if (title === '(sons)') {
                window.location.href = 'sons.html'; 
                return;
            }

          

            const img = card.dataset.img;
            const text = card.dataset.text;
            const quote = card.dataset.quote;
            const author = card.dataset.author;
            const type = card.dataset.type;

            if (!modalBody) return;
            modalBody.innerHTML = '';
            clearInterval(galleryInterval);
            clearTimeout(resumeTimeout);
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }

            if (type === 'preview-expand') {
                const isMemoriesCard = card.dataset.title === '(memórias)';

                const previewHTML = `
                    <span class="modal-close">&times;</span>
                    <div class="modal-preview-layout">
                        ${isMemoriesCard ? `
                            <div class="modal-image-container">
                                <video autoplay loop muted playsinline class="modal-video-background">
                                    <source src="videos/memorias.mp4" type="video/mp4">
                                </video>
                                <h2 class="modal-title">${title}</h2>
                                <a href="#modal-text-content" class="explore-link">
                                    <span>Explorar</span>
                                    <div class="explore-arrow"></div>
                                </a>
                            </div>
                        ` : `
                            <div class="modal-image-container" style="background-image: url('${img}')">
                                <h2 class="modal-title">${title}</h2>
                                <a href="#modal-text-content" class="explore-link">
                                    <span>Explorar</span>
                                    <div class="explore-arrow"></div>
                                </a>
                            </div>
                        `}
                        <div id="modal-text-content" class="modal-text-content">
                            ${isMemoriesCard ? `
                                <div class="quote-section-dark">
                                    <div class="modal-frame-corner top-left"></div>
                                    <div class="modal-frame-corner top-right"></div>
                                    <p class="modal-quote">${quote}</p>
                                    <p class="modal-author">${author || ''}</p>
                                    <div class="modal-frame-corner bottom-left"></div>
                                    <div class="modal-frame-corner bottom-right"></div>
                                </div>
                            ` : `
                                <p class="modal-quote">${quote}</p>
                                <p class="modal-author">${author || ''}</p>
                            `}
                            <div class="modal-expandable-content" id="expandable-content">
                                <div class="expanded-text-grid">
                                    <p>${card.dataset.textLeft || ''}</p>
                                    <p>${card.dataset.textRight || ''}</p>
                                </div>
                            </div>
                            <a href="#" class="modal-button" id="expand-btn">Ler Mais</a>
                        </div>
                        <div class="modal-gallery-container"></div>
                        <div class="gallery-footer is-visible">
                            <div class="modal-exit-button">
                                <a class="modal-close-trigger">Voltar</a>
                            </div>
                        </div>
                    </div>
                `;
                modalBody.innerHTML = previewHTML;
                
                setupGallery(); // Chama a galeria
                
                const expandBtn = document.getElementById('expand-btn');
                const expandableContent = document.getElementById('expandable-content');
                if(expandBtn && expandableContent) {
                    expandBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        expandableContent.classList.toggle('expanded');
                        expandBtn.textContent = expandableContent.classList.contains('expanded') ? 'Ler Menos' : 'Ler Mais';
                    });
                }

            } else { 
                const simpleModalHTML = `
                    <span class="modal-close">&times;</span>
                     <div class="modal-preview-layout">
                         <div class="modal-image-container" style="background-image: url('${img}')">
                             <h2 class="modal-title">${title}</h2>
                         </div>
                         <div class="modal-text-content">
                              <p class="modal-quote">${quote || ''}</p>
                              <p>${text || ''}</p>
                         </div>
                          <div class="gallery-footer is-visible">
                              <div class="modal-exit-button">
                                  <a class="modal-close-trigger">Voltar</a>
                              </div>
                          </div>
                     </div>
                `;
                modalBody.innerHTML = simpleModalHTML;
            }
            
            if (modal) modal.classList.add('active');
            document.body.classList.add('modal-open');
            
            setupModalAnimations();

            const closeBtn = modalBody.querySelector('.modal-close');
            const closeTrigger = modalBody.querySelector('.modal-close-trigger');
            if (closeBtn) closeBtn.addEventListener('click', closeModal);
            if (closeTrigger) closeTrigger.addEventListener('click', closeModal);
        });
    });

    function closeModal() {
        if (modal) modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        clearInterval(galleryInterval);
        clearTimeout(resumeTimeout);
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
    }
    
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    }

    function setupModalAnimations() {
        const modalContent = document.querySelector('#journey-modal .modal-content');
        if (!modalContent) return;

        const elementsToAnimate = modalContent.querySelectorAll('.quote-section-dark, .modal-button, .modal-expandable-content, .gallery-footer');
        if (elementsToAnimate.length === 0) return;

        elementsToAnimate.forEach(el => {
            el.classList.remove('is-visible');
            el.style.transitionDelay = '0s';
        });

        const modalObserverOptions = {
            root: modalContent,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };

        const modalObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    entry.target.style.transitionDelay = `${index * 0.15}s`;
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, modalObserverOptions);

        elementsToAnimate.forEach(el => {
            modalObserver.observe(el);
        });
    }

    const cardsToAnimate = document.querySelectorAll('.journey-card');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 
    };

    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                entry.target.classList.remove('is-visible');
            }
        });
    }, observerOptions);

    cardsToAnimate.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.2}s`;
        cardObserver.observe(card);
    });

    function setupGallery() {
         const galleryData = [
             {
                 img: 'images/arvore-genealogica.png',
                 title: 'Árvore genealógica de Fausto Nilo',
                 subtitle: 'Pesquisa: Prof Cesar Sabino<br>Bordado: Mestra Dadá Leitão',
                 audioSrc: 'audios/arvore.mp3', 
                 extraInfo: 'A árvore genealógica bordada é uma obra de arte que conecta gerações, mostrando as raízes profundas do artista no sertão cearense.'
             },
             {
                 img: 'images/caderno-de-canto.png',
                 title: 'Livro de cantorias e paródias',
                 subtitle: 'De Selma Costa, irmã de Fausto Nilo<br>Acervo Pessoal',
                 audioSrc: 'audios/parodias.mp3', 
                 extraInfo: 'Este caderno era um tesouro de família, onde as canções populares se misturavam com a criatividade do cotidiano, influenciando o jovem Fausto.'
             },
             {
                 img: 'images/fausto-crianca.png',
                 title: 'Fausto Nilo aos 2 anos',
                 subtitle: 'Revista Dragão do Mar<br>Nº 3',
                 audioSrc: 'audios/fausto.mp3', 
                 extraInfo: 'Nesta foto rara, já se pode notar o olhar curioso que mais tarde se tornaria a marca de um dos maiores observadores da cultura brasileira.'
             }
         ];

         const galleryContainer = document.querySelector('.modal-gallery-container');
         if(!galleryContainer) return;

         galleryContainer.innerHTML = `
             <div class="gallery-layout-grid">
                 <div class="gallery-carousel-wrapper">
                      <div class="gallery-nav-arrows">
                          <div class="nav-arrow" id="prev-arrow"><svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg></div>
                          <div class="nav-arrow" id="next-arrow"><svg viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg></div>
                      </div>
                     <div class="gallery-carousel">
                         ${galleryData.map((item, index) => `
                             <div class="gallery-item" data-index="${index}">
                                 <img src="${item.img}" alt="${item.title}" class="gallery-image">
                             </div>
                         `).join('')}
                     </div>
                 </div>
                 <div class="gallery-info-panel">
                      <div class="gallery-text">
                          <h4></h4>
                          <p></p>
                     </div>
                     <div class="gallery-controls">
                          <button class="control-btn info-toggle" title="Saber mais"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg></button>
                          <button class="control-btn audio-toggle" title="Ouvir"><svg class="play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg><svg class="pause-icon" style="display:none;" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></button>
                          <div class="gallery-timer-container">
                              <svg class="gallery-timer-svg" viewBox="0 0 36 36">
                                  <path class="timer-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                  <path class="timer-progress" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                              </svg>
                          </div>
                     </div>
                     <div class="extra-info">
                          <p></p>
                          <button class="continue-btn">Continuar</button>
                     </div>
                 </div>
             </div>
              ${galleryData.map(item => `<audio class="gallery-audio" src="${item.audioSrc}" preload="metadata"></audio>`).join('')}
         `;
         
         const infoPanel = galleryContainer.querySelector('.gallery-info-panel');
         const carouselWrapper = galleryContainer.querySelector('.gallery-carousel-wrapper');
         const galleryItems = galleryContainer.querySelectorAll('.gallery-item');
         const allAudios = galleryContainer.querySelectorAll('.gallery-audio');

         if (galleryItems.length === 0 || !infoPanel) return;

         let currentItem = 0;
         const slideDuration = 5000;

         function updateInfoPanel(index) {
             const data = galleryData[index];
             if (!data) return;
             
             const titleEl = infoPanel.querySelector('h4');
             const subtitleEl = infoPanel.querySelector('p');
             const extraInfoEl = infoPanel.querySelector('.extra-info p');
             
             if(titleEl) titleEl.innerHTML = data.title;
             if(subtitleEl) subtitleEl.innerHTML = data.subtitle;
             if(extraInfoEl) extraInfoEl.innerHTML = data.extraInfo;
             
             infoPanel.classList.add('is-active');
         }

         function showItem(index) {
             if (currentAudio && !currentAudio.paused) {
                 currentAudio.pause();
             }
             currentItem = index;
             
             galleryItems.forEach((item, itemIdx) => {
                 const isActive = itemIdx === currentItem;
                 
                 let transform = '';
                 const zTranslate = 200;
                 const rotateY = 45;

                 if (itemIdx < currentItem) {
                      transform = `translateX(-50%) translateZ(-${zTranslate}px) rotateY(${rotateY}deg)`;
                 } else if (itemIdx > currentItem) {
                      transform = `translateX(50%) translateZ(-${zTranslate}px) rotateY(-${rotateY}deg)`;
                 } else {
                      transform = `translateZ(0) rotateY(0)`;
                 }
                 item.style.transform = transform;
                 item.style.opacity = isActive ? '1' : '0.4';
                 
                 item.style.pointerEvents = 'all'; 
                 item.style.zIndex = isActive ? 10 : 1; 
             });
             
             infoPanel.classList.remove('is-active');
             const extraInfoPanel = infoPanel.querySelector('.extra-info');
             if (extraInfoPanel) extraInfoPanel.classList.remove('visible');
             
             setTimeout(() => updateInfoPanel(currentItem), 400);
         }
         
         function showNextItem() {
             const nextIndex = (currentItem + 1) % galleryItems.length;
             showItem(nextIndex);
         }

         function showPrevItem() {
             const prevIndex = (currentItem - 1 + galleryItems.length) % galleryItems.length;
             showItem(prevIndex);
         }

         function startSlideshow() {
             clearInterval(galleryInterval);
             galleryInterval = setInterval(showNextItem, slideDuration);
         }

         const nextArrow = document.getElementById('next-arrow');
         const prevArrow = document.getElementById('prev-arrow');
         
         if (nextArrow) {
             nextArrow.addEventListener('click', () => {
                 showNextItem();
                 startSlideshow();
             });
         }
         if (prevArrow) {
             prevArrow.addEventListener('click', () => {
                 showPrevItem();
                 startSlideshow();
             });
         }
         
         galleryItems.forEach((item, index) => {
             item.addEventListener('click', () => {
                 if (index !== currentItem) {
                     showItem(index);
                     startSlideshow();
                 }
             });
         });

         let touchStartX = 0;
         if (carouselWrapper) {
            carouselWrapper.addEventListener('touchstart', e => {
                touchStartX = e.touches[0].clientX;
                clearInterval(galleryInterval);
            }, { passive: true }); 
            carouselWrapper.addEventListener('touchend', e => {
                const touchEndX = e.changedTouches[0].clientX;
                if (touchStartX - touchEndX > 50) { // desliza left
                    showNextItem();
                } else if (touchEndX - touchStartX > 50) { // desliza right
                    showPrevItem();
                }
                startSlideshow();
            });
         }
         
         const audioToggle = infoPanel.querySelector('.audio-toggle');
         const infoToggle = infoPanel.querySelector('.info-toggle');
         const extraInfo = infoPanel.querySelector('.extra-info');
         const continueBtn = infoPanel.querySelector('.continue-btn');

         if (audioToggle) {
            audioToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const activeAudio = allAudios[currentItem];
                if (activeAudio) {
                    if (activeAudio.paused) {
                        if (currentAudio && !currentAudio.paused) currentAudio.pause();
                        activeAudio.play();
                        currentAudio = activeAudio;
                    } else {
                        activeAudio.pause();
                    }
                }
            });
         }

         allAudios.forEach((audio, index) => {
            audio.onplay = () => {
                if (index === currentItem && audioToggle) {
                    const playIcon = audioToggle.querySelector('.play-icon');
                    const pauseIcon = audioToggle.querySelector('.pause-icon');
                    if (playIcon) playIcon.style.display = 'none';
                    if (pauseIcon) pauseIcon.style.display = 'block';
                }
                clearInterval(galleryInterval); 
            };
            audio.onpause = () => {
                if (index === currentItem && audioToggle) {
                    const playIcon = audioToggle.querySelector('.play-icon');
                    const pauseIcon = audioToggle.querySelector('.pause-icon');
                    if (playIcon) playIcon.style.display = 'block';
                    if (pauseIcon) pauseIcon.style.display = 'none';
                }
                if (!extraInfo || !extraInfo.classList.contains('visible')) {
                    startSlideshow();
                }
            };
            audio.onended = () => {
                 if (index === currentItem && audioToggle) {
                    const playIcon = audioToggle.querySelector('.play-icon');
                    const pauseIcon = audioToggle.querySelector('.pause-icon');
                    if (playIcon) playIcon.style.display = 'block';
                    if (pauseIcon) pauseIcon.style.display = 'none';
                }
            };
         });
         
         if (infoToggle && extraInfo) {
            infoToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                extraInfo.classList.add('visible'); 
                clearInterval(galleryInterval); 
                if (currentAudio && !currentAudio.paused) {
                    currentAudio.pause();
                }
            });
         }

         if (continueBtn && extraInfo) {
            continueBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                extraInfo.classList.remove('visible'); 
                showNextItem();
                startSlideshow();
            });
         }
         
         showItem(0);
         startSlideshow();
    }
    
    function createWavyText(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => { 
            if (element) {
                const text = element.textContent;
                element.innerHTML = '';
                text.split('').forEach((char, index) => {
                    const span = document.createElement('span');
                    span.className = 'wavy-char';
                    span.textContent = char === ' ' ? '\u00A0' : char;
                    span.style.animationDelay = `${index * 0.1}s`;
                    element.appendChild(span);
                });
            }
        });
    }
    createWavyText('.journey-title-block h3');
    createWavyText('.about-title-block h3');

    //  LÓGICA DO MAPA AFETIVO 
    memoryItems.forEach(item => {
        item.addEventListener('click', () => {
            if (!panel) return;
            
            /*  Reset do painel ao clicar */
            if (currentPanelAudio && !currentPanelAudio.paused) {
                currentPanelAudio.pause();
            }
            if (panelAudio) panelAudio.currentTime = 0;
            const oldVideoWrapper = panel.querySelector('.panel-video-wrapper');
            if (oldVideoWrapper) {
                oldVideoWrapper.remove();
            }
            const panelText = panel.querySelector('#panel-text');
            const audioPlayer = panel.querySelector('#panel-audio-player');
            if (panelText) panelText.style.display = 'block';
            if (audioPlayer) audioPlayer.style.display = 'flex';


            /*  Fim do Reset */


            const panelMediaContainer = panel.querySelector('#panel-media-container');
            const bgImage = item.dataset.imgBg;
            
            if (panelMediaContainer && bgImage) {
                panelMediaContainer.innerHTML = `
                    <img src="${bgImage}" alt="${item.dataset.title}" class="panel-image">
                `;
            } else if (panelMediaContainer) {
                panelMediaContainer.innerHTML = '';
            }

            const panelTitle = panel.querySelector('#panel-title');
            if (panelTitle) panelTitle.textContent = item.dataset.title;
            
            if (panelText) panelText.innerHTML = item.dataset.text; 
            
            const audioSrc = item.dataset.audioNarracao;
            const youtubeId = item.dataset.youtubeId;
            const audioTitle = panel.querySelector('#panel-audio-title');

            panel.dataset.youtubeId = youtubeId || "";
            panel.dataset.audioSrc = audioSrc || "";
            
            if (audioSrc && panelAudio && audioPlayer && audioTitle) {
                audioPlayer.style.display = 'flex';
                audioTitle.textContent = item.dataset.audioTitle;
                panelAudio.src = audioSrc;
            } else if (youtubeId && audioPlayer && audioTitle) {
                audioPlayer.style.display = 'flex';
                audioTitle.textContent = item.dataset.videoTitle; 
                panelAudio.src = ""; 
            } else if (audioPlayer) {
                audioPlayer.style.display = 'none';
            }

            panel.classList.add('is-open');
            document.body.classList.add('panel-open');

            /* Lógica do 'Ler Mais'  */
            const expandBtn = panel.querySelector('.modal-button');
            const expandableContent = panel.querySelector('.modal-expandable-content');

            if (expandBtn && expandableContent) {
                if (expandableContent.innerHTML.trim() === "") {
                    expandBtn.style.display = 'none';
                } else {
                    expandBtn.style.display = 'inline-block';
                    expandBtn.textContent = 'Ler Mais'; 
                    expandableContent.classList.remove('expanded'); 
                }

                expandBtn.onclick = (e) => {
                    e.preventDefault();
                    expandableContent.classList.toggle('expanded');
                    expandBtn.textContent = expandableContent.classList.contains('expanded') ? 'Ler Menos' : 'Ler Mais';
                };
            }
        });
    });

    function closePanel() {
        if (!panel) return;
        panel.classList.remove('is-open');
        document.body.classList.remove('panel-open');
        
        if (currentPanelAudio && !currentPanelAudio.paused) {
            currentPanelAudio.pause();
        }
        if (panelAudio && !panelAudio.paused) {
            panelAudio.pause();
            panelAudio.currentTime = 0;
        }
        
        const videoWrapper = panel.querySelector('.panel-video-wrapper');
        if (videoWrapper) videoWrapper.remove();
        
        const panelText = panel.querySelector('#panel-text');
        const audioPlayer = panel.querySelector('#panel-audio-player');
        if (panelText) panelText.style.display = 'block';
        if (audioPlayer) audioPlayer.style.display = 'flex';
    }

    if (panelCloseBtn) panelCloseBtn.addEventListener('click', closePanel);

    /*  Fechar o painel ao clicar fora  */
    document.addEventListener('click', function(event) {
        if (!panel || !panel.classList.contains('is-open')) {
            return;
        }
        if (panel.contains(event.target)) {
            return;
        }
        if (event.target.closest('.memory-item')) {
            return;
        }
        closePanel();
    });


    // Lógica do player de áudio/vídeo do painel
    const panelAudioBtn = document.getElementById('panel-audio-btn');
    if (panelAudioBtn) {
        const playIcon = panelAudioBtn.querySelector('.play-icon');
        const pauseIcon = panelAudioBtn.querySelector('.pause-icon');

        /*  Lógica para tocar ÁUDIO ou VÍDEO */
        panelAudioBtn.addEventListener('click', () => {
            const videoId = panel.dataset.youtubeId;
            const audioSrc = panel.dataset.audioSrc;
            
            if (videoId) {
                //  VÍDEO DO YOUTUBE
                const panelContent = panel.querySelector('.panel-content');
                const panelText = panel.querySelector('#panel-text');
                const audioPlayer = panel.querySelector('#panel-audio-player');

                /* Lógica do 'embed' com o ID */
                const videoHtml = `
                    <div class="panel-video-wrapper">
                        <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1" 
                                frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
                        </iframe>
                        <button id="panel-video-close-btn">Fechar Vídeo</button>
                    </div>
                `;

                if (panelText) panelText.style.display = 'none';
                if (audioPlayer) audioPlayer.style.display = 'none';
                panelContent.insertAdjacentHTML('beforeend', videoHtml);

            } else if (audioSrc && panelAudio) { 
                // ÁUDIO MP3 
                if (panelAudio.paused) {
                    panelAudio.play();
                } else {
                    panelAudio.pause();
                }
            }
        });

        /* Listener para o botão "Fechar Vídeo" */
        panel.addEventListener('click', function(event) {
            if (event.target.id === 'panel-video-close-btn') {
                const videoWrapper = panel.querySelector('.panel-video-wrapper');
                if (videoWrapper) videoWrapper.remove();
                
                const panelText = panel.querySelector('#panel-text');
                const audioPlayer = panel.querySelector('#panel-audio-player');
                if (panelText) panelText.style.display = 'block';
                if (audioPlayer) audioPlayer.style.display = 'flex';
            }
        });


        if (panelAudio) {
            panelAudio.onplay = () => {
                currentPanelAudio = panelAudio;
                if (playIcon) playIcon.style.display = 'none';
                if (pauseIcon) pauseIcon.style.display = 'block';
            };
            panelAudio.onpause = () => {
                currentPanelAudio = null;
                if (playIcon) playIcon.style.display = 'block';
                if (pauseIcon) pauseIcon.style.display = 'none';
            };
            panelAudio.onended = () => {
                 if (playIcon) playIcon.style.display = 'block';
                 if (pauseIcon) pauseIcon.style.display = 'none';
            };
        }
    }

    //  LÓGICA DA ANIMAÇÃO DA COLAGEM 
    const memoryObserverOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px', 
        threshold: 0.1
    };

    const memoryObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            } else {
                entry.target.classList.remove('is-visible');
            }
        });
    }, memoryObserverOptions);

    memoryItemsToAnimate.forEach(item => {
        memoryObserver.observe(item);
    });

    window.addEventListener('load', function() {
        document.body.classList.add('site-loaded');
    });


});




