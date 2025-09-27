import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import './Header.css'

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('')
    const [showCollegeDropdown, setShowCollegeDropdown] = useState(false)
    const [showMoreDropdown, setShowMoreDropdown] = useState(false)
    const location = useLocation()

    // Check if we're on an individual article page (any path that's not / or known category pages)
    const isArticlePage = () => {
        const path = location.pathname
        const knownPages = ['/', '/news', '/rumors', '/analysis', '/gamerecaps', '/suns', '/diamondbacks', '/cardinals', '/mercury', '/wildcats', '/sundevils', '/trades', '/draft', '/freeagency']
        return !knownPages.includes(path) && path !== '/blog'
    }

    // Content categories - universal across all teams
    const contentCategories = [
        { key: 'news', label: 'News', color: '#97233F' },
        { key: 'rumors', label: 'Rumors', color: '#97233F' },
        { key: 'analysis', label: 'Analysis', color: '#97233F' },
        { key: 'gamerecaps', label: 'Recaps', color: '#97233F' }
    ]

    // Arizona professional teams - all using site red
    const proTeams = [
        { key: 'suns', label: 'Suns', color: '#97233F' },
        { key: 'diamondbacks', label: 'Diamondbacks', color: '#97233F' },
        { key: 'cardinals', label: 'Cardinals', color: '#97233F' },
        { key: 'mercury', label: 'Mercury', color: '#97233F' }
    ]

    // Arizona college teams
    const collegeTeams = [
        { key: 'wildcats', label: 'Wildcats', color: '#97233F' },
        { key: 'sundevils', label: 'Sun Devils', color: '#97233F' }
    ]

    // More section items
    const moreItems = [
        { key: 'trades', label: 'Trades', color: '#97233F' },
        { key: 'draft', label: 'Draft', color: '#97233F' },
        { key: 'freeagency', label: 'Free Agency', color: '#97233F' }
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

    return (
        <header className={`two-row-header ${isArticlePage() ? 'article-page' : ''}`}>
            <div className="bottom-border"></div>
            <div className="header-content">
                {isArticlePage() ? (
                    /* Condensed single row for article pages */
                    <div className="condensed-header-row">
                        {/* Left hamburger */}
                        <div className="hamburger-section">
                            <div className="hamburger">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>

                        {/* Center logo */}
                        <div className='condensed-logo-center'>
                            <Link to="/">
                                <h2 className="condensed-title">
                                    <span>Valley Sports News</span>
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
                        </div>
                    </div>
                ) : (
                    /* Original multi-row layout for home page */
                    <>
                        {/* Top utility bar */}
                        <div className="top-utility-bar">
                            {/* Left hamburger */}
                            <div className="hamburger-section">
                                <div className="hamburger">
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
                            </div>
                        </div>

                        {/* Logo row */}
                        <div className="logo-row">
                            <div className='logo-center'>
                                <Link to="/">
                                    <h2>
                                        <span>Valley Sports News</span>
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
                            <li className="college-dropdown-container">
                                <button
                                    className="teams-button"
                                    onClick={toggleCollegeDropdown}
                                    onMouseEnter={() => setShowCollegeDropdown(true)}
                                >
                                    <span>NCAA</span>
                                </button>
                                {showCollegeDropdown && (
                                    <div
                                        className="teams-dropdown"
                                        onMouseLeave={() => setShowCollegeDropdown(false)}
                                    >
                                        <div className="teams-grid">
                                            {collegeTeams.map((team) => (
                                                <Link
                                                    key={team.key}
                                                    to={`/${team.key}`}
                                                    className="team-link"
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
                            <li className="more-dropdown-container">
                                <button
                                    className="teams-button"
                                    onClick={toggleMoreDropdown}
                                    onMouseEnter={() => setShowMoreDropdown(true)}
                                >
                                    <span>More</span>
                                </button>
                                {showMoreDropdown && (
                                    <div
                                        className="teams-dropdown"
                                        onMouseLeave={() => setShowMoreDropdown(false)}
                                    >
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
        </header>
    )
}