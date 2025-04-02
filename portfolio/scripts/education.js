document.addEventListener('DOMContentLoaded', function() {
    fetch('./json/education.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load education data');
            }
            return response.json();
        })
        .then(data => {
            const educationContainer = document.getElementById('education-container');
            
            // Clear any existing content
            educationContainer.innerHTML = '';
            
            // Loop through the education items in the JSON and create elements
            data.educationItems.forEach(item => {
                // Create timeline item
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                
                // Create and add date
                const timelineDate = document.createElement('p');
                timelineDate.className = 'timeline-date';
                timelineDate.textContent = item.date;
                
                // Create and add degree/certification
                const timelineDegree = document.createElement('h3');
                timelineDegree.className = 'timeline-degree';
                timelineDegree.textContent = item.degree;
                
                // Create and add institution
                const timelineInstitution = document.createElement('p');
                timelineInstitution.className = 'timeline-institution';
                timelineInstitution.textContent = item.institution;
                
                // Create and add description
                const description = document.createElement('p');
                description.textContent = item.description;
                
                // Assemble the timeline item
                timelineItem.appendChild(timelineDate);
                timelineItem.appendChild(timelineDegree);
                timelineItem.appendChild(timelineInstitution);
                timelineItem.appendChild(description);
                
                // Add the complete timeline item to the container
                educationContainer.appendChild(timelineItem);
            });
        })
        .catch(error => {
            console.error('Error loading education data:', error);
        });
});