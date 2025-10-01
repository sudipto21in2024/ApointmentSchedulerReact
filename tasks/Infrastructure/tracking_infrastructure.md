gantt
    title Infrastructure Task Tracking
    dateFormat YYYY-MM-DD
    axisFormat %m-%d
    
    section Critical Path
    INF-001 Setup Project Structure    :done, inf001, 2024-01-01, 2d
    INF-002 Setup Database            :active, inf002, after inf001, 5d
    INF-003 Setup Containerization    :pending, inf003, after inf002, 4d
    
    section Parallel Tasks
    INF-004 Setup CI/CD               :pending, inf004, after inf001, 4d
    INF-005 Setup Monitoring          :pending, inf005, after inf003, 3d