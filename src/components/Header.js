import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import client from "../client"
import './Header.css'
import HoopsWave from "../images/HoopsWaveNoBg.png"

export default function Header() {
    const [teams, setTeams] = useState([])
    const [showTeamsDropdown, setShowTeamsDropdown] = useState(false)
    const [loading, setLoading] = useState(true)
    const [showSearch, setShowSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Categories data - your existing categories
    const categories = [
        { key: 'trades', label: 'Trades', color: '#2c8aa6' },
        { key: 'freeAgency', label: 'Free Agency', color: '#2c8aa6' },
        { key: 'draft', label: 'Draft', color: '#2c8aa6' },
        { key: 'news', label: 'News', color: '#2c8aa6' },
        { key: 'rumors', label: 'Rumors', color: '#2c8aa6' }
    ]

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const data = await client.fetch(
                    `*[_type == "team"] | order(city asc) {
                        name,
                        slug,
                        city,
                        abbreviation
                    }`
                )
                setTeams(data)
            } catch (err) {
                console.error('Error fetching teams:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchTeams()
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.teams-dropdown-container')) {
                setShowTeamsDropdown(false)
            }
        }

        if (showTeamsDropdown) {
            document.addEventListener('click', handleClickOutside)
        }

        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [showTeamsDropdown])

    const toggleDropdown = (e) => {
        e.stopPropagation()
        setShowTeamsDropdown(!showTeamsDropdown)
    }

    const closeDropdown = () => {
        setShowTeamsDropdown(false)
    }

    const toggleSearch = () => {
        setShowSearch(!showSearch)
        if (!showSearch) {
            setSearchQuery('')
        }
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            // Navigate to search results page with query
            window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`
        }
    }

    return (
        <header className="two-row-header">
            {/* Top row */}
            <div className="top-row">
                {/* Left section with hamburger */}
                <div className="hamburger-section">
                    <div className="hamburger">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                {/* Center logo */}
                <div className='logo-center'>
                    <Link to="/">
                        <h2>
                            <span>HO</span>
                            <img src={HoopsWave} alt="Hoops Wave" className="inline-logo" />
                            <span>PS WAVE</span>
                        </h2>
                        <p className="tagline">Your Premier NBA News Source</p>
                    </Link>
                </div>

                {/* Right section with social icons and actions */}
                <div className="header-actions">
                    <div className="social-icons">
                        <a href="https://instagram.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            <span className="follower-count">8.2K</span>
                        </a>
                        <a href="https://twitter.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                            </svg>
                            <span className="follower-count">12.5K</span>
                        </a>
                    </div>
                    <div className="search-container">
                        <div className="search-icon" onClick={toggleSearch}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                        </div>
                        {showSearch && (
                            <form onSubmit={handleSearchSubmit} className="search-form">
                                <input
                                    type="text"
                                    placeholder="Search NBA news..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                    autoFocus
                                />
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom row with navigation */}
            <div className="bottom-row">
                <nav>
                    <ul>
                        {/* Teams first */}
                        <li className="teams-dropdown-container">
                            <button
                                className="teams-button"
                                onClick={toggleDropdown}
                                onMouseEnter={() => setShowTeamsDropdown(true)}
                            >
                                <span>Browse Teams</span>
                            </button>
                            {showTeamsDropdown && !loading && (
                                <div
                                    className="teams-dropdown"
                                    onMouseLeave={() => setShowTeamsDropdown(false)}
                                >
                                    <div className="dropdown-header">
                                        <Link to="/" onClick={closeDropdown}>
                                            All Teams
                                        </Link>
                                    </div>
                                    <div className="teams-grid">
                                        {teams.map((team) => (
                                            <Link
                                                key={team.slug?.current || team._id}
                                                to={`/teams/${team.slug?.current || team._id}`}
                                                className="team-link"
                                                onClick={closeDropdown}
                                            >
                                                <span className="team-abbreviation">
                                                    {team.abbreviation}
                                                </span>
                                                <span className="team-name">
                                                    {team.city} {team.name}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </li>

                        {/* Category Links in specified order */}
                        <li>
                            <Link
                                to="/news"
                                className="category-link category-news"
                                data-category="news"
                            >
                                News
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/rumors"
                                className="category-link category-rumors"
                                data-category="rumors"
                            >
                                Rumors
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/trades"
                                className="category-link category-trades"
                                data-category="trades"
                            >
                                Trades
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/draft"
                                className="category-link category-draft"
                                data-category="draft"
                            >
                                Draft
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/freeAgency"
                                className="category-link category-freeAgency"
                                data-category="freeAgency"
                            >
                                Free Agency
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    )
}