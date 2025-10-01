gantt
    title Testing Task Tracking
    dateFormat YYYY-MM-DD
    axisFormat %m-%d
    
    section Critical Path
    QA-001 Setup Testing Framework    :done, qa001, 2024-01-01, 2d
    QA-002 Create Unit Tests          :active, qa002, after qa001, 4d
    QA-003 Create Integration Tests   :pending, qa003, after qa002, 3d
    
    section Parallel Tasks
    QA-004 Create E2E Tests           :pending, qa004, after qa003, 5d
    QA-005 Setup Performance Tests    :pending, qa005, after qa004, 3d