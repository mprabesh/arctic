// FAQ Data - Will be loaded from JSON file
let faqData = [];

// Load FAQ data from JSON file
async function loadFAQData() {
    try {
        const response = await fetch('data/faq.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        faqData = data.faqData;
        console.log(`Loaded ${faqData.length} FAQ items`);
        
        // Initialize FAQ display after data is loaded
        loadFAQs();
    } catch (error) {
        console.error('Error loading FAQ data:', error);
        // Fallback to showing an error message
        document.getElementById('faqContainer').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <h4>Unable to load FAQ data</h4>
                <p>Please refresh the page or contact support if the problem persists.</p>
                <button onclick="loadFAQData()" class="btn btn-primary" style="margin-top: 1rem;">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Enhanced search functionality with JSON data
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const resultsContainer = document.getElementById('searchResults');
    
    if (searchTerm.length < 2) {
        resultsContainer.classList.add('hidden');
        return;
    }
    
    if (faqData.length === 0) {
        resultsContainer.innerHTML = `
            <div style="padding: 1rem; text-align: center; color: #666;">
                Loading FAQ data... Please try again in a moment.
            </div>
        `;
        resultsContainer.classList.remove('hidden');
        return;
    }
    
    const matchingFAQs = faqData.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm) || 
        faq.answer.toLowerCase().includes(searchTerm) ||
        (faq.tags && faq.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
    
    if (matchingFAQs.length > 0) {
        resultsContainer.innerHTML = `
            <div style="padding: 1rem;">
                <h4>Search Results (${matchingFAQs.length} found):</h4>
                ${matchingFAQs.map(faq => `
                    <div style="padding: 1rem; border-bottom: 1px solid #eee; cursor: pointer;" 
                         onclick="scrollToFAQItem('${faq.question}')">
                        <strong>${faq.question}</strong>
                        <p style="color: #666; margin-top: 0.5rem;">
                            ${faq.answer.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </p>
                    </div>
                `).join('')}
            </div>
        `;
        resultsContainer.classList.remove('hidden');
    } else {
        resultsContainer.innerHTML = `
            <div style="padding: 1rem; text-align: center; color: #666;">
                No results found. Try different keywords or 
                <a href="#contact" onclick="closeSearchResults()">contact support</a>.
            </div>
        `;
        resultsContainer.classList.remove('hidden');
    }
}

function closeSearchResults() {
    document.getElementById('searchResults').classList.add('hidden');
    document.getElementById('searchInput').value = '';
}

// FAQ pagination variables
let currentFAQCount = 4; // Show 4 FAQs initially
const faqIncrement = 4; // Load 4 more each time
let currentCategory = 'all';

// FAQ Functions
function loadFAQs(category = 'all', resetCount = true) {
    const container = document.getElementById('faqContainer');
    const counter = document.getElementById('faqCounter');
    
    // Reset count when changing categories
    if (resetCount || category !== currentCategory) {
        currentFAQCount = 4;
        currentCategory = category;
    }
    
    // Show loading indicator if no data
    if (faqData.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Loading FAQ data...</p>
            </div>
        `;
        if (counter) counter.textContent = '';
        return;
    }
    
    const filteredFAQs = category === 'all' ? faqData : faqData.filter(faq => faq.category === category);
    
    if (filteredFAQs.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>No FAQ items found for this category.</p>
            </div>
        `;
        if (counter) counter.textContent = '';
        return;
    }
    
    // Get FAQs to display (limited by currentFAQCount)
    const displayedFAQs = filteredFAQs.slice(0, currentFAQCount);
    const hasMore = filteredFAQs.length > currentFAQCount;
    
    // Update counter
    if (counter) {
        const totalCount = faqData.length;
        const categoryCount = filteredFAQs.length;
        const shownCount = displayedFAQs.length;
        
        if (category === 'all') {
            counter.textContent = hasMore 
                ? `(showing ${shownCount} of ${totalCount} questions)` 
                : `(${totalCount} questions)`;
        } else {
            counter.textContent = hasMore 
                ? `(showing ${shownCount} of ${categoryCount})` 
                : `(${categoryCount} of ${totalCount})`;
        }
    }
    
    // Generate FAQ HTML
    const faqHTML = displayedFAQs.map((faq, index) => `
        <div class="faq-item" data-category="${faq.category}" data-id="${faq.id}">
            <div class="faq-question" onclick="toggleFAQ(this)">
                <span>${faq.question}</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
                <div>${faq.answer}</div>
                ${faq.tags ? `<div class="faq-tags"><strong>Related:</strong> ${faq.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>` : ''}
            </div>
        </div>
    `).join('');
    
    // Add Load More button if needed
    const loadMoreHTML = hasMore ? `
        <div class="load-more-container">
            <button class="btn btn-secondary load-more-btn" onclick="loadMoreFAQs()">
                <i class="fas fa-plus"></i>
                Load More Questions (${filteredFAQs.length - currentFAQCount} remaining)
            </button>
            ${filteredFAQs.length - currentFAQCount > 4 ? `
                <button class="btn btn-info show-all-btn" onclick="showAllFAQs()">
                    <i class="fas fa-list"></i>
                    Show All ${filteredFAQs.length} Questions
                </button>
            ` : ''}
        </div>
    ` : '';
    
    container.innerHTML = faqHTML + loadMoreHTML;
}

// Load more FAQs function
function loadMoreFAQs() {
    currentFAQCount += faqIncrement;
    loadFAQs(currentCategory, false); // Don't reset count
    
    // Smooth scroll to the newly loaded content
    setTimeout(() => {
        const newItems = document.querySelectorAll('.faq-item');
        if (newItems.length > faqIncrement) {
            const targetItem = newItems[newItems.length - faqIncrement];
            if (targetItem) {
                targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, 100);
}

// Show all FAQs function
function showAllFAQs() {
    const filteredFAQs = currentCategory === 'all' ? faqData : faqData.filter(faq => faq.category === currentCategory);
    currentFAQCount = filteredFAQs.length;
    loadFAQs(currentCategory, false); // Don't reset count
    
    // Smooth scroll to the top of FAQ section
    setTimeout(() => {
        document.getElementById('faq').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function toggleFAQ(element) {
    const faqItem = element.closest('.faq-item');
    const isActive = faqItem.classList.contains('active');
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Toggle current item
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

function scrollToFAQItem(question) {
    closeSearchResults();
    
    // Find the FAQ item and its category
    const targetFAQ = faqData.find(faq => faq.question === question);
    if (targetFAQ) {
        // Switch to the appropriate category and load enough FAQs
        const targetCategory = targetFAQ.category;
        const categoryFAQs = faqData.filter(faq => faq.category === targetCategory);
        const faqIndex = categoryFAQs.findIndex(faq => faq.question === question);
        
        // Set category and ensure enough FAQs are loaded
        currentCategory = targetCategory;
        currentFAQCount = Math.max(4, faqIndex + 1);
        
        // Update category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === targetCategory);
        });
        
        // Load FAQs and then scroll
        loadFAQs(targetCategory, false);
        
        setTimeout(() => {
            const faqItems = document.querySelectorAll('.faq-question span');
            faqItems.forEach(item => {
                if (item.textContent === question) {
                    item.closest('.faq-question').click();
                    item.closest('.faq-item').scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }, 300);
    } else {
        // Fallback to regular scroll
        scrollToFAQ();
    }
}

// Category filtering
document.addEventListener('DOMContentLoaded', function() {
    // Load FAQ data first, then initialize the interface
    loadFAQData();
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadFAQs(this.dataset.category, true); // Reset count when changing categories
        });
    });
    
    // Search on Enter key
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        const searchContainer = document.querySelector('.search-section');
        if (!searchContainer.contains(e.target)) {
            closeSearchResults();
        }
    });
});

// Modal Functions
function openTicket() {
    document.getElementById('ticketModal').classList.remove('hidden');
}

function openTicketForm() {
    openTicket();
}

function closeModal() {
    document.getElementById('ticketModal').classList.add('hidden');
}

// Navigation Functions
function scrollToFAQ() {
    document.getElementById('faq').scrollIntoView({ behavior: 'smooth' });
}

function showChat() {
    // Simulate chat opening
    alert('Live Chat will open here. Currently available Mon-Fri 9AM-5PM CST.\n\nFor immediate assistance, please call 1-800-ARCTIC-1 or submit a support ticket.');
}

function startChat() {
    showChat();
}

// Support Ticket Form
document.addEventListener('DOMContentLoaded', function() {
    const ticketForm = document.getElementById('ticketForm');
    if (ticketForm) {
        ticketForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                priority: document.getElementById('priority').value,
                category: document.getElementById('category').value,
                subject: document.getElementById('subject').value,
                description: document.getElementById('description').value
            };
            
            // Simulate ticket submission
            alert(`Ticket submitted successfully!\n\nTicket ID: ADS-${Date.now()}\nPriority: ${formData.priority}\nExpected Response: ${formData.priority === 'urgent' ? '2 hours' : formData.priority === 'high' ? '12 hours' : '72 hours'}\n\nYou'll receive an email confirmation shortly.`);
            
            closeModal();
            ticketForm.reset();
        });
    }
});

// Issue Card Click Handlers
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.issue-card').forEach(card => {
        card.addEventListener('click', function() {
            const issueType = this.querySelector('h4').textContent;
            let searchTerm = '';
            
            switch(issueType) {
                case 'Login Problems':
                    searchTerm = 'login';
                    break;
                case 'File Upload Errors':
                    searchTerm = 'upload';
                    break;
                case 'Can\'t Find Documents':
                    searchTerm = 'migration';
                    break;
                case 'Interface Confusion':
                    searchTerm = 'interface';
                    break;
            }
            
            // Filter FAQs and scroll
            document.querySelector(`[data-category="${searchTerm}"]`)?.click();
            scrollToFAQ();
        });
    });
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('ticketModal');
    if (e.target === modal) {
        closeModal();
    }
});

