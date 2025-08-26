
import {Link} from "react-router-dom"

export default function Homepage () {
    return (
        <div>
            <section className="hi">
            <h1>Hoops Wave Blog</h1>
            <button>
                <Link to="/blog">
                    Read my blog posts
                </Link>
            </button>
            </section>
        </div>
    )
}