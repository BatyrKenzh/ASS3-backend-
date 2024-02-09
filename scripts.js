document.addEventListener('DOMContentLoaded', () => {
  const blogForm = document.getElementById('blogForm');
  const blogList = document.getElementById('blogList');

  // Function to fetch and display all blog posts
  const fetchBlogs = async () => {
    try {
      const response = await fetch('/blogs'); // Relative URL if server is on the same domain
      const blogs = await response.json();
      blogList.innerHTML = '';
      blogs.forEach(blog => {
        const blogItem = document.createElement('div');
        blogItem.innerHTML = `
          <h2>${blog.title}</h2>
          <p>${blog.body}</p>
          <p><strong>Author:</strong> ${blog.author}</p>
          <hr>
        `;
        blogList.appendChild(blogItem);
      });
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  // Function to handle form submission (creating a new blog post)
  blogForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(blogForm);
    const blogData = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/blogs', { // Relative URL if server is on the same domain
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(blogData)
      });
      if (response.ok) {
        await fetchBlogs();
        blogForm.reset();
      } else {
        console.error('Error creating blog post:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating blog post:', error);
    }
  });

  // Fetch and display blogs when the page loads
  fetchBlogs();
});
