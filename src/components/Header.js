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
                    {/* <li>
                        <button><Link to="/">Home</Link></button>
                    </li> */}
                    <li 
                        className="teams-dropdown-container"
                        onMouseEnter={() => setShowTeamsDropdown(true)}
                        onMouseLeave={() => setShowTeamsDropdown(false)}
                    >
                        <button className="teams-button">
                            Teams ▼
                        </button>
                        {showTeamsDropdown && !loading && (
                            <div className="teams-dropdown">
                                <div className="dropdown-header">
                                    <Link to="/" onClick={() => setShowTeamsDropdown(false)}>
                                        All Teams
                                    </Link>
                                </div>
                                <div className="teams-grid">
                                    {teams.map((team) => (
                                        <Link 
                                            key={team.slug.current}
                                            to={`/teams/${team.slug.current}`}
                                            className="team-link"
                                            onClick={() => setShowTeamsDropdown(false)}
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
                    {/* <li>
                        <button><Link to="/">Blog</Link></button>
                    </li> */}
                </ul>
            </nav>
        </header>
        </>
    )
}