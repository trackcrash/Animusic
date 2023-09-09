window.addEventListener('scroll', function() {
    sessionStorage.setItem('scrollPosition', window.scrollY);
});


window.addEventListener('load', function() {
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    if (savedScrollPosition) {
        window.scrollTo(0, savedScrollPosition);
    }
});