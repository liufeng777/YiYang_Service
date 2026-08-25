Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("D:\code\YiYang\.reasonix\attachments\clipboard-20260814-135301.724949-000001.png")
Write-Host ("WIDTH=" + $img.Width + " HEIGHT=" + $img.Height)
$img.Dispose()
