import { useState, useEffect } from "react"
import { useParams, useLocation, Link } from "react-router-dom"
import client from "../client"
import './TeamPage.css' // Reuse your existing blog styles

export default function TeamPage() {
    const { teamSlug } = useParams() // Get team slug from URL params (/teams/suns)
    const location = useLocation()

    // Get team slug from either URL params or direct path
    const currentTeamSlug = teamSlug || location.pathname.slice(1) // Remove leading '/'
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
                        `*[_type == "team" && slug.current == $currentTeamSlug][0] {
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
                        { currentTeamSlug: currentTeamSlug }
                    ),
                    
                    // Get posts for this team
                    client.fetch(
                        `*[_type == "post" && team->slug.current == $currentTeamSlug] {
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
                        { currentTeamSlug: currentTeamSlug }
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
    }, [currentTeamSlug])

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const categorizePost = (post) => {
        // Look for exact category matches first
        const categoryTitles = post.categories?.map(cat => cat.title?.toLowerCase()) || []

        if (categoryTitles.includes('game recaps') || categoryTitles.includes('game recap')) return 'gameRecaps'
        if (categoryTitles.includes('analysis')) return 'analysis'
        if (categoryTitles.includes('rumors')) return 'rumors'
        if (categoryTitles.includes('news')) return 'news'

        // Default to news if no category matches
        return 'news'
    }

    const getCategorizedPosts = () => {
        const categorized = {
            news: [],
            gameRecaps: [],
            analysis: [],
            rumors: []
        }

        posts.forEach(post => {
            const category = categorizePost(post)
            categorized[category].push(post)
        })

        return categorized
    }

    if (loading) return <div className="loading">Loading...</div>
    if (error) return <div className="error">Error loading content: {error}</div>
    if (!team) return <div className="error">Team not found</div>

    const featuredPost = posts[0]
    const sidebarPosts = posts.slice(1, 4)
    const categorizedPosts = getCategorizedPosts()

    const categories = [
        { key: 'news', label: 'News', color: '#8C1D40' },
        { key: 'gameRecaps', label: 'Game Recaps', color: '#8C1D40' },
        { key: 'analysis', label: 'Analysis', color: '#8C1D40' },
        { key: 'rumors', label: 'Rumors', color: '#8C1D40' }
    ]

    const SectionArticle = ({ post, size = 'small', isRed = false }) => (
        <article className={`section-article ${size}`}>
            {post.mainImage && post.mainImage.asset && (
                <img
                    src={post.mainImage.asset.url}
                    alt={post.title}
                    className="section-image"
                />
            )}
            <div className="section-content">
                <div className="section-category">{team.city} {team.name} News</div>
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

    const renderCategorySection = (category) => {
        const categoryPosts = categorizedPosts[category.key]
        if (!categoryPosts || categoryPosts.length === 0) return null

        return (
            <section key={category.key} className="content-section">
                <div className="section-header">
                    <h2 className="section-title" style={{ color: category.color }}>
                        {team.name} {category.label}
                    </h2>
                    <Link 
                        to={`/teams/${teamSlug}/${category.key}`} 
                        className="see-more"
                        style={{ color: category.color }}
                    >
                        See more
                    </Link>
                </div>
                <div className={`section-grid ${categoryPosts.length === 1 ? 'single-article' : 'mixed-layout'}`}>
                    {categoryPosts.length === 1 ? (
                        <SectionArticle post={categoryPosts[0]} size="large" />
                    ) : (
                        <>
                            <SectionArticle post={categoryPosts[0]} size="large" />
                            <div className="sidebar-section-articles">
                                {categoryPosts.slice(1, 4).map((post) => (
                                    <SectionArticle key={post.slug.current} post={post} size="small" />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>
        )
    }

    return (
        <div className="blog-container">
            {/* Team Header */}
            <div className="blog-header">
                <div className="team-header">
                    {team.logo && team.logo.asset && (
                        <img
                            src={team.logo.asset.url}
                            alt={`${team.name} logo`}
                            className="team-logo"
                            style={{ width: '60px', height: '60px', marginRight: '15px' }}
                        />
                    )}
                    <div>
                        <h1 className="blog-title">{team.city} {team.name}</h1>
                        <p className="team-subtitle">Latest news and updates</p>
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
                <span className="breadcrumb-current">{team.city} {team.name}</span>
            </div>
            
            {posts.length === 0 && (
                <div className="no-posts">
                    <p>No articles found for the {team.city} {team.name} yet.</p>
                    <p>Check back soon for the latest {team.name} news and updates!</p>
                    <Link to="/" className="back-to-all">← Back to All Teams</Link>
                </div>
            )}
            
            {posts.length > 0 && (
                <>
                    {/* Only show featured/sidebar if we have posts */}
                    {featuredPost && (
                        <div className="posts-layout">
                            {/* Featured Article */}
                            <article className="featured-article">
                                {featuredPost.mainImage && featuredPost.mainImage.asset && (
                                    <img
                                        src={featuredPost.mainImage.asset.url}
                                        alt={featuredPost.title}
                                        className="featured-image"
                                    />
                                )}
                                <div className="featured-overlay">
                                    <div className="featured-category">{team.city} {team.name} News</div>
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
                                            <div className="sidebar-category">{team.city} {team.name} News</div>
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
                    )}

                    {/* Category Sections */}
                    <div className="content-sections">
                        {categories.map(category => renderCategorySection(category))}
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