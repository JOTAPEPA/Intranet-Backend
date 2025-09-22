# Crear una imagen de prueba simple (PNG de 1x1 pixel transparente en base64)
$base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg=="
$imageBytes = [System.Convert]::FromBase64String($base64Image)
[System.IO.File]::WriteAllBytes("$PWD\test-image.png", $imageBytes)

$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$documento = "Prueba con imagen PNG"

# Leer el archivo de imagen
$imageContent = [System.IO.File]::ReadAllBytes("$PWD\test-image.png")

# Crear el cuerpo multipart/form-data manualmente
$bodyLines = @()
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"documento`""
$bodyLines += ""
$bodyLines += $documento
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"documentos`"; filename=`"test-image.png`""
$bodyLines += "Content-Type: image/png"
$bodyLines += ""

# Convertir a bytes
$bodyText = ($bodyLines -join $LF) + $LF
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyText)

# Agregar los bytes de la imagen
$bodyBytes = $bodyBytes + $imageContent

# Agregar el cierre del boundary
$closeText = $LF + "--$boundary--" + $LF
$closeBytes = [System.Text.Encoding]::UTF8.GetBytes($closeText)
$bodyBytes = $bodyBytes + $closeBytes

# Hacer la petición
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/compras" -Method Post -Body $bodyBytes -ContentType "multipart/form-data; boundary=$boundary"
    
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response Body: $($reader.ReadToEnd())"
    }
}
