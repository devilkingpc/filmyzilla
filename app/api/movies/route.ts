import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface MovieLink {
  title: string;
  url: string;
  quality: string;
}

interface CategoryData {
  category: string;
  categoryUrl: string;
  movies: MovieLink[];
}

export async function GET() {
  try {
    const response = await axios.get('https://www.filmyzilla13.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const categories: CategoryData[] = [];
    
    // Extract all update divs
    $('.update').each((index, element) => {
      const $element = $(element);
      
      // Get category title and URL
      const categoryLink = $element.find('.black a').first();
      const categoryTitle = categoryLink.text().trim();
      const categoryUrl = categoryLink.attr('href') || '';
      
      // Extract movies from this category
      const movies: MovieLink[] = [];
      
      // Get the HTML content and parse it more carefully
      const updateHtml = $element.html();
      if (updateHtml) {
        // Split by movie links and process each part
        const movieRegex = /<a href="([^"]*\/movies?\/[^"]*)"[^>]*>([^<]+)<\/a>\s*<font[^>]*color="green"[^>]*>\[([^\]]+)\]<\/font>/gi;
        let match;
        
        while ((match = movieRegex.exec(updateHtml)) !== null) {
          const [, url, title, quality] = match;
          
          if (title && url) {
            movies.push({
              title: title.trim(),
              url: url.startsWith('http') ? url : `https://www.filmyzilla13.com${url}`,
              quality: quality.trim()
            });
          }
        }
        
        // Fallback method if regex doesn't work
        if (movies.length === 0) {
          $element.find('a').each((i, movieElement) => {
            const $movieElement = $(movieElement);
            const href = $movieElement.attr('href');
            
            // Skip if it's the category link or doesn't have href
            if (!href || $movieElement.closest('.black').length > 0) {
              return;
            }
            
            const title = $movieElement.text().trim();
            if (title && (href.includes('/movie') || href.includes('/movies'))) {
              // Look for the next font element with green color
              let quality = 'Unknown';
              let nextElement = $movieElement.next();
              
              // Check immediate next element and a few following elements
              for (let j = 0; j < 3; j++) {
                if (nextElement.length === 0) break;
                
                if (nextElement.is('font') && nextElement.attr('color') === 'green') {
                  quality = nextElement.text().replace(/[\[\]]/g, '').trim();
                  break;
                }
                nextElement = nextElement.next();
              }
              
              movies.push({
                title,
                url: href.startsWith('http') ? href : `https://www.filmyzilla13.com${href}`,
                quality
              });
            }
          });
        }
      }
      
      if (categoryTitle && movies.length > 0) {
        categories.push({
          category: categoryTitle,
          categoryUrl: categoryUrl.startsWith('http') ? categoryUrl : `https://www.filmyzilla13.com${categoryUrl}`,
          movies
        });
      }
    });
    
    // Extract additional categories from .touch divs
    $('.touch').each((index, element) => {
      const $element = $(element);
      
      // Get category link and title
      const categoryLink = $element.find('a').first();
      const categoryTitle = categoryLink.text().trim();
      const categoryUrl = categoryLink.attr('href') || '';
      
      if (categoryTitle && categoryUrl) {
        // For touch categories, we don't have immediate movie data
        // So we create a category with empty movies array
        categories.push({
          category: categoryTitle,
          categoryUrl: categoryUrl.startsWith('http') ? categoryUrl : `https://www.filmyzilla13.com${categoryUrl}`,
          movies: [] // These would need to be scraped from the category page
        });
      }
    });
    
    return NextResponse.json({
      success: true,
      totalCategories: categories.length,
      data: categories,
      scrapedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error scraping FilmyZilla:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to scrape data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
