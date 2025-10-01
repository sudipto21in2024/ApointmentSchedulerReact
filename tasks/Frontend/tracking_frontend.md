gantt
    title Frontend Task Tracking
    dateFormat YYYY-MM-DD
    axisFormat %m-%d
    
    section Critical Path
    FE-001 Setup Frontend Framework    :done, fe001, 2024-01-01, 2d
    FE-002 Implement Design System     :active, fe002, after fe001, 3d
    FE-003 Create Component Library    :pending, fe003, after fe002, 4d
    
    section Parallel Tasks
    FE-004 Implement Routing           :pending, fe004, after fe003, 2d
    FE-005 Integrate Backend APIs      :pending, fe005, after fe004, 4d