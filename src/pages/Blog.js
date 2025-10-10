import { useState, useEffect } from "react"
import client from "../client"
import {Link} from "react-router-dom"
import './Blog.css'

export default function Blog() {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTeam, setSelectedTeam] = useState('all')

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
                            alt,
                            credit
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

    // Filter for news articles specifically
    const newsArticles = filteredPosts.filter(post =>
        post.categories && post.categories.some(cat => cat.title.toLowerCase() === 'news')
    )

    const featuredPost = filteredPosts[0]
    const secondFeaturedPost = filteredPosts[1] // Second featured article (post 2)
    const secondaryPost = filteredPosts[2] // Third most recent post for secondary section
    const trendingPosts = filteredPosts.slice(6, 11) // Posts 7-11 for right sidebar
    const latestPosts = filteredPosts.slice(11, 17) // Posts 12-17 for left sidebar
    const secondSidebarPosts = filteredPosts.slice(2, 7) // Posts 3-7 for second right sidebar

    // Get the most recent news articles for the news section (will be updated by team filter)
    // const featuredTeamNewsPost = newsArticles[0] || filteredPosts[0] // Use first news article or fallback to first post
    // Teams for the filter
    const teams = [
        { key: 'all', label: 'All' },
        { key: 'cardinals', label: 'Cardinals' },
        { key: 'diamondbacks', label: 'Diamondbacks' },
        { key: 'suns', label: 'Suns' },
        { key: 'mercury', label: 'Mercury' }
    ]

    // Get team-specific news articles
    const getTeamNewsArticles = (teamKey) => {
        if (teamKey === 'all') {
            // For "All", use all posts if there aren't enough news articles
            return newsArticles.length >= 13 ? newsArticles : filteredPosts
        }
        return newsArticles.filter(post =>
            post.team?.name?.toLowerCase().includes(teamKey) ||
            post.categories?.some(category => category.title.toLowerCase().includes(teamKey)) ||
            post.title?.toLowerCase().includes(teamKey)
        )
    }

    // Get articles for the selected team
    const teamNewsArticles = getTeamNewsArticles(selectedTeam)

    // Get team-filtered articles for all news section components
    const filteredNewsArticles = teamNewsArticles

    // Featured article for news section (team-filtered)
    const featuredTeamNewsPost = filteredNewsArticles[0] || filteredPosts[0]

    // Left sidebar articles (team-filtered) - show more when "All" is selected
    const newsLeftSidebarPosts = selectedTeam === 'all'
        ? filteredNewsArticles.slice(1, 7)  // Show 6 articles for "All"
        : filteredNewsArticles.slice(1, 6)  // Show 5 articles for specific teams

    // Right sidebar articles (team-filtered) - show more when "All" is selected
    const newsRightSidebarPosts = selectedTeam === 'all'
        ? filteredNewsArticles.slice(7, 13) // Show 6 articles for "All"
        : filteredNewsArticles.slice(1, Math.min(filteredNewsArticles.length, 6)) // Show 5 articles for specific teams, ensuring we have content

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
        { key: 'rumors', label: 'Rumors', color: '#6B46C1' },
        { key: 'trades', label: 'Trades', color: '#059669' },
        { key: 'draft', label: 'Draft', color: '#DC2626' },
        { key: 'freeAgency', label: 'Free Agency', color: '#0369A1' }
    ]

    const SectionArticle = ({ post, size = 'small', isRed = false }) => {
        // Generate description snippet from body content
        const getDescriptionSnippet = (body) => {
            if (!body || !Array.isArray(body)) return ''

            // Find the first text block
            const textBlock = body.find(block => block._type === 'block' && block.children)
            if (!textBlock || !textBlock.children) return ''

            // Extract text from children
            const text = textBlock.children
                .filter(child => child._type === 'span' && child.text)
                .map(child => child.text)
                .join('')

            // Return first 60 characters with ellipsis for small cards
            return text.length > 60 ? text.substring(0, 60) + '...' : text
        }

        return (
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
                        <h4 className={`section-title ${isRed ? 'red' : ''}`}>
                            {post.title}
                        </h4>
                        {/* Add description snippet for news section articles */}
                        {size === 'large' && (
                            <p className="section-description">
                                {getDescriptionSnippet(post.body)}
                            </p>
                        )}
                        {size === 'small' && (
                            <p className="section-description-small">
                                {getDescriptionSnippet(post.body)}
                            </p>
                        )}
                        <div className="section-meta">
                            {post.author?.name || 'Staff'} | {formatDate(post.publishedAt) || 'Recent'}
                        </div>
                    </div>
                </article>
            </Link>
        )
    }

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
                    {/* Second Featured Section - Duplicate of main featured section with unique class names */}
                    {filteredPosts.length > 1 && (
                        <div className="second-three-column-layout">
                            {/* Left Content Container */}
                            <div className="second-left-content-container">
                                {/* Center Featured Article */}
                                <main className="second-center-featured">
                                    <Link to={`/${filteredPosts[1].slug.current}`} className="second-featured-article-link">
                                        <article className="second-featured-article">
                                            <div className="second-featured-content">
                                                <div className="second-featured-top-content">
                                                    <h2 className="second-featured-title">{filteredPosts[1].title}</h2>
                                                    <div className="second-featured-description">
                                                        {filteredPosts[1].body && filteredPosts[1].body[0]?.children?.[0]?.text ?
                                                            (() => {
                                                                const fullText = filteredPosts[1].body[0].children[0].text;
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
                                                <div className="second-featured-bottom-content">
                                                    <div className="article-category-tag" style={{ color: getTeamColor(filteredPosts[1]) }}>
                                                        {getCategoryLabel(filteredPosts[1])}
                                                    </div>
                                                    <div className="second-featured-meta">
                                                        <span className="second-featured-author">{filteredPosts[1].author?.name || 'Staff'}</span>
                                                        <span className="second-featured-timestamp">{formatDate(filteredPosts[1].publishedAt) || 'Recent'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="second-featured-image-container">
                                                {filteredPosts[1].mainImage && (
                                                    <img
                                                        src={filteredPosts[1].mainImage.asset.url}
                                                        alt={filteredPosts[1].title}
                                                        className="second-featured-image"
                                                    />
                                                )}
                                            </div>
                                        </article>
                                    </Link>
                                </main>

                                {/* Secondary Section - positioned in left area */}
                                <div className="second-secondary-section">
                                    <div className="second-secondary-grid">
                                        {filteredPosts.slice(7, 10).map((post) => (
                                            <Link key={post.slug.current} to={`/${post.slug.current}`} className="second-secondary-card-link">
                                                <article className="second-secondary-card">
                                                    {post.mainImage && (
                                                        <img
                                                            src={post.mainImage.asset.url}
                                                            alt={post.title}
                                                            className="second-secondary-card-image"
                                                        />
                                                    )}
                                                    <div className="second-latest-article-content">
                                                        <div className="second-latest-article-top">
                                                            <h4 className="second-latest-article-title">
                                                                {post.title}
                                                            </h4>
                                                        </div>
                                                        <div className="second-latest-article-bottom">
                                                            <div className="article-category-tag" style={{ color: getTeamColor(post) }}>
                                                                {getCategoryLabel(post)}
                                                            </div>
                                                            <div className="second-latest-author-date">
                                                                <span className="second-latest-author">{post.author?.name || 'Staff'}</span>
                                                                <span className="second-latest-divider">|</span>
                                                                <span className="second-latest-date">{formatDate(post.publishedAt) || 'Recent'}</span>
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
                            <aside className="second-right-sidebar">
                                {secondSidebarPosts.map((post, index) => (
                                    <Link key={post.slug.current} to={`/${post.slug.current}`} className="second-latest-article-link">
                                        <article className="second-latest-article">
                                            <div className="second-latest-article-content">
                                                <div className="second-latest-article-top">
                                                    {getNewsIndicator(post, index + 3) && (
                                                        <div className={`news-indicator-small ${getNewsIndicator(post, index + 3).toLowerCase()}`}>
                                                            {getNewsIndicator(post, index + 3)}
                                                        </div>
                                                    )}
                                                    <h4 className="second-latest-article-title">
                                                        {post.title}
                                                    </h4>
                                                </div>
                                                <div className="second-latest-article-bottom">
                                                    <div className="article-category-tag" style={{ color: getTeamColor(post) }}>
                                                        {getCategoryLabel(post)}
                                                    </div>
                                                    <div className="second-latest-author-date">
                                                        <span className="second-latest-author">{post.author?.name || 'Staff'}</span>
                                                        <span className="second-latest-divider">|</span>
                                                        <span className="second-latest-date">{formatDate(post.publishedAt) || 'Recent'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </aside>
                        </div>
                    )}

                    <div className="three-column-layout">
                        {/* News Section Header */}
                        <div className="news-section-header">
                            <div className="section-header">
                                <h2 className="section-title" style={{ color: '#97233F' }}>
                                    News
                                </h2>
                                <Link
                                    to="/news"
                                    className="see-more"
                                    style={{ color: '#97233F' }}
                                >
                                    See more
                                </Link>
                            </div>
                        </div>

                        {/* Left Sidebar - Team Filter */}
                        <aside className="news-left-sidebar">
                            <div className="left-sidebar-filter">
                                <h3 className="filter-title">By Team</h3>
                                <div className="team-filter-tabs vertical">
                                    {teams.map((team) => (
                                        <button
                                            key={team.key}
                                            className={`team-tab vertical ${selectedTeam === team.key ? 'active' : ''}`}
                                            onClick={() => setSelectedTeam(team.key)}
                                        >
                                            {team.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        {/* Left Content Container */}
                        <div className="left-content-container">
                            {/* Center Featured Article */}
                            <main className="center-featured">
                                <Link to={`/${featuredTeamNewsPost.slug.current}`} className="featured-article-link">
                                    <article className="featured-article">
                                        <div className="featured-content">
                                            <div className="featured-top-content">
                                                <h2 className="featured-title">{featuredTeamNewsPost.title}</h2>
                                                <div className="featured-description">
                                                    {featuredTeamNewsPost.body && featuredTeamNewsPost.body[0]?.children?.[0]?.text ?
                                                        (() => {
                                                            const fullText = featuredTeamNewsPost.body[0].children[0].text;
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
                                                <div className="article-category-tag" style={{ color: getTeamColor(featuredTeamNewsPost) }}>
                                                    {getCategoryLabel(featuredTeamNewsPost)}
                                                </div>
                                                <div className="featured-meta">
                                                    <span className="featured-author">{featuredTeamNewsPost.author?.name || 'Staff'}</span>
                                                    <span className="featured-timestamp">{formatDate(featuredTeamNewsPost.publishedAt) || 'Recent'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="featured-image-container">
                                            {featuredTeamNewsPost.mainImage && (
                                                <img
                                                    src={featuredTeamNewsPost.mainImage.asset.url}
                                                    alt={featuredTeamNewsPost.title}
                                                    className="featured-image"
                                                />
                                            )}
                                        </div>
                                    </article>
                                </Link>
                            </main>
                        </div>

                        {/* Right Sidebar - Articles */}
                        <aside className="right-sidebar">
                            {newsRightSidebarPosts.map((post, index) => (
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