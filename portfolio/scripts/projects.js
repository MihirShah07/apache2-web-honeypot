document.addEventListener('DOMContentLoaded', function() {
    fetch('./json/projects.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load projects data');
            }
            return response.json();
        })
        .then(data => {
            const projectsContainer = document.getElementById('projects-container');
            
            // Clear any existing content
            projectsContainer.innerHTML = '';
            
            // Loop through the projects in the JSON and create elements
            data.projects.forEach(project => {
                // Create project card
                const projectCard = document.createElement('div');
                projectCard.className = 'project-card';
                
                // Create and add project image
                const projectImage = document.createElement('img');
                projectImage.src = project.image;
                projectImage.alt = project.alt;
                projectImage.className = 'project-image';
                
                // Create project info container
                const projectInfo = document.createElement('div');
                projectInfo.className = 'project-info';
                
                // Create and add project title
                const projectTitle = document.createElement('h3');
                projectTitle.className = 'project-title';
                projectTitle.textContent = project.title;
                
                // Create and add project description
                const projectDescription = document.createElement('p');
                projectDescription.className = 'project-description';
                projectDescription.textContent = project.description;
                
                // Create and add project technologies
                const projectTech = document.createElement('div');
                projectTech.className = 'project-tech';
                
                project.technologies.forEach(tech => {
                    const techSpan = document.createElement('span');
                    techSpan.textContent = tech;
                    projectTech.appendChild(techSpan);
                });
                
                // Create and add project links
                const projectLinks = document.createElement('div');
                projectLinks.className = 'project-links';
                
                project.links.forEach(link => {
                    const linkElement = document.createElement('a');
                    linkElement.href = link.url;
                    linkElement.title = link.title;
                    
                    const linkIcon = document.createElement('i');
                    linkIcon.className = link.icon;
                    
                    linkElement.appendChild(linkIcon);
                    projectLinks.appendChild(linkElement);
                });
                
                // Assemble the project card
                projectInfo.appendChild(projectTitle);
                projectInfo.appendChild(projectDescription);
                projectInfo.appendChild(projectTech);
                projectInfo.appendChild(projectLinks);
                
                projectCard.appendChild(projectImage);
                projectCard.appendChild(projectInfo);
                
                // Add the complete project card to the container
                projectsContainer.appendChild(projectCard);
            });
        })
        .catch(error => {
            console.error('Error loading projects:', error);
        });
});