document.addEventListener('DOMContentLoaded', function() {
    fetch('./json/core_skills.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load skills data');
            }
            return response.json();
        })
        .then(data => {
            const skillsContainer = document.getElementById('skills-container');
            
            // Clear any existing content
            skillsContainer.innerHTML = '';
            
            // Loop through the skills in the JSON and create elements
            data.coreSkills.forEach(skill => {
                const skillCard = document.createElement('div');
                skillCard.className = 'skill-card';
                
                const icon = document.createElement('i');
                icon.className = skill.icon;
                
                const title = document.createElement('h3');
                title.textContent = skill.title;
                
                const description = document.createElement('p');
                description.textContent = skill.description;
                
                // Append elements to the skill card
                skillCard.appendChild(icon);
                skillCard.appendChild(title);
                skillCard.appendChild(description);
                
                // Append the skill card to the container
                skillsContainer.appendChild(skillCard);
            });
        })
        .catch(error => {
            console.error('Error loading skills:', error);
        });
});