import {Link} from "react-router-dom"
import './Header.css'
import HoopsWave from "../images/HoopsWave.png"

export default function Header () {
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
                    <li>
                        <button><Link to="/">Home</Link></button>
                    </li>
                    <li>
                        <button><Link to="/blog">Blog</Link></button>
                    </li>
                </ul>
            </nav>
        </header>
        </>
    )
}