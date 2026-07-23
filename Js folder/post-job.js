// post-job.js
document.getElementById('jobForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Form ki values get karna
    const title = document.getElementById('jobTitle').value;
    const category = document.getElementById('jobCategory').value;
    const budget = document.getElementById('jobBudget').value;
    const description = document.getElementById('jobDescription').value;

    // Data object banana
    const jobData = {
        title,
        category,
        budget,
        description,
        date: new Date().toLocaleDateString()
    };

    // Console mein print ya localStorage mein save karna
    console.log('New Job Posted:', jobData);
    
    // Aap yahan localStorage ya Firebase mein save kar sakte hain
    let jobs = JSON.parse(localStorage.getItem('postedJobs')) || [];
    jobs.push(jobData);
    localStorage.setItem('postedJobs', JSON.stringify(jobs));

    alert('Job Posted Successfully!');
    
    // Form reset karna
    document.getElementById('jobForm').reset();
});