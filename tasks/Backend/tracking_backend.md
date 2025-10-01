gantt
    title Backend Task Tracking
    dateFormat YYYY-MM-DD
    axisFormat %m-%d
    
    section Critical Path
    BE-001 Setup API Framework    :done, be001, 2024-01-01, 3d
    BE-002 Implement Authentication  :active, be002, after be001, 4d
    BE-003 Create Entity Models      :pending, be003, after be002, 3d
    
    section Parallel Tasks
    BE-004 Implement CRUD Operations :pending, be004, after be003, 5d
    BE-005 Implement Business Logic  :pending, be005, after be004, 6d