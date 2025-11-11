import React, { useState, useEffect } from 'react';

const Navigation = ({ currentPage, onPageChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      if (!navbar) return;
      if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
      } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Robust smooth scroll (works for items near the bottom and after quick page changes)
  const scrollToSection = (sectionId) => {
    const tryScroll = (attempt = 0) => {
      const el = document.getElementById(sectionId);
      if (el) {
        const NAV_OFFSET = 88; // tweak if your navbar height changes
        const y =
          el.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;

        window.scrollTo({
          top: y,
          behavior: 'smooth',
        });
        setIsMenuOpen(false);
      } else if (attempt < 6) {
        requestAnimationFrame(() => tryScroll(attempt + 1));
      } else {
        setIsMenuOpen(false);
      }
    };

    tryScroll();
  };

  const handlePageChange = (page) => {
    onPageChange(page);
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <a
          href="#"
          className="nav-logo"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange('landing');
          }}
        >
          ACDC HR
        </a>

        <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <a
              href="#"
              className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange('dashboard');
              }}
            >
              Dashboard
            </a>
          </li>

          <li>
            <a
              href="#"
              className={`nav-link ${currentPage === 'landing' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange('landing');
              }}
            >
              Home
            </a>
          </li>

          <li>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange('landing');
                scrollToSection('employees');
              }}
            >
              Employees
            </a>
          </li>

          <li>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange('landing');
                scrollToSection('add-employee');
              }}
            >
              Add Employee
            </a>
          </li>

          <li>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange('landing');
                scrollToSection('contact');
              }}
            >
              Support
            </a>
          </li>

          
          <li>
            <a
              href="#"
              className={`nav-link ${currentPage === 'register' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange('register');
              }}
            >
              Register
            </a>
          </li>
        </ul>

        <div className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
