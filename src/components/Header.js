import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import client from "../client"
import './Header.css'
import HoopsWave from "../images/HoopsWaveNoBg.png"

export default function Header() {
    const [teams, setTeams] = useState([])
    const [showTeamsDropdown, setShowTeamsDropdown] = useState(false)
    const [loading, setLoading] = useState(true)
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

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            // Navigate to search results page with query
            window.location.href = `/?search=${encodeURIComponent(searchQuery.trim())}`
        }
    }

    return (
        <header className="two-row-header">
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
                            <span>HO</span>
                            <img src={HoopsWave} alt="Hoops Wave" className="inline-logo" />
                            <span>PS WAVE</span>
                        </h2>
                    </Link>
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
                                <span>Teams</span>
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