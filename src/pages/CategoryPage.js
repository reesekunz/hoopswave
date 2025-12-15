import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import client from "../client"
import './CategoryPage.css'

export default function CategoryPage() {
    const location = useLocation()
    const [posts, setPosts] = useState([])
    const [teams, setTeams] = useState([])
    const [selectedTeam, setSelectedTeam] = useState('all')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Get category from the URL path
    const category = location.pathname.substring(1) // Remove leading slash
    
    console.log('Current path:', location.pathname)
    console.log('Category:', category)

    // Map URL params to category titles for filtering
    const categoryMap = {
        'news': 'news',
        'rumors': 'rumors',
        'gamerecaps': 'game recaps'
    }

    // Map for display titles
    const displayTitles = {
        'news': 'News',
        'rumors': 'Rumors',
        'gamerecaps': 'Game Recaps'
    }

    // Map for colors
    const categoryColors = {
        'news': '#8C1D40',
        'rumors': '#8C1D40',
        'gamerecaps': '#8C1D40'
    }

    // Function to categorize posts (updated for new categories)
    const categorizePost = (post) => {
        const categoryTitles = post.categories?.map(cat => cat.title?.toLowerCase()) || []

        if (categoryTitles.includes('game recaps') || categoryTitles.includes('game recap')) return 'gamerecaps'
        if (categoryTitles.includes('rumors')) return 'rumors'
        if (categoryTitles.includes('news')) return 'news'

        return 'news'
    }

    useEffect(() => {
        const fetchCategoryPosts = async () => {
            try {
                setLoading(true)
                
                if (!categoryMap[category]) {
                    setError(`Category "${category}" not found. Available: ${Object.keys(categoryMap).join(', ')}`)
                    return
                }

                // Fetch all posts and teams
                const [postsData, teamsData] = await Promise.all([
                    client.fetch(`*[_type == "post"] {
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
                    } | order(publishedAt desc)`),
                    client.fetch(`*[_type == "team"] {
                        name,
                        slug,
                        city,
                        abbreviation,
                        primaryColor
                    } | order(city asc)`)
                ])
                
                // Filter posts by category using the same logic as Blog.js
                const filteredPosts = postsData.filter(post => {
                    const postCategory = categorizePost(post)
                    return postCategory === category
                })
                
                console.log(`Fetched and filtered ${category} posts:`, filteredPosts)
                setPosts(filteredPosts)
                setTeams(teamsData)
            } catch (err) {
                console.error('Error fetching category posts:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchCategoryPosts()
    }, [category])

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    if (loading) return <div className="loading">Loading...</div>
    if (error) return <div className="error">Error: {error}</div>
    if (!categoryMap[category]) return <div className="error">Category not found</div>

    const displayTitle = displayTitles[category]
    const categoryColor = categoryColors[category]
    
    // Filter posts by selected team - handle cases where team might be null/undefined
    const getFilteredPosts = () => {
        if (selectedTeam === 'all') {
            return posts
        }
        
        if (selectedTeam === 'no-team') {
            return posts.filter(post => !post.team)
        }
        
        return posts.filter(post => {
            // Handle posts that might not have a team assigned
            if (!post.team || !post.team.slug) {
                return false
            }
            return post.team.slug.current === selectedTeam
        })
    }
    
    const filteredPosts = getFilteredPosts()
    
    // Get teams that actually have posts in this category
    const teamsWithPosts = teams.filter(team => {
        return posts.some(post => post.team?.slug?.current === team.slug?.current)
    })

    return (
        <div className="category-page">
            <div className="category-header">
                <Link to="/" className="back-link">
                    ← Back to Home
                </Link>
                <h1 className="category-title" style={{ color: categoryColor }}>
                    {displayTitle}
                </h1>
                <p className="category-count">
                    {filteredPosts.length} {filteredPosts.length === 1 ? 'Article' : 'Articles'}
                    {selectedTeam !== 'all' && (
                        <span className="filter-indicator">
                            {selectedTeam === 'no-team'
                                ? ' with no team assigned'
                                : ` for ${teams.find(t => t.slug?.current === selectedTeam)?.city} ${teams.find(t => t.slug?.current === selectedTeam)?.name}`
                            }
                        </span>
                    )}
                </p>

                {/* Team Filter Dropdown */}
                <div className="team-filter">
                    <label htmlFor="team-select" className="filter-label">
                        Filter by Team:
                    </label>
                    <select 
                        id="team-select"
                        value={selectedTeam} 
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="team-select"
                    >
                        <option value="all">All Teams ({posts.length})</option>
                        {teamsWithPosts.map(team => {
                            const teamPostCount = posts.filter(post => post.team?.slug?.current === team.slug?.current).length
                            const teamSlug = team.slug?.current || team._id || team.name?.toLowerCase().replace(/\s+/g, '-')
                            return (
                                <option key={teamSlug} value={teamSlug}>
                                    {team.city} {team.name} ({teamPostCount})
                                </option>
                            )
                        })}
                        {posts.some(post => !post.team) && (
                            <option value="no-team">No Team Assigned ({posts.filter(post => !post.team).length})</option>
                        )}
                    </select>
                </div>
            </div>

            {filteredPosts.length === 0 ? (
                <div className="no-posts">
                    {selectedTeam === 'all' ? (
                        <>
                            <p>No {displayTitle.toLowerCase()} articles found yet.</p>
                            <p>Check back soon for more content!</p>
                        </>
                    ) : selectedTeam === 'no-team' ? (
                        <>
                            <p>No {displayTitle.toLowerCase()} articles without team assignment found.</p>
                            <p>Try selecting a different filter or check back later!</p>
                        </>
                    ) : (
                        <>
                            <p>No {displayTitle.toLowerCase()} articles found for {teams.find(t => t.slug?.current === selectedTeam)?.city} {teams.find(t => t.slug?.current === selectedTeam)?.name}.</p>
                            <p>Try selecting a different team or check back later!</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="category-posts">
                    {filteredPosts.map((post) => (
                        <article key={post.slug.current} className="category-post">
                            {post.mainImage && (
                                <div className="post-image-container">
                                    <img 
                                        src={post.mainImage.asset.url} 
                                        alt={post.title} 
                                        className="post-image"
                                    />
                                </div>
                            )}
                            <div className="post-content">
                                <div className="post-category-tag" style={{ color: categoryColor }}>
                                    {post.team?.name ? `${post.team.city} ${post.team.name}` : 'NBA'}
                                </div>
                                <h2 className="post-title">
                                    <Link to={`/${post.slug.current}`}>
                                        {post.title}
                                    </Link>
                                </h2>
                                <div className="post-meta">
                                    <span className="post-author">
                                        {post.author?.name || 'Staff'}
                                    </span>
                                    <span className="post-date">
                                        {formatDate(post.publishedAt) || 'Recent'}
                                    </span>
                                </div>
                                {post.body && post.body[0] && (
                                    <p className="post-excerpt">
                                        {post.body[0].children?.[0]?.text?.substring(0, 150)}...
                                    </p>
                                )}
                                <Link 
                                    to={`/${post.slug.current}`} 
                                    className="read-more"
                                    style={{ color: categoryColor }}
                                >
                                    Read More →
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}