

document.addEventListener('DOMContentLoaded', function () {
  // Variables
  const exploreBtn = document.getElementById('exploreBtn');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.getElementById('mobileMenu');

  // Navbar scroll effect
  window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      navbar.style.padding = '0.8rem 0';
    } else {
      navbar.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
      navbar.style.padding = '1.2rem 0';
    }
  });

  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // Explore button scroll to AI Tools section
  if (exploreBtn) {
    exploreBtn.addEventListener('click', function () {
      const aiToolsSection = document.getElementById('ai-tools');
      if (aiToolsSection) {
        window.scrollTo({
          top: aiToolsSection.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  }

  // ✅ Mobile menu toggle
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('show');
      mobileMenuBtn.classList.toggle('active');
    });
  }

  // ✅ Close mobile menu on link click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.classList.remove('show');
      if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
    });
  });

  // Animation on scroll
  function animateOnScroll() {
    const elements = document.querySelectorAll('.tool-card');

    elements.forEach(element => {
      const position = element.getBoundingClientRect();

      if (position.top < window.innerHeight && position.bottom >= 0) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }
    });
  }

  document.querySelectorAll('.tool-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  window.addEventListener('scroll', animateOnScroll);
  animateOnScroll();
});
