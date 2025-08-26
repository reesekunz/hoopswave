import { useState, useEffect } from "react"
import client from "../client"
import {Link} from "react-router-dom"


export default function Blog() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true)
                const data = await client.fetch(
                    `*[_type == "post"] {
                        title,
                        slug,
                        body,
                        mainImage {
                            asset -> {
                                _id,
                                url 
                            },
                            alt
                        }
                    }`
                )
                console.log('Fetched data:', data) // Debug log
                setPosts(data)
            } catch (err) {
                console.error('Error fetching posts:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchPosts()
    }, [])

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>
   
    return (
        <div>
            <h1>Blog</h1>
            <h2>You are viewing {posts.length} blog posts</h2>
            {posts.length === 0 && <p>No posts found.</p>}
            <div>
                {posts.map((post) => (
<article key={post.slug.current}>
    <img src={post.mainImage.asset.url} alt={post.title} />
    <h4>{post.title}</h4>
    <button>
    <Link to={`/blog/${post.slug.current}`} className='hi'>Read Full Article </Link>
    </button>
</article>
                )
                )}
            </div>
        </div>
    )
}