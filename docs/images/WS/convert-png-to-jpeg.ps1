# Try uncommenting the following line if you receive errors about a missing assembly
[void][System.Reflection.Assembly]::LoadWithPartialName("System.Drawing")
function ConvertTo-Jpg
{
  [cmdletbinding()]
  param([Parameter(Mandatory=$true, ValueFromPipeline = $true)] $Path)

  process {
    $qualityEncoder = [System.Drawing.Imaging.Encoder]::Quality
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)

    # Set JPEG quality level here: 0 - 100 (inclusive bounds)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($qualityEncoder, 95)
    $jpegCodecInfo = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | where {$_.MimeType -eq 'image/jpeg'}

    if ($Path -is [string]) {
      $Path = get-childitem $Path
    }

    $Path | foreach {
      $image = [System.Drawing.Image]::FromFile($($_.FullName))
      $filePathJpg =  "{0}\{1}.jpg" -f $($_.DirectoryName), $($_.BaseName)
      $image.Save($filePathJpg, $jpegCodecInfo, $encoderParams)
      $image.Dispose()
      
      $filePathPng =  "{0}\{1}.png" -f $($_.DirectoryName), $($_.BaseName)
      
      $jpgSize = (Get-Item $filePathJpg).length;
      $pngSize = (Get-Item $filePathPng).length;
      
      if ($jpgSize -lt $pngSize) {
        Remove-Item -Path $filePathPng
      } else {
        Remove-Item -Path $filePathJpg
      }
    }
  }
}

#Run ConvertTo-Jpg function
Get-ChildItem *.png -Recurse | ConvertTo-Jpg