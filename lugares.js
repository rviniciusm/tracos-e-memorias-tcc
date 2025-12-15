document.addEventListener('DOMContentLoaded', function() {

    /* Lógica do Cursor Personalizado */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
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

    document.querySelectorAll('a, .voltar-btn').forEach(link => {
        link.addEventListener('mouseenter', () => {
            if(cursorOutline) cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });
        link.addEventListener('mouseleave', () => {
            if(cursorOutline) cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });
    
    window.addEventListener('mousemove', handleMouseMove);
    requestAnimationFrame(animateCursor); 
    /* Fim da Lógica do Cursor */


    /* Lógica da Animação "Anzol" */
    
    const itemsParaAnimar = document.querySelectorAll('.reveal-item');

    const observerOptions = {
        root: null, 
        rootMargin: '0px 0px -200px 0px', 
        threshold: 0.1 
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            // O item está visível?
            if (entry.isIntersecting) {
                // Adiciona a classe '.is-visible'
                entry.target.classList.add('is-visible');
                // Isso impede o "loop" da tremedeira
                observer.unobserve(entry.target);
            }
        });
    };

    
    /* Fim da Atualização */

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    itemsParaAnimar.forEach(item => {
        observer.observe(item);
    });

});