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

    const categorizePost = (post) => {
        // Look for exact category matches first
        const categoryTitles = post.categories?.map(cat => cat.title?.toLowerCase()) || []
        
        if (categoryTitles.includes('trades')) return 'trades'
        if (categoryTitles.includes('free agency')) return 'freeAgency'
        if (categoryTitles.includes('draft')) return 'draft'
        if (categoryTitles.includes('rumors')) return 'rumors'
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
            rumors: []
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
            news: 'News'
        }
        
        const categoryName = categoryLabels[category] || 'News'
        const teamName = post.team?.name ? `${post.team.city} ${post.team.name}` : 'Hoops Wave'
        
        return `${teamName} ${categoryName}`
    }


    if (loading) return <div className="loading">Loading...</div>
    if (error) return <div className="error">Error loading posts: {error}</div>
   
    const featuredPost = posts[0]
    const secondaryPost = posts[1] // Second most recent post for secondary section
    const trendingPosts = posts.slice(2, 7) // Posts 3-7 for right sidebar
    const latestPosts = posts.slice(8, 14) // Posts 9-14 for left sidebar
    const categorizedPosts = getCategorizedPosts()

    const categories = [
        { key: 'news', label: 'News', color: '#2c8aa6' },
        { key: 'rumors', label: 'Rumors', color: '#2c8aa6' },
        { key: 'trades', label: 'Trades', color: '#2c8aa6' },
        { key: 'draft', label: 'Draft', color: '#2c8aa6' },
        { key: 'freeAgency', label: 'Free Agency', color: '#2c8aa6' }
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
            {posts.length === 0 && (
                <p className="no-posts">No posts found. Check back soon for fresh basketball content!</p>
            )}
            
            {posts.length > 0 && (
                <>
                    <div className="three-column-layout">

                        {/* Left Content Container */}
                        <div className="left-content-container">
                            {/* Center Featured Article */}
                            <main className="center-featured">
                                <Link to={`/${featuredPost.slug.current}`} className="featured-article-link">
                                    <article className="featured-article">
                                        <div className="featured-image-container">
                                            <img
                                                src={featuredPost.mainImage.asset.url}
                                                alt={featuredPost.title}
                                                className="featured-image"
                                            />
                                            <div className="photo-credit">
                                                ({featuredPost.author?.name || 'Staff'} / Hoops Wave)
                                            </div>
                                        </div>
                                        <div className="featured-content">
                                            <div className="featured-top-content">
                                                <h2 className="featured-title">{featuredPost.title}</h2>
                                                <div className="featured-description">
                                                    {featuredPost.body && featuredPost.body[0]?.children?.[0]?.text ?
                                                        featuredPost.body[0].children[0].text.substring(0, 150) + '...' :
                                                        'Breaking basketball news and analysis from around the league.'
                                                    }
                                                </div>
                                            </div>
                                            <div className="featured-bottom-content">
                                                <div className="featured-category">
                                                    {getCategoryLabel(featuredPost)}
                                                </div>
                                                <div className="featured-meta">
                                                    <span className="featured-author">{featuredPost.author?.name || 'Staff'}</span>
                                                    <span className="featured-timestamp">{formatDate(featuredPost.publishedAt) || 'Recent'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            </main>

                            {/* Secondary Section - positioned in left area */}
                            <div className="secondary-section">
                                <div className="secondary-grid">
                                    {posts.slice(10, 13).map((post) => (
                                        <Link key={post.slug.current} to={`/${post.slug.current}`} className="secondary-card-link">
                                            <article className="secondary-card">
                                                {post.mainImage && (
                                                    <img
                                                        src={post.mainImage.asset.url}
                                                        alt={post.title}
                                                        className="secondary-card-image"
                                                    />
                                                )}
                                                <div className="secondary-card-content">
                                                    <h4 className="secondary-card-title">
                                                        {post.title}
                                                    </h4>
                                                    <div className="secondary-card-category">
                                                        {getCategoryLabel(post)}
                                                    </div>
                                                    <div className="secondary-card-meta">
                                                        {post.author?.name || 'Staff'} | {formatDate(post.publishedAt) || 'Recent'}
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
                            {posts.slice(2, 8).map((post) => (
                                <Link key={post.slug.current} to={`/${post.slug.current}`} className="latest-article-link">
                                    <article className="latest-article">
                                        <h4 className="latest-article-title">
                                            {post.title}
                                        </h4>
                                        <div className="latest-category">
                                            {getCategoryLabel(post)}
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