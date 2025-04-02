document.addEventListener('DOMContentLoaded', function() {
    fetch('./json/experience.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load experience data');
            }
            return response.json();
        })
        .then(data => {
            // Get container elements
            const tabsContainer = document.getElementById('experience-tabs');
            const contentContainer = document.getElementById('job-content-container');
            
            // Clear any existing content
            tabsContainer.innerHTML = '';
            contentContainer.innerHTML = '';
            
            // Create tabs and content for each job
            data.jobs.forEach((job, index) => {
                // Create tab button
                const tabButton = document.createElement('button');
                tabButton.className = 'tab-button' + (index === 0 ? ' active' : '');
                tabButton.setAttribute('data-tab', job.id);
                tabButton.textContent = job.company;
                tabsContainer.appendChild(tabButton);
                
                // Create content section
                const contentDiv = document.createElement('div');
                contentDiv.className = 'tab-content' + (index === 0 ? ' active' : '');
                contentDiv.id = job.id;
                
                // Create and add job title
                const jobTitle = document.createElement('h3');
                jobTitle.className = 'job-title';
                jobTitle.textContent = job.title;
                
                // Create and add job company
                const jobCompany = document.createElement('h4');
                jobCompany.className = 'job-company';
                jobCompany.textContent = job.company;
                
                // Create and add job duration
                const jobDuration = document.createElement('p');
                jobDuration.className = 'job-duration';
                jobDuration.textContent = job.duration;
                
                // Create and add job responsibilities list
                const jobDescription = document.createElement('ul');
                jobDescription.className = 'job-description';
                
                job.responsibilities.forEach(responsibility => {
                    const li = document.createElement('li');
                    li.textContent = responsibility;
                    jobDescription.appendChild(li);
                });
                
                // Assemble the job content
                contentDiv.appendChild(jobTitle);
                contentDiv.appendChild(jobCompany);
                contentDiv.appendChild(jobDuration);
                contentDiv.appendChild(jobDescription);
                
                // Add to container
                contentContainer.appendChild(contentDiv);
            });
            
            // Add tab switching functionality
            const tabButtons = document.querySelectorAll('.tab-button');
            tabButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all buttons and content
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                    
                    // Add active class to clicked button and corresponding content
                    this.classList.add('active');
                    document.getElementById(this.getAttribute('data-tab')).classList.add('active');
                });
            });
        })
        .catch(error => {
            console.error('Error loading experience data:', error);
        });
});