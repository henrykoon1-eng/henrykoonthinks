#!/usr/bin/env python3
"""Scrape blogspot blog and convert to markdown"""

import requests
from bs4 import BeautifulSoup
import re
import os
from datetime import datetime

# List of all post URLs to scrape
posts = [
    {"url": "https://henrykoonthinks.blogspot.com/2024/07/life-is-story.html", "date": "2024-07-19", "title": "Life is a Story"},
    {"url": "https://henrykoonthinks.blogspot.com/2024/07/the-climb-of-worship.html", "date": "2024-07-04", "title": "The Climb of Worship"},
    {"url": "https://henrykoonthinks.blogspot.com/2024/07/a-letter-to-friend.html", "date": "2024-07-03", "title": "To be Childlike: A letter to a Friend"},
    {"url": "https://henrykoonthinks.blogspot.com/2024/07/many-faces-of-lion.html", "date": "2024-07-01", "title": "Many Faces of the Lion"},
    {"url": "https://henrykoonthinks.blogspot.com/2024/06/watching-from-bottom-meanish-poem.html", "date": "2024-06-20", "title": "Watching from the Bottom: A (meanish) Poem"},
    {"url": "https://henrykoonthinks.blogspot.com/2024/06/waking-in-woods-poem.html", "date": "2024-06-20", "title": "Waking in Woods: A Poem"},
    {"url": "https://henrykoonthinks.blogspot.com/2024/06/today-i-climbed-tree-short-poem.html", "date": "2024-06-19", "title": "Today I Climbed a Tree: A Short Poem"},
    {"url": "https://henrykoonthinks.blogspot.com/2024/06/faith-signaling-and-great-sin-of.html", "date": "2024-06-09", "title": "Using Faith as a tool: The Great Sin of Christian Pride"},
    {"url": "https://henrykoonthinks.blogspot.com/2024/06/a-letter-to-mentor.html", "date": "2024-06-01", "title": "A Letter To A Mentor"},
    {"url": "https://henrykoonthinks.blogspot.com/2024/05/god-as-holy-host_25.html", "date": "2024-05-25", "title": "God as a Holy Host"},
    {"url": "https://henrykoonthinks.blogspot.com/2024/05/trees-sunsets-and-rebirth-prayer.html", "date": "2024-05-24", "title": "Trees, Sunsets and Rebirth: A Prayer"},
    {"url": "https://henrykoonthinks.blogspot.com/2024/04/prayer-as-meditation-and-dialectic.html", "date": "2024-04-22", "title": "Prayer as meditation and dialectic"},
    {"url": "https://henrykoonthinks.blogspot.com/2024/04/the-tree-of-good-and-evil.html", "date": "2024-04-09", "title": "The Tree of Life and the Perpetual Battle with Evil"},
    {"url": "https://henrykoonthinks.blogspot.com/2024/03/what-is-education.html", "date": "2024-03-12", "title": "What is Education"},
    {"url": "https://henrykoonthinks.blogspot.com/2024/02/koon-studies-study-of-life-universe-and.html", "date": "2024-02-28", "title": "Koon Studies: The Study of Life the Universe and Everything"},
    {"url": "https://henrykoonthinks.blogspot.com/2024/02/peaks-and-valleys.html", "date": "2024-02-13", "title": "Peaks and Valleys: A Poem"},
    {"url": "https://henrykoonthinks.blogspot.com/2024/01/the-calling.html", "date": "2024-01-29", "title": "The Calling: A Poem"},
    {"url": "https://henrykoonthinks.blogspot.com/2023/12/lost-at-sea.html", "date": "2023-12-08", "title": "Lost at Sea: A Poem"},
]

def slugify(title):
    """Convert title to URL-friendly slug"""
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug[:50]

def categorize_by_title(title):
    """Assign category based on title/content hints"""
    title_lower = title.lower()
    
    # Poetry detection
    if 'poem' in title_lower:
        return 'poetry'
    
    # Faith/religion detection
    faith_keywords = ['prayer', 'worship', 'god', 'christian', 'faith', 'church', 'holy', 'elijah', 'moses', 'bible', 'sin', 'religion']
    if any(kw in title_lower for kw in faith_keywords):
        return 'faith'
    
    # The Outdoors detection
    outdoors_keywords = ['mountain', 'climb', 'tree', 'woods', 'forest', 'sea', 'valley', 'nature', 'hike', 'wilderness']
    if any(kw in title_lower for kw in outdoors_keywords):
        return 'the-outdoors'
    
    # Life detection
    life_keywords = ['life', 'education', 'story', 'letter', 'friend', 'mentor', 'childlike']
    if any(kw in title_lower for kw in life_keywords):
        return 'life'
    
    # Essays detection
    essay_keywords = ['essay', 'study', 'dialectic', 'meditation', 'philosophy', 'politics', 'narrative']
    if any(kw in title_lower for kw in essay_keywords):
        return 'essays'
    
    # Default to reviews if doesn't fit
    return 'reviews'

def scrape_post(post_info):
    """Scrape a single blog post"""
    try:
        response = requests.get(post_info['url'], timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the main post content
        post_div = soup.find('div', class_='post-body') or soup.find('div', class_='entry-content')
        if not post_div:
            # Try alternative selectors
            post_div = soup.find('article') or soup.find('main')
        
        if post_div:
            content = post_div.get_text(separator='\n\n', strip=True)
        else:
            content = "Content could not be extracted. Please manually copy from the original blog."
        
        # Get labels/tags
        labels = []
        label_div = soup.find('div', class_='post-labels') or soup.find('span', class_='post-labels')
        if label_div:
            labels = [a.get_text(strip=True) for a in label_div.find_all('a')]
        
        return content, labels
    except Exception as e:
        print(f"Error scraping {post_info['url']}: {e}")
        return f"Error fetching content. Original URL: {post_info['url']}", []

def create_markdown(post_info, content, labels):
    """Create markdown file from post data"""
    category = categorize_by_title(post_info['title'])
    slug = slugify(post_info['title'])
    
    # Create excerpt (first 150 chars)
    excerpt = content[:150].replace('\n', ' ').strip() + '...' if len(content) > 150 else content
    
    markdown = f"""---
title: "{post_info['title']}"
date: "{post_info['date']}"
category: "{category}"
excerpt: "{excerpt}"
---

# {post_info['title']}

*Originally published on [{post_info['date']}]({post_info['url']})*

{content}

---

*Tags: {', '.join(labels) if labels else 'None'}*
"""
    return markdown, slug

def main():
    output_dir = "content/posts"
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"Scraping {len(posts)} posts from blogspot...")
    
    for i, post_info in enumerate(posts, 1):
        print(f"[{i}/{len(posts)}] Scraping: {post_info['title']}")
        content, labels = scrape_post(post_info)
        markdown, slug = create_markdown(post_info, content, labels)
        
        filename = f"{slug}.md"
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(markdown)
        
        print(f"  → Saved to {filepath}")
    
    print(f"\nDone! Scraped {len(posts)} posts to {output_dir}/")

if __name__ == "__main__":
    main()
