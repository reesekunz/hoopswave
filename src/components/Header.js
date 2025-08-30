import { useState, useEffect } from "react"
import {Link} from "react-router-dom"
import client from "../client"
import './Header.css'
import HoopsWave from "../images/HoopsWave.png"

export default function Header () {
    const [teams, setTeams] = useState([])
    const [showTeamsDropdown, setShowTeamsDropdown] = useState(false)
    const [loading, setLoading] = useState(true)

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

    return (
        <>
        <header>
            <div className='logo'>
                <Link to="/">
                    <img src={HoopsWave} alt="Hoops Wave" className="logo-image" />
                    <h2>hoops wave</h2>
                </Link>
            </div>
            <nav>
                <ul>
                    <li 
                        className="teams-dropdown-container"
                    >
                        <button 
                            className="teams-button"
                            onClick={toggleDropdown}
                            onMouseEnter={() => setShowTeamsDropdown(true)}
                        >
                            Teams ▼
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
                                            key={team.slug.current}
                                            to={`/teams/${team.slug.current}`}
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
                </ul>
            </nav>
        </header>
        </>
    )
}