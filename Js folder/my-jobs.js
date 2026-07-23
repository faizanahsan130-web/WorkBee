// my-jobs.js
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('jobsListContainer');
    const savedJobs = JSON.parse(localStorage.getItem('postedJobs')) || [];

    if (savedJobs.length === 0) {
        container.innerHTML = '<p style="color: #666; font-size: 16px;">Aapne abhi tak koi job post nahi ki.</p>';
    } else {
        container.innerHTML = '';
        savedJobs.forEach((job, index) => {
            container.innerHTML += `
                <div class="job-card">
                    <div class="job-info">
                        <h3>${job.title}</h3>
                        <p>${job.description}</p>
                        <small style="color: #999;">Category: ${job.category} | Date: ${job.date}</small>
                    </div>
                    <div class="job-budget">$${job.budget}</div>
                </div>
            `;
        });
    }
});