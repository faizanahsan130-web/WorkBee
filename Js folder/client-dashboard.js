<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Client Dashboard - WorkBee</title>
    <link rel="stylesheet" href="Css%20folder/client-dashboard.css">
</head>
<body>

    <div class="dashboard-container">
        
        <!-- Sidebar Navigation -->
        <aside class="sidebar">
            <div class="logo-box">
                <a href="index.html">🐝 WorkBee</a>
            </div>
            <nav class="sidebar-menu">
                <a href="client-dashboard.html" class="menu-item active">
                    <span class="icon">📊</span> Dashboard
                </a>
                <a href="browse-gigs.html" class="menu-item">
                    <span class="icon">🔍</span> Browse Services
                </a>
                <a href="#" class="menu-item">
                    <span class="icon">➕</span> Post Project
                </a>
                <a href="#" class="menu-item">
                    <span class="icon">📁</span> My Projects
                </a>
                <a href="messages.html" class="menu-item">
                    <span class="icon">💬</span> Messages
                </a>
            </nav>
            <div class="sidebar-footer">
                <a href="login.html" class="btn-logout-sidebar">
                    <span class="icon">🚪</span> Logout
                </a>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="main-content">
            
            <!-- Top Header -->
            <header class="top-header">
                <div class="welcome-text">
                    <h1>Welcome back, Client! 👋</h1>
                    <p>Here is an overview of your active projects and orders.</p>
                </div>
                <div class="user-profile">
                    <div class="avatar">C</div>
                    <span class="user-name">Client Account</span>
                </div>
            </header>

            <!-- Stats Overview Grid -->
            <section class="stats-grid">
                <div class="stat-card">
                    <div class="stat-info">
                        <p class="stat-label">Total Projects</p>
                        <h2 class="stat-value">12</h2>
                    </div>
                    <div class="stat-icon-box yellow">📁</div>
                </div>

                <div class="stat-card">
                    <div class="stat-info">
                        <p class="stat-label">Active Projects</p>
                        <h2 class="stat-value">5</h2>
                    </div>
                    <div class="stat-icon-box blue">⚡</div>
                </div>

                <div class="stat-card">
                    <div class="stat-info">
                        <p class="stat-label">Completed</p>
                        <h2 class="stat-value">7</h2>
                    </div>
                    <div class="stat-icon-box green">✅</div>
                </div>

                <div class="stat-card">
                    <div class="stat-info">
                        <p class="stat-label">Total Spending</p>
                        <h2 class="stat-value">$4,850</h2>
                    </div>
                    <div class="stat-icon-box purple">💳</div>
                </div>
            </section>

            <!-- Recent Projects Table Section -->
            <section class="table-section">
                <div class="section-header">
                    <h2>Recent Projects</h2>
                    <a href="#" class="btn-view-all">View All</a>
                </div>

                <div class="table-card">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Budget</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="project-title">Website Development</td>
                                <td>Web Dev</td>
                                <td><span class="badge status-active">Active</span></td>
                                <td class="price">$800</td>
                                <td><button class="btn-action">View</button></td>
                            </tr>
                            <tr>
                                <td class="project-title">Logo Design & Branding</td>
                                <td>Graphic Design</td>
                                <td><span class="badge status-completed">Completed</span></td>
                                <td class="price">$120</td>
                                <td><button class="btn-action">View</button></td>
                            </tr>
                            <tr>
                                <td class="project-title">AI Chatbot Integration</td>
                                <td>AI Services</td>
                                <td><span class="badge status-pending">Pending</span></td>
                                <td class="price">$1,500</td>
                                <td><button class="btn-action">View</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

        </main>

    </div>

</body>
</html>