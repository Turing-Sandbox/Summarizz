function Test-Command {
    param (
        [string]$CommandName
    )
    return [bool](Get-Command -Name $CommandName -ErrorAction SilentlyContinue)
}

function Install-Poetry {
    $OS = if ($IsWindows) {
        "Windows"
    } elseif ($IsMacOS) {
        "MacOS"
    } elseif ($IsLinux) {
        "Linux"
    } else {
        "Unknown"
    }

    Write-Host "Detected OS: $OS"
    Write-Host "Poetry installation not found. Installing Poetry..."

    try {
        if ($OS -eq "Windows") {
            (Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python3 -
            $ENV:PATH = "$ENV:APPDATA\Python\Scripts;$ENV:PATH"
        }
        else {
            curl -sSL https://install.python-poetry.org | python3 -
            $ENV:PATH = "$HOME/.local/bin:$ENV:PATH"
        }
    }
    catch {
        Write-Error "Failed to install Poetry: $_"
        exit 1
    }
}

function Install-Dependencies {
    if (Test-Path "requirements.txt") {
        Write-Host "Installing dependencies and setting up virtual environment..."
        try {
            $requirements = Get-Content "requirements.txt"
            foreach ($req in $requirements) {
                if (-not [string]::IsNullOrWhiteSpace($req)) {
                    Write-Host "Installing $req..."
                    poetry add $req
                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to install dependency: $req"
                    }
                }
            }
        }
        catch {
            Write-Error "Failed to install dependencies: $_"
            exit 1
        }
    }
    else {
        Write-Error "requirements.txt file was not found, please consider creating one."
        exit 1
    }
}

try
{
    if (-not (Test-Command "poetry"))
    {
        Install-Poetry

        if (-not (Test-Command "poetry"))
        {
            Write-Error "Poetry installation failed, recommended to install Poetry manually."
            exit 1
        }
    }
    Install-Dependencies

    Write-Host "Creating/updating poetry.lock file..."
    poetry lock

    Write-Host "Activating virtual environment..."
    poetry shell

    Write-Host "Setup completed successfully!"

}
catch {
    Write-Error "An unexpected error occurred: $_"
    exit 1

}