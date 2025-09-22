$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

# Crear contenido del archivo
$fileContent = "Este es un archivo de prueba para Cloudinary"
$fileName = "test-file.txt"
$documento = "Prueba desde PowerShell"

# Crear el cuerpo multipart/form-data
$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"documento`"",
    "",
    $documento,
    "--$boundary",
    "Content-Disposition: form-data; name=`"documentos`"; filename=`"$fileName`"",
    "Content-Type: text/plain",
    "",
    $fileContent,
    "--$boundary--"
) -join $LF

# Hacer la petición
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/compras" -Method Post -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary"

# Mostrar la respuesta
Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Response:"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
