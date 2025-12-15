import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import './Header.css'

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('')
    const [showCollegeDropdown, setShowCollegeDropdown] = useState(false)
    const [showMoreDropdown, setShowMoreDropdown] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false) // Default to light mode
    const location = useLocation()

    // Check if we're on an individual article page (any path that's not / or known category pages)
    const isArticlePage = () => {
        const path = location.pathname
        const knownPages = ['/', '/news', '/rumors', '/gamerecaps', '/suns', '/diamondbacks', '/cardinals', '/mercury', '/wildcats', '/sundevils', '/trades', '/draft', '/freeagency']
        return !knownPages.includes(path) && path !== '/blog'
    }

    // Content categories - universal across all teams
    const contentCategories = [
        { key: 'news', label: 'News', color: '#8C1D40' },
        { key: 'rumors', label: 'Rumors', color: '#8C1D40' }
    ]

    // Arizona professional teams - all using site red
    const proTeams = [
        { key: 'suns', label: 'Suns', color: '#8C1D40' },
        { key: 'cardinals', label: 'Cardinals', color: '#8C1D40' },
        { key: 'diamondbacks', label: 'Diamondbacks', color: '#8C1D40' },
        { key: 'mercury', label: 'Mercury', color: '#6B46C1' }
    ]

    // Arizona college teams
    const collegeTeams = [
        { key: 'wildcats', label: 'Wildcats', color: '#8C1D40' },
        { key: 'sundevils', label: 'Sun Devils', color: '#8C1D40' }
    ]

    // More section items
    const moreItems = [
        { key: 'gamerecaps', label: 'Recaps', color: '#8C1D40' },
        { key: 'trades', label: 'Trades', color: '#8C1D40' },
        { key: 'freeagency', label: 'Free Agency', color: '#8C1D40' },
        { key: 'draft', label: 'Draft', color: '#8C1D40' }
    ]


    const toggleCollegeDropdown = (e) => {
        e.stopPropagation()
        setShowCollegeDropdown(!showCollegeDropdown)
    }

    const closeCollegeDropdown = () => {
        setShowCollegeDropdown(false)
    }

    const toggleMoreDropdown = (e) => {
        e.stopPropagation()
        setShowMoreDropdown(!showMoreDropdown)
    }

    const closeMoreDropdown = () => {
        setShowMoreDropdown(false)
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            // Navigate to search results page with query
            window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`
        }
    }

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu)
    }

    const closeMobileMenu = () => {
        setShowMobileMenu(false)
    }

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode)
    }


    // Initialize theme from localStorage on component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark')
        }
    }, [])

    // Handle theme changes
    useEffect(() => {
        const theme = isDarkMode ? 'dark' : 'light'
        localStorage.setItem('theme', theme)
        document.body.className = document.body.className.replace(/theme-\w+/g, '')
        document.body.classList.add(`theme-${theme}`)
    }, [isDarkMode])

    // Handle body scroll lock when mobile menu is open
    useEffect(() => {
        if (showMobileMenu) {
            document.body.classList.add('mobile-menu-open')
        } else {
            document.body.classList.remove('mobile-menu-open')
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove('mobile-menu-open')
        }
    }, [showMobileMenu])

    return (
        <header className={`two-row-header ${isArticlePage() ? 'article-page' : ''} ${showMobileMenu ? 'mobile-menu-open' : ''}`}>
            <div className="bottom-border"></div>
            <div className="header-content">
                {/* Mobile/Tablet single row layout */}
                <div className="mobile-header-layout">
                    <div className="hamburger-section">
                        <div className="hamburger" onClick={toggleMobileMenu}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>

                    <div className="mobile-title-center">
                        <Link to="/">
                            <h2>Valley Sports News</h2>
                        </Link>
                    </div>

                    <div className="utility-actions">
                        <button className="theme-toggle-button" title="Toggle dark/light mode" onClick={toggleTheme}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                            </svg>
                        </button>
                    </div>
                </div>

                {isArticlePage() ? (
                    /* Condensed single row for article pages */
                    <div className="condensed-header-row">
                        {/* Left hamburger */}
                        <div className="hamburger-section">
                            <div className="hamburger" onClick={toggleMobileMenu}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>

                        {/* Center logo */}
                        <div className='condensed-logo-center'>
                            <Link to="/">
                                <h2 className="condensed-title">
                                    <span>Valley Sports news</span>
                                </h2>
                            </Link>
                        </div>

                        {/* Right search bar */}
                        <div className="utility-actions">
                            <div className="permanent-search-container">
                                <form onSubmit={handleSearchSubmit} className="permanent-search-form">
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="permanent-search-input"
                                    />
                                    <button type="submit" className="permanent-search-button">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                        </svg>
                                    </button>
                                </form>
                            </div>
                            <button className="theme-toggle-button" title="Toggle dark/light mode" onClick={toggleTheme}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Original multi-row layout for home page */
                    <>
                        {/* Top utility bar - NYT style */}
                        <div className="top-utility-bar">
                            {/* Left hamburger */}
                            <div className="hamburger-section">
                                <div className="hamburger" onClick={toggleMobileMenu}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>

                            {/* Right search bar */}
                            <div className="utility-actions">
                                <div className="permanent-search-container">
                                    <form onSubmit={handleSearchSubmit} className="permanent-search-form">
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="permanent-search-input"
                                        />
                                        <button type="submit" className="permanent-search-button">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                                <button className="theme-toggle-button" title="Toggle dark/light mode" onClick={toggleTheme}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Logo row */}
                        <div className="logo-row">
                            <div className='logo-center'>
                                <Link to="/">
                                    <h2 className="title-with-team-colors">
                                        <span>Valley Sports news</span>
                                    </h2>
                                </Link>
                            </div>
                        </div>

                        {/* Single Navigation Row */}
                        <div className="bottom-row">
                    <nav>
                        <ul>
                            {/* Professional Teams */}
                            {proTeams.map((team) => (
                                <li key={team.key}>
                                    <Link
                                        to={`/${team.key}`}
                                        className={`team-link team-${team.key}`}
                                        data-team={team.key}
                                    >
                                        {team.label}
                                    </Link>
                                </li>
                            ))}

                            {/* College Dropdown */}
                            <li
                                className="college-dropdown-container"
                                onMouseEnter={() => setShowCollegeDropdown(true)}
                                onMouseLeave={() => setShowCollegeDropdown(false)}
                            >
                                <button
                                    className="teams-button"
                                    onClick={toggleCollegeDropdown}
                                >
                                    <span>NCAA</span>
                                </button>
                                {showCollegeDropdown && (
                                    <div className="teams-dropdown">
                                        <div className="teams-grid">
                                            {collegeTeams.map((team) => (
                                                <Link
                                                    key={team.key}
                                                    to={`/${team.key}`}
                                                    className="team-link"
                                                    data-team={team.key}
                                                    onClick={closeCollegeDropdown}
                                                    style={{'--team-color': team.color}}
                                                >
                                                    <span className="team-name">
                                                        {team.label}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </li>

                            {/* Content Categories */}
                            {contentCategories.map((category) => (
                                <li key={category.key}>
                                    <Link
                                        to={`/${category.key}`}
                                        className={`category-link category-${category.key}`}
                                        data-category={category.key}
                                    >
                                        {category.label}
                                    </Link>
                                </li>
                            ))}

                            {/* More Dropdown */}
                            <li
                                className="more-dropdown-container"
                                onMouseEnter={() => setShowMoreDropdown(true)}
                                onMouseLeave={() => setShowMoreDropdown(false)}
                            >
                                <button
                                    className="teams-button"
                                    onClick={toggleMoreDropdown}
                                >
                                    <span>More</span>
                                </button>
                                {showMoreDropdown && (
                                    <div className="teams-dropdown">
                                        <div className="teams-grid">
                                            {moreItems.map((item) => (
                                                <Link
                                                    key={item.key}
                                                    to={`/${item.key}`}
                                                    className="team-link"
                                                    onClick={closeMoreDropdown}
                                                    style={{'--team-color': item.color}}
                                                >
                                                    <span className="team-name">
                                                        {item.label}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </li>
                        </ul>
                    </nav>
                        </div>
                    </>
                )}
            </div>

            {/* Mobile Navigation Menu */}
            {showMobileMenu && (
                <>
                    <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
                    <div className="mobile-menu">
                        <div className="mobile-menu-header">
                            <button className="mobile-menu-close" onClick={closeMobileMenu}>
                                <span>×</span>
                            </button>
                        </div>
                        <div className="mobile-menu-content">
                            {/* Teams Section */}
                            <div className="mobile-menu-section">
                                <h4>Teams</h4>
                                <div className="mobile-menu-links">
                                    {proTeams.map((team) => (
                                        <Link
                                            key={team.key}
                                            to={`/${team.key}`}
                                            className="mobile-menu-link"
                                            onClick={closeMobileMenu}
                                        >
                                            {team.label}
                                        </Link>
                                    ))}
                                    {collegeTeams.map((team) => (
                                        <Link
                                            key={team.key}
                                            to={`/${team.key}`}
                                            className="mobile-menu-link"
                                            onClick={closeMobileMenu}
                                        >
                                            {team.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Content Categories */}
                            <div className="mobile-menu-section">
                                <h4>Content</h4>
                                <div className="mobile-menu-links">
                                    {contentCategories.map((category) => (
                                        <Link
                                            key={category.key}
                                            to={`/${category.key}`}
                                            className="mobile-menu-link"
                                            onClick={closeMobileMenu}
                                        >
                                            {category.label}
                                        </Link>
                                    ))}
                                    {moreItems.map((item) => (
                                        <Link
                                            key={item.key}
                                            to={`/${item.key}`}
                                            className="mobile-menu-link"
                                            onClick={closeMobileMenu}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </header>
    )
}