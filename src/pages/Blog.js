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

    if (loading) return <div className="loading">Loading...</div>
    if (error) return <div className="error">Error loading posts: {error}</div>
   
    const featuredPost = posts[0]
    const sidebarPosts = posts.slice(1, 4)
    const categorizedPosts = getCategorizedPosts()

    const categories = [
        { key: 'trades', label: 'Trades', color: '#e74c3c' },
        { key: 'freeAgency', label: 'Free Agency', color: '#3498db' },
        { key: 'draft', label: 'Draft', color: '#9b59b6' },
        { key: 'news', label: 'News', color: '#2ecc71' },
        { key: 'rumors', label: 'Rumors', color: '#f39c12' }
    ]

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
                <div className="section-category">
                    {post.team?.name ? `${post.team.city} ${post.team.name} News` : 'Hoops Wave News'}
                </div>
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
                                <div className="featured-category">
                                    {featuredPost.team?.name ? `${featuredPost.team.city} ${featuredPost.team.name} News` : 'Hoops Wave News'}
                                </div>
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
                                    <div className="sidebar-category">
                                        {post.team?.name ? `${post.team.city} ${post.team.name} News` : 'Hoops Wave News'}
                                    </div>
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

                    {/* Category Sections */}
                    <div className="content-sections">
                        {categories.map(category => renderCategorySection(category))}
                    </div>
                </>
            )}
        </div>
    )
}