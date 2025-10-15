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

    const extractTwoSentences = (body) => {
        if (!body || !Array.isArray(body)) return ''

        let allText = ''

        // Extract text from multiple blocks/paragraphs
        for (let block of body) {
            if (block._type === 'block' && block.children) {
                for (let child of block.children) {
                    if (child._type === 'span' && child.text) {
                        allText += child.text + ' '
                    }
                }
                // Add space between paragraphs
                allText += ' '
            }
        }

        if (!allText.trim()) return ''

        // Split by periods, but be more careful about abbreviations
        const sentences = allText.split(/\.(?=\s+[A-Z])/); // Split on period followed by space and capital letter

        if (sentences.length >= 1) {
            // Take first sentence and add the period back
            return sentences[0].trim() + '.'
        }

        return allText.trim()
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
            'Cardinals': '#8C1D40',       // Cardinals Red
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

    // Filter for rumors articles specifically
    const rumorsArticles = filteredPosts.filter(post =>
        post.categories && post.categories.some(cat => cat.title.toLowerCase() === 'rumors')
    )

    // Filter for analysis articles specifically
    const analysisArticles = filteredPosts.filter(post =>
        post.categories && post.categories.some(cat => cat.title.toLowerCase() === 'analysis')
    )

    const featuredPost = filteredPosts[0]
    const secondFeaturedPost = filteredPosts[1] // Second featured article (post 2)
    const secondaryPost = filteredPosts[2] // Third most recent post for secondary section
    const trendingPosts = filteredPosts.slice(6, 11) // Posts 7-11 for right sidebar
    const latestPosts = filteredPosts.slice(11, 17) // Posts 12-17 for left sidebar
    const secondSidebarPosts = filteredPosts.slice(2, 8) // Posts 3-8 for second right sidebar

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

    // Get 4 latest Suns articles for dedicated Suns section
    const sunsArticles = posts.filter(post =>
        post.team?.name?.toLowerCase().includes('suns') ||
        post.categories?.some(category => category.title.toLowerCase().includes('suns')) ||
        post.title?.toLowerCase().includes('suns')
    )

    // If less than 4 Suns articles, fill with general posts
    const latestSunsArticles = sunsArticles.length >= 4
        ? sunsArticles.slice(0, 4)
        : [...sunsArticles, ...posts.filter(post => !sunsArticles.includes(post)).slice(0, 4 - sunsArticles.length)]

    // Get 4 latest Cardinals articles for dedicated Cardinals section
    const cardinalsArticles = posts.filter(post =>
        post.team?.name?.toLowerCase().includes('cardinals') ||
        post.categories?.some(category => category.title.toLowerCase().includes('cardinals')) ||
        post.title?.toLowerCase().includes('cardinals')
    )

    // If less than 4 Cardinals articles, fill with general posts
    const latestCardinalsArticles = cardinalsArticles.length >= 4
        ? cardinalsArticles.slice(0, 4)
        : [...cardinalsArticles, ...posts.filter(post => !cardinalsArticles.includes(post)).slice(0, 4 - cardinalsArticles.length)]

    // Get 4 latest Diamondbacks articles for dedicated Diamondbacks section
    const diamondbacksArticles = posts.filter(post =>
        post.team?.name?.toLowerCase().includes('diamondbacks') ||
        post.categories?.some(category => category.title.toLowerCase().includes('diamondbacks')) ||
        post.title?.toLowerCase().includes('diamondbacks')
    )

    // If less than 4 Diamondbacks articles, fill with general posts
    const latestDiamondbacksArticles = diamondbacksArticles.length >= 4
        ? diamondbacksArticles.slice(0, 4)
        : [...diamondbacksArticles, ...posts.filter(post => !diamondbacksArticles.includes(post)).slice(0, 4 - diamondbacksArticles.length)]

    // Get 8 latest Recaps articles for dedicated Recaps section (2 rows of 4)
    const recapsArticles = posts.filter(post =>
        post.categories?.some(category => category.title.toLowerCase().includes('recap')) ||
        post.categories?.some(category => category.title.toLowerCase().includes('gamerecap')) ||
        post.title?.toLowerCase().includes('recap')
    )

    // If less than 8 Recaps articles, fill with general posts
    const latestRecapsArticles = recapsArticles.length >= 8
        ? recapsArticles.slice(0, 8)
        : [...recapsArticles, ...posts.filter(post => !recapsArticles.includes(post)).slice(0, 8 - recapsArticles.length)]

    // Get 4 latest Mercury articles for dedicated Mercury section
    const mercuryArticles = posts.filter(post =>
        post.team?.name?.toLowerCase().includes('mercury') ||
        post.categories?.some(category => category.title.toLowerCase().includes('mercury')) ||
        post.title?.toLowerCase().includes('mercury')
    )

    // If less than 4 Mercury articles, fill with general posts
    const latestMercuryArticles = mercuryArticles.length >= 4
        ? mercuryArticles.slice(0, 4)
        : [...mercuryArticles, ...posts.filter(post => !mercuryArticles.includes(post)).slice(0, 4 - mercuryArticles.length)]

    // Get Trades articles for two-column section
    const tradesSpecificArticles = posts.filter(post =>
        post.categories?.some(category => category.title.toLowerCase().includes('trade')) ||
        post.title?.toLowerCase().includes('trade')
    )
    const tradesArticles = tradesSpecificArticles.length >= 4
        ? tradesSpecificArticles.slice(0, 4)
        : [...tradesSpecificArticles, ...posts.filter(post => !tradesSpecificArticles.includes(post)).slice(0, 4 - tradesSpecificArticles.length)]

    // Get Free Agency articles for two-column section
    const freeAgencySpecificArticles = posts.filter(post =>
        post.categories?.some(category => category.title.toLowerCase().includes('free agency')) ||
        post.categories?.some(category => category.title.toLowerCase().includes('freeagency')) ||
        post.title?.toLowerCase().includes('free agency')
    )
    const freeAgencyArticles = freeAgencySpecificArticles.length >= 4
        ? freeAgencySpecificArticles.slice(0, 4)
        : [...freeAgencySpecificArticles, ...posts.filter(post => !freeAgencySpecificArticles.includes(post)).slice(0, 4 - freeAgencySpecificArticles.length)]

    // Featured article for news section (team-filtered)
    const featuredTeamNewsPost = filteredNewsArticles[0] || filteredPosts[0]

    // Left sidebar articles (team-filtered) - show more when "All" is selected
    const newsLeftSidebarPosts = selectedTeam === 'all'
        ? filteredNewsArticles.slice(1, 7)  // Show 6 articles for "All"
        : filteredNewsArticles.slice(1, 6)  // Show 5 articles for specific teams

    // Right sidebar articles (team-filtered) - show more when "All" is selected
    const newsRightSidebarPosts = selectedTeam === 'all'
        ? filteredNewsArticles.slice(7, 14) // Show 7 articles for "All"
        : filteredNewsArticles.slice(1, Math.min(filteredNewsArticles.length, 7)) // Show 6 articles for specific teams, ensuring we have content

    // Get team-specific rumors articles
    const getTeamRumorsArticles = (teamKey) => {
        if (teamKey === 'all') {
            return rumorsArticles.length >= 13 ? rumorsArticles : filteredPosts.filter(post =>
                post.categories && post.categories.some(cat => cat.title.toLowerCase() === 'rumors')
            )
        }
        return rumorsArticles.filter(post =>
            post.team?.name?.toLowerCase().includes(teamKey) ||
            post.categories?.some(category => category.title.toLowerCase().includes(teamKey)) ||
            post.title?.toLowerCase().includes(teamKey)
        )
    }

    const teamRumorsArticles = getTeamRumorsArticles(selectedTeam)
    const filteredRumorsArticles = teamRumorsArticles
    const featuredTeamRumorsPost = filteredRumorsArticles[0] || filteredPosts.find(post =>
        post.categories && post.categories.some(cat => cat.title.toLowerCase() === 'rumors')
    ) || filteredPosts[0]

    const rumorsRightSidebarPosts = selectedTeam === 'all'
        ? filteredRumorsArticles.slice(1, 8)
        : filteredRumorsArticles.slice(1, Math.min(filteredRumorsArticles.length, 7))

    // Get team-specific analysis articles
    const getTeamAnalysisArticles = (teamKey) => {
        if (teamKey === 'all') {
            return analysisArticles.length >= 13 ? analysisArticles : filteredPosts.filter(post =>
                post.categories && post.categories.some(cat => cat.title.toLowerCase() === 'analysis')
            )
        }
        return analysisArticles.filter(post =>
            post.team?.name?.toLowerCase().includes(teamKey) ||
            post.categories?.some(category => category.title.toLowerCase().includes(teamKey)) ||
            post.title?.toLowerCase().includes(teamKey)
        )
    }

    const teamAnalysisArticles = getTeamAnalysisArticles(selectedTeam)
    const filteredAnalysisArticles = teamAnalysisArticles
    const featuredTeamAnalysisPost = filteredAnalysisArticles[0] || filteredPosts.find(post =>
        post.categories && post.categories.some(cat => cat.title.toLowerCase() === 'analysis')
    ) || filteredPosts[0]

    const analysisRightSidebarPosts = selectedTeam === 'all'
        ? filteredAnalysisArticles.slice(1, 8)
        : filteredAnalysisArticles.slice(1, Math.min(filteredAnalysisArticles.length, 7))

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
                                                        {extractTwoSentences(filteredPosts[1].body) ||
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
                                                    {extractTwoSentences(featuredTeamNewsPost.body) ||
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

                    {/* Suns Section */}
                    <div className="suns-section">
                        <div className="suns-section-header">
                            <h2 className="section-title" style={{ color: '#E56020' }}>
                                Suns
                            </h2>
                            <Link to="/suns" className="see-more-link" style={{ color: '#E56020' }}>
                                See More
                            </Link>
                        </div>
                        <div className="suns-articles-container">
                            {latestSunsArticles.map((post, index) => (
                                <Link key={post.slug.current || index} to={`/${post.slug.current}`} className="suns-article-card">
                                    <article>
                                        {post.mainImage && (
                                            <div className="suns-card-image">
                                                <img
                                                    src={post.mainImage.asset.url}
                                                    alt={post.mainImage.alt || post.title}
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}
                                        <div className="suns-card-content">
                                            <h3 className="suns-card-title">{post.title}</h3>
                                            <div className="suns-card-meta">
                                                <span className="suns-card-author">{post.author?.name || 'Staff'}</span>
                                                <span className="suns-card-divider">|</span>
                                                <span className="suns-card-date">{getTimeAgo(post.publishedAt)}</span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Rumors Section */}
                    <div className="three-column-layout">
                        {/* Rumors Section Header */}
                        <div className="rumors-section-header">
                            <div className="section-header">
                                <h2 className="section-title" style={{ color: '#97233F' }}>
                                    Rumors
                                </h2>
                                <Link
                                    to="/rumors"
                                    className="see-more"
                                    style={{ color: '#97233F' }}
                                >
                                    See more
                                </Link>
                            </div>
                        </div>

                        {/* Left Sidebar - Team Filter */}
                        <aside className="rumors-left-sidebar">
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
                                <Link to={`/${featuredTeamRumorsPost.slug.current}`} className="featured-article-link">
                                    <article className="featured-article">
                                        <div className="featured-content">
                                            <div className="featured-top-content">
                                                <h2 className="featured-title">{featuredTeamRumorsPost.title}</h2>
                                                <div className="featured-description">
                                                    {extractTwoSentences(featuredTeamRumorsPost.body) ||
                                                        'Latest rumors and speculation from around the league.'
                                                    }
                                                </div>
                                            </div>
                                            <div className="featured-bottom-content">
                                                <div className="article-category-tag" style={{ color: getTeamColor(featuredTeamRumorsPost) }}>
                                                    {getCategoryLabel(featuredTeamRumorsPost)}
                                                </div>
                                                <div className="featured-meta">
                                                    <span className="featured-author">{featuredTeamRumorsPost.author?.name || 'Staff'}</span>
                                                    <span className="featured-timestamp">{formatDate(featuredTeamRumorsPost.publishedAt) || 'Recent'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="featured-image-container">
                                            {featuredTeamRumorsPost.mainImage && (
                                                <img
                                                    src={featuredTeamRumorsPost.mainImage.asset.url}
                                                    alt={featuredTeamRumorsPost.title}
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
                            {rumorsRightSidebarPosts.map((post, index) => (
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

                    {/* Cardinals Section */}
                    <div className="cardinals-section">
                        <div className="cardinals-section-header">
                            <h2 className="section-title" style={{ color: '#97233F' }}>
                                Cardinals
                            </h2>
                            <Link to="/cardinals" className="see-more-link">
                                See More
                            </Link>
                        </div>
                        <div className="cardinals-articles-container">
                            {latestCardinalsArticles.map((post, index) => (
                                <Link key={post.slug.current || index} to={`/${post.slug.current}`} className="cardinals-article-card">
                                    <article>
                                        {post.mainImage && (
                                            <div className="cardinals-card-image">
                                                <img
                                                    src={post.mainImage.asset.url}
                                                    alt={post.mainImage.alt || post.title}
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}
                                        <div className="cardinals-card-content">
                                            <h3 className="cardinals-card-title">{post.title}</h3>
                                            <div className="cardinals-card-meta">
                                                <span className="cardinals-card-author">{post.author?.name || 'Staff'}</span>
                                                <span className="cardinals-card-divider">|</span>
                                                <span className="cardinals-card-date">{getTimeAgo(post.publishedAt)}</span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Analysis Section */}
                    <div className="three-column-layout">
                        {/* Analysis Section Header */}
                        <div className="analysis-section-header">
                            <div className="section-header">
                                <h2 className="section-title" style={{ color: '#97233F' }}>
                                    Analysis
                                </h2>
                                <Link
                                    to="/analysis"
                                    className="see-more"
                                    style={{ color: '#97233F' }}
                                >
                                    See more
                                </Link>
                            </div>
                        </div>

                        {/* Left Sidebar - Team Filter */}
                        <aside className="analysis-left-sidebar">
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
                                <Link to={`/${featuredTeamAnalysisPost.slug.current}`} className="featured-article-link">
                                    <article className="featured-article">
                                        <div className="featured-content">
                                            <div className="featured-top-content">
                                                <h2 className="featured-title">{featuredTeamAnalysisPost.title}</h2>
                                                <div className="featured-description">
                                                    {extractTwoSentences(featuredTeamAnalysisPost.body) ||
                                                        'In-depth analysis and insights from basketball experts.'
                                                    }
                                                </div>
                                            </div>
                                            <div className="featured-bottom-content">
                                                <div className="article-category-tag" style={{ color: getTeamColor(featuredTeamAnalysisPost) }}>
                                                    {getCategoryLabel(featuredTeamAnalysisPost)}
                                                </div>
                                                <div className="featured-meta">
                                                    <span className="featured-author">{featuredTeamAnalysisPost.author?.name || 'Staff'}</span>
                                                    <span className="featured-timestamp">{formatDate(featuredTeamAnalysisPost.publishedAt) || 'Recent'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="featured-image-container">
                                            {featuredTeamAnalysisPost.mainImage && (
                                                <img
                                                    src={featuredTeamAnalysisPost.mainImage.asset.url}
                                                    alt={featuredTeamAnalysisPost.title}
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
                            {analysisRightSidebarPosts.map((post, index) => (
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

                    {/* Diamondbacks Section */}
                    <div className="diamondbacks-section">
                        <div className="diamondbacks-section-header">
                            <h2 className="section-title" style={{ color: '#17A2B8' }}>
                                Diamondbacks
                            </h2>
                            <Link to="/diamondbacks" className="see-more-link" style={{ color: '#17A2B8' }}>
                                See More
                            </Link>
                        </div>
                        <div className="diamondbacks-articles-container">
                            {latestDiamondbacksArticles.map((post, index) => (
                                <Link key={post.slug.current || index} to={`/${post.slug.current}`} className="diamondbacks-article-card">
                                    <article>
                                        {post.mainImage && (
                                            <div className="diamondbacks-card-image">
                                                <img
                                                    src={post.mainImage.asset.url}
                                                    alt={post.mainImage.alt || post.title}
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}
                                        <div className="diamondbacks-card-content">
                                            <h3 className="diamondbacks-card-title">{post.title}</h3>
                                            <div className="diamondbacks-card-meta">
                                                <span className="diamondbacks-card-author">{post.author?.name || 'Staff'}</span>
                                                <span className="diamondbacks-card-divider">|</span>
                                                <span className="diamondbacks-card-date">{getTimeAgo(post.publishedAt)}</span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recaps Section */}
                    <div className="recaps-section">
                        <div className="recaps-section-header">
                            <h2 className="section-title" style={{ color: '#97233F' }}>
                                Recaps
                            </h2>
                            <Link to="/gamerecaps" className="see-more-link">
                                See More
                            </Link>
                        </div>
                        <div className="recaps-articles-container">
                            <div className="recaps-row">
                                {latestRecapsArticles.slice(0, 4).map((post, index) => (
                                    <Link key={post.slug.current || index} to={`/${post.slug.current}`} className="recaps-article-card">
                                        <article>
                                            {post.mainImage && (
                                                <div className="recaps-card-image">
                                                    <img
                                                        src={post.mainImage.asset.url}
                                                        alt={post.mainImage.alt || post.title}
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )}
                                            <div className="recaps-card-content">
                                                <h3 className="recaps-card-title">{post.title}</h3>
                                                <div className="recaps-card-meta">
                                                    <span className="recaps-card-author">{post.author?.name || 'Staff'}</span>
                                                    <span className="recaps-card-divider">|</span>
                                                    <span className="recaps-card-date">{getTimeAgo(post.publishedAt)}</span>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                            <div className="recaps-row">
                                {latestRecapsArticles.slice(4, 8).map((post, index) => (
                                    <Link key={post.slug.current || index + 4} to={`/${post.slug.current}`} className="recaps-article-card">
                                        <article>
                                            {post.mainImage && (
                                                <div className="recaps-card-image">
                                                    <img
                                                        src={post.mainImage.asset.url}
                                                        alt={post.mainImage.alt || post.title}
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )}
                                            <div className="recaps-card-content">
                                                <h3 className="recaps-card-title">{post.title}</h3>
                                                <div className="recaps-card-meta">
                                                    <span className="recaps-card-author">{post.author?.name || 'Staff'}</span>
                                                    <span className="recaps-card-divider">|</span>
                                                    <span className="recaps-card-date">{getTimeAgo(post.publishedAt)}</span>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mercury Section */}
                    <div className="mercury-section">
                        <div className="mercury-section-header">
                            <h2 className="section-title" style={{ color: '#6B46C1' }}>
                                Mercury
                            </h2>
                            <Link to="/mercury" className="see-more-link" style={{ color: '#6B46C1' }}>
                                See More
                            </Link>
                        </div>
                        <div className="mercury-articles-container">
                            {latestMercuryArticles.map((post, index) => (
                                <Link key={post.slug.current || index} to={`/${post.slug.current}`} className="mercury-article-card">
                                    <article>
                                        {post.mainImage && (
                                            <div className="mercury-card-image">
                                                <img
                                                    src={post.mainImage.asset.url}
                                                    alt={post.mainImage.alt || post.title}
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}
                                        <div className="mercury-card-content">
                                            <h3 className="mercury-card-title">{post.title}</h3>
                                            <div className="mercury-card-meta">
                                                <span className="mercury-card-author">{post.author?.name || 'Staff'}</span>
                                                <span className="mercury-card-divider">|</span>
                                                <span className="mercury-card-date">{getTimeAgo(post.publishedAt)}</span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Trades and Free Agency Two-Column Section */}
                    <div className="two-column-section">
                        {/* Trades Column */}
                        <div className="trades-column">
                            <div className="trades-header">
                                <h2 className="section-title">Trades</h2>
                                <Link to="/trades" className="see-more-link">
                                    See more
                                </Link>
                            </div>
                            <div className="trades-content">
                                {tradesArticles[0] && (
                                    <Link to={`/${tradesArticles[0].slug.current}`} className="featured-trade-article">
                                        <article>
                                            {tradesArticles[0].mainImage && (
                                                <div className="featured-trade-image">
                                                    <img
                                                        src={tradesArticles[0].mainImage.asset.url}
                                                        alt={tradesArticles[0].mainImage.alt || tradesArticles[0].title}
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )}
                                            <div className="featured-trade-content">
                                                <h3 className="featured-trade-title">{tradesArticles[0].title}</h3>
                                                <div className="featured-trade-meta">
                                                    <span>{tradesArticles[0].author?.name || 'Staff'} | {getTimeAgo(tradesArticles[0].publishedAt)}</span>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                )}
                                <div className="trades-sidebar">
                                    {tradesArticles.slice(1, 4).map((post, index) => (
                                        <Link key={post.slug.current} to={`/${post.slug.current}`} className="trades-sidebar-article">
                                            <article>
                                                <div className="trades-sidebar-content">
                                                    <h4 className="trades-sidebar-title">{post.title}</h4>
                                                    <div className="trades-sidebar-category" style={{ color: getTeamColor(post) }}>
                                                        {getCategoryLabel(post)}
                                                    </div>
                                                    <div className="trades-sidebar-meta">
                                                        <span className="trades-sidebar-author">{post.author?.name || 'Staff'}</span>
                                                        <span className="trades-sidebar-divider">|</span>
                                                        <span className="trades-sidebar-date">{getTimeAgo(post.publishedAt)}</span>
                                                    </div>
                                                </div>
                                            </article>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Free Agency Column */}
                        <div className="freeagency-column">
                            <div className="freeagency-header">
                                <h2 className="section-title">Free Agency</h2>
                                <Link to="/freeagency" className="see-more-link">
                                    See more
                                </Link>
                            </div>
                            <div className="freeagency-content">
                                {freeAgencyArticles[0] && (
                                    <Link to={`/${freeAgencyArticles[0].slug.current}`} className="featured-freeagency-article">
                                        <article>
                                            {freeAgencyArticles[0].mainImage && (
                                                <div className="featured-freeagency-image">
                                                    <img
                                                        src={freeAgencyArticles[0].mainImage.asset.url}
                                                        alt={freeAgencyArticles[0].mainImage.alt || freeAgencyArticles[0].title}
                                                        loading="lazy"
                                                    />
                                                </div>
                                            )}
                                            <div className="featured-freeagency-content">
                                                <h3 className="featured-freeagency-title">{freeAgencyArticles[0].title}</h3>
                                                <div className="featured-freeagency-meta">
                                                    <span>{freeAgencyArticles[0].author?.name || 'Staff'} | {getTimeAgo(freeAgencyArticles[0].publishedAt)}</span>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                )}
                                <div className="freeagency-sidebar">
                                    {freeAgencyArticles.slice(1, 4).map((post, index) => (
                                        <Link key={post.slug.current} to={`/${post.slug.current}`} className="freeagency-sidebar-article">
                                            <article>
                                                <div className="freeagency-sidebar-content">
                                                    <h4 className="freeagency-sidebar-title">{post.title}</h4>
                                                    <div className="freeagency-sidebar-category" style={{ color: getTeamColor(post) }}>
                                                        {getCategoryLabel(post)}
                                                    </div>
                                                    <div className="freeagency-sidebar-meta">
                                                        <span className="freeagency-sidebar-author">{post.author?.name || 'Staff'}</span>
                                                        <span className="freeagency-sidebar-divider">|</span>
                                                        <span className="freeagency-sidebar-date">{getTimeAgo(post.publishedAt)}</span>
                                                    </div>
                                                </div>
                                            </article>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
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