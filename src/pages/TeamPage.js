import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import client from "../client"
import './TeamPage.css' // Reuse your existing blog styles

export default function TeamPage() {
    const { teamSlug } = useParams() // Get team slug from URL
    const [posts, setPosts] = useState([])
    const [team, setTeam] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchTeamAndPosts = async () => {
            try {
                setLoading(true)
                
                // Fetch team info and posts in parallel
                const [teamData, postsData] = await Promise.all([
                    // Get team information
                    client.fetch(
                        `*[_type == "team" && slug.current == $teamSlug][0] {
                            name,
                            slug,
                            city,
                            abbreviation,
                            primaryColor,
                            logo {
                                asset -> {
                                    url
                                }
                            }
                        }`,
                        { teamSlug }
                    ),
                    
                    // Get posts for this team
                    client.fetch(
                        `*[_type == "post" && team->slug.current == $teamSlug] {
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
                            team-> {
                                name,
                                slug,
                                city,
                                abbreviation,
                                primaryColor
                            },
                            mainImage {
                                asset -> {
                                    _id,
                                    url 
                                },
                                alt
                            }
                        } | order(publishedAt desc)`,
                        { teamSlug }
                    )
                ])

                console.log('Fetched team:', teamData)
                console.log('Fetched posts:', postsData)
                
                setTeam(teamData)
                setPosts(postsData)
                
            } catch (err) {
                console.error('Error fetching data:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchTeamAndPosts()
    }, [teamSlug])

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    if (loading) return <div className="loading">Loading...</div>
    if (error) return <div className="error">Error loading content: {error}</div>
    if (!team) return <div className="error">Team not found</div>

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
                <div className="section-category">{team.name} News</div>
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
            {/* Team Header */}
            <div className="blog-header">
                <div className="team-header">
                    {team.logo && (
                        <img 
                            src={team.logo.asset.url} 
                            alt={`${team.name} logo`} 
                            className="team-logo"
                            style={{ width: '60px', height: '60px', marginRight: '15px' }}
                        />
                    )}
                    <div>
                        <h1 className="blog-title">{team.name} News</h1>
                        <p className="team-subtitle">{team.city} {team.name}</p>
                    </div>
                </div>
                <p className="blog-count">
                    {posts.length} {posts.length === 1 ? 'Article' : 'Articles'}
                </p>
            </div>
            
            {/* Breadcrumb Navigation */}
            <div className="breadcrumb">
                <Link to="/" className="breadcrumb-link">All Teams</Link>
                <span className="breadcrumb-separator"> > </span>
                <span className="breadcrumb-current">{team.name}</span>
            </div>
            
            {posts.length === 0 && (
                <div className="no-posts">
                    <p>No articles found for the {team.name} yet.</p>
                    <p>Check back soon for the latest {team.name} news and updates!</p>
                    <Link to="/" className="back-to-all">← Back to All Teams</Link>
                </div>
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
                                <div className="featured-category">{team.name} News</div>
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
                        {sidebarPosts.length > 0 && (
                            <aside className="sidebar-articles">
                                <h3 className="sidebar-title">More {team.name} Stories</h3>
                                {sidebarPosts.map((post) => (
                                    <article key={post.slug.current} className="sidebar-article">
                                        <div className="sidebar-category">{team.name} News</div>
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
                        )}
                    </div>

                    {/* Content Sections */}
                    <div className="content-sections">
                        {/* Rumors Section */}
                        {rumorsPosts.length > 0 && (
                            <section className="content-section">
                                <div className="section-header">
                                    <h2 className="section-title">{team.name} Rumors</h2>
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
                                    <h2 className="section-title">{team.name} Free Agency</h2>
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
                                    <h2 className="section-title">More {team.name} Stories</h2>
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
                                    <div className="bottom-featured-category">{team.name} News</div>
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

                    {/* Back to All Teams Link */}
                    <div className="back-to-all-container">
                        <Link to="/" className="back-to-all">← Back to All Teams</Link>
                    </div>
                </>
            )}
        </div>
    )
}