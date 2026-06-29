document.addEventListener('DOMContentLoaded', () => {
  // Select DOM elements for parallax blobs and navigation.
  const blobs = document.querySelectorAll('.bg-blob');
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const taglineEl = document.getElementById('heroTagline');
  const contactForm = document.getElementById('contactForm');
  const tabs = document.querySelectorAll('.ach-tab');
  const achCards = document.querySelectorAll('.ach-card');
  const sections = document.querySelectorAll('section[id]');
  const navAnchorLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');
  const themeToggle = document.getElementById('themeToggle');

  // Handle dark mode toggling
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  // Mouse tracking state for ambient background parallax blobs
  let xFraction = 0;
  let yFraction = 0;
  let isVisualsUpdating = false;

  // Single animation loop to handle parallax background blobs
  function updateVisuals() {
    // Apply background blob transforms based on mouse fraction using translate3d for GPU acceleration
    blobs.forEach((blob, idx) => {
      const depth = (idx + 1) * 20;
      const moveX = xFraction * depth;
      const moveY = yFraction * depth;
      blob.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
    isVisualsUpdating = false;
  }

  // Update target coordinates and start loop if stationary
  window.addEventListener('mousemove', (e) => {
    xFraction = e.clientX / window.innerWidth - 0.5;
    yFraction = e.clientY / window.innerHeight - 0.5;

    if (!isVisualsUpdating) {
      isVisualsUpdating = true;
      requestAnimationFrame(updateVisuals);
    }
  }, { passive: true });

  // Initial layout calculation for background blobs positioning
  isVisualsUpdating = true;
  requestAnimationFrame(updateVisuals);

  // Reveal elements on scroll using Intersection Observer
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });
  revealElements.forEach(el => revealObserver.observe(el));

  // Toggle navbar background transition when scrolling past threshold
  let isNavbarScrolled = false;
  window.addEventListener('scroll', () => {
    const shouldScroll = window.scrollY > 50;
    if (shouldScroll !== isNavbarScrolled) {
      isNavbarScrolled = shouldScroll;
      navbar.classList.toggle('scrolled', isNavbarScrolled);
    }
  }, { passive: true });

  // Mobile menu open/close toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  // Typewriter effect for the hero section tagline
  const taglineText = "Passionate about bridging web development with intelligence to craft seamless user experiences.";
  let typingIndex = 0;

  function typeText() {
    if (taglineEl && typingIndex < taglineText.length) {
      taglineEl.textContent += taglineText.charAt(typingIndex);
      typingIndex++;
      setTimeout(typeText, 30 + Math.random() * 25);
    }
  }
  setTimeout(typeText, 900);

  // Tab filter category selection for achievements
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterValue = tab.dataset.filter;

      achCards.forEach(card => {
        if (filterValue === 'all' || card.dataset.category === filterValue) {
          card.classList.remove('hidden');
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px) scale(0.98)';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 30);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // Track active section to highlight the corresponding navbar link
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        navAnchorLinks.forEach(link => {
          const isCurrent = link.getAttribute('href') === `#${activeId}`;
          link.classList.toggle('active-link', isCurrent);
        });
      }
    });
  }, {
    threshold: 0.25,
    rootMargin: '-20% 0px -60% 0px'
  });
  sections.forEach(section => sectionObserver.observe(section));

  // Handle contact form submission - opens email client with form data
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalContent = submitBtn.innerHTML;

      // Show sending state with animated spinner
      submitBtn.innerHTML = '<i class="ph ph-spinner-gap animate-spin"></i> Sending...';
      submitBtn.disabled = true;

      const formData = new FormData(contactForm);

      fetch(contactForm.action || 'https://splitforms.com/api/submit', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          // Success feedback
          submitBtn.innerHTML = '<i class="ph ph-check-circle"></i> Message Sent!';
          submitBtn.style.backgroundColor = '#16a34a';
          submitBtn.style.borderColor = '#16a34a';
          contactForm.reset();
        } else {
          throw new Error('Form submission failed');
        }
      })
      .catch(error => {
        console.error('Error submitting form:', error);
        // Error feedback
        submitBtn.innerHTML = '<i class="ph ph-x-circle"></i> Submission Failed';
        submitBtn.style.backgroundColor = '#dc2626';
        submitBtn.style.borderColor = '#dc2626';
      })
      .finally(() => {
        // Restore button state after delay
        setTimeout(() => {
          submitBtn.innerHTML = originalContent;
          submitBtn.style.backgroundColor = '';
          submitBtn.style.borderColor = '';
          submitBtn.disabled = false;
        }, 3500);
      });
    });
  }
});
