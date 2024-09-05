function toggleMenu() {
    const navbar = document.querySelector('.navbar');
    navbar.classList.toggle('expanded');
}

function toggleSubMenu() {
    const subMenu = document.querySelector('.sub-menus');
    subMenu.style.display = subMenu.style.display === 'block' ? 'none' : 'block';
}
