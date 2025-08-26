import { useState, useEffect } from "react"
import client from "../client"
import { Link, useParams } from "react-router-dom"
import { PortableText } from "@portabletext/react"

export default function SinglePost() {
    const [singlePost, setSinglePost] = useState(null) // Changed from [] to null
    const [isLoading, setIsLoading] = useState(true)
    const { slug } = useParams()

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setIsLoading(true)
                const data = await client.fetch(
                    `*[slug.current == $slug][0] {
                        title,
                        body,
                        mainImage {
                            asset -> {
                                _id,
                                url
                            },
                            alt
                        }
                    }`,
                    { slug } // Using parameterized query for security
                )
                
                console.log('Fetched post data:', data) // Debug log
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

    if (isLoading) {
        return <div><h1>Loading...</h1></div>
    }

    if (!singlePost) {
        return <div><h1>Error 404 | Page not found</h1>
        <Link to="/">Back to homepage</Link>
        </div>
    }

    return (
        <div>
            <h1>{singlePost.title}</h1>
            
            {/* Safe image rendering with fallbacks */}
            {singlePost.mainImage?.asset?.url ? (
                <img 
                    src={singlePost.mainImage.asset.url} 
                    alt={singlePost.mainImage.alt || singlePost.title || 'Blog post image'} 
                    title={singlePost.title} 
                />
            ) : (
                <div>No image available</div>
            )}
            
            <p>By Reesey</p>
            
            {/* Render body content using PortableText (modern approach) */}
            {singlePost.body && (
                <div>
                    <PortableText 
                        value={singlePost.body}
                        components={{
                            // Optional: Custom components for different block types
                            block: {
                                h1: ({children}) => <h1 className="text-3xl font-bold">{children}</h1>,
                                h2: ({children}) => <h2 className="text-2xl font-semibold">{children}</h2>,
                                normal: ({children}) => <p className="mb-4">{children}</p>
                            },
                            marks: {
                                strong: ({children}) => <strong className="font-bold">{children}</strong>,
                                em: ({children}) => <em className="italic">{children}</em>
                            }
                        }}
                    />
                </div>
            )}
            
            <button>
                <Link to="/blog">Read more articles</Link>
            </button>
        </div>
    )
}