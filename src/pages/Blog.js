import { useState, useEffect } from "react"
import client from "../client"
import {Link} from "react-router-dom"
import './Blog.css'

export default function Blog() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        // Get search query from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const search = urlParams.get('search')
        if (search) {
            setSearchQuery(search)
        }

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

    const getTimeAgo = (dateString) => {
        const now = new Date()
        const postDate = new Date(dateString)
        const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60))

        if (diffInHours < 1) return 'Just now'
        if (diffInHours < 24) return `${diffInHours}h ago`
        if (diffInHours < 48) return 'Yesterday'
        return formatDate(dateString)
    }

    const getNewsIndicator = (post, index) => {
        const now = new Date()
        const postDate = new Date(post.publishedAt)
        const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60))

        if (index === 0) return 'BREAKING'
        if (diffInHours < 2) return 'BREAKING'
        if (diffInHours < 6) return 'LATEST'
        return null
    }

    const categorizePost = (post) => {
        // Look for exact category matches first
        const categoryTitles = post.categories?.map(cat => cat.title?.toLowerCase()) || []

        if (categoryTitles.includes('trades')) return 'trades'
        if (categoryTitles.includes('free agency')) return 'freeAgency'
        if (categoryTitles.includes('draft')) return 'draft'
        if (categoryTitles.includes('rumors')) return 'rumors'
        if (categoryTitles.includes('recaps') || categoryTitles.includes('gamerecaps') || categoryTitles.includes('game recaps')) return 'gamerecaps'
        if (categoryTitles.includes('analysis')) return 'analysis'
        if (categoryTitles.includes('news')) return 'news'

        // Default to news if no category matches
        return 'news'
    }

    const getCategorizedPosts = () => {
        const categorized = {
            trades: [],
            freeAgency: [],
            draft: [],
            news: [],
            rumors: [],
            gamerecaps: [],
            analysis: []
        }

        posts.forEach(post => {
            const category = categorizePost(post)
            categorized[category].push(post)
        })

        return categorized
    }

    const getCategoryLabel = (post) => {
        const category = categorizePost(post)
        const categoryLabels = {
            trades: 'Trades',
            freeAgency: 'Free Agency',
            draft: 'Draft',
            rumors: 'Rumors',
            news: 'News',
            gamerecaps: 'Recaps',
            analysis: 'Analysis'
        }

        const categoryName = categoryLabels[category] || 'News'
        const teamName = post.team?.name ? post.team.name : 'Benchwarm'

        return `${teamName} ${categoryName}`
    }

    const getTeamColor = (post) => {
        const teamColors = {
            'Suns': '#E56020',           // Phoenix Suns Orange
            'Cardinals': '#97233F',       // Cardinals Red
            'Diamondbacks': '#30CED8',    // D-backs Teal
            'Mercury': '#8B5CF6',         // Mercury Bright Purple
            'Wildcats': '#003366',        // U of A Navy
            'Sun Devils': '#8C1D40'       // ASU Maroon
        }
        return teamColors[post.team?.name] || '#E56020' // Default to orange
    }

    // Filter posts based on search query
    const filteredPosts = searchQuery
        ? posts.filter(post =>
            post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.team?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.categories?.some(cat => cat.title?.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : posts

    if (loading) return <div className="loading">Loading...</div>
    if (error) return <div className="error">Error loading posts: {error}</div>

    const featuredPost = filteredPosts[0]
    const secondaryPost = filteredPosts[1] // Second most recent post for secondary section
    const trendingPosts = filteredPosts.slice(6, 11) // Posts 7-11 for right sidebar
    const latestPosts = filteredPosts.slice(11, 17) // Posts 12-17 for left sidebar

    // Use filtered posts for categories when searching
    const getCategorizedFilteredPosts = () => {
        const categorized = {
            trades: [],
            freeAgency: [],
            draft: [],
            news: [],
            rumors: [],
            gamerecaps: [],
            analysis: []
        }

        filteredPosts.forEach(post => {
            const category = categorizePost(post)
            categorized[category].push(post)
        })

        return categorized
    }

    const categorizedPosts = searchQuery ? getCategorizedFilteredPosts() : getCategorizedPosts()

    const categories = [
        { key: 'news', label: 'News', color: '#8B4513' },
        { key: 'rumors', label: 'Rumors', color: '#8B4513' },
        { key: 'trades', label: 'Trades', color: '#8B4513' },
        { key: 'draft', label: 'Draft', color: '#8B4513' },
        { key: 'freeAgency', label: 'Free Agency', color: '#8B4513' },
        { key: 'gamerecaps', label: 'Recaps', color: '#97233F' },
        { key: 'analysis', label: 'Analysis', color: '#8B4513' }
    ]

    const SectionArticle = ({ post, size = 'small', isRed = false }) => (
        <Link
            to={`/${post.slug.current}`}
            className={`section-article-link ${size}`}
        >
            <article className={`section-article ${size}`}>
                {/* Show images for large and medium articles */}
                {(size === 'large' || size === 'medium') && post.mainImage && (
                    <img
                        src={post.mainImage.asset.url}
                        alt={post.title}
                        className="section-image"
                    />
                )}
                <div className="section-content">
                    <div className="section-category">
                        {getCategoryLabel(post)}
                    </div>
                    <h4 className={`section-title ${isRed ? 'red' : ''}`}>
                        {post.title}
                    </h4>
                    <div className="section-meta">
                        {post.author?.name || 'Staff'} | {formatDate(post.publishedAt) || 'Recent'}
                    </div>
                </div>
            </article>
        </Link>
    )

    const getLayoutType = (categoryKey) => {
        const layoutMap = {
            'news': 'image-focus',      // Layout A: Large image + 3 text
            'trades': 'image-focus',    // Layout A: Large image + 3 text
            'rumors': 'text-focus',     // Layout B: 4 text articles in grid
            'draft': 'text-focus',      // Layout B: 4 text articles in grid
            'freeAgency': 'mixed'       // Layout C: 2 with images, 2 text
        }
        return layoutMap[categoryKey] || 'image-focus'
    }

    const renderCategorySection = (category) => {
        const categoryPosts = categorizedPosts[category.key]
        if (!categoryPosts || categoryPosts.length === 0) return null

        const layoutType = getLayoutType(category.key)

        return (
            <section key={category.key} className="content-section">
                <div className="section-header">
                    <h2 className="section-title" style={{ color: category.color }}>
                        {category.label}
                    </h2>
                    <Link
                        to={`/${category.key}`}
                        className="see-more"
                        style={{ color: category.color }}
                    >
                        See more
                    </Link>
                </div>

                {/* Layout A: Image Focus (News, Trades) */}
                {layoutType === 'image-focus' && (
                    <div className="section-grid layout-image-focus">
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
                )}

                {/* Layout B: Text Focus (Rumors, Draft) */}
                {layoutType === 'text-focus' && (
                    <div className="section-grid layout-text-focus">
                        {categoryPosts.slice(0, 4).map((post) => (
                            <SectionArticle key={post.slug.current} post={post} size="text-only" />
                        ))}
                    </div>
                )}

                {/* Layout C: Mixed (Free Agency) */}
                {layoutType === 'mixed' && (
                    <div className="section-grid layout-mixed">
                        <div className="mixed-top-row">
                            {categoryPosts.slice(0, 2).map((post) => (
                                <SectionArticle key={post.slug.current} post={post} size="medium" />
                            ))}
                        </div>
                        <div className="mixed-bottom-row">
                            {categoryPosts.slice(2, 4).map((post) => (
                                <SectionArticle key={post.slug.current} post={post} size="text-only" />
                            ))}
                        </div>
                    </div>
                )}
            </section>
        )
    }

    return (
        <div className="blog-container">
            {searchQuery && (
                <div className="search-results-header">
                    <h2>Search Results for "{searchQuery}"</h2>
                    <p>{filteredPosts.length} articles found</p>
                    <button onClick={() => {
                        setSearchQuery('')
                        window.history.pushState({}, '', '/')
                    }} className="clear-search">
                        Clear Search
                    </button>
                </div>
            )}

            {filteredPosts.length === 0 && searchQuery && (
                <p className="no-posts">No articles found for "{searchQuery}". Try different keywords.</p>
            )}

            {posts.length === 0 && !searchQuery && (
                <p className="no-posts">No posts found. Check back soon for fresh basketball content!</p>
            )}

            {filteredPosts.length > 0 && (
                <>
                    <div className="three-column-layout">

                        {/* Left Content Container */}
                        <div className="left-content-container">
                            {/* Center Featured Article */}
                            <main className="center-featured">
                                <Link to={`/${featuredPost.slug.current}`} className="featured-article-link">
                                    <article className="featured-article">
                                        <div className="featured-content">
                                            <div className="featured-top-content">
                                                <h2 className="featured-title">{featuredPost.title}</h2>
                                                <div className="featured-description">
                                                    {featuredPost.body && featuredPost.body[0]?.children?.[0]?.text ?
                                                        (() => {
                                                            const fullText = featuredPost.body[0].children[0].text;
                                                            const sentences = fullText.split('.');
                                                            // Take first two sentences if available
                                                            if (sentences.length >= 2) {
                                                                return sentences.slice(0, 2).join('.') + '.';
                                                            }
                                                            // If only one sentence, use it
                                                            return sentences[0] + '.';
                                                        })() :
                                                        'Breaking basketball news and analysis from around the league.'
                                                    }
                                                </div>
                                            </div>
                                            <div className="featured-bottom-content">
                                                <div className="article-category-tag" style={{ color: getTeamColor(featuredPost) }}>
                                                    {getCategoryLabel(featuredPost)}
                                                </div>
                                                <div className="featured-meta">
                                                    <span className="featured-author">{featuredPost.author?.name || 'Staff'}</span>
                                                    <span className="featured-timestamp">{formatDate(featuredPost.publishedAt) || 'Recent'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="featured-image-container">
                                            <img
                                                src={featuredPost.mainImage.asset.url}
                                                alt={featuredPost.title}
                                                className="featured-image"
                                            />
                                        </div>
                                    </article>
                                </Link>
                            </main>


                            {/* Secondary Section - positioned in left area */}
                            <div className="secondary-section">
                                <div className="secondary-grid">
                                    {posts.slice(1, 4).map((post) => (
                                        <Link key={post.slug.current} to={`/${post.slug.current}`} className="secondary-card-link">
                                            <article className="secondary-card">
                                                {post.mainImage && (
                                                    <img
                                                        src={post.mainImage.asset.url}
                                                        alt={post.title}
                                                        className="secondary-card-image"
                                                    />
                                                )}
                                                <div className="latest-article-content">
                                                    <div className="latest-article-top">
                                                        <h4 className="latest-article-title">
                                                            {post.title}
                                                        </h4>
                                                    </div>
                                                    <div className="latest-article-bottom">
                                                        <div className="article-category-tag" style={{ color: getTeamColor(post) }}>
                                                            {getCategoryLabel(post)}
                                                        </div>
                                                        <div className="latest-author-date">
                                                            <span className="latest-author">{post.author?.name || 'Staff'}</span>
                                                            <span className="latest-divider">|</span>
                                                            <span className="latest-date">{formatDate(post.publishedAt) || 'Recent'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Latest Section */}
                        <aside className="right-sidebar">
                            {posts.slice(4, 9).map((post, index) => (
                                <Link key={post.slug.current} to={`/${post.slug.current}`} className="latest-article-link">
                                    <article className="latest-article">
                                        <div className="latest-article-content">
                                            <div className="latest-article-top">
                                                {getNewsIndicator(post, index + 2) && (
                                                    <div className={`news-indicator-small ${getNewsIndicator(post, index + 2).toLowerCase()}`}>
                                                        {getNewsIndicator(post, index + 2)}
                                                    </div>
                                                )}
                                                <h4 className="latest-article-title">
                                                    {post.title}
                                                </h4>
                                            </div>
                                            <div className="latest-article-bottom">
                                                <div className="article-category-tag" style={{ color: getTeamColor(post) }}>
                                                    {getCategoryLabel(post)}
                                                </div>
                                                <div className="latest-author-date">
                                                    <span className="latest-author">{post.author?.name || 'Staff'}</span>
                                                    <span className="latest-divider">|</span>
                                                    <span className="latest-date">{formatDate(post.publishedAt) || 'Recent'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </aside>
                    </div>

                    {/* Category Sections */}
                    <div className="content-sections">
                        {categories.map(category => renderCategorySection(category))}
                    </div>
                </>
            )}
        </div>
    )
}