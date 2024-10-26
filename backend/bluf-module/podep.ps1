# NOTE
# THIS SCRIPT NEEDS TO BE CHANGED DON'T USE!
# END_NOTE

$reqs = @(Get-Content requirements.txt)

for ($i = 0; $i -lt $reqs.Length; $i++) {
    poetry add $reqs[$i]
}

Write-Host "requirements.txt file has been installed successfully."