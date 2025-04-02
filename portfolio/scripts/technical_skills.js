document.addEventListener('DOMContentLoaded', function() {
    fetch('./json/technical_skills.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load skills data');
            }
            return response.json();
        })
        .then(data => {
            const leftContainer = document.getElementById('skills-left-container');
            const rightContainer = document.getElementById('skills-right-container');
            
            // Clear any existing content
            leftContainer.innerHTML = '';
            rightContainer.innerHTML = '';
            
            // Process each skill category
            data.skillCategories.forEach(category => {
                // Create category container
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'skills-category';
                
                // Create and add category heading
                const categoryHeading = document.createElement('h3');
                categoryHeading.textContent = category.name;
                categoryDiv.appendChild(categoryHeading);
                
                // Add each skill in this category
                category.skills.forEach(skill => {
                    // Create skill bar container
                    const skillBar = document.createElement('div');
                    skillBar.className = 'skill-bar';
                    
                    // Create skill info (name and percentage)
                    const skillInfo = document.createElement('div');
                    skillInfo.className = 'skill-info';
                    
                    const skillName = document.createElement('span');
                    skillName.textContent = skill.name;
                    
                    const skillPercentage = document.createElement('span');
                    skillPercentage.textContent = skill.percentage + '%';
                    
                    skillInfo.appendChild(skillName);
                    skillInfo.appendChild(skillPercentage);
                    
                    // Create skill progress bar
                    const skillProgress = document.createElement('div');
                    skillProgress.className = 'skill-progress';
                    
                    const skillProgressBar = document.createElement('div');
                    skillProgressBar.className = 'skill-progress-bar';
                    skillProgressBar.style.width = skill.percentage + '%';
                    
                    skillProgress.appendChild(skillProgressBar);
                    
                    // Assemble the skill bar
                    skillBar.appendChild(skillInfo);
                    skillBar.appendChild(skillProgress);
                    
                    // Add to category container
                    categoryDiv.appendChild(skillBar);
                });
                
                // Add to appropriate container based on position
                if (category.position === 'left') {
                    leftContainer.appendChild(categoryDiv);
                } else {
                    rightContainer.appendChild(categoryDiv);
                }
            });
        })
        .catch(error => {
            console.error('Error loading skills data:', error);
        });
});