// System status update (simulated)
function updateSystemStatus() {
    const statusElement = document.getElementById('systemStatus');
    const now = new Date();
    const hour = now.getHours();
    
    // Simulate different response times based on time of day
    let responseTime = '72 hours';
    let message = 'We\'re working to improve this to 24 hours';
    
    if (hour >= 9 && hour <= 17) {
        responseTime = '48 hours';
        message = 'Response times improving during business hours';
    }
    
    if (hour >= 22 || hour <= 6) {
        responseTime = '96 hours';
        message = 'Extended response times during overnight hours';
    }
    
    statusElement.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>Current Response Time: <strong>${responseTime}</strong> - ${message}</span>
    `;
}

// Mobile menu functions
function toggleMobileMenu() {
    const nav = document.getElementById('mainNav');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    nav.classList.toggle('active');
    toggle.classList.toggle('active');
    
    // Prevent body scrolling when menu is open
    if (nav.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function closeMobileMenu() {
    const nav = document.getElementById('mainNav');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    nav.classList.remove('active');
    toggle.classList.remove('active');
    document.body.style.overflow = '';
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const nav = document.getElementById('mainNav');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (nav && nav.classList.contains('active') && 
        !nav.contains(e.target) && 
        !toggle.contains(e.target)) {
        closeMobileMenu();
    }
});

// Close mobile menu on window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
});

// Mobile-specific enhancements
function initMobileEnhancements() {
    // Add mobile navigation toggle if needed
    const nav = document.querySelector('.nav');
    const header = document.querySelector('.header');
    
    // Improve touch scrolling for FAQ categories on mobile
    const categoryContainer = document.querySelector('.faq-categories');
    const scrollHint = document.getElementById('scrollHint');
    
    if (categoryContainer && window.innerWidth <= 768) {
        let isScrolling = false;
        
        // Check if scrolling is needed
        function checkScrollNeeded() {
            if (categoryContainer.scrollWidth > categoryContainer.clientWidth) {
                if (scrollHint) scrollHint.classList.remove('hidden');
            } else {
                if (scrollHint) scrollHint.classList.add('hidden');
            }
        }
        
        // Hide scroll hint when scrolled to end
        categoryContainer.addEventListener('scroll', () => {
            if (scrollHint) {
                const isAtEnd = categoryContainer.scrollLeft >= 
                    (categoryContainer.scrollWidth - categoryContainer.clientWidth - 10);
                scrollHint.classList.toggle('hidden', isAtEnd);
            }
        });
        
        categoryContainer.addEventListener('touchstart', () => {
            isScrolling = true;
        });
        
        categoryContainer.addEventListener('touchend', () => {
            setTimeout(() => {
                isScrolling = false;
            }, 100);
        });
        
        // Prevent click events during scrolling
        categoryContainer.addEventListener('click', (e) => {
            if (isScrolling) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        
        // Initial check
        checkScrollNeeded();
        
        // Check on resize
        window.addEventListener('resize', checkScrollNeeded);
    }
    
    // Auto-hide keyboard on mobile after form submission
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', () => {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => input.blur());
        });
    });
    
    // Optimize modal for mobile
    const modal = document.getElementById('ticketModal');
    if (modal && window.innerWidth <= 768) {
        modal.addEventListener('touchmove', (e) => {
            const modalContent = modal.querySelector('.modal-content');
            if (e.target === modal) {
                e.preventDefault(); // Prevent background scrolling
            }
        }, { passive: false });
    }
}

// Responsive behavior adjustments
function handleResponsiveChanges() {
    const windowWidth = window.innerWidth;
    
    // Adjust search placeholder text based on screen size
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        if (windowWidth <= 480) {
            searchInput.placeholder = 'Search help...';
        } else if (windowWidth <= 768) {
            searchInput.placeholder = 'Search FAQs and help articles...';
        } else {
            searchInput.placeholder = 'Search for help articles, FAQs, or solutions...';
        }
    }
    
    // Adjust FAQ answer max-height for smaller screens
    const faqAnswers = document.querySelectorAll('.faq-answer');
    faqAnswers.forEach(answer => {
        if (windowWidth <= 480) {
            answer.style.setProperty('--max-height', '200px');
        } else {
            answer.style.setProperty('--max-height', '300px');
        }
    });
    
    // Optimize issue cards layout for very small screens
    const issueCards = document.querySelectorAll('.issue-card');
    if (windowWidth <= 320) {
        issueCards.forEach(card => {
            const count = card.querySelector('.issue-count');
            if (count) {
                count.style.fontSize = '0.7rem';
            }
        });
    }
}

// Smooth scrolling enhancement for mobile
function enhanceSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize responsive features
document.addEventListener('DOMContentLoaded', function() {
    initMobileEnhancements();
    handleResponsiveChanges();
    enhanceSmoothScrolling();
});

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        handleResponsiveChanges();
        initMobileEnhancements();
    }, 250);
});

// Handle orientation change
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        handleResponsiveChanges();
        // Force recalculation of viewport height on mobile
        if (window.innerWidth <= 768) {
            document.body.style.minHeight = '100vh';
        }
    }, 100);
});

// Update status every 30 seconds
setInterval(updateSystemStatus, 30000);
updateSystemStatus(); // Initial call
