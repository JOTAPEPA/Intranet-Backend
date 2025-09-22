# Crear un archivo de texto simple para prueba
$content = "Este es contenido de prueba"
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"documento`"",
    "",
    "Prueba multipart simple",
    "--$boundary",
    "Content-Disposition: form-data; name=`"documentos`"; filename=`"test.txt`"",
    "Content-Type: text/plain",
    "",
    $content,
    "--$boundary--"
) -join $LF

try {
    Write-Host "Enviando petición multipart..."
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/compras" -Method Post -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary"
    
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response Body:"
    $response.Content
} catch {
    Write-Host "ERROR:"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error Message: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
