document.addEventListener('DOMContentLoaded', function() {

    /* --- Lógica do Cursor --- */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;
    function handleMouseMove(e) { mouseX = e.clientX; mouseY = e.clientY; }
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
    document.querySelectorAll('.ticket-card, .play-button, .voltar-btn, .return-btn').forEach(el => {
        el.addEventListener('mouseenter', () => { if(cursorOutline) cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)'; });
        el.addEventListener('mouseleave', () => { if(cursorOutline) cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)'; });
    });
    window.addEventListener('mousemove', handleMouseMove);
    requestAnimationFrame(animateCursor);


    /*  LÓGICA DO PLAYER */
    const audioPlayer = document.getElementById('global-audio-player');
    const tickets = document.querySelectorAll('.ticket-card'); 
    let currentTicket = null; 

    // Função para fechar vídeos do YouTube
    function closeAllVideos() {
        tickets.forEach(t => {
            t.classList.remove('is-video-mode');
            const videoWrapper = t.querySelector('.video-embed-wrapper');
            if (videoWrapper) videoWrapper.remove();
        });
    }

    // Função para resetar visualmente um ticket de áudio
    function resetAudioTicket(ticket) {
        ticket.classList.remove('playing');
        const fill = ticket.querySelector('.progress-fill');
        if(fill) fill.style.width = '0%';
    }

    tickets.forEach(ticket => {
        const playBtn = ticket.querySelector('.play-button');

        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const youtubeId = ticket.dataset.youtubeId;
            const audioSrc = ticket.dataset.audio;

            // 1. SE FOR YOUTUBE
            if (youtubeId) {
                if (ticket.classList.contains('is-video-mode')) return;

                // Fecha tudo e inicia o vídeo
                closeAllVideos();
                if (!audioPlayer.paused) {
                    audioPlayer.pause();
                    // Se estava tocando um áudio, reseta o visual dele
                    if (currentTicket && currentTicket.dataset.audio) {
                        resetAudioTicket(currentTicket);
                    }
                }
                
                const videoHtml = `
                    <div class="video-embed-wrapper">
                        <iframe class="video-frame" 
                                src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1" 
                                frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>
                        </iframe>
                        <button class="close-embed-btn">FECHAR VÍDEO</button>
                    </div>
                `;

                ticket.insertAdjacentHTML('beforeend', videoHtml);
                setTimeout(() => { ticket.classList.add('is-video-mode'); }, 10);

                setTimeout(() => {
                   ticket.querySelector('.close-embed-btn').addEventListener('click', (ev) => {
                       ev.stopPropagation();
                       closeAllVideos();
                   });
                }, 50);
                
                currentTicket = null; // Vídeo não usa o player de áudio
            } 
            
            // 2. SE FOR MP3
            else if (audioSrc) {
                closeAllVideos(); // Fecha vídeos se tiver algum aberto

                // CASO A: Clicou no MESMO ticket
                if (currentTicket === ticket) {
                    if (audioPlayer.paused) {
                        audioPlayer.play(); // Retoma (RESUME)
                        ticket.classList.add('playing');
                    } else {
                        audioPlayer.pause(); // Pausa
                        ticket.classList.remove('playing');
                    }
                } 
                
                // CASO B: Clicou em um ticket NOVO
                else {
                    // Reseta o anterior
                    if (currentTicket) {
                        resetAudioTicket(currentTicket);
                    }

                    // Configura o novo
                    audioPlayer.src = audioSrc;
                    audioPlayer.currentTime = 0; // Começa do zero
                    audioPlayer.play();
                    
                    ticket.classList.add('playing');
                    currentTicket = ticket;
                }
            }
        });
    });

    // --- Barra de Progresso (MP3) 
    audioPlayer.addEventListener('timeupdate', () => {
        // Atualiza a barra apenas se houver um ticket de áudio ativo
        if (currentTicket) {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            const fill = currentTicket.querySelector('.progress-fill');
            if (fill) fill.style.width = `${progress}%`;
        }
    });

    // Quando o áudio acaba 
    audioPlayer.addEventListener('ended', () => {
        if (currentTicket) {
            resetAudioTicket(currentTicket);
            currentTicket = null;
        }
    });
    
    // Clicar fora fecha vídeos
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.ticket-card') && !e.target.closest('.tickets-container')) {
             closeAllVideos();
        }
    });

});