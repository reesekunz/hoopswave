// Enhanced Categories component with real data integration
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import client from '../client'
import './Categories.css'

const Categories = ({ teamSlug = null, teamName = null }) => {
  const [articles, setArticles] = useState({
    trades: [],
    freeAgency: [],
    draft: [],
    news: [],
    rumors: []
  })
  const [loading, setLoading] = useState(true)

  const categories = [
    { key: 'trades', label: 'Trades', color: '#2c8aa6' },
    { key: 'freeAgency', label: 'Free Agency', color: '#2c8aa6' },
    { key: 'draft', label: 'Draft', color: '#2c8aa6' },
    { key: 'news', label: 'News', color: '#2c8aa6' },
    { key: 'rumors', label: 'Rumors', color: '#2c8aa6' }
  ]

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Build query based on whether we're on a team page or home page
        let query = `*[_type == "article"`
        
        if (teamSlug) {
          query += ` && team->slug.current == $teamSlug`
        }
        
        query += `] | order(publishedAt desc) {
          _id,
          title,
          slug,
          publishedAt,
          author,
          category,
          excerpt,
          mainImage {
            asset -> {
              url
            }
          },
          team -> {
            name,
            city,
            abbreviation
          }
        }`

        const data = await client.fetch(query, teamSlug ? { teamSlug } : {})
        
        // Group articles by category
        const groupedArticles = {
          trades: data.filter(article => 
            article.category?.toLowerCase().includes('trade') ||
            article.title?.toLowerCase().includes('trade')
          ).slice(0, 4),
          freeAgency: data.filter(article => 
            article.category?.toLowerCase().includes('free agency') ||
            article.title?.toLowerCase().includes('free agent')
          ).slice(0, 4),
          draft: data.filter(article => 
            article.category?.toLowerCase().includes('draft') ||
            article.title?.toLowerCase().includes('draft')
          ).slice(0, 4),
          news: data.filter(article => 
            article.category?.toLowerCase().includes('news') ||
            (!article.category?.toLowerCase().includes('trade') &&
             !article.category?.toLowerCase().includes('free agency') &&
             !article.category?.toLowerCase().includes('draft') &&
             !article.category?.toLowerCase().includes('rumor'))
          ).slice(0, 4),
          rumors: data.filter(article => 
            article.category?.toLowerCase().includes('rumor') ||
            article.title?.toLowerCase().includes('rumor')
          ).slice(0, 4)
        }

        setArticles(groupedArticles)
      } catch (err) {
        console.error('Error fetching articles:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [teamSlug])

  const getCategoryUrl = (categoryKey) => {
    if (teamSlug) {
      return `/teams/${teamSlug}/${categoryKey}`
    }
    return `/${categoryKey}`
  }

  const getArticleUrl = (article) => {
    if (teamSlug) {
      return `/teams/${teamSlug}/articles/${article.slug.current}`
    }
    return `/articles/${article.slug.current}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const renderArticleCard = (article, isLarge = false) => (
    <Link 
      key={article._id} 
      to={getArticleUrl(article)}
      className={`article-card ${isLarge ? 'large' : 'small'}`}
    >
      <div className="article-image">
        <img 
          src={article.mainImage?.asset?.url || '/api/placeholder/400/300'} 
          alt={article.title} 
        />
        <div className="category-tag">
          {article.team ? `${article.team.city} ${article.team.name} News` : 'NBA News'}
        </div>
      </div>
      <div className="article-content">
        <h3 className="article-title">{article.title}</h3>
        <div className="article-meta">
          <span className="article-author">{article.author}</span>
          <span className="article-date">{formatDate(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  )

  const renderCategorySection = (category) => {
    const categoryArticles = articles[category.key]
    if (!categoryArticles || categoryArticles.length === 0) return null

    return (
      <section key={category.key} className="category-section">
        <div className="category-header">
          <h2 className="category-title" style={{ color: category.color }}>
            {category.label}
          </h2>
          <Link 
            to={getCategoryUrl(category.key)} 
            className="see-more-link"
            style={{ color: category.color }}
          >
            See more
          </Link>
        </div>
        
        <div className={`articles-grid ${categoryArticles.length === 1 ? 'single-article' : ''}`}>
          {categoryArticles.length === 1 ? (
            renderArticleCard(categoryArticles[0], true)
          ) : (
            <>
              {renderArticleCard(categoryArticles[0], true)}
              <div className="sidebar-articles">
                {categoryArticles.slice(1, 4).map(article => renderArticleCard(article, false))}
              </div>
            </>
          )}
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <div className="categories-container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          Loading articles...
        </div>
      </div>
    )
  }

  return (
    <div className="categories-container">
      {teamName && (
        <div className="team-header">
          <h1 className="team-title">{teamName}</h1>
        </div>
      )}
      
      <div className="categories-content">
        {categories.map(category => renderCategorySection(category))}
      </div>
    </div>
  )
}

export default Categories