import { useState, useEffect } from "react"
import client from "../client"
import {Link} from "react-router-dom"
import './Blog.css'

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
                        publishedAt,
                        categories[]-> {
                            title
                        },
                        author-> {
                            name
                        },
                        mainImage {
                            asset -> {
                                _id,
                                url 
                            },
                            alt
                        }
                    } | order(publishedAt desc)`
                )
                console.log('Fetched data:', data)
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

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    if (loading) return <div className="loading">Loading...</div>
    if (error) return <div className="error">Error loading posts: {error}</div>
   
    const featuredPost = posts[0]
    const sidebarPosts = posts.slice(1, 4)
    const olderPosts = posts.slice(4)

    // Group posts by categories for sections
    const rumorsPosts = olderPosts.filter((post, index) => index % 3 === 0).slice(0, 4)
    const freeAgencyPosts = olderPosts.filter((post, index) => index % 3 === 1).slice(0, 4)
    const moreStoriesPosts = olderPosts.filter((post, index) => index % 3 === 2).slice(0, 6)

    const SectionArticle = ({ post, size = 'small', isRed = false }) => (
        <article className={`section-article ${size}`}>
            {post.mainImage && (
                <img 
                    src={post.mainImage.asset.url} 
                    alt={post.title} 
                    className="section-image"
                />
            )}
            <div className="section-content">
                <div className="section-category">Hoops Wave News</div>
                <Link 
                    to={`/${post.slug.current}`} 
                    className={`section-title-link ${isRed ? 'red' : ''}`}
                >
                    {post.title}
                </Link>
                <div className="section-meta">
                    {post.author?.name || 'Staff'} | {formatDate(post.publishedAt) || 'Recent'}
                </div>
            </div>
        </article>
    )

    return (
        <div className="blog-container">
            <div className="blog-header">
                <h1 className="blog-title">Hoops Wave News</h1>
                <p className="blog-count">
                    {posts.length} {posts.length === 1 ? 'Article' : 'Articles'}
                </p>
            </div>
            
            {posts.length === 0 && (
                <p className="no-posts">No posts found. Check back soon for fresh basketball content!</p>
            )}
            
            {posts.length > 0 && (
                <>
                    <div className="posts-layout">
                        {/* Featured Article */}
                        <article className="featured-article">
                            <img 
                                src={featuredPost.mainImage.asset.url} 
                                alt={featuredPost.title} 
                                className="featured-image"
                            />
                            <div className="featured-overlay">
                                <div className="featured-category">Hoops Wave News</div>
                                <h2 className="featured-title">{featuredPost.title}</h2>
                                <div className="featured-meta">
                                    {featuredPost.author?.name || 'Staff'} | {formatDate(featuredPost.publishedAt) || 'Recent'}
                                </div>
                                <button className="read-more-btn">
                                    <Link to={`/${featuredPost.slug.current}`} className="read-more-link">
                                        Read Full Article
                                    </Link>
                                </button>
                            </div>
                        </article>

                        {/* Sidebar Articles */}
                        <aside className="sidebar-articles">
                            <h3 className="sidebar-title">More Stories</h3>
                            {sidebarPosts.map((post) => (
                                <article key={post.slug.current} className="sidebar-article">
                                    <div className="sidebar-category">Hoops Wave News</div>
                                    <h4 className="sidebar-article-title">
                                        <Link to={`/${post.slug.current}`}>
                                            {post.title}
                                        </Link>
                                    </h4>
                                    <div className="sidebar-meta">
                                        {post.author?.name || 'Staff'} | {formatDate(post.publishedAt) || 'Recent'}
                                    </div>
                                </article>
                            ))}
                        </aside>
                    </div>

                    {/* Content Sections */}
                    <div className="content-sections">
                        {/* Rumors Section */}
                        {rumorsPosts.length > 0 && (
                            <section className="content-section">
                                <div className="section-header">
                                    <h2 className="section-title">Rumors</h2>
                                    <a href="#" className="see-more">See more</a>
                                </div>
                                <div className="section-grid mixed-layout">
                                    {rumorsPosts[0] && <SectionArticle post={rumorsPosts[0]} size="large" />}
                                    {rumorsPosts.slice(1, 3).map((post) => (
                                        <SectionArticle key={post.slug.current} post={post} size="small" />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Free Agency Section */}
                        {freeAgencyPosts.length > 0 && (
                            <section className="content-section">
                                <div className="section-header">
                                    <h2 className="section-title">Free Agency</h2>
                                    <a href="#" className="see-more">See more</a>
                                </div>
                                <div className="section-grid mixed-layout">
                                    {freeAgencyPosts[0] && <SectionArticle post={freeAgencyPosts[0]} size="large" />}
                                    {freeAgencyPosts.slice(1, 3).map((post) => (
                                        <SectionArticle key={post.slug.current} post={post} size="small" />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* More Stories Section */}
                        {moreStoriesPosts.length > 0 && (
                            <section className="content-section">
                                <div className="section-header">
                                    <h2 className="section-title">More Stories</h2>
                                    <a href="#" className="see-more">See more</a>
                                </div>
                                <div className="section-grid three-column">
                                    {moreStoriesPosts.slice(0, 3).map((post) => (
                                        <SectionArticle key={post.slug.current} post={post} size="small" />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Bottom Featured Article */}
                        {olderPosts.length > 6 && (
                            <article className="bottom-featured">
                                <img 
                                    src={olderPosts[6].mainImage.asset.url} 
                                    alt={olderPosts[6].title} 
                                    className="bottom-featured-image"
                                />
                                <div className="bottom-featured-content">
                                    <div className="bottom-featured-category">Hoops Wave News</div>
                                    <h2 className="bottom-featured-title">{olderPosts[6].title}</h2>
                                    <div className="bottom-featured-meta">
                                        {olderPosts[6].author?.name || 'Staff'} | {formatDate(olderPosts[6].publishedAt) || 'Recent'}
                                    </div>
                                    <button className="read-more-btn">
                                        <Link to={`/${olderPosts[6].slug.current}`} className="read-more-link">
                                            Read Full Article
                                        </Link>
                                    </button>
                                </div>
                            </article>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}