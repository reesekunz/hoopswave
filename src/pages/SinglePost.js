import { useState, useEffect } from "react"
import client from "../client"
import { Link, useParams } from "react-router-dom"
import { PortableText } from "@portabletext/react"
import './SinglePost.css'  // Add this import

export default function SinglePost() {
    const [singlePost, setSinglePost] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const { slug } = useParams()

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setIsLoading(true)
                const data = await client.fetch(
                    `*[slug.current == $slug][0] {
                        title,
                        intro,
                        body,
                        publishedAt,
                        author-> {
                            name
                        },
                        categories[]-> {
                            title
                        },
                        team-> {
                            name,
                            city
                        },
                        mainImage {
                            asset -> {
                                _id,
                                url
                            },
                            alt
                        }
                    }`,
                    { slug }
                )
                
                console.log('Fetched post data:', data)
                setSinglePost(data)
            } catch (error) {
                console.error('Error fetching post:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (slug) {
            fetchPost()
        }
    }, [slug])

    const formatDate = (dateString) => {
        if (!dateString) return 'Recent'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        })
    }

    if (isLoading) {
        return (
            <div className="loading-container">
                <h1>🏀 Loading article...</h1>
            </div>
        )
    }

    if (!singlePost) {
        return (
            <div className="error-container">
                <h1>Error 404 | Page not found</h1>
                <p>The article you're looking for doesn't exist.</p>
                <Link to="/" className="error-link">Back to homepage</Link>
            </div>
        )
    }

    return (
        <article className="single-post-container">
            <header className="single-post-header">
                <h1 className="single-post-title">{singlePost.title}</h1>

                {singlePost.intro && (
                    <div className="single-post-intro">
                        {singlePost.intro}
                    </div>
                )}

                <div className="single-post-meta">
                    <span className="single-post-category">
                        {singlePost.team && singlePost.categories?.length > 0
                            ? `${singlePost.team.name} ${singlePost.categories[0].title}`
                            : singlePost.categories?.length > 0
                            ? singlePost.categories[0].title
                            : singlePost.team
                            ? `${singlePost.team.city} ${singlePost.team.name}`
                            : 'Arizona Sports'}
                    </span>
                    <span className="single-post-author">
                        By {singlePost.author?.name || 'Reesey'}
                    </span>
                    <span className="single-post-date">
                        {formatDate(singlePost.publishedAt)}
                    </span>
                </div>
            </header>

            {singlePost.mainImage?.asset?.url ? (
                <img 
                    src={singlePost.mainImage.asset.url} 
                    alt={singlePost.mainImage.alt || singlePost.title || 'Blog post image'} 
                    title={singlePost.title}
                    className="single-post-image"
                />
            ) : (
                <div className="no-image">No image available</div>
            )}
            
            {singlePost.body && (
                <div className="single-post-content">
                    <PortableText 
                        value={singlePost.body}
                        components={{
                            block: {
                                h1: ({children}) => <h1>{children}</h1>,
                                h2: ({children}) => <h2>{children}</h2>,
                                h3: ({children}) => <h3>{children}</h3>,
                                normal: ({children}) => <p>{children}</p>,
                                blockquote: ({children}) => <blockquote>{children}</blockquote>
                            },
                            marks: {
                                strong: ({children}) => <strong>{children}</strong>,
                                em: ({children}) => <em>{children}</em>,
                                code: ({children}) => <code>{children}</code>
                            },
                            list: {
                                bullet: ({children}) => <ul>{children}</ul>,
                                number: ({children}) => <ol>{children}</ol>
                            },
                            listItem: {
                                bullet: ({children}) => <li>{children}</li>,
                                number: ({children}) => <li>{children}</li>
                            }
                        }}
                    />
                </div>
            )}
            
            <footer className="single-post-footer">
                <button className="back-to-blog-btn">
                    <Link to="/blog" className="back-to-blog-link">
                        Read More Articles
                    </Link>
                </button>
            </footer>
        </article>
    )
}