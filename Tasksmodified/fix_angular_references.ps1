# PowerShell script to fix Angular references in React task files

$directory = "Tasksmodified/Frontend-React"

# Get all JSON files in the directory
$files = Get-ChildItem -Path $directory -Filter "*.json"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw

    # Replace Angular Components with React Components in required_skills
    $content = $content -replace '"Angular Components"', '"React Components"'

    # Replace Angular Reactive Forms with React Hook Form
    $content = $content -replace '"Angular Reactive Forms"', '"React Hook Form"'

    # Replace Angular Router with React Router
    $content = $content -replace '"Angular Router"', '"React Router"'

    # Replace Angular HttpClient with Axios
    $content = $content -replace '"Angular HttpClient"', '"Axios"'

    # Replace Angular Material with Material-UI
    $content = $content -replace '"Angular Material"', '"Material-UI"'

    # Replace Angular guards with React route protection
    $content = $content -replace '"Angular guards"', '"React route protection"'

    # Replace Angular services with React hooks/context
    $content = $content -replace '"Angular services"', '"React hooks/context"'

    # Replace Angular best practices with React best practices
    $content = $content -replace 'Follow Angular best practices', 'Follow React best practices'

    # Replace Angular component file paths with React component file paths
    $content = $content -replace '"frontend/AppointmentSaas/src/app/components/', '"src/components/'
    $content = $content -replace '"frontend/src/app/components/', '"src/components/'

    # Replace .component.ts with .tsx
    $content = $content -replace '\.component\.ts"', '.tsx"'

    # Replace .component.html and .component.scss references
    $content = $content -replace '\.component\.html"', '.tsx"'
    $content = $content -replace '\.component\.scss"', '.tsx"'

    # Update folder structure from Angular to React conventions
    $content = $content -replace 'src/app/components/booking/', 'src/components/booking/'
    $content = $content -replace 'src/app/components/service/', 'src/components/service/'
    $content = $content -replace 'src/app/components/payment/', 'src/components/payment/'
    $content = $content -replace 'src/app/components/notification/', 'src/components/notification/'
    $content = $content -replace 'src/app/components/user/', 'src/components/user/'
    $content = $content -replace 'src/app/components/layout/', 'src/components/layout/'
    $content = $content -replace 'src/app/components/navigation/', 'src/components/navigation/'

    # Save the updated content
    Set-Content -Path $file.FullName -Value $content

    Write-Host "Updated: $($file.Name)"
}

Write-Host "All files updated successfully!"