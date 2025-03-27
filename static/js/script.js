// static/js/script.js

document.addEventListener('DOMContentLoaded', function() {
    const courseForm = document.getElementById('courseForm');
    const loadingIndicator = document.getElementById('loading');
    const resultsSection = document.getElementById('resultsSection');

    function showError(message) {
        resultsSection.classList.remove('hidden');
        resultsSection.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong class="font-bold">Error:</strong>
                <span class="block sm:inline"> ${message}</span>
            </div>
        `;
    }

    courseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading indicator, hide results
        loadingIndicator.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        
        // Get form data
        const formData = {
            subject: document.getElementById('subject').value,
            budget: document.getElementById('budget').value,
            skillLevel: document.getElementById('skillLevel').value,
            timeAvailability: document.getElementById('timeAvailability').value,
            learningStyle: document.getElementById('learningStyle').value
        };
        
        // Make API request
        fetch('/get_recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            
            if (data.error) {
                console.error('API returned error:', data.error);
                showError(data.error);
                return;
            }
            
            // Check if the data has the expected structure
            if (!data.recommendations || !data.roadmap) {
                console.error('Invalid data structure received:', data);
                showError('The API returned an unexpected response format. Check the console for details.');
                return;
            }
            
            // Display results
            displayRecommendations(data);
            resultsSection.classList.remove('hidden');
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            loadingIndicator.classList.add('hidden');
            console.error('Error details:', error);
            showError('Error fetching recommendations. Check the console for details.');
        });
    });

    function displayRecommendations(data) {
        // Display course recommendations
        const recommendationsContainer = document.getElementById('courseRecommendations');
        recommendationsContainer.innerHTML = '';
        
        if (data.recommendations && data.recommendations.length > 0) {
            data.recommendations.forEach(course => {
                const courseCard = document.createElement('div');
                courseCard.className = 'course-card p-4 border border-gray-200 rounded-lg hover:shadow-lg';
                
                courseCard.innerHTML = `
                    <div class="flex justify-between items-start">
                        <h4 class="text-lg font-semibold text-gray-800">${course.course_name}</h4>
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">${course.skill_level}</span>
                    </div>
                    <p class="text-sm text-gray-500 mt-1">${course.platform}</p>
                    <p class="mt-2">${course.description}</p>
                    <div class="flex justify-between mt-4 text-sm">
                        <span class="font-semibold">${course.cost}</span>
                        <span>${course.duration}</span>
                    </div>
                    <a href="${course.url}" target="_blank" class="block mt-4 text-center py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition">View Course</a>
                `;
                
                recommendationsContainer.appendChild(courseCard);
            });
        } else {
            recommendationsContainer.innerHTML = '<p>No specific course recommendations found.</p>';
        }
        
        // Display learning roadmap
        const roadmapContainer = document.getElementById('learningRoadmap');
        roadmapContainer.innerHTML = '';
        
        if (data.roadmap && data.roadmap.length > 0) {
            data.roadmap.forEach(stage => {
                const stageElement = document.createElement('div');
                stageElement.className = 'roadmap-stage';
                
                const keySkills = stage.key_skills ? `
                    <div class="mt-2">
                        <span class="font-semibold">Key Skills:</span> ${stage.key_skills.join(', ')}
                    </div>
                ` : '';
                
                const resources = stage.resources ? `
                    <div class="mt-2">
                        <span class="font-semibold">Recommended Resources:</span> ${stage.resources.join(', ')}
                    </div>
                ` : '';
                
                stageElement.innerHTML = `
                    <h4 class="text-lg font-semibold text-gray-800">${stage.stage}</h4>
                    <p class="mt-1">${stage.description}</p>
                    <p class="mt-2 text-sm text-gray-600"><span class="font-semibold">Estimated Time:</span> ${stage.estimated_time}</p>
                    ${keySkills}
                    ${resources}
                `;
                
                roadmapContainer.appendChild(stageElement);
            });
        } else {
            roadmapContainer.innerHTML = '<p>No roadmap information available.</p>';
        }
        
        // Display additional tips
        const tipsContainer = document.getElementById('additionalTips');
        if (data.additional_tips) {
            tipsContainer.textContent = data.additional_tips;
        } else {
            tipsContainer.textContent = 'No additional tips available.';
        }
    }
});
