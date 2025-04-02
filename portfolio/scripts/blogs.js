document.addEventListener('DOMContentLoaded', function() {
    fetch('./json/blogs.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load blogs data');
            }
            return response.json();
        })
        .then(data => {
            const blogsContainer = document.getElementById('blogs-container');
            
            // Clear any existing content
            blogsContainer.innerHTML = '';
            
            // Loop through the blogs in the JSON and create elements
            data.blogs.forEach(blog => {
                // Create blog card
                const blogCard = document.createElement('div');
                blogCard.className = 'blog-card';
                
                // Create and add blog image
                const blogImage = document.createElement('img');
                blogImage.src = blog.image;
                blogImage.alt = blog.alt;
                blogImage.className = 'blog-image';
                
                // Create blog info container
                const blogInfo = document.createElement('div');
                blogInfo.className = 'blog-info';
                
                // Create and add blog date
                const blogDate = document.createElement('p');
                blogDate.className = 'blog-date';
                blogDate.textContent = blog.date;
                
                // Create and add blog title
                const blogTitle = document.createElement('h3');
                blogTitle.className = 'blog-title';
                blogTitle.textContent = blog.title;
                
                // Create and add blog excerpt
                const blogExcerpt = document.createElement('p');
                blogExcerpt.className = 'blog-excerpt';
                blogExcerpt.textContent = blog.excerpt;
                
                // Create and add read more button
                const readMoreBtn = document.createElement('a');
                readMoreBtn.href = blog.url;
                readMoreBtn.className = 'btn';
                readMoreBtn.textContent = 'Read More';
                
                // Assemble the blog card
                blogInfo.appendChild(blogDate);
                blogInfo.appendChild(blogTitle);
                blogInfo.appendChild(blogExcerpt);
                blogInfo.appendChild(readMoreBtn);
                
                blogCard.appendChild(blogImage);
                blogCard.appendChild(blogInfo);
                
                // Add the complete blog card to the container
                blogsContainer.appendChild(blogCard);
            });
        })
        .catch(error => {
            console.error('Error loading blogs:', error);
        });
});