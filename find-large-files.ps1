# Find large files in Git history
Write-Host "Finding largest files in Git history..." -ForegroundColor Cyan

# Get the largest blob SHAs
$largeBlobs = @(
    "ab8152d622a6a5ce2500023b711716a31d0b3158",
    "e9df85dd725fae108ff13fcee94ad434fa59be63",
    "fbed250c6f6b9671039e75a589552fbf0eb177d8",
    "7f447333e7a84e81d912db55bc40ec771c48b1d2",
    "b4b2321abb59a1e9ce49fb405962f4ef99a8fc4e",
    "9bb7b4c2bcde5a4fbfe088057c2f4d2a626f835e",
    "7b598e5dc4f5e994f01cba3058040bd51ac11191",
    "4f8fba2eead86e2f0dd93e9d9d9912d30710d25b13",
    "b3d0e02e5dfcb33fde584c3d57f6678c819caae5",
    "c47ced42c2a4c33e001888f9132bf5d93917b773"
)

Write-Host "`nLargest files in Git history:" -ForegroundColor Yellow
Write-Host "=" * 80

foreach ($sha in $largeBlobs) {
    Write-Host "`nSHA: $sha" -ForegroundColor Green
    $result = git rev-list --objects --all | Select-String $sha
    if ($result) {
        Write-Host "File: $($result -replace '^[a-f0-9]+ ', '')" -ForegroundColor White
    } else {
        Write-Host "File: [Unable to identify - may be deleted]" -ForegroundColor Red
    }
}

Write-Host "`n" + ("=" * 80)
Write-Host "Recommendation: Remove these files from Git history using git filter-repo" -ForegroundColor Cyan